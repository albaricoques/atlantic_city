// ---- Reproducir audio de la rana ----
function playFrogAudio(){
  const audio = document.getElementById('frogAudio');
  audio.currentTime = 0; // Reiniciar el audio
  audio.volume = 0.3; // Reducir volumen al 30%
  audio.play().catch(e => console.log('Audio no se pudo reproducir:', e));
}

// ---- Animación de entrada de la rana (solo caída + bubble, sin explosión) ----
function playFrogAnimation(frogId, bubbleId){
  const frog = document.getElementById(frogId);
  const bubble = document.getElementById(bubbleId);
  
  // Resetear animaciones
  frog.style.animation = 'none';
  frog.classList.remove('idle');
  frog.offsetHeight; // Trigger reflow
  frog.style.animation = 'frogEntry 3s ease-out forwards'; // Más lento: 3s en lugar de 2s
  
  bubble.style.animation = 'none';
  setTimeout(() => {
    bubble.style.animation = 'bubbleFadeIn 0.5s ease-out forwards';
  }, 3000);
  
  // Agregar animación idle después de la entrada
  setTimeout(() => {
    frog.classList.add('idle');
  }, 3000);
}

// ---- Cambio de vista SIN recargar la página ----
function showView(view){
  const isLogin = view === 'login';

  document.getElementById('view-login').style.display = isLogin ? 'grid' : 'none';
  document.getElementById('view-register').style.display = isLogin ? 'none' : 'grid';

  document.getElementById('tabLogin').classList.toggle('active', isLogin);
  document.getElementById('tabRegister').classList.toggle('active', !isLogin);

  talk(isLogin ? 'bubble-login' : 'bubble-register');
  
  // Reproducir animación de la rana al cambiar de vista
  const frogId = isLogin ? 'frog-login' : 'frog-register';
  const bubbleId = isLogin ? 'bubble-login' : 'bubble-register';
  playFrogAnimation(frogId, bubbleId);
}

// ---- Animación de "boca hablando" al hacer clic en "área de TI" ----
// Reproduce automáticamente al cargar la página (vista Login por defecto)
window.addEventListener('DOMContentLoaded', () => {
  limpiarCuentasAntiguas();
  crearUsuarioPorDefecto();

  // Esta animación es solo para la pantalla de login; en el resto de
  // páginas (dashboard, gestión de perfiles, etc.) no existe la rana
  // de login, así que no se ejecuta ahí.
  if(document.getElementById('frog-login')){
    playFrogAnimation('frog-login', 'bubble-login');
    talk('bubble-login');
  }
});

function limpiarCuentasAntiguas(){
  const cuentas = obtenerCuentas();
  const cuentasValidas = cuentas.filter(c => {
    return c && typeof c.id === 'string' && c.id.startsWith('AC')
        && typeof c.nombre === 'string'
        && typeof c.rolArea === 'string'
        && ROLES_PERMITIDOS.includes(c.rolArea);
  });
  if(cuentasValidas.length !== cuentas.length){
    guardarCuentas(cuentasValidas);
    sessionStorage.removeItem('ac_sesion');
  }
}

function talk(bubbleId){
  const frogId = bubbleId === 'bubble-login' ? 'frog-login' : 'frog-register';
  const frog = document.getElementById(frogId);

  frog.classList.add('talking');

  // Duración simulada de la "frase" hablada (estilo Loquendo: cortante y robótico)
  clearTimeout(frog._talkTimeout);
  frog._talkTimeout = setTimeout(() => {
    frog.classList.remove('talking');
  }, 2200);
}

// ---- Registro e inicio de sesión (demo académica, sin backend real) ----
// Las cuentas se guardan en localStorage del navegador, así que solo
// se puede ingresar si antes te registraste desde este mismo navegador.

const ROLES_PERMITIDOS = [
  'Servicio al Cliente — Agente de Sala',
  'Servicio al Cliente — Supervisor',
  'Marketing — Gerente de Marketing',
  'Marketing — Analista de Promociones',
  'Operaciones — Gerente de Operaciones',
  'Operaciones — Colaborador de Sala',
  'TI — Administrador del Sistema',
  'TI — Soporte Técnico',
  'Recursos Humanos — Especialista de Gestión',
  'Alta Dirección — Gerente General'
];

const PERMISOS_POR_ROL = {
  'Servicio al Cliente — Agente de Sala': ['perfiles', 'incidentes'],
  'Servicio al Cliente — Supervisor': ['perfiles', 'incidentes'],
  'Marketing — Gerente de Marketing': ['segmentacion', 'reportes'],
  'Marketing — Analista de Promociones': ['segmentacion'],
  'Operaciones — Gerente de Operaciones': ['incidentes'],
  'Operaciones — Colaborador de Sala': ['incidentes'],
  'TI — Administrador del Sistema': ['perfiles', 'incidentes', 'segmentacion', 'reportes'],
  'TI — Soporte Técnico': ['perfiles', 'incidentes', 'segmentacion'],
  'Recursos Humanos — Especialista de Gestión': [],
  'Alta Dirección — Gerente General': ['perfiles', 'incidentes', 'segmentacion', 'reportes']
};

function obtenerModulosBloqueados(rol){
  const TODOS_LOS_MODULOS = ['perfiles', 'incidentes', 'segmentacion', 'reportes'];
  const permitidos = PERMISOS_POR_ROL[rol] || [];
  return TODOS_LOS_MODULOS.filter(m => !permitidos.includes(m));
}

