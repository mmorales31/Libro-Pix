// --- acerca_sketch.js ---
// (Corregido para centrarse con PADDING INTERNO)

// Se crea una instancia de p5.js para evitar conflictos
const s_acerca = (p) => { 
    let triangles = [];
    let cols, rows;
    let gap = 10;
    let moved = false;
    let tex; // Variable para la textura
    let parentContainer; // Variable para guardar el contenedor

    const ORANGE = "#E64B19";
    const LILAC = "#EDE4F2"; 

    p.setup = function() {
        // 1. Busca el contenedor .fixed-visual
        parentContainer = document.querySelector('.fixed-visual');
        
        // 2. Crea el canvas con el tamaño de ese contenedor
        const canvas = p.createCanvas(
            parentContainer.clientWidth, 
            parentContainer.clientHeight, // Lee el alto del contenedor
            p.WEBGL
        );
        // 3. Asigna el canvas directamente al elemento .fixed-visual
        canvas.parent(parentContainer); 
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

        // 4. Llama a la función que crea la grilla
        createGrid();
    }

    // --- FUNCIÓN createGrid MODIFICADA ---
    function createGrid() {
        triangles = [];
        moved = false; 
        
        cols = 6;
        rows = 7;

        // 1. Define un "padding".
        let padding = 100; 

        // 2. Calcula el ancho y alto interior (restando el padding)
        let innerWidth = p.width - padding * 2;
        let innerHeight = p.height - padding * 2;
        
        // 3. Calcula el tamaño de los triángulos basándose en el área interior
        let w = (innerWidth - gap * (cols + 1)) / cols;
        let h = (innerHeight - gap * (rows + 1)) / rows;
        let size = p.min(w, h);

        // --- AJUSTE DE CENTRADO ---
        let x_offset = 50; // <-- Desplazamiento de 50px a la derecha


        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                if (p.random() < 0.05) continue; 

                // --- ¡LÓGICA DE CENTRADO CORREGIDA! ---
                // Se centra la grilla usando innerWidth/2 en lugar de p.width/2
                let x = i * (size + gap) + gap + size / 2 - innerWidth / 2 + x_offset; // <-- offset añadido
                let y = j * (size + gap) + gap + size / 2 - innerHeight / 2;
                // --- FIN DE LA CORRECCIÓN ---

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

    // Se ejecuta si el usuario cambia el tamaño de la ventana
    p.windowResized = function() {
        p.resizeCanvas(parentContainer.clientWidth, parentContainer.clientHeight);
        createGrid();
    }


    p.draw = function() {
        p.background(255);
        for (let t of triangles) {
            t.show();
        }
    }

    p.mousePressed = function() {
        // --- CÁLCULO DE PADDING CORREGIDO ---
        // Usa la misma lógica de padding y centrado que createGrid()
        let padding = 100; 
        let innerWidth = p.width - padding * 2;
        let innerHeight = p.height - padding * 2;
        
        let w = (innerWidth - gap * (cols + 1)) / cols;
        let h = (innerHeight - gap * (rows + 1)) / rows;
        let baseSize = p.min(w, h);
        // --- FIN DE LA CORRECCIÓN ---
        
        // --- AJUSTE DE CENTRADO ---
        let x_offset = 50; // <-- Mismo desplazamiento

        if (!moved) {
            let grid = [];
            for (let i = 0; i < cols; i++) {
                grid[i] = [];
                for (let j = 0; j < rows; j++) {
                    grid[i][j] = true; // libre
                }
            }

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
                                grid[i][j] = grid[i + 1][j] = false;
                                grid[i][j + 1] = grid[i + 1][j + 1] = false;
                                
                                // --- LÓGICA DE CENTRADO CORREGIDA ---
                                t.targetX = i * (baseSize + gap) + gap + baseSize - innerWidth / 2 + gap/2 + x_offset; // <-- offset añadido
                                t.targetY = j * (baseSize + gap) + gap + baseSize - innerHeight / 2 + gap/2;
                                t.targetSize = baseSize * 2 + gap; 
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
                                // --- LÓGICA DE CENTRADO CORREGIDA ---
                                t.targetX = i * (baseSize + gap) + gap + baseSize / 2 - innerWidth / 2 + x_offset; // <-- offset añadido
                                t.targetY = j * (baseSize + gap) + gap + baseSize / 2 - innerHeight / 2;
                                t.targetSize = baseSize;
                                t.angle = p.random([0, p.HALF_PI, p.PI, 3 * p.HALF_PI]);
                                placed = true;
                            }
                        }
                    }
                }

                if (!placed) {
                    // --- ¡CORRECCIÓN AQUÍ! ---
                    // En lugar de mandarlos fuera de la pantalla,
                    // hacemos que se encojan en su lugar.
                    t.targetX = t.x; // Quédate en tu 'x' actual
                    t.targetY = t.y; // Quédate en tu 'y' actual
                    t.targetSize = 0; // Encógete hasta desaparecer
                    // --- FIN DE LA CORRECCIÓN ---
                }
            }

            moved = true;
        } else {
            // volver al inicio (esto funciona porque t.xOriginal usa el mismo cálculo)
            for (let t of triangles) {
                t.targetX = t.xOriginal;
                t.targetY = t.yOriginal;
                t.targetSize = t.sizeOriginal;
            }
            moved = false;
        }
    }

    class Tri {
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
            // --- ANIMACIÓN MÁS RÁPIDA ---
            // Se cambió 0.1 por 0.2
            this.x = p.lerp(this.x, this.targetX, 0.2);
            this.y = p.lerp(this.y, this.targetY, 0.2);
            this.size = p.lerp(this.size, this.targetSize, 0.2);

            p.push();
            p.translate(this.x, this.y);
            p.rotate(this.angle);

            if (this.useTexture) {
                p.noStroke();
                p.beginShape();
                p.texture(tex);
                p.vertex(-this.size / 2, this.size / 2, 0, tex.height);
                p.vertex(this.size / 2, this.size / 2, tex.width, tex.height);
                p.vertex(-this.size / 2, -this.size / 2, 0, 0);
                p.endShape(p.CLOSE);
            } else {
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
    
    p.keyTyped = function() {
        if (p.key === 's' || p.key === 'S') {
            p.saveCanvas('grid_triangular_acerca', 'png'); 
        }
    }
    
    function shuffleArray(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            let j = p.floor(p.random(i + 1));
            // --- ¡BUG CORREGIDO AQUÍ! ---
            // Estaba [arr[j], arr[j]], lo que corrompía el array.
            // Ahora es [arr[j], arr[i]]
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    }
};

let myp5_acerca = new p5(s_acerca);

function mousePressed() {
    // 🔥 CÓDIGO CRÍTICO: DETENER SI EL CLIC ESTÁ FUERA DEL CANVAS
    if (mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height) {
        return; // Salir de la función si el cursor está fuera del canvas
    }

    // --- El resto de tu lógica de reorganización comienza aquí ---
    let w_calc = (width - gap * (cols + 1)) / cols;
    // ... etc.
}