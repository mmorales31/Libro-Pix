// --- Partitura PiX (Naranja, Lila y Textura) ---
// Canvas 700x900 con WEBGL (requerido para texturas)
// Grilla 6x7
// Colores: Naranja, Lila y Textura Negra (distribución 1/3 cada uno)

// Se crea una instancia de p5.js para evitar conflictos
const s = (p) => { 
    let triangles = [];
    let cols, rows;
    let gap = 10;
    let moved = false;
    let tex; // Variable para la textura

    const ORANGE = "#E64B19";
    const LILAC = "#EDE4F2"; 

    p.setup = function() {
        // ¡IMPORTANTE! Se añade WEBGL, necesario para la textura
        const canvas = p.createCanvas(700, 800, p.WEBGL);
        canvas.parent('p5-container'); // <-- Asigna el canvas al contenedor
        p.noStroke();
        p.frameRate(30);

        // --- Creación de la Textura Negra ---
        tex = p.createGraphics(200, 200);
        tex.background(255);
        tex.noStroke();
        for (let i = 0; i < 6000; i++) {
            tex.fill(0, p.random(50, 150));
            tex.circle(p.random(tex.width), p.random(tex.height), p.random(1, 3));
        }
        // ------------------------------------

        cols = 6;
        rows = 7;

        let w = (p.width - gap * (cols + 1)) / cols;
        let h = (p.height - gap * (rows + 1)) / rows;
        let size = p.min(w, h);

        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                if (p.random() < 0.05) continue; // deja espacios vacíos

                // Coordenadas ajustadas para WEBGL (centradas)
                let x = i * (size + gap) + gap + size / 2 - p.width / 2;
                let y = j * (size + gap) + gap + size / 2 - p.height / 2;

                // --- Lógica de Color (Textura, Naranja, Lila) ---
                let r = p.random();
                let useTexture = false;
                let c;
                if (r < 0.33) { // 33% Textura
                    useTexture = true;
                    c = null;
                } else if (r < 0.66) { // 33% Naranja
                    useTexture = false;
                    c = p.color(ORANGE);
                } else { // 33% Lila
                    useTexture = false;
                    c = p.color(LILAC);
                }
                // --------------------------------------------

                let ang = p.random([0, p.HALF_PI, p.PI, 3 * p.HALF_PI]);
                triangles.push(new Tri(x, y, size, useTexture, c, ang));
            }
        }
    }

    p.draw = function() {
        p.background(255);
        for (let t of triangles) {
            t.show();
        }
    }

    p.mousePressed = function() {
        let w = (p.width - gap * (cols + 1)) / cols;
        let h = (p.height - gap * (rows + 1)) / rows;
        let baseSize = p.min(w, h);

        if (!moved) {
            // generar grilla de celdas libres
            let grid = [];
            for (let i = 0; i < cols; i++) {
                grid[i] = [];
                for (let j = 0; j < rows; j++) {
                    grid[i][j] = true; // libre
                }
            }

            // barajar triángulos para que el orden cambie
            shuffleArray(triangles);

            for (let t of triangles) {
                let placed = false;

                // 20% de chance de ser pieza grande (2x2)
                if (p.random() < 0.2) {
                    for (let i = 0; i < cols - 1 && !placed; i++) {
                        for (let j = 0; j < rows - 1 && !placed; j++) {
                            if (
                                grid[i][j] &&
                                grid[i + 1][j] &&
                                grid[i][j + 1] &&
                                grid[i + 1][j + 1]
                            ) {
                                // ocupar 2x2
                                grid[i][j] = grid[i + 1][j] = false;
                                grid[i][j + 1] = grid[i + 1][j + 1] = false;

                                // Coordenadas ajustadas para WEBGL (centradas)
                                t.targetX = i * (baseSize + gap) + gap + baseSize - p.width / 2 + gap/2;
                                t.targetY = j * (baseSize + gap) + gap + baseSize - p.height / 2 + gap/2;
                                t.targetSize = baseSize * 2 + gap; // ocupa 2 celdas
                                t.angle = p.random([0, p.HALF_PI, p.PI, 3 * p.HALF_PI]);
                                placed = true;
                            }
                        }
                    }
                }

                // si no fue grande, probar con 1x1
                if (!placed) {
                    for (let i = 0; i < cols && !placed; i++) {
                        for (let j = 0; j < rows && !placed; j++) {
                            if (grid[i][j]) {
                                grid[i][j] = false;
                                // Coordenadas ajustadas para WEBGL (centradas)
                                t.targetX = i * (baseSize + gap) + gap + baseSize / 2 - p.width / 2;
                                t.targetY = j * (baseSize + gap) + gap + baseSize / 2 - p.height / 2;
                                t.targetSize = baseSize;
                                t.angle = p.random([0, p.HALF_PI, p.PI, 3 * p.HALF_PI]);
                                placed = true;
                            }
                        }
                    }
                }

                // si no se pudo poner, se manda fuera (ajustado para WEBGL)
                if (!placed) {
                    t.targetX = -p.width; // Mover fuera del canvas
                    t.targetY = -p.height;
                }
            }

            moved = true;
        } else {
            // volver al inicio
            for (let t of triangles) {
                t.targetX = t.xOriginal;
                t.targetY = t.yOriginal;
                t.targetSize = t.sizeOriginal;
            }
            moved = false;
        }
    }

    class Tri {
        // Constructor actualizado para incluir textura y animación de tamaño
        constructor(x, y, s, useTexture, col, angle) {
            this.xOriginal = x;
            this.yOriginal = y;
            this.sizeOriginal = s;
            this.x = x;
            this.y = y;
            this.size = s;
            this.targetX = x;
            this.targetY = y;
            this.targetSize = s;
            this.useTexture = useTexture;
            this.col = col;
            this.angle = angle;
            this.angleOriginal = angle;
        }

        show() {
            // Animación suave (Lerp) para posición y tamaño
            this.x = p.lerp(this.x, this.targetX, 0.1);
            this.y = p.lerp(this.y, this.targetY, 0.1);
            this.size = p.lerp(this.size, this.targetSize, 0.1);

            p.push();
            p.translate(this.x, this.y);
            p.rotate(this.angle);

            if (this.useTexture) {
                // Dibujar con Textura
                p.noStroke();
                p.beginShape();
                p.texture(tex);
                p.vertex(-this.size / 2, this.size / 2, 0, tex.height);
                p.vertex(this.size / 2, this.size / 2, tex.width, tex.height);
                p.vertex(-this.size / 2, -this.size / 2, 0, 0);
                p.endShape(p.CLOSE);
            } else {
                // Dibujar con Color Sólido (Naranja o Lila)
                p.noStroke();
                p.fill(this.col);
                p.triangle(
                    -this.size / 2, this.size / 2,
                    this.size / 2, this.size / 2,
                    -this.size / 2, -this.size / 2
                );
            }
            p.pop();
        }
    }
    
    // --- FUNCIÓN AÑADIDA ---
    // Guarda el canvas si se presiona la tecla 's'
    p.keyTyped = function() {
        if (p.key === 's' || p.key === 'S') {
            p.saveCanvas('grid_triangular_todos', 'png'); // Nombre de archivo actualizado
        }
    }
    // función para barajar array
    function shuffleArray(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            let j = p.floor(p.random(i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    }
};

// Se instancia p5.js con la función 's'
// y se asigna al contenedor con el ID 'p5-container'
let myp5 = new p5(s);

function mousePressed() {
    // 🔥 CÓDIGO CRÍTICO: DETENER SI EL CLIC ESTÁ FUERA DEL CANVAS
    if (mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height) {
        return; // Salir de la función si el cursor está fuera del canvas
    }

    // --- El resto de tu lógica de reorganización comienza aquí ---
    let w_calc = (width - gap * (cols + 1)) / cols;
    // ... etc.
}