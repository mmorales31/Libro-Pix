// Sketch para el Caso Cuadernos
// Se aplica el mismo estilo de posicionamiento y escalado del caso Memento.
// Usa un canvas base de 700x900 (proporción 7:9).

const W = 700;
const H = 900;
const SCALE_FACTOR = 0.7; // Reducido a 70% del original para márgenes amplios
const CANVAS_OFFSET_Y = 50; // Margen superior de 50px (para separarse del header)

let gridElements = []; // Contendrá tanto triángulos como iconos
let cols, rows;
let gap = 10;
let moved = false;
let baseSize; // Tamaño base de una celda

// Variables para las imágenes de los iconos
let iconEdit, iconView, iconBook;

// --- FUNCIÓN PRELOAD ---
function preload() {
    // CRUCIAL: Carga los archivos SVG. 
    iconEdit = loadImage('edit.svg');
    iconView = loadImage('view.svg');
    iconBook = loadImage('Book PiX.svg');
}

function setup() {
    // 1. CREAR CANVAS CON TAMAÑO FIJO Y ESCALADO (igual que en Memento)
    let w_scaled = W * SCALE_FACTOR;
    let h_scaled = H * SCALE_FACTOR;

    let cnv = createCanvas(w_scaled, h_scaled);
    cnv.parent('p5-container'); // Asumiendo que usas el mismo contenedor

    // 2. AJUSTE DE POSICIONAMIENTO CSS (igual que en Memento)
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

    // Recalcular baseSize usando las dimensiones escaladas (width y height)
    let w = (width - gap * (cols + 1)) / cols;
    let h = (height - gap * (rows + 1)) / rows;
    baseSize = min(w, h);

    let allCells = [];
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            allCells.push({ i, j });
        }
    }
    shuffleArray(allCells); // Barajar todas las celdas

    // Se usa 90% de celdas para asegurar espacios vacíos de forma aleatoria, 
    // pero se llenan las 42 celdas con Triángulos o Iconos, dejando 42 - (numTriangles + numIcons) vacías.
    let numTotalElements = 42; 
    let numIcons = 3; 
    let numTriangles = numTotalElements - numIcons; 

    // Colores de la paleta anterior
    let palette = [color("#E3653B"), color("#F2F0EF"), color("#EDE4F2")];

    // --- CREAR TRIÁNGULOS ---
    for (let k = 0; k < numTriangles; k++) {
        let cell = allCells[k];
        let i = cell.i;
        let j = cell.j;

        let x = i * (baseSize + gap) + gap + baseSize / 2;
        let y = j * (baseSize + gap) + gap + baseSize / 2;
        let c = random(palette);
        let ang = random([0, HALF_PI, PI, 3 * HALF_PI]);

        gridElements.push(new Tri(x, y, baseSize, c, ang, i, j)); 
    }

    // --- CREAR ICONOS ---
    let iconImages = [iconEdit, iconView, iconBook];
    for (let k = 0; k < numIcons; k++) {
        let cell = allCells[numTriangles + k];
        let i = cell.i;
        let j = cell.j;

        let x = i * (baseSize + gap) + gap + baseSize / 2;
        let y = j * (baseSize + gap) + gap + baseSize / 2;
        
        gridElements.push(new Icon(x, y, baseSize, iconImages[k], i, j));
    }
}

function draw() {
    background(255);

    for (let element of gridElements) {
        element.show();
    }
}

