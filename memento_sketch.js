// Sketch para el Caso Memento
// Usa un canvas fijo de 700x900 (proporción 7:9)
// Aplica SCALE_FACTOR para crear mayores márgenes.

const W = 700;
const H = 900;
const SCALE_FACTOR = 0.7; // Reducido a 70% del original para márgenes amplios
const CANVAS_OFFSET_Y = 50; // Margen superior de 50px (para separarse del header)

let triangles = [];
let cols, rows;
let gap = 10;
let moved = false;

// Variables para los íconos (objetos PImage que contendrán los SVG)
let iconLogo, iconThink, iconDeviceShake;


function preload() {
    // CRUCIAL: Carga los archivos SVG. 
    iconLogo = loadImage("logo.svg");
    iconThink = loadImage("think.svg");
    iconDeviceShake = loadImage("deviceshake.svg");
}

function setup() {
    // 1. CREAR CANVAS CON TAMAÑO FIJO Y ESCALADO
    let w_scaled = W * SCALE_FACTOR;
    let h_scaled = H * SCALE_FACTOR;

    let cnv = createCanvas(w_scaled, h_scaled);
    cnv.parent('p5-container');

    // Aplicar CSS para centrar el canvas dentro de su contenedor #p5-container
    // 2. AJUSTE DE POSICIONAMIENTO CON MARGEN SUPERIOR
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
            // Se mantiene la chance de dejar un espacio vacío 
            if (random() < 0.3) continue;

            let x = i * (size + gap) + gap + size / 2;
            let y = j * (size + gap) + gap + size / 2;

            let palette = [
                color("#E3653B"), // Naranja
                color("#F2F0EF"), // Blanco roto
                color("#EDE4F2"), // Lila suave
            ];
            let c = random(palette);
            let ang = random([0, HALF_PI, PI, 3 * HALF_PI]);

            triangles.push(new Tri(x, y, size, c, ang));
        }
    }

    // --- ASIGNACIÓN DE LOS ÍCONOS A ALGUNOS TRIÁNGULOS ---
    let availableIcons = [iconLogo, iconThink, iconDeviceShake];

    shuffleArray(triangles);

    for (let i = 0; i < availableIcons.length; i++) {
        if (triangles[i]) {
            triangles[i].isIcon = true;
            triangles[i].icon = availableIcons[i]; // Asignamos el objeto PImage/SVG
        }
    }
}

function draw() {
    background(255);
    for (let t of triangles) {
        t.show();
    }
}

function mousePressed() {
    // 🛑 NUEVA VERIFICACIÓN DE LÍMITES 🛑
    // Si el ratón (mouseX, mouseY) está fuera del ancho o alto del canvas, sal de la función.
    // Esto asegura que solo se reaccione a los clics dentro del área de la ilustración.
    if (mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height) {
        return;
    }
    
    // Recalcular baseSize dentro de mousePressed (o fuera si es global)
    let w_calc = (width - gap * (cols + 1)) / cols;
    let h_calc = (height - gap * (rows + 1)) / rows;
    let baseSize = min(w_calc, h_calc);

    if (!moved) {
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

            if (random() < 0.2) {
                for (let i = 0; i < cols - 1 && !placed; i++) {
                    for (let j = 0; j < rows - 1 && !placed; j++) {
                        if (
                            grid[i][j] &&
                            grid[i + 1][j] &&
                            grid[i][j + 1] &&
                            grid[i + 1][j + 1]
                        ) {
                            grid[i][j] = false;
                            grid[i + 1][j] = false;
                            grid[i][j + 1] = false;
                            grid[i + 1][j + 1] = false;

                            t.targetX = i * (baseSize + gap) + gap + baseSize;
                            t.targetY = j * (baseSize + gap) + gap + baseSize;
                            t.targetSize = baseSize * 2 + gap;
                            t.angle = random([0, HALF_PI, PI, 3 * HALF_PI]);
                            placed = true;
                        }
                    }
                }
            }

            if (!placed) {
                for (let i = 0; i < cols && !placed; i++) {
                    for (let j = 0; j < rows && !placed; j++) {
                        if (grid[i][j]) {
                            grid[i][j] = false;
                            t.targetX = i * (baseSize + gap) + gap + baseSize / 2;
                            t.targetY = j * (baseSize + gap) + gap + baseSize / 2;
                            t.targetSize = baseSize;
                            t.angle = random([0, HALF_PI, PI, 3 * HALF_PI]);
                            placed = true;
                        }
                    }
                }
            }

            if (!placed) {
                t.targetX = -200;
                t.targetY = -200;
            }
        }

        moved = true;
    } else {
        for (let t of triangles) {
            t.targetX = t.xOriginal;
            t.targetY = t.yOriginal;
            t.targetSize = baseSize; // Asumiendo que baseSize es el tamaño original aquí
            t.angle = t.angleOriginal;
        }
        moved = false;
    }
}


class Tri {
    constructor(x, y, s, col, angle) {
        this.xOriginal = x;
        this.yOriginal = y;
        this.angleOriginal = angle;

        this.x = x;
        this.y = y;
        this.angle = angle;

        this.size = s;
        this.col = col;

        this.targetX = x;
        this.targetY = y;
        this.targetSize = s;

        this.isIcon = false;
        this.icon = null; // Almacena el objeto PImage/SVG
    }

    show() {
        // Animación suave (lerp)
        this.x = lerp(this.x, this.targetX, 0.1);
        this.y = lerp(this.y, this.targetY, 0.1);
        this.size = lerp(this.size, this.targetSize, 0.1); // Animación de tamaño

        push();
        translate(this.x, this.y);
        
        if (this.isIcon && this.icon) {
            imageMode(CENTER);
            // Dibujamos la imagen SVG cargada
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
        saveCanvas("grid_triangular_memento", "png");
    }
}

function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        let j = floor(random(i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
}