function mostrarDenegadoYRedirigir(redirigirA){
  alert('🔒 ACCESO DENEGADO\n\nNo tienes permiso para acceder a este módulo. Ponte en contacto con el Administrador del Sistema.');
  window.location.href = redirigirA;
}

function validarAccesoModulo(modulo){
  const sesionRaw = sessionStorage.getItem('ac_sesion');
  if(!sesionRaw){
    window.location.href = 'atlantic-city-login.html';
    return false;
  }
  try {
    const sesion = JSON.parse(sesionRaw);
    if(!sesion || !sesion.rolArea){
      sessionStorage.removeItem('ac_sesion');
      window.location.href = 'atlantic-city-login.html';
      return false;
    }
    const permitidos = PERMISOS_POR_ROL[sesion.rolArea] || [];
    if(!permitidos.includes(modulo)){
      mostrarDenegadoYRedirigir('dashboard.html');
      return false;
    }
    return true;
  } catch(e) {
    sessionStorage.removeItem('ac_sesion');
    window.location.href = 'atlantic-city-login.html';
    return false;
  }
}

function obtenerCuentas(){
  return JSON.parse(localStorage.getItem('ac_cuentas') || '[]');
}

function guardarCuentas(cuentas){
  localStorage.setItem('ac_cuentas', JSON.stringify(cuentas));
}

function crearUsuarioPorDefecto(){
  const cuentas = obtenerCuentas();
  const dniDefault = '12345678';
  const idDefault = 'AC' + dniDefault;

  if(!cuentas.some(c => c.id === idDefault)){
    cuentas.push({
      id: idDefault,
      dni: dniDefault,
      nombre: 'Master Chief',
      rolArea: 'TI — Administrador del Sistema',
      pass: 'Admin123'
    });
    guardarCuentas(cuentas);
    console.log('Usuario por defecto creado:', idDefault);
  }
}

function registrarYVolverALogin(){
  const dni = document.getElementById('regId').value.trim();
  const nombre = document.getElementById('regNombre').value.trim();
  const rolArea = document.getElementById('regRolArea').value;
  const pass = document.getElementById('regPass').value;
  const passConfirm = document.getElementById('regPassConfirm').value;
  const errorEl = document.getElementById('registerError');

  errorEl.style.display = 'none';

  if(!dni || !nombre || !rolArea || !pass || !passConfirm){
    errorEl.textContent = 'Complete todos los campos (incluya Rol y Área).';
    errorEl.style.display = 'block';
    return;
  }

  if(!/^\d{8}$/.test(dni)){
    errorEl.textContent = 'El DNI debe ser un número entero de exactamente 8 dígitos.';
    errorEl.style.display = 'block';
    return;
  }

  if(nombre.length > 50){
    errorEl.textContent = 'El nombre debe tener máximo 50 caracteres (incluyendo espacios).';
    errorEl.style.display = 'block';
    return;
  }

  if(!ROLES_PERMITIDOS.includes(rolArea)){
    errorEl.textContent = 'Seleccione un rol válido de la lista.';
    errorEl.style.display = 'block';
    return;
  }

  if(pass.length < 7 || pass.length > 15){
    errorEl.textContent = 'La contraseña debe tener entre 7 y 15 caracteres.';
    errorEl.style.display = 'block';
    return;
  }

  if(pass !== passConfirm){
    errorEl.textContent = 'Las contraseñas no coinciden.';
    errorEl.style.display = 'block';
    return;
  }

  const idColaborador = 'AC' + dni;
  const cuentas = obtenerCuentas();

  if(cuentas.some(c => c.id === idColaborador)){
    errorEl.textContent = 'Ya existe una cuenta registrada con ese DNI.';
    errorEl.style.display = 'block';
    return;
  }

  cuentas.push({ id: idColaborador, dni, nombre, rolArea, pass });
  guardarCuentas(cuentas);

  // Limpiar formulario
  document.getElementById('regId').value = '';
  document.getElementById('regNombre').value = '';
  document.getElementById('regRolArea').value = '';
  document.getElementById('regPass').value = '';
  document.getElementById('regPassConfirm').value = '';

  // Volver a login y pre-cargar el ID generado con un mensaje de éxito
  showView('login');
  document.getElementById('loginId').value = idColaborador;

  const errorElLogin = document.getElementById('loginError');
  errorElLogin.style.display = 'block';
  errorElLogin.style.background = '#1e3a1e';
  errorElLogin.style.border = '1px solid #3a7a3a';
  errorElLogin.style.color = '#c8f5c8';
  errorElLogin.textContent = `✅ Registro exitoso. Su ID de inicio de sesión es: ${idColaborador}. Ahora ingrese su contraseña.`;
}

function intentarLogin(){
  const id = document.getElementById('loginId').value.trim();
  const pass = document.getElementById('loginPass').value;
  const errorEl = document.getElementById('loginError');

  // Resetear estilo del mensaje por si fue cambiado por el de éxito
  errorEl.style.background = '';
  errorEl.style.border = '';
  errorEl.style.color = '';
  errorEl.textContent = 'ID o contraseña incorrectos, o la cuenta no existe. Recuerde que el ID debe tener el formato AC + DNI (ej: AC12345678). Regístrese primero.';

  const cuentas = obtenerCuentas();
  const cuenta = cuentas.find(c => c.id === id && c.pass === pass);

  if(!cuenta){
    errorEl.style.display = 'block';
    return;
  }

  errorEl.style.display = 'none';
  sessionStorage.setItem('ac_sesion', JSON.stringify({
    id: cuenta.id,
    nombre: cuenta.nombre,
    rolArea: cuenta.rolArea || 'Sin rol asignado'
  }));
  window.location.href = 'dashboard.html';
}
