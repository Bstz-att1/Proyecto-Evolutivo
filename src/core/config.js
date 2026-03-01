/**
 * Configuración centralizada de la aplicación
 * Contiene constantes y configuraciones globales
 */

// URL base de la API
export const API_URL = "http://localhost:3000/todos";

// Configuración de la aplicación
export const APP_CONFIG = {
    // Tiempo máximo de espera para peticiones (ms)
    REQUEST_TIMEOUT: 10000,
    
    // Número de tareas a mostrar por defecto
    DEFAULT_TASK_LIMIT: 5,
    
    // Duración de las notificaciones (ms)
    NOTIFICATION_DURATION: 5000
};
