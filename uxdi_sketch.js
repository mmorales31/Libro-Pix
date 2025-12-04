// Sketch para el Caso UXDI
// Aplica el mismo estilo de posicionamiento y escalado de los casos anteriores.

const W = 700;
const H = 900;
const SCALE_FACTOR = 0.7; // Reducido a 70% del original para márgenes amplios
const CANVAS_OFFSET_Y = 50; // Margen superior de 50px

// --- Variables Globales ---
let triangles = [];
let cols, rows;
let gap = 10; 
let moved = false; 

// Variables para los íconos
let iconHand, iconContacts, iconExpand;

// --- Función Preload ---
function preload() {
    // CRUCIAL: Carga los archivos SVG. 
    iconHand = loadImage("hand.svg");
    iconContacts = loadImage("contacts.svg");
    iconExpand = loadImage("expand.svg");
}

// --- Función Setup ---
function setup() {
    // 1. CREAR CANVAS CON TAMAÑO FIJO Y ESCALADO
    let w_scaled = W * SCALE_FACTOR;
    let h_scaled = H * SCALE_FACTOR;

    let cnv = createCanvas(w_scaled, h_scaled);
    cnv.parent('p5-container'); // Asumiendo que existe un contenedor 'p5-container'

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

    // Calcular el tamaño base de cada celda usando las dimensiones escaladas
    let w = (width - gap * (cols + 1)) / cols;
    let h = (height - gap * (rows + 1)) / rows;
    let size = min(w, h);

    // Crear la grilla de triángulos inicial
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            // 5% de chance de dejar un espacio vacío
            if (random() < 0.05) continue; 

            let x = i * (size + gap) + gap + size / 2;
            let y = j * (size + gap) + gap + size / 2;

            // Paleta de colores (la misma que en los casos anteriores)
            let palette = [
                color("#E3653B"), // Naranja
                color("#F2F0EF"), // Blanco roto
                color("#EDE4F2"), // Lila suave
            ];
            let c = random(palette);
            let ang = random([0, HALF_PI, PI, 3 * HALF_PI]); // Rotación inicial

            triangles.push(new Tri(x, y, size, c, ang));
        }
    }

    // --- ASIGNACIÓN DE ÍCONOS ---
    let availableIcons = [iconHand, iconContacts, iconExpand];
    shuffleArray(triangles);

    for (let i = 0; i < availableIcons.length; i++) {
        if (triangles[i]) {
            triangles[i].isIcon = true; 
            triangles[i].icon = availableIcons[i];
        }
    }
}

// --- Función Draw ---
function draw() {
    background(255); 
    // Mostrar cada elemento (triángulo o ícono)
    for (let t of triangles) {
        t.show();
    }
}

// --- Función MousePressed ---
function mousePressed() {
    // 🛑 NUEVA VERIFICACIÓN DE LÍMITES 🛑
    // Solo reaccionar a clics dentro del canvas
    if (mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height) {
        return;
    }

    // Recalcular el tamaño base dentro de la función (aunque es constante en setup)
    let w_calc = (width - gap * (cols + 1)) / cols;
    let h_calc = (height - gap * (rows + 1)) / rows;
    let baseSize = min(w_calc, h_calc); 

    if (!moved) {
        // --- ESTADO 1: REORGANIZAR ---
        let grid = [];
        for (let i = 0; i < cols; i++) {
            grid[i] = [];
            for (let j = 0; j < rows; j++) {
                grid[i][j] = true; // true = celda libre
            }
        }

        shuffleArray(triangles);

        for (let t of triangles) {
            let placed = false;

            // 20% de chance de ser una pieza grande (2x2)
            if (random() < 0.2) {
                for (let i = 0; i < cols - 1 && !placed; i++) {
                    for (let j = 0; j < rows - 1 && !placed; j++) {
                        // Comprobar si hay un espacio de 2x2 libre
                        if (
                            grid[i][j] && grid[i + 1][j] &&
                            grid[i][j + 1] && grid[i + 1][j + 1]
                        ) {
                            // Ocupar las 4 celdas
                            grid[i][j] = grid[i + 1][j] = false;
                            grid[i][j + 1] = grid[i + 1][j + 1] = false;

                            // Asignar nueva posición y tamaño
                            t.targetX = i * (baseSize + gap) + gap + baseSize;
                            t.targetY = j * (baseSize + gap) + gap + baseSize;
                            t.targetSize = baseSize * 2 + gap; // Usar targetSize
                            if (!t.isIcon) { // Solo rotar triángulos
                                t.angle = random([0, HALF_PI, PI, 3 * HALF_PI]);
                            }
                            placed = true;
                        }
                    }
                }
            }

            // Si no fue grande (o no se pudo poner), probar con 1x1
            if (!placed) {
                for (let i = 0; i < cols && !placed; i++) {
                    for (let j = 0; j < rows && !placed; j++) {
                        if (grid[i][j]) {
                            // Si la celda está libre
                            grid[i][j] = false; // Ocuparla
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

            // Si no se pudo poner en ningún lado (grilla llena), se manda fuera
            if (!placed) {
                t.targetX = -200;
                t.targetY = -200;
                t.targetSize = 0; // Para que desaparezca suavemente
            }
        }

        moved = true; // Cambiar estado a "reorganizado"
    } else {
        // --- ESTADO 2: VOLVER AL INICIO ---
        // Volver a la posición y tamaño original
        for (let t of triangles) {
            t.targetX = t.xOriginal;
            t.targetY = t.yOriginal;
            t.targetSize = t.sizeOriginal;
            t.angle = t.angleOriginal; // Volver al ángulo original
        }
        moved = false; // Cambiar estado a "inicio"
    }
}

// --- Clase Tri ---
class Tri {
    constructor(x, y, s, col, angle) {
        // Posición, tamaño y ángulo original
        this.xOriginal = x;
        this.yOriginal = y;
        this.sizeOriginal = s; // Guardar tamaño original
        this.angleOriginal = angle;

        // Propiedades actuales
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.size = s;
        this.col = col;

        // Posición y tamaño objetivo (hacia donde se anima)
        this.targetX = x;
        this.targetY = y;
        this.targetSize = s; 

        // Propiedades para íconos
        this.isIcon = false; 
        this.icon = null; 
    }

    // Método para mostrar el elemento
    show() {
        // Interpolar (animar suavemente) la posición y el tamaño
        this.x = lerp(this.x, this.targetX, 0.1);
        this.y = lerp(this.y, this.targetY, 0.1);
        this.size = lerp(this.size, this.targetSize, 0.1); // Animación de tamaño

        push(); // Guardar estado de dibujo
        translate(this.x, this.y); // Moverse al centro del elemento

        if (this.isIcon) {
            // --- DIBUJAR COMO ÍCONO ---
            imageMode(CENTER); // Dibujar imagen desde su centro
            image(this.icon, 0, 0, this.size, this.size);
        } else {
            // --- DIBUJAR COMO TRIÁNGULO ---
            rotate(this.angle); // Rotar el triángulo
            fill(this.col); // Usar el color del triángulo
            triangle(
                -this.size / 2,
                this.size / 2,
                this.size / 2,
                this.size / 2,
                -this.size / 2,
                -this.size / 2
            );
        }

        pop(); // Restaurar estado de dibujo
    }
}

// --- Función KeyTyped ---
function keyTyped() {
    if (key === "s" || key === "S") {
        saveCanvas("grid_triangular_iconos_uxdi", "png");
    }
}

// --- Función ShuffleArray ---
function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        let j = floor(random(i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]]; // Intercambio de elementos
    }
}
