// Sketch para la Ilustración "Saldo"
// Usa un canvas fijo de 700x900 (proporción 7:9)
// CONFIGURADO para usar archivos SVG externos (requiere map.svg, process.svg, person.svg).

const W = 700;
const H = 900;
const SCALE_FACTOR = 0.7; // Reducido a 70% del original para márgenes amplios
const CANVAS_OFFSET_Y = 50; // Margen superior de 50px

let triangles = [];
let cols, rows;
let gap = 10;
let moved = false;

// Variables para los íconos (objetos PImage que contendrán los SVG)
let iconMap, iconProcess, iconPerson;

function preload() {
    // CRUCIAL: Carga los archivos SVG. 
    iconMap = loadImage("map.svg");
    iconProcess = loadImage("process.svg");
    iconPerson = loadImage("person.svg");
}


function setup() {
    // 1. CREAR CANVAS CON TAMAÑO FIJO Y ESCALADO
    let w_scaled = W * SCALE_FACTOR;
    let h_scaled = H * SCALE_FACTOR;

    // El canvas se adjuntará al contenedor 'p5-container' en el HTML.
    // NOTA: Para VSC/web, debes asegurarte de que un <div> con id="p5-container" exista en tu HTML.
    let cnv = createCanvas(w_scaled, h_scaled);
    cnv.parent('p5-container');

    // 2. AJUSTE DE POSICIONAMIENTO CON MARGEN SUPERIOR (Centrado en el contenedor)
    cnv.style('display', 'block');
    cnv.style('margin', 'auto');
    cnv.style('position', 'absolute');
    cnv.style('top', CANVAS_OFFSET_Y + 'px');
    cnv.style('bottom', '0');
    cnv.style('left', '0');
    cnv.style('right', '0');

    noStroke();

    cols = 6;
    rows = 7;

    let w = (width - gap * (cols + 1)) / cols;
    let h = (height - gap * (rows + 1)) / rows;
    let size = min(w, h);
    let baseSize = size;

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

            // Se pasa el tamaño base para que la clase Tri lo almacene
            triangles.push(new Tri(x, y, size, c, ang, baseSize));
        }
    }

    // --- ASIGNACIÓN DE LOS ÍCONOS ---
    let availableIcons = [iconMap, iconProcess, iconPerson];
    
    shuffleArray(triangles);

    for (let i = 0; i < availableIcons.length; i++) {
        if (triangles[i]) {
            triangles[i].isIcon = true;
            triangles[i].icon = availableIcons[i]; // Asigna el objeto PImage/SVG cargado
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
    // Verificar si el clic está dentro del canvas.
    if (mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height) {
        // Permitir la ejecución si se llama desde el botón (en el HTML)
        if (window.event && window.event.type === 'click' && window.event.target.id === 'toggleButton') {
            // Continuar si es el botón
        } else {
            return;
        }
    }
    
    // Recalcular baseSize
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

            // Intento de colocar 2x2
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
                            t.targetAngle = random([0, HALF_PI, PI, 3 * HALF_PI]);
                            placed = true;
                        }
                    }
                }
            }

            // Intento de colocar 1x1
            if (!placed) {
                for (let i = 0; i < cols && !placed; i++) {
                    for (let j = 0; j < rows && !placed; j++) {
                        if (grid[i][j]) {
                            grid[i][j] = false;
                            t.targetX = i * (baseSize + gap) + gap + baseSize / 2;
                            t.targetY = j * (baseSize + gap) + gap + baseSize / 2;
                            t.targetSize = baseSize;
                            t.targetAngle = random([0, HALF_PI, PI, 3 * HALF_PI]);
                            placed = true;
                        }
                    }
                }
            }

            if (!placed) {
                t.targetX = -200;
                t.targetY = -200;
                t.targetSize = 0; // Se encoge si queda fuera
            }
        }

        moved = true;
    } else {
        for (let t of triangles) {
            t.targetX = t.xOriginal;
            t.targetY = t.yOriginal;
            t.targetSize = t.baseSizeOriginal;
            t.targetAngle = t.angleOriginal;
        }
        moved = false;
    }
}


class Tri {
    constructor(x, y, s, col, angle, baseSize) {
        this.xOriginal = x;
        this.yOriginal = y;
        this.angleOriginal = angle;
        this.baseSizeOriginal = baseSize;

        this.x = x;
        this.y = y;
        this.angle = angle;
        this.targetAngle = angle;

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
        this.size = lerp(this.size, this.targetSize, 0.1);
        this.angle = lerp(this.angle, this.targetAngle, 0.1);

        push();
        translate(this.x, this.y);
        
        if (this.isIcon && this.icon) {
            imageMode(CENTER);
            // Dibujamos la imagen SVG cargada
            image(this.icon, 0, 0, this.size, this.size);
        } else {
            rotate(this.angle);
            fill(this.col);
            // Dibuja el triángulo
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
        saveCanvas("grid_triangular_saldo", "png");
    }
}

function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        let j = floor(random(i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
}
