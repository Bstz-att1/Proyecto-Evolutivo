/**
 * Módulo de Notificaciones (RF03)
 * Sistema estructurado e independiente para mensajes de usuario.
 * No depende del módulo API ni de la lógica de negocio.
 */

// Contenedor para las notificaciones (Toast)
let notificationContainer = null;

function getNotificationContainer() {
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.id = 'notification-toast-container';
        // Estilos inline para asegurar independencia y visibilidad
        Object.assign(notificationContainer.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: '9999',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
        });
        document.body.appendChild(notificationContainer);
    }
    return notificationContainer;
}

/**
 * Crea y muestra una notificación visual
 * @param {string} mensaje - Texto a mostrar
 * @param {string} tipo - 'success', 'error', 'info'
 */
function mostrarNotificacion(mensaje, tipo) {
    const container = getNotificationContainer();
    const toast = document.createElement('div');
    
    // Estilos base
    Object.assign(toast.style, {
        padding: '15px 20px',
        borderRadius: '5px',
        color: 'white',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        minWidth: '250px',
        maxWidth: '400px',
        fontSize: '14px',
        fontFamily: 'sans-serif',
        animation: 'fadeIn 0.3s ease-in-out'
    });

    // Colores según tipo
    const colores = {
        success: '#28a745', // Verde
        error: '#dc3545',   // Rojo
        info: '#17a2b8'     // Azul
    };
    toast.style.backgroundColor = colores[tipo] || colores.info;
    toast.textContent = mensaje;

    container.appendChild(toast);

    // Auto-eliminar después de 5 segundos
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 5000);
}

export function mostrarExito(mensaje) {
    mostrarNotificacion(mensaje, 'success');
}

export function mostrarError(mensaje) {
    mostrarNotificacion(mensaje, 'error');
}

export function mostrarInfo(mensaje) {
    mostrarNotificacion(mensaje, 'info');
}