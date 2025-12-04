// La función 'setup' se ejecuta una sola vez al inicio.

// --- Menos textura, más color sólido (naranja/lila) ---

// 0. FACTOR DE ESCALA: Reduce el tamaño del canvas proporcionalmente
const SCALE_FACTOR = 0.8; 

// Base Canvas físico: 17.4 cm x 18.3 cm
const DPI = 96;
const CM2PX = DPI / 2.54;

// Dimensiones originales (sin escalar)
const BASE_W = 17.4; 
const BASE_H = 18.3;

// 1. Dimensiones finales del Canvas (escaladas)
const W = Math.round(BASE_W * CM2PX * SCALE_FACTOR); // Ancho fijo escalado
const H = Math.round(BASE_H * CM2PX * SCALE_FACTOR); // Alto fijo escalado

let triangles = [];
let cols = 6, rows = 6;
let gap = 4;
let moved = false;
let tex;

// Probabilidades (ajusta a gusto)
const P_TEXTURE = 0.25; // 25% con textura negra
const P_ORANGE  = 0.40; // 40% naranja sólido
const P_LILAC   = 0.35; // 35% lila sólido

// --- CAMBIO DE COLOR REALIZADO AQUÍ ---
const ORANGE = "#E3653B"; // Nuevo tono de naranja solicitado
const LILAC  = "#EDE4F2";

function setup() {
    // 1. CREAR CANVAS CON TAMAÑO FIJO Y EN MODO WEBGL
    let cnv = createCanvas(W, H, WEBGL); // Usa W y H escalados

    // 2. MUY IMPORTANTE: Colocar el canvas dentro del contenedor en el HTML 
    cnv.parent('p5-container');

    // Opcional: Centrar el canvas dentro de su contenedor #p5-container 
    cnv.style('display', 'block');
    cnv.style('margin', 'auto'); // Centrado horizontal
    cnv.style('position', 'absolute');
    
    // --- MODIFICACIÓN: Margen superior aumentado a 50px ---
    cnv.style('top', '50px'); 
    
    cnv.style('bottom', '0');
    cnv.style('left', '0');
    cnv.style('right', '0'); // Centrado completo dentro del contenedor

    // textura de grano negra
    tex = createGraphics(200, 200);
    tex.background(255);
    tex.noStroke();
    for (let i = 0; i < 6000; i++) {
        tex.fill(0, random(50, 150));
        tex.circle(random(tex.width), random(tex.height), random(1, 3));
    }

    generarTriangulos();
}

function generarTriangulos() {
    triangles = [];

    let w = (width - gap * (cols + 1)) / cols;
    let h = (height - gap * (rows + 1)) / rows;
    let size = min(w, h);

    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            if (random() < 0.20) continue; // deja algunos espacios en blanco

            // centros de celda (WEBGL: coordenadas del centro son 0,0)
            let x = i * (size + gap) + gap + size / 2 - width / 2;
            let y = j * (size + gap) + gap + size / 2 - height / 2;

            // --- BLOQUE: selección de estilo ---
            let r = random();
            let useTexture = false;
            let c = color(ORANGE);
            if (r < P_TEXTURE) {
                useTexture = true;                 // negro texturizado (poco)
                c = null;
            } else if (r < P_TEXTURE + P_ORANGE) {
                useTexture = false;                // naranja sólido (mayoría)
                c = color(ORANGE);
            } else {
                useTexture = false;                // lila sólido
                c = color(LILAC);
            }
            // ------------------------------------------------------------

            let ang = random([0, HALF_PI, PI, 3 * HALF_PI]);
            triangles.push(new Tri(x, y, size, useTexture, c, ang));
        }
    }
}

function draw() {
    background(255);
    for (let t of triangles) t.show();
}

function mousePressed() {
    // 🛑 NUEVA VERIFICACIÓN DE LÍMITES 🛑
    // Solo si el clic está dentro de las coordenadas del canvas (0 a width/height)
    if (mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height) {
        return;
    }
    
    let w = (width - gap * (cols + 1)) / cols;
    let h = (height - gap * (rows + 1)) / rows;
    let baseSize = min(w, h);

    let grid = Array.from({ length: cols }, () => Array(rows).fill(true));

    if (!moved) {
        shuffleArray(triangles);

        for (let t of triangles) {
            let placed = false;

            // algunos bloques 2x2
            if (random() < 0.2) {
                for (let i = 0; i < cols - 1 && !placed; i++) {
                    for (let j = 0; j < rows - 1 && !placed; j++) {
                        if (grid[i][j] && grid[i+1][j] && grid[i][j+1] && grid[i+1][j+1]) {
                            grid[i][j] = grid[i+1][j] = grid[i][j+1] = grid[i+1][j+1] = false;
                            t.targetX = i * (baseSize + gap) + gap + baseSize - width / 2;
                            t.targetY = j * (baseSize + gap) + gap + baseSize - height / 2;
                            t.targetSize = baseSize * 2 + gap;
                            t.angle = random([0, HALF_PI, PI, 3 * HALF_PI]);
                            placed = true;
                        }
                    }
                }
            }

            // celda 1x1
            if (!placed) {
                for (let i = 0; i < cols && !placed; i++) {
                    for (let j = 0; j < rows && !placed; j++) {
                        if (grid[i][j]) {
                            grid[i][j] = false;
                            t.targetX = i * (baseSize + gap) + gap + baseSize / 2 - width / 2;
                            t.targetY = j * (baseSize + gap) + gap + baseSize / 2 - height / 2;
                            t.targetSize = baseSize;
                            t.angle = random([0, HALF_PI, PI, 3 * HALF_PI]);
                            placed = true;
                        }
                    }
                }
            }
        }
        moved = true;
    } else {
        // volver al estado original
        for (let t of triangles) {
            t.targetX = t.xOriginal;
            t.targetY = t.yOriginal;
            t.targetSize = t.sizeOriginal;
            t.angle = t.angleOriginal;
        }
        moved = false;
    }
}

// -------- Tri con animación de tamaño --------
class Tri {
    constructor(x, y, s, useTexture, col, angle) {
        this.xOriginal = x; this.yOriginal = y; this.sizeOriginal = s;
        this.x = x; this.y = y; this.size = s;
        this.targetX = x; this.targetY = y; this.targetSize = s;
        this.useTexture = useTexture; this.col = col;
        this.angle = angle; this.angleOriginal = angle;
    }
    show() {
        this.x = lerp(this.x, this.targetX, 0.12);
        this.y = lerp(this.y, this.targetY, 0.12);
        this.size = lerp(this.size, this.targetSize, 0.12);

        push();
        translate(this.x, this.y);
        rotate(this.angle);

        if (this.useTexture) {
            noStroke();
            beginShape();
            texture(tex);
            vertex(-this.size/2,  this.size/2, 0,           tex.height);
            vertex( this.size/2,  this.size/2, tex.width,   tex.height);
            vertex(-this.size/2, -this.size/2, 0,           0);
            endShape(CLOSE);
        } else {
            noStroke();
            fill(this.col);
            triangle(
                -this.size/2,  this.size/2,
                this.size/2,  this.size/2,
                -this.size/2, -this.size/2
            );
        }
        pop();
    }
}

// -------- Utilidad --------
function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = floor(random(i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
}