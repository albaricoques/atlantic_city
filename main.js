document.addEventListener('DOMContentLoaded', () => {
    // 1. INICIALIZACIÓN DE DATOS (Con usuario predeterminado del equipo Scrum)
    if (!localStorage.getItem('ac_collaborators')) {
        const defaultUsers = [
            { id: '1024', name: 'Alvaro Díaz (Scrum Master)', role: 'TI / Scrum', pass: 'admin123' }
        ];
        localStorage.setItem('ac_collaborators', JSON.stringify(defaultUsers));
    }

    // 2. GESTIÓN DEL TEMA (Claro / Oscuro)
    const themeToggleBtn = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;

    // Cargar preferencia guardada
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
    const alertBox = document.getElementById('alert-box');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    // Función para mostrar alertas en pantalla
    const showAlert = (message, type = 'danger') => {
        alertBox.textContent = message;
        alertBox.className = `alert alert-${type} mt-3 d-block`;
        setTimeout(() => alertBox.classList.add('d-none'), 4000);
    };

    // 4. LÓGICA DE REGISTRO CON VALIDACIÓN DE NO DUPLICIDAD
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('reg-id').value.trim();
        const name = document.getElementById('reg-name').value.trim();
        const role = document.getElementById('reg-role').value;
        const pass = document.getElementById('reg-pass').value;

        let collaborators = JSON.parse(localStorage.getItem('ac_collaborators')) || [];

        // VALIDACIÓN DE HOMONIMIA / DUPLICIDAD (Según requerimiento de QA)
        const exists = collaborators.some(colab => colab.id === id);
        if (exists) {
            showAlert(`¡Error de Homonimia! El DNI/ID "${id}" ya se encuentra registrado en el sistema.`, 'danger');
            return;
        }

        // Guardar nuevo colaborador
        collaborators.push({ id, name, role, pass });
        localStorage.setItem('ac_collaborators', JSON.stringify(collaborators));

        showAlert('¡Colaborador registrado exitosamente! Ya puedes iniciar sesión.', 'success');
        registerForm.reset();
        
        // Cambiar dinámicamente al tab de Login
        const loginTab = new bootstrap.Tab(document.getElementById('login-tab'));
        loginTab.show();
    });

    // 5. LÓGICA DE AUTENTICACIÓN (NIVEL 0 -> NIVEL 1)
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('login-id').value.trim();
        const pass = document.getElementById('login-pass').value;

        const collaborators = JSON.parse(localStorage.getItem('ac_collaborators')) || [];
        const user = collaborators.find(colab => colab.id === id && colab.pass === pass);

        if (user) {
            // Guardar sesión activa
            localStorage.setItem('ac_active_session', JSON.stringify(user));
            renderDashboard(user);
        } else {
            showAlert('Credenciales inválidas. Verifique su ID o contraseña.', 'danger');
        }
    });

    // 6. CAMBIO DINÁMICO DE VISTA (Comportamiento SPA)
    const renderDashboard = (user) => {
        document.getElementById('user-display-name').textContent = user.name;
        document.getElementById('user-display-role').textContent = user.role;
        
        // Transición de pantallas
        authView.classList.add('d-none');
        dashboardView.classList.remove('d-none');
    };

    // 7. CERRAR SESIÓN
    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.removeItem('ac_active_session');
        loginForm.reset();
        dashboardView.classList.add('d-none');
        authView.classList.remove('d-none');
    });

    // Verificar si ya había una sesión abierta al recargar
    const activeSession = JSON.parse(localStorage.getItem('ac_active_session'));
    if (activeSession) {
        renderDashboard(activeSession);
    }
});
