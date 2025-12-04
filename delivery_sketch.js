// Sketch para la ilustración interactiva (basado en la estructura Memento)
// Usa un canvas fijo de 700x900 (proporción 7:9)
// Aplica SCALE_FACTOR para crear mayores márgenes.

const W = 700;
const H = 900;
const SCALE_FACTOR = 0.7; // Reducido a 70% del original para márgenes amplios
const CANVAS_OFFSET_Y = 50; // Margen superior de 50px (para separarse del header/borde)

let triangles = [];
let cols, rows;
let gap = 10;
let moved = false;

// Variables para los NUEVOS íconos (objetos PImage que contendrán los SVG)
let iconBuy, iconCall, iconClock;


function preload() {
    // CRUCIAL: Carga los archivos SVG. Asegúrate de que estos archivos estén disponibles.
    iconBuy = loadImage("buy.svg");
    iconCall = loadImage("call.svg");
    iconClock = loadImage("clock.svg");
}

function setup() {
    // 1. CREAR CANVAS CON TAMAÑO FIJO Y ESCALADO
    let w_scaled = W * SCALE_FACTOR;
    let h_scaled = H * SCALE_FACTOR;

    // Crea el canvas escalado
    let cnv = createCanvas(w_scaled, h_scaled);
    // Asigna el contenedor padre
    cnv.parent('p5-container');

    // 2. AJUSTE DE POSICIONAMIENTO CON MARGEN SUPERIOR (Centrado absoluto)
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
    let size = min(w, h); // Tamaño base de la celda

    // Inicialización de los Triángulos
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            // Se mantiene la chance de dejar un espacio vacío (30%)
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

    // --- ASIGNACIÓN DE LOS NUEVOS ÍCONOS A ALGUNOS TRIÁNGULOS ---
    let availableIcons = [iconBuy, iconCall, iconClock];

    shuffleArray(triangles);

    // Asigna los iconos a los primeros triángulos disponibles
    for (let i = 0; i < availableIcons.length; i++) {
        if (triangles[i]) {
            triangles[i].isIcon = true;
            triangles[i].icon = availableIcons[i]; // Asignamos el objeto PImage/SVG
        }
    }
}

function draw() {
    background(255); // Fondo blanco
    for (let t of triangles) {
        t.show();
    }
}

function mousePressed() {
    // 🛑 VERIFICACIÓN DE LÍMITES 🛑
    // Solo reacciona a clics dentro del área del canvas
    if (mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height) {
        return;
    }
    
    // Recalcular baseSize
    let w_calc = (width - gap * (cols + 1)) / cols;
    let h_calc = (height - gap * (rows + 1)) / rows;
    let baseSize = min(w_calc, h_calc);

    if (!moved) {
        // Modo A: Reorganizar y crear bloques 2x2
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

            // Intenta formar un bloque 2x2 (20% de probabilidad)
            if (random() < 0.2) {
                for (let i = 0; i < cols - 1 && !placed; i++) {
                    for (let j = 0; j < rows - 1 && !placed; j++) {
                        if (
                            grid[i][j] && grid[i + 1][j] && 
                            grid[i][j + 1] && grid[i + 1][j + 1]
                        ) {
                            grid[i][j] = false;
                            grid[i + 1][j] = false;
                            grid[i][j + 1] = false;
                            grid[i + 1][j + 1] = false;

                            t.targetX = i * (baseSize + gap) + gap + baseSize;
                            t.targetY = j * (baseSize + gap) + gap + baseSize;
                            t.targetSize = baseSize * 2 + gap; // El tamaño es el doble + el gap central
                            t.angle = random([0, HALF_PI, PI, 3 * HALF_PI]);
                            placed = true;
                        }
                    }
                }
            }

            // Si no se colocó en un bloque 2x2, intenta colocarlo en un bloque 1x1
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

            // Si no hay lugar, mover fuera de la pantalla (desaparecer)
            if (!placed) {
                t.targetX = -200;
                t.targetY = -200;
                t.targetSize = baseSize; 
            }
        }

        moved = true;
    } else {
        // Modo B: Volver al estado original (grid ordenado)
        for (let t of triangles) {
            t.targetX = t.xOriginal;
            t.targetY = t.yOriginal;
            t.targetSize = t.sizeOriginal;
            t.angle = t.angleOriginal;
        }
        moved = false;
    }
}

/**
 * Clase que representa cada pieza triangular o ícono.
 */
class Tri {
    constructor(x, y, s, col, angle) {
        // Almacenar valores originales
        this.xOriginal = x;
        this.yOriginal = y;
        this.angleOriginal = angle;
        this.sizeOriginal = s;

        // Propiedades de estado actual
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.size = s;
        this.col = col;

        // Propiedades de estado objetivo (para animación lerp)
        this.targetX = x;
        this.targetY = y;
        this.targetSize = s;

        // Propiedades de ícono
        this.isIcon = false;
        this.icon = null; 
    }

    show() {
        // Animación suave (interpolación lineal)
        this.x = lerp(this.x, this.targetX, 0.1);
        this.y = lerp(this.y, this.targetY, 0.1);
        this.size = lerp(this.size, this.targetSize, 0.1); // Animación de tamaño

        push();
        translate(this.x, this.y);
        
        if (this.isIcon && this.icon) {
            imageMode(CENTER);
            // Dibujamos la imagen SVG cargada, escalada al tamaño actual
            image(this.icon, 0, 0, this.size * 0.8, this.size * 0.8); 
        } else {
            // Dibuja el triángulo normal
            rotate(this.angle);
            fill(this.col);
            // Dibujamos un triángulo con el centro en (0, 0)
            triangle(
                -this.size / 2, -this.size / 2,
                this.size / 2, -this.size / 2,
                -this.size / 2, this.size / 2
            );
        }

        pop();
    }
}

/**
 * Guarda el canvas como PNG.
 */
function keyTyped() {
    if (key === "s" || key === "S") {
        saveCanvas("grid_triangular_interactivo", "png");
    }
}

/**
 * Mezcla aleatoriamente un array (Algoritmo Fisher-Yates).
 */
function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        let j = floor(random(i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
}
