// --- SCRIPT PRINCIPAL DE LÓGICA Y MENÚ (VERSIÓN FINAL LIMPIA) ---
document.addEventListener('DOMContentLoaded', () => {
    
    // ===================================
    //  1. DECLARACIÓN DE SELECTORES
    // ===================================
    const menuIcon = document.getElementById('menuIcon');
    const sidebarNav = document.getElementById('sidebarNav');
    const actionButtons = document.querySelectorAll('.action-button');
    const screenContent = document.querySelector('.screen-content');
    
    // Selectores para el submenú de Casos de Uso
    const toggleArrow = document.querySelector('.submenu-toggle-arrow'); 
    const casosSubmenu = document.getElementById('casos-submenu');
    
    // =======================================================
    //  🔥 FUNCIÓN DE RESETEO TOTAL
    //  Cierra el submenú y endereza la flecha.
    // =======================================================
    const resetMenuState = () => {
        if (casosSubmenu) {
            casosSubmenu.classList.remove('active'); // Ocultar lista
        }
        if (toggleArrow) {
            toggleArrow.classList.remove('active'); // Enderezar flecha
        }
    };

    // =======================================================
    //  2. SOLUCIÓN CRÍTICA: AISLAMIENTO DE EVENTOS
    // =======================================================
    if (sidebarNav) {
        const stopPropagationHandler = (event) => {
            if (sidebarNav.classList.contains('active')) {
                event.stopPropagation();
            }
        };

        sidebarNav.addEventListener('click', stopPropagationHandler);
        sidebarNav.addEventListener('mousedown', stopPropagationHandler);
        sidebarNav.addEventListener('mouseup', stopPropagationHandler);
    }
    
    // =======================================================
    //  A. FUNCIONALIDAD DEL MENÚ DE HAMBURGUESA
    // =======================================================
    if (menuIcon && sidebarNav && screenContent) {
        menuIcon.addEventListener('click', (event) => {
            event.stopPropagation(); 

            sidebarNav.classList.toggle('active');
            menuIcon.classList.toggle('active'); 
            screenContent.classList.toggle('menu-open'); 
            
            // Si acabamos de CERRAR el menú con el botón, reseteamos el submenú
            if (!sidebarNav.classList.contains('active')) {
                resetMenuState();
            }
        });
        
        // Lógica de cierre al hacer clic fuera (en el contenido)
        document.addEventListener('click', (event) => {
            const isClickInsideMenu = sidebarNav.contains(event.target);
            const isClickOnIcon = menuIcon.contains(event.target);
            
            if (!isClickInsideMenu && !isClickOnIcon && sidebarNav.classList.contains('active')) {
                sidebarNav.classList.remove('active');
                menuIcon.classList.remove('active');
                screenContent.classList.remove('menu-open');
                
                // 🔥 AL CERRAR: Reseteamos para que la próxima vez esté todo cerrado
                resetMenuState();
            }
        });
    }

    // =================================================================
    //  B. LÓGICA DE CIERRE EN ENLACES
    // =================================================================
    document.querySelectorAll('.sidebar-nav ul li a').forEach(link => {
        // Quitamos filtros complejos. Si es un link del menú, que cierre y resetee.
        link.addEventListener('click', (e) => {
            setTimeout(() => {
                sidebarNav.classList.remove('active');
                menuIcon.classList.remove('active');
                if (screenContent) screenContent.classList.remove('menu-open');
                
                // 🔥 AL NAVEGAR: Reseteamos también
                resetMenuState();
                
            }, 100); 
        });
    });

    // =================================================================
    //  C. FUNCIONALIDAD: SUBMENÚ ACORDEÓN (SOLO CLIC EN FLECHA)
    // =================================================================
    if (toggleArrow && casosSubmenu) {
        toggleArrow.addEventListener('click', (e) => {
            e.stopPropagation(); 
            // Aquí solo hacemos toggle (abrir/cerrar) al clickear la flecha
            casosSubmenu.classList.toggle('active');
            toggleArrow.classList.toggle('active'); 
        });
    }

    // (HEMOS ELIMINADO LA SECCIÓN "LÓGICA DE PERSISTENCIA" PARA QUE SIEMPRE EMPIECE CERRADO)

    // ===================================
    //  D. INTERACTIVIDAD BÁSICA (MODAL, ETC)
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