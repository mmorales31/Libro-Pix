// --- LÓGICA: Triángulos con Textura y Colores Sólidos (Naranja/Lila/Gris) ---

// 1. CONSTANTES DE DIMENSIÓN
// Canvas físico deseado: 11.4 cm x 12.325 cm 
const DPI = 96;
const CM2PX = DPI / 2.54;

// Dimensiones finales del canvas
const W = Math.round(13 * CM2PX); // Ancho: ~430 px
const H = Math.round(16 * CM2PX); // Alto: ~465 px

// 2. VARIABLES GLOBALES
let triangles = [];
let cols = 8, rows = 10;
let gap = 4;
let moved = false;
let tex; // Objeto de textura de grano

// 3. CONSTANTES DE COLOR Y PROBABILIDAD
// Probabilidades ajustadas
const P_TEXTURE = 0.20; // 20% textura negra
const P_ORANGE  = 0.40; // 40% naranja sólido
const P_LILAC   = 0.20; // 20% lila sólido
const P_GRAY    = 0.20; // 20% gris sólido

const ORANGE = "#E64B19";
const LILAC  = "#EDE4F2";
const GRAY   = "#E5E5E5";

// Función de configuración inicial (se ejecuta una vez)
function setup() {
    // Crea el canvas con las dimensiones calculadas y en modo WEBGL
    let cnv = createCanvas(W, H, WEBGL);

    // Adjunta el canvas al contenedor HTML llamado 'p5-container'
    // Asegúrate de que tu index.html tiene un div con ese id.
    cnv.parent('p5-container'); 
    cnv.style('display', 'block');
    cnv.style('margin', 'auto');

    cnv.style('margin-left', 'auto');
cnv.style('margin-right', 'auto');
cnv.style('margin-top', '30px'); // <--- NUEVO MARGEN SUPERIOR
    
    frameRate(30);

    // Creación de la textura de grano negra
    tex = createGraphics(200, 200);
    tex.background(255);
    tex.noStroke();
    for (let i = 0; i < 6000; i++) {
        tex.fill(0, random(50, 150));
        tex.circle(random(tex.width), random(tex.height), random(1, 3));
    }

    generarTriangulos();
}

// Función para guardar el canvas al presionar 'S'
function keyTyped() {
    if (key === 's' || key === 'S') {
        saveCanvas('partitura_pix', 'png');
        console.log("¡Canvas guardado como partitura_pix.png!");
    }
}

// Función para inicializar y distribuir los triángulos en la rejilla
function generarTriangulos() {
    triangles = [];

    // Calcula el tamaño máximo de celda disponible
    let w = (width - gap * (cols + 1)) / cols;
    let h = (height - gap * (rows + 1)) / rows;
    let size = min(w, h); 

    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            if (random() < 0.05) continue; // 5% de probabilidad de dejar la celda vacía

            // Posición central de la celda en coordenadas WEBGL (centro es 0,0)
            let x = i * (size + gap) + gap + size / 2 - width / 2;
            let y = j * (size + gap) + gap + size / 2 - height / 2;

            // Selección de color/textura basado en las probabilidades
            let r = random();
            let useTexture = false;
            let c;

            if (r < P_TEXTURE) {
                useTexture = true;
                c = null;
            } else if (r < P_TEXTURE + P_ORANGE) {
                c = color(ORANGE);
            } else if (r < P_TEXTURE + P_ORANGE + P_LILAC) {
                c = color(LILAC);
            } else {
                // Color gris
                c = color(GRAY);
            }

            let ang = random([0, HALF_PI, PI, 3 * HALF_PI]);
            triangles.push(new Tri(x, y, size, useTexture, c, ang));
        }
    }
}

// Bucle principal de dibujo 
function draw() {
    background(255);
    for (let t of triangles) t.show();
}

// Función que maneja la reorganización de los bloques al hacer clic
function mousePressed() {
    // Aseguramos que el click esté dentro del canvas
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

            // 20% de probabilidad de crear un bloque 2x2
            if (random() < 0.2) {
                for (let i = 0; i < cols - 1 && !placed; i++) {
                    for (let j = 0; j < rows - 1 && !placed; j++) {
                        // Verifica si las 4 celdas están disponibles
                        if (grid[i][j] && grid[i+1][j] && grid[i][j+1] && grid[i+1][j+1]) {
                            grid[i][j] = grid[i+1][j] = grid[i][j+1] = grid[i+1][j+1] = false;
                            
                            // Calcula la posición y tamaño para el bloque 2x2 (incluyendo el gap/2 de offset)
                            t.targetX = i * (baseSize + gap) + gap + baseSize - width / 2 + gap/2;
                            t.targetY = j * (baseSize + gap) + gap + baseSize - height / 2 + gap/2;
                            t.targetSize = baseSize * 2 + gap;
                            t.angle = random([0, HALF_PI, PI, 3 * HALF_PI]);
                            placed = true;
                        }
                    }
                }
            }

            // Si no se colocó en 2x2, coloca en una celda 1x1 disponible
            if (!placed) {
                for (let i = 0; i < cols && !placed; i++) {
                    for (let j = 0; j < rows && !placed; j++) {
                        if (grid[i][j]) {
                            grid[i][j] = false;
                            
                            // Calcula la posición y tamaño para el bloque 1x1
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
        // Volver al estado original
        for (let t of triangles) {
            t.targetX = t.xOriginal;
            t.targetY = t.yOriginal;
            t.targetSize = t.sizeOriginal;
            t.angle = t.angleOriginal;
        }
        moved = false;
    }
}

// -------- Clase Tri (Maneja la lógica del triángulo individual) --------
class Tri {
    constructor(x, y, s, useTexture, col, angle) {
        this.xOriginal = x; this.yOriginal = y; this.sizeOriginal = s;
        this.x = x; this.y = y; this.size = s;
        this.targetX = x; this.targetY = y; this.targetSize = s;
        this.useTexture = useTexture; this.col = col;
        this.angle = angle; this.angleOriginal = angle;
    }
    
    show() {
        // Interpolación lineal para animar suavemente la posición y el tamaño
        this.x = lerp(this.x, this.targetX, 0.12);
        this.y = lerp(this.y, this.targetY, 0.12);
        this.size = lerp(this.size, this.targetSize, 0.12);

        push();
        translate(this.x, this.y);
        rotate(this.angle);

        if (this.useTexture) {
            // Dibuja el triángulo con la textura de grano negro (WEBGL)
            noStroke();
            beginShape();
            texture(tex);
            // Coordenadas del triángulo y mapeo UV de la textura
            vertex(-this.size/2,  this.size/2, 0,          tex.height);
            vertex( this.size/2,  this.size/2, tex.width,  tex.height);
            vertex(-this.size/2, -this.size/2, 0,          0);
            endShape(CLOSE);
        } else {
            // Dibuja el triángulo con color sólido
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

// -------- Utilidad: Algoritmo Fisher-Yates para mezclar un array --------
function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = floor(random(i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
}
