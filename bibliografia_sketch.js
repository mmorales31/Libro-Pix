// Lógica del sketch de iconos (preload, mouseClicked)
// fusionada con la plantilla responsive de 'acerca_sketch.js'

// Se crea una instancia de p5.js para evitar conflictos
const s_bibliografia = (p) => { 
    let triangles = [];
    let cols, rows;
    let gap = 10;
    let moved = false;
    let parentContainer; // Variable para guardar el contenedor

    // --- Variables de este sketch ---
    let loadedIcons = [];
    const ICON_FILES = [
      "edit.svg", "search.svg", "view.svg", "comment.svg", "Book PiX.svg",
    ];
    let TOTAL_ICON_TYPES;

    // --- PRELOAD ---
    // Se usa p.preload para cargar los SVGs
    p.preload = function() {
        for (let file of ICON_FILES) {
            loadedIcons.push(p.loadImage(file));
        }
    }

    // --- SETUP ---
    p.setup = function() {
        // 1. Busca el contenedor .fixed-visual
        parentContainer = document.querySelector('.fixed-visual');
        
        // 2. Crea el canvas con el tamaño de ese contenedor
        // ¡SIN WEBGL! Se usa el modo 2D (P2D) para que 'image()' funcione
        const canvas = p.createCanvas(
            parentContainer.clientWidth, 
            parentContainer.clientHeight
        );
        // 3. Asigna el canvas directamente al elemento .fixed-visual
        canvas.parent(parentContainer); 
        p.noStroke();
        p.frameRate(30);

        // 4. Calcula el total de tipos (1 para triángulo + N iconos)
        TOTAL_ICON_TYPES = 1 + loadedIcons.length;

        // 5. Llama a la función que crea la grilla
        createGrid();
    }

    // --- FUNCIÓN createGrid (Con Padding y Offset) ---
    function createGrid() {
        triangles = [];
        moved = false; 
        
        cols = 6;
        rows = 7;

        // 1. Define padding y offset (de 'acerca_sketch.js')
        let padding = 100; 
        let x_offset = 50;

        // 2. Calcula el área interior
        let innerWidth = p.width - padding * 2;
        let innerHeight = p.height - padding * 2;
        
        let w = (innerWidth - gap * (cols + 1)) / cols;
        let h = (innerHeight - gap * (rows + 1)) / rows;
        let size = p.min(w, h);

        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                if (p.random() < 0.3) continue; // 30% de espacios vacíos

                // 3. Calcula coordenadas 2D (con padding y offset)
                let x = padding + x_offset + i * (size + gap) + gap + size / 2;
                let y = padding + j * (size + gap) + gap + size / 2;

                // 4. Lógica de color de este sketch
                let palette = [
                    p.color("#E3653B"),
                    p.color("#F2F0EF"),
                    p.color("#EDE4F2"),
                ];
                let c = p.random(palette);
                let ang = p.random([0, p.HALF_PI, p.PI, 3 * p.HALF_PI]);
                
                let initialIconType = 0; // Empieza como triángulo
                triangles.push(new Tri(x, y, size, c, ang, initialIconType));
            }
        }
        
        // 5. Asigna los iconos únicos
        shuffleArray(triangles);
        let iconsToAssign = loadedIcons.length;
        for (let i = 0; i < iconsToAssign && i < triangles.length; i++) {
            triangles[i].iconType = i + 1; // 1, 2, 3...
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

    // --- mousePressed (Reorganizar todo) ---
    p.mousePressed = function() {
        if (p.mouseX < 0 || p.mouseX > p.width || p.mouseY < 0 || p.mouseY > p.height) {
            return;
        }

        // Usa la misma lógica de padding y centrado
        let padding = 100; 
        let x_offset = 50;
        let innerWidth = p.width - padding * 2;
        let innerHeight = p.height - padding * 2;
        
        let w = (innerWidth - gap * (cols + 1)) / cols;
        let h = (innerHeight - gap * (rows + 1)) / rows;
        let baseSize = p.min(w, h);
        
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
                                
                                // Coordenadas 2D (con padding y offset)
                                t.targetX = padding + x_offset + i * (baseSize + gap) + gap + baseSize;
                                t.targetY = padding + j * (baseSize + gap) + gap + baseSize;
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
                                // Coordenadas 2D (con padding y offset)
                                t.targetX = padding + x_offset + i * (baseSize + gap) + gap + baseSize / 2;
                                t.targetY = padding + j * (baseSize + gap) + gap + baseSize / 2;
                                t.targetSize = baseSize;
                                t.angle = p.random([0, p.HALF_PI, p.PI, 3 * p.HALF_PI]);
                                placed = true;
                            }
                        }
                    }
                }

                if (!placed) {
                    // Fix: encoger en lugar de mover fuera
                    t.targetX = t.x; 
                    t.targetY = t.y; 
                    t.targetSize = 0;
                }
            }

            moved = true;
        } else {
            // volver al inicio
            for (let t of triangles) {
                t.targetX = t.xOriginal;
                t.targetY = t.yOriginal;
                t.targetSize = t.sizeOriginal;
                t.angle = t.angleOriginal;
            }
            moved = false;
        }
    }

    // --- mouseClicked (Cambiar ícono individual) ---
    p.mouseClicked = function() {
        if (p.mouseX < 0 || p.mouseX > p.width || p.mouseY < 0 || p.mouseY > p.height) {
            return;
        }
         
        // Revisa si se hizo clic en un triángulo
        // (Esto funciona porque t.x y t.y son coordenadas 2D)
        for (let t of triangles) {
            let d = p.dist(p.mouseX, p.mouseY, t.x, t.y);
            if (d < t.size / 2) {
                t.iconType = (t.iconType + 1) % TOTAL_ICON_TYPES; 
                
                let palette = [p.color("#E3653B"), p.color("#F2F0EF"), p.color("#EDE4F2")];
                t.col = p.random(palette);
                
                return; // Detiene el loop
            }
        }
    }

    // --- CLASE Tri ---
    class Tri {
        constructor(x, y, s, col, angle, iconType) {
            this.xOriginal = x;
            this.yOriginal = y;
            this.angleOriginal = angle;
            this.sizeOriginal = s; // Guardar tamaño original

            this.x = x;
            this.y = y;
            this.angle = angle;
            this.size = s;
            this.col = col;

            this.targetX = x;
            this.targetY = y;
            this.targetSize = s;

            this.iconType = iconType;
        }

        show() {
            // Animación más rápida y con tamaño
            this.x = p.lerp(this.x, this.targetX, 0.2);
            this.y = p.lerp(this.y, this.targetY, 0.2);
            this.size = p.lerp(this.size, this.targetSize, 0.2);

            p.push();
            p.translate(this.x, this.y);
            
            if (this.iconType === 0) {
                // TIPO 0: Triángulo
                p.fill(this.col); 
                p.rotate(this.angle);
                p.triangle(
                    -this.size / 2, this.size / 2,
                    this.size / 2, this.size / 2,
                    -this.size / 2, -this.size / 2
                );
            } else {
                // TIPO > 0: Icono SVG
                
                // Lógica de Tinte (Naranja sí, otros no)
                if (this.col.toString() === p.color("#E3653B").toString()) {
                    p.tint(this.col); 
                } else {
                    p.noTint(); 
                }

                p.imageMode(p.CENTER);
                let iconIndex = this.iconType - 1; 
                let iconSize = this.size * 0.7; 
                p.image(loadedIcons[iconIndex], 0, 0, iconSize, iconSize);
            }

            p.pop();
        }
    }
    
    // Función para guardar
    p.keyTyped = function() {
        if (p.key === "s" || p.key === "S") {
            p.saveCanvas("grid_bibliografia_icons", "png");
        }
    }

    // Función de barajado (corregida)
    function shuffleArray(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            let j = p.floor(p.random(i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    }
};

// Se instancia p5.js con la nueva función
let myp5_bibliografia = new p5(s_bibliografia);

function mousePressed() {
    // 🔥 CÓDIGO CRÍTICO: DETENER SI EL CLIC ESTÁ FUERA DEL CANVAS
    if (mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height) {
        return; // Salir de la función si el cursor está fuera del canvas
    }

    // --- El resto de tu lógica de reorganización comienza aquí ---
    let w_calc = (width - gap * (cols + 1)) / cols;
    // ... etc.
}