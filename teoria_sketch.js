// --- teoria_sketch.js ---
// Partitura PiX (Lila y Textura)
// CORREGIDO: El clic solo funciona sobre el canvas gracias a la verificación de límites en p.mousePressed.

const teoriaSketch = (p) => { 
    let triangles = [];
    let cols, rows;
    let gap = 10;
    let moved = false;
    let tex;
    // Se elimina canvasElement ya que no usaremos event listeners nativos, sino p.mousePressed

    const LILAC = "#EDE4F2";

    p.setup = function() {
        const canvas = p.createCanvas(530, 700, p.WEBGL);
        canvas.parent('p5-container');

        // --- AJUSTE CSS INLINE PARA CENTRADO ---
        const container = document.getElementById('p5-container');
        if (container) {
            container.style.display = 'flex';
            container.style.justifyContent = 'center'; 
            container.style.alignItems = 'center'; 
            container.style.height = '100%'; 
            container.style.padding = '40px 0'; 
        }
        canvas.style('display', 'block');
        canvas.style('margin', '0'); 
        // --- FIN AJUSTE CSS ---

        p.noStroke();
        p.frameRate(30);

        // --- Crear Textura ---
        tex = p.createGraphics(200, 200);
        tex.background(255);
        tex.noStroke();
        for (let i = 0; i < 6000; i++) {
            tex.fill(0, p.random(50, 150));
            tex.circle(p.random(tex.width), p.random(tex.height), p.random(1, 3));
        }

        cols = 6;
        rows = 7;

        let w = (p.width - gap * (cols + 1)) / cols;
        let h = (p.height - gap * (rows + 1)) / rows;
        let size = p.min(w, h);

        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                if (p.random() < 0.05) continue;

                let x = i * (size + gap) + gap + size / 2 - p.width / 2;
                let y = j * (size + gap) + gap + size / 2 - p.height / 2;

                let useTexture = p.random() < 0.5;
                let c = useTexture ? null : p.color(LILAC);

                let ang = p.random([0, p.HALF_PI, p.PI, 3 * p.HALF_PI]);
                triangles.push(new Tri(x, y, size, useTexture, c, ang));
            }
        }
    }

    p.draw = function() {
        p.background(255);
        for (let t of triangles) t.show();
    }

    // 🔥 REINTRODUCIMOS p.mousePressed CON VERIFICACIÓN DE LÍMITES 🔥
    p.mousePressed = function() {
        // 🔥 ESTO ES LA CLAVE: Si el clic está fuera del canvas (coordenadas < 0 o > width/height),
        // la función termina ANTES de que se ejecute la lógica de reorganización.
        if (p.mouseX < 0 || p.mouseX > p.width || p.mouseY < 0 || p.mouseY > p.height) {
            return; 
        }
        
        let w = (p.width - gap * (cols + 1)) / cols;
        let h = (p.height - gap * (rows + 1)) / rows;
        let baseSize = p.min(w, h);

        if (!moved) {
            let grid = [];
            for (let i = 0; i < cols; i++) {
                grid[i] = [];
                for (let j = 0; j < rows; j++) grid[i][j] = true;
            }

            p.shuffleArray(triangles);

            for (let t of triangles) {
                let placed = false;

                // 20% piezas grandes (2x2)
                if (p.random() < 0.2) {
                    for (let i = 0; i < cols - 1 && !placed; i++) {
                        for (let j = 0; j < rows - 1 && !placed; j++) {
                            if (grid[i][j] && grid[i+1][j] && grid[i][j+1] && grid[i+1][j+1]) {

                                grid[i][j] = grid[i+1][j] = false;
                                grid[i][j+1] = grid[i+1][j+1] = false;
                                
                                // Coordenadas corregidas para centrar 2x2 en WEBGL
                                t.targetX = i * (baseSize + gap) + gap + baseSize * 1.5 - p.width / 2;
                                t.targetY = j * (baseSize + gap) + gap + baseSize * 1.5 - p.height / 2;
                                
                                t.targetSize = baseSize * 2 + gap;
                                t.angle = p.random([0, p.HALF_PI, p.PI, 3 * p.HALF_PI]);

                                placed = true;
                            }
                        }
                    }
                }

                // Piezas 1×1
                if (!placed) {
                    for (let i = 0; i < cols && !placed; i++) {
                        for (let j = 0; j < rows && !placed; j++) {
                            if (grid[i][j]) {
                                grid[i][j] = false;

                                t.targetX = i * (baseSize + gap) + gap + baseSize/2 - p.width/2;
                                t.targetY = j * (baseSize + gap) + gap + baseSize/2 - p.height/2;
                                t.targetSize = baseSize;
                                t.angle = p.random([0, p.HALF_PI, p.PI, 3*p.HALF_PI]);

                                placed = true;
                            }
                        }
                    }
                }

                if (!placed) {
                    t.targetX = t.x;
                    t.targetY = t.y;
                    t.targetSize = 0;
                }
            }

            moved = true;

        } else {
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
            this.x = p.lerp(this.x, this.targetX, 0.1);
            this.y = p.lerp(this.y, this.targetY, 0.1);
            this.size = p.lerp(this.size, this.targetSize, 0.1);

            p.push();
            p.translate(this.x, this.y);
            p.rotate(this.angle);

            if (this.useTexture) {
                p.noStroke();
                p.beginShape();
                p.texture(tex);
                p.vertex(-this.size/2, this.size/2, 0, tex.height);
                p.vertex( this.size/2, this.size/2, tex.width, tex.height);
                p.vertex(-this.size/2, -this.size/2, 0, 0);
                p.endShape(p.CLOSE);

            } else {
                p.noStroke();
                p.fill(this.col);
                p.triangle(
                    -this.size/2, this.size/2,
                    this.size/2, this.size/2,
                    -this.size/2, -this.size/2
                );
            }

            p.pop();
        }
    }

    p.keyTyped = function() {
        if (p.key === 's' || p.key === 'S')
            p.saveCanvas('grid_triangular_lila', 'png');
    }

    // Hace que shuffleArray sea accesible desde la instancia
    p.shuffleArray = function(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            let j = p.floor(p.random(i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    }
};

let myp5Teoria = new p5(teoriaSketch);
// SE ELIMINA LA FUNCIÓN mousePressed() GLOBAL