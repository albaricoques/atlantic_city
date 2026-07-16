document.addEventListener('DOMContentLoaded', () => {
    // 1. INICIALIZACIÓN DE DATOS (Usuario predeterminado del equipo Scrum)
    if (!localStorage.getItem('ac_collaborators')) {
        const defaultUsers = [
            { id: '1024', name: 'Alvaro Díaz (Scrum Master)', role: 'TI / Scrum', pass: 'admin123' }
        ];
        localStorage.setItem('ac_collaborators', JSON.stringify(defaultUsers));
    }

    // 2. GESTIÓN DEL TEMA (Claro / Oscuro)
    const themeToggleBtn = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;
    const savedTheme = localStorage.getItem('ac_theme') || 'dark';
    htmlElement.setAttribute('data-theme', savedTheme);

    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('ac_theme', newTheme);
    });

    // 3. REFERENCIAS DOM PARA LA SPA
    const authView = document.getElementById('auth-view');
    const dashboardView = document.getElementById('dashboard-view');
    const placeholderView = document.getElementById('module-placeholder-view');
    
    // Referencias Menú Nivel 1
    const mainNavLinks = document.getElementById('main-nav-links');
    const userInfoBadge = document.getElementById('user-info-badge');
    const logoutBtn = document.getElementById('logout-btn');
    const navItems = document.querySelectorAll('.ac-nav-item');

    const alertBox = document.getElementById('alert-box');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    const showAlert = (message, type = 'danger') => {
        alertBox.textContent = message;
        alertBox.className = `alert alert-${type} mt-3 d-block`;
        setTimeout(() => alertBox.classList.add('d-none'), 4000);
    };

    // 4. LÓGICA DE REGISTRO CON VALIDACIÓN ANTI-DUPLICIDAD
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('reg-id').value.trim();
        const name = document.getElementById('reg-name').value.trim();
        const role = document.getElementById('reg-role').value;
        const pass = document.getElementById('reg-pass').value;

        let collaborators = JSON.parse(localStorage.getItem('ac_collaborators')) || [];

        if (collaborators.some(colab => colab.id === id)) {
            showAlert(`¡Error de Homonimia! El DNI/ID "${id}" ya se encuentra registrado.`, 'danger');
            return;
        }

        collaborators.push({ id, name, role, pass });
        localStorage.setItem('ac_collaborators', JSON.stringify(collaborators));

        showAlert('¡Colaborador registrado! Ya puedes iniciar sesión.', 'success');
        registerForm.reset();
        new bootstrap.Tab(document.getElementById('login-tab')).show();
    });

    // 5. LÓGICA DE AUTENTICACIÓN (NIVEL 0 -> NIVEL 1)
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('login-id').value.trim();
        const pass = document.getElementById('login-pass').value;

        const collaborators = JSON.parse(localStorage.getItem('ac_collaborators')) || [];
        const user = collaborators.find(colab => colab.id === id && colab.pass === pass);

        if (user) {
            localStorage.setItem('ac_active_session', JSON.stringify(user));
            renderLevel1(user);
        } else {
            showAlert('Credenciales inválidas. Verifique su ID o contraseña.', 'danger');
        }
    });

    // 6. RENDERIZADO NIVEL 1 (MENÚ SUPERIOR Y DASHBOARD EJECUTIVO)
    const renderLevel1 = (user) => {
        // Asignar datos al navbar
        document.getElementById('user-display-name').textContent = user.name;
        document.getElementById('user-display-role').textContent = user.role;
        
        // Mostrar barra de herramientas y menú de Nivel 1
        mainNavLinks.classList.remove('d-none');
        userInfoBadge.classList.remove('d-none');
        logoutBtn.classList.remove('d-none');
        
        // Cambiar vista del SPA
        authView.classList.add('d-none');
        placeholderView.classList.add('d-none');
        dashboardView.classList.remove('d-none');

        // Resetear menú al dashboard
        setActiveNav('dashboard');
    };

    // 7. GESTIÓN DE NAVEGACIÓN SPA ENTRE MÓDULOS (Nivel 1 -> Nivel 2.X)
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetModule = item.getAttribute('data-module');
            setActiveNav(targetModule);

            if (targetModule === 'dashboard') {
                placeholderView.classList.add('d-none');
                dashboardView.classList.remove('d-none');
            } else {
                dashboardView.classList.add('d-none');
                placeholderView.classList.remove('d-none');
                
                // Configurar el mensaje para los módulos del Nivel 2
                const titleEl = document.getElementById('placeholder-title');
                const descEl = document.getElementById('placeholder-desc');

                if (targetModule === 'perfiles') {
                    titleEl.textContent = '👤 Nivel 2.1: Gestión de Perfiles (PUC)';
                    descEl.textContent = 'Aquí construiremos el formulario para el Perfil Único de Cliente, validando homonimias y eliminando los registros duplicados de sala.';
                } else if (targetModule === 'segmentacion') {
                    titleEl.textContent = '🎯 Nivel 2.2: Motor de Segmentación';
                    descEl.textContent = 'Módulo para el área de Marketing: Algoritmos para agrupar clientes (Ej: VIP Platino) y envío automatizado de cupones digitales.';
                } else if (targetModule === 'incidencias') {
                    titleEl.textContent = '⚠️ Nivel 2.3: Mesa de Incidencias en Sala';
                    descEl.textContent = 'Mantenimiento de SLAs y alertas críticas si un ticket de atención al cliente supera el límite máximo de 2 horas.';
                }
            }
        });
    });

    const setActiveNav = (moduleName) => {
        navItems.forEach(link => {
            if (link.getAttribute('data-module') === moduleName) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    };

    // 8. CERRAR SESIÓN (Regresar a Nivel 0)
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('ac_active_session');
        loginForm.reset();
        
        // Ocultar elementos del menú Nivel 1
        mainNavLinks.classList.add('d-none');
        userInfoBadge.classList.add('d-none');
        logoutBtn.classList.add('d-none');
        
        // Volver al Login
        dashboardView.classList.add('d-none');
        placeholderView.classList.add('d-none');
        authView.classList.remove('d-none');
    });

    // Mantener sesión al recargar la SPA
    const activeSession = JSON.parse(localStorage.getItem('ac_active_session'));
    if (activeSession) {
        renderLevel1(activeSession);
    }
});
