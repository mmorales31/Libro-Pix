// --- SCRIPT PRINCIPAL DE LÓGICA Y MENÚ ---
document.addEventListener('DOMContentLoaded', () => {
    
    // ===================================
    //  1. DECLARACIÓN DE SELECTORES
    // ===================================
    const menuIcon = document.getElementById('menuIcon');
    const sidebarNav = document.getElementById('sidebarNav');
    const actionButtons = document.querySelectorAll('.action-button');
    const screenContent = document.querySelector('.screen-content');
    
    // Selectores para el submenú de Casos de Uso
    const toggleArrow = document.querySelector('.submenu-toggle-arrow'); 
    const casosSubmenu = document.getElementById('casos-submenu');
    
    // =======================================================
    // 💥 SOLUCIÓN CRÍTICA: AISLAMIENTO DE EVENTOS (ZONA DEL MENÚ)
    // =======================================================
    
    if (sidebarNav) {
        // 1. Intercepta los eventos de clic y pulsación en la BARRA LATERAL
        const stopPropagationHandler = (event) => {
            // Solo detenemos la propagación si la barra está abierta
            if (sidebarNav.classList.contains('active')) {
                event.stopPropagation();
            }
        };

        // Bloquear click, mousedown y mouseup para cubrir todas las bases de interacción
        sidebarNav.addEventListener('click', stopPropagationHandler);
        sidebarNav.addEventListener('mousedown', stopPropagationHandler);
        sidebarNav.addEventListener('mouseup', stopPropagationHandler);
    }
    
    // =======================================================
    //  A. FUNCIONALIDAD DEL MENÚ DE HAMBURGUESA
    // =======================================================
    
    if (menuIcon && sidebarNav && screenContent) {
        menuIcon.addEventListener('click', (event) => {
            // 🔥 SOLUCIÓN CRÍTICA AÑADIDA: Detiene el clic en el icono para que no llegue a P5.js
            event.stopPropagation(); 

            // Alternar clases de visibilidad y animación
            sidebarNav.classList.toggle('active');
            menuIcon.classList.toggle('active'); 

            // Clase necesaria para posibles bloqueos de scroll/clic en el body
            screenContent.classList.toggle('menu-open'); 
        });
        
        // Lógica de cierre al hacer clic fuera
        document.addEventListener('click', (event) => {
            const isClickInsideMenu = sidebarNav.contains(event.target);
            const isClickOnIcon = menuIcon.contains(event.target);
            
            if (!isClickInsideMenu && !isClickOnIcon && sidebarNav.classList.contains('active')) {
                sidebarNav.classList.remove('active');
                menuIcon.classList.remove('active');
                screenContent.classList.remove('menu-open'); // Cerrar clase de bloqueo
            }
        });
    }

    
    // =================================================================
    // 💥 LÓGICA DE CIERRE EN ENLACES: Mantenemos tu lógica de cierre con retraso
    // =================================================================
    document.querySelectorAll('.sidebar-nav ul li a').forEach(link => {
        // Excluimos los enlaces que tienen la clase de Casos de Uso (navegan de forma distinta)
        const isSimpleNavLink = !link.classList.contains('nav-link-pure');

        if (isSimpleNavLink) {
            link.addEventListener('click', (e) => {
                // El stopPropagationHandler en sidebarNav ya actuó, el canvas está seguro.
                
                // Cerramos el menú con un retraso, dando tiempo a la navegación
                setTimeout(() => {
                    sidebarNav.classList.remove('active');
                    menuIcon.classList.remove('active');
                    if (screenContent) screenContent.classList.remove('menu-open');
                }, 100); 
            });
        }
    });


    // =================================================================
    //  B. FUNCIONALIDAD: SUBMENÚ ACORDEÓN
    // =================================================================

    if (toggleArrow && casosSubmenu) {
        toggleArrow.addEventListener('click', (e) => {
            
            e.stopPropagation(); // CRÍTICO: Detiene la propagación en la flecha (evita que el document.click cierre el menú)
            
            casosSubmenu.classList.toggle('active');
            toggleArrow.classList.toggle('active'); 
        });
    }

    
    // =================================================================
    //  C. LÓGICA DE PERSISTENCIA (SÓLO CASOS ESPECÍFICOS)
    // =================================================================
    
    const currentUrl = window.location.pathname;
    const isSpecificCasePage = currentUrl.includes('casos_'); 
    
    if (isSpecificCasePage) {
        if (casosSubmenu && toggleArrow) {
            casosSubmenu.classList.add('active');
            toggleArrow.classList.add('active'); 
        }
    }


    // ===================================
    //  D. INTERACTIVIDAD BÁSICA DE BOTONES (Modal, etc.)
    // ===================================
    
    actionButtons.forEach(button => {
        button.addEventListener('click', () => {
            console.log(`Botón "${button.textContent}" clicado`);
        });
    });
    
    // --- Lógica del Modal ---
    const imageModal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    const closeButton = document.querySelector('.close-button');
    const clickableImageContainers = document.querySelectorAll('.clickable-image-container');

    if (imageModal) {
        clickableImageContainers.forEach(container => {
            container.addEventListener('click', function() {
                const fullSizeSrc = this.getAttribute('data-fullsize-src');
                if (fullSizeSrc) {
                    modalImage.src = fullSizeSrc;
                    imageModal.classList.add('active');
                    document.body.style.overflow = 'hidden';
                }
            });
        });

        function closeModal() {
            imageModal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }

        if (closeButton) closeButton.addEventListener('click', closeModal);

        imageModal.addEventListener('click', function(event) {
            if (event.target === imageModal || event.target === closeButton) {
                closeModal();
            }
        });

        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape' && imageModal.classList.contains('active')) {
                closeModal();
            }
        });
    }
});