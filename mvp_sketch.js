// Sketch para el Caso MVP (Mínimo Producto Viable)
// Aplica el mismo estilo de posicionamiento, escalado y centrado de los casos anteriores.

const W = 700;
const H = 900;
const SCALE_FACTOR = 0.7; // Reducido a 70% del original para márgenes amplios
const CANVAS_OFFSET_Y = 50; // Margen superior de 50px (aplicado por CSS en el contenedor)

let triangles = [];
let cols, rows;
let gap = 10;
let moved = false;

// Variables para los nuevos íconos
let iconMobile, iconPay, iconSystem;

function preload() {
    // CRUCIAL: Carga los archivos SVG. 
    // Asegúrate de que 'mobile.svg', 'pay.svg', y 'system.svg' estén en la misma carpeta.
    iconMobile = loadImage("mobile.svg");
    iconPay = loadImage("pay.svg");
    iconSystem = loadImage("system.svg");
}

function setup() {
    // 1. CREAR CANVAS CON TAMAÑO FIJO Y ESCALADO
    let w_scaled = W * SCALE_FACTOR;
    let h_scaled = H * SCALE_FACTOR;

    let cnv = createCanvas(w_scaled, h_scaled);
    cnv.parent('p5-container'); // Se adjunta al contenedor HTML

    // 2. AJUSTE DE POSICIONAMIENTO CSS para centrar el canvas
    cnv.style('display', 'block');
    cnv.style('margin', 'auto'); 
    cnv.style('position', 'absolute');
    cnv.style('top', CANVAS_OFFSET_Y + 'px'); // Desplazamiento superior fijo
    cnv.style('bottom', '0');
    cnv.style('left', '0');
    cnv.style('right', '0'); 
    
    noStroke();

    cols = 6;
    rows = 7;

    let w = (width - gap * (cols + 1)) / cols;
    let h = (height - gap * (rows + 1)) / rows;
    let size = min(w, h);

    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            // 30% de chance de dejar un espacio vacío
            if (random() < 0.3) continue;

            let x = i * (size + gap) + gap + size / 2;
            let y = j * (size + gap) + gap + size / 2;

            let palette = [
                color("#E3653B"),
                color("#F2F0EF"),
                color("#EDE4F2"),
            ];
            let c = random(palette);
            let ang = random([0, HALF_PI, PI, 3 * HALF_PI]);

            // Se pasa el tamaño original y se guarda en sizeOriginal
            triangles.push(new Tri(x, y, size, c, ang));
        }
    }

    // --- ASIGNACIÓN DE LOS NUEVOS ÍCONOS ---
    let availableIcons = [iconMobile, iconPay, iconSystem];

    shuffleArray(triangles);

    for (let i = 0; i < availableIcons.length; i++) {
        if (triangles[i]) {
            triangles[i].isIcon = true;
            triangles[i].icon = availableIcons[i];
        }
    }
}

function draw() {
    background(255);
    
    // CORRECCIÓN VISUAL: Mueve el sistema de coordenadas hacia arriba
    // para compensar el 'top: 50px' del CSS.
    push();
    translate(0, -CANVAS_OFFSET_Y); 

    for (let t of triangles) {
        t.show();
    }
    pop();
}

function mousePressed() {
    // 🛑 VERIFICACIÓN DE LÍMITES 🛑
    if (mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height) {
        return;
    }

    let w_calc = (width - gap * (cols + 1)) / cols;
    let h_calc = (height - gap * (rows + 1)) / rows;
    let baseSize = min(w_calc, h_calc);

    if (!moved) {
        // --- ESTADO 1: REORGANIZAR ---
        let grid = [];
        for (let i = 0; i < cols; i++) {
            grid[i] = [];
            for (let j = 0; j < rows; j++) {
                grid[i][j] = true;
            }
        }

        shuffleArray(triangles);

        for (let t of triangles) {
            let placed = false;

            // 20% de chance de ser una pieza grande (2x2)
            if (random() < 0.2) {
                for (let i = 0; i < cols - 1 && !placed; i++) {
                    for (let j = 0; j < rows - 1 && !placed; j++) {
                        if (
                            grid[i][j] && grid[i + 1][j] &&
                            grid[i][j + 1] && grid[i + 1][j + 1]
                        ) {
                            // Ocupar 4 celdas
                            grid[i][j] = grid[i + 1][j] = false;
                            grid[i][j + 1] = grid[i + 1][j + 1] = false;

                            t.targetX = i * (baseSize + gap) + gap + baseSize;
                            t.targetY = j * (baseSize + gap) + gap + baseSize;
                            t.targetSize = baseSize * 2 + gap; // Usar targetSize
                            if (!t.isIcon) {
                                t.angle = random([0, HALF_PI, PI, 3 * HALF_PI]);
                            }
                            placed = true;
                        }
                    }
                }
            }

            // Intentar 1x1
            if (!placed) {
                for (let i = 0; i < cols && !placed; i++) {
                    for (let j = 0; j < rows && !placed; j++) {
                        if (grid[i][j]) {
                            grid[i][j] = false;
                            t.targetX = i * (baseSize + gap) + gap + baseSize / 2;
                            t.targetY = j * (baseSize + gap) + gap + baseSize / 2;
                            t.targetSize = baseSize; // Usar targetSize
                            if (!t.isIcon) {
                                t.angle = random([0, HALF_PI, PI, 3 * HALF_PI]);
                            }
                            placed = true;
                        }
                    }
                }
            }

            // Si no se pudo colocar, mandar fuera
            if (!placed) {
                t.targetX = -200;
                t.targetY = -200;
                t.targetSize = 0;
            }
        }

        moved = true;
    } else {
        // --- ESTADO 2: VOLVER AL INICIO ---
        for (let t of triangles) {
            t.targetX = t.xOriginal;
            t.targetY = t.yOriginal;
            t.targetSize = t.sizeOriginal; // Usar el tamaño original guardado
            t.angle = t.angleOriginal;
        }
        moved = false;
    }
}

class Tri {
    constructor(x, y, s, col, angle) {
        this.xOriginal = x;
        this.yOriginal = y;
        this.sizeOriginal = s; // GUARDADO el tamaño original
        this.angleOriginal = angle;

        this.x = x;
        this.y = y;
        this.angle = angle;

        this.size = s;
        this.col = col;

        this.targetX = x;
        this.targetY = y;
        this.targetSize = s; // Inicializar targetSize
        
        this.isIcon = false;
        this.icon = null;
    }

    show() {
        // Interpolación para animación suave
        this.x = lerp(this.x, this.targetX, 0.1);
        this.y = lerp(this.y, this.targetY, 0.1);
        this.size = lerp(this.size, this.targetSize, 0.1); // Interpolación de tamaño

        push();
        translate(this.x, this.y);

        if (this.isIcon) {
            imageMode(CENTER);
            image(this.icon, 0, 0, this.size, this.size);
        } else {
            rotate(this.angle);
            fill(this.col);
            triangle(
                -this.size / 2,
                this.size / 2,
                this.size / 2,
                this.size / 2,
                -this.size / 2,
                -this.size / 2
            );
        }

        pop();
    }
}

function keyTyped() {
    if (key === "s" || key === "S") {
        saveCanvas("grid_triangular_mobile_pay_system", "png");
    }
}

function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        let j = floor(random(i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
}