function mousePressed() {
    // 🛑 NUEVA VERIFICACIÓN DE LÍMITES 🛑
    if (mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height) {
        return;
    }

    let grid = [];
    for (let i = 0; i < cols; i++) {
        grid[i] = [];
        for (let j = 0; j < rows; j++) {
            grid[i][j] = true; // Empezar con todas libres
        }
    }

    if (!moved) {
        shuffleArray(gridElements); // Barajar TODOS los elementos de la cuadrícula

        for (let element of gridElements) {
            let placed = false;

            // Lógica para piezas grandes (solo triángulos con 20% de probabilidad)
            if (element instanceof Tri && random() < 0.2) { 
                for (let i = 0; i < cols - 1 && !placed; i++) {
                    for (let j = 0; j < rows - 1 && !placed; j++) {
                        if (
                            grid[i][j] &&
                            grid[i + 1][j] &&
                            grid[i][j + 1] &&
                            grid[i + 1][j + 1]
                        ) {
                            grid[i][j] = grid[i + 1][j] = false;
                            grid[i][j + 1] = grid[i + 1][j + 1] = false;

                            element.targetX = i * (baseSize + gap) + gap + baseSize;
                            element.targetY = j * (baseSize + gap) + gap + baseSize;
                            element.targetSize = baseSize * 2 + gap; 
                            if (element instanceof Tri) {
                                element.angle = random([0, HALF_PI, PI, 3 * HALF_PI]);
                            }
                            placed = true;
                        }
                    }
                }
            }

            // Si no fue grande o es un icono, probar con 1x1
            if (!placed) {
                for (let i = 0; i < cols && !placed; i++) {
                    for (let j = 0; j < rows && !placed; j++) {
                        if (grid[i][j]) {
                            grid[i][j] = false; // Marcar como ocupada
                            element.targetX = i * (baseSize + gap) + gap + baseSize / 2;
                            element.targetY = j * (baseSize + gap) + gap + baseSize / 2;
                            element.targetSize = baseSize; 
                            if (element instanceof Tri) {
                                element.angle = random([0, HALF_PI, PI, 3 * HALF_PI]);
                            }
                            placed = true;
                        }
                    }
                }
            }

            // si no se pudo poner (debería ser raro si se llena toda la cuadrícula), se manda fuera
            if (!placed) {
                element.targetX = -200;
                element.targetY = -200;
                element.targetSize = 0; // Desaparecer
            }
        }
        moved = true;

    } else {
        // --- VOLVER AL INICIO ---
        for (let element of gridElements) {
            let i = element.iOriginal; 
            let j = element.jOriginal;

            element.targetX = i * (baseSize + gap) + gap + baseSize / 2;
            element.targetY = j * (baseSize + gap) + gap + baseSize / 2;
            element.targetSize = baseSize; 
            
            if (element instanceof Tri) {
                element.angle = element.angleOriginal; // Vuelve al ángulo original
            }
        }
        moved = false;
    }
}

// --- CLASE TRI (Igual al caso Memento, con ajuste para targetSize) ---
class Tri {
    constructor(x, y, s, col, angle, i, j) {
        this.xOriginal = x;
        this.yOriginal = y;
        this.angleOriginal = angle; // Guardar ángulo original
        this.iOriginal = i; 
        this.jOriginal = j; 
        this.x = x;
        this.y = y;
        this.size = s;
        this.col = col;
        this.angle = angle;
        this.targetX = x;
        this.targetY = y;
        this.targetSize = s; 
    }

    show() {
        // Animación suave (lerp)
        this.x = lerp(this.x, this.targetX, 0.1);
        this.y = lerp(this.y, this.targetY, 0.1);
        this.size = lerp(this.size, this.targetSize, 0.1);

        push();
        translate(this.x, this.y);
        rotate(this.angle);
        fill(this.col);

        // Dibuja el triángulo centrado en (0,0)
        triangle(
            -this.size / 2, this.size / 2,
            this.size / 2, this.size / 2,
            -this.size / 2, -this.size / 2
        );

        pop();
    }
}

// --- CLASE ICON (Nueva clase para manejar iconos SVG) ---
class Icon {
    constructor(x, y, s, img, i, j) {
        this.xOriginal = x;
        this.yOriginal = y;
        this.iOriginal = i; 
        this.jOriginal = j; 
        this.x = x;
        this.y = y;
        this.size = s;
        this.img = img; // Objeto PImage/SVG
        this.targetX = x;
        this.targetY = y;
        this.targetSize = s; 
    }

    show() {
        // Animación suave (lerp)
        this.x = lerp(this.x, this.targetX, 0.1);
        this.y = lerp(this.y, this.targetY, 0.1);
        this.size = lerp(this.size, this.targetSize, 0.1);

        push();
        imageMode(CENTER);
        // Dibuja el icono centrado en (this.x, this.y)
        image(this.img, this.x, this.y, this.size, this.size);
        pop();
    }
}

// --- FUNCIÓN ADICIONAL: Guardar Canvas ---
function keyTyped() {
    if (key === 's' || key === 'S') {
        saveCanvas('grid_triangular_iconos_movimiento', 'png');
    }
}

// --- FUNCIÓN ADICIONAL: Mezclar Array ---
function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        let j = floor(random(i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
}
