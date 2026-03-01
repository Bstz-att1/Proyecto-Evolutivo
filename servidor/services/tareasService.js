/**
 * Módulo de Servicios - Lógica intermedia entre API y UI
 * Coordina las llamadas a la API y prepara los datos para la UI
 */

import { 
    taskPost, 
    taskGet, 
    taskGetByUser, 
    taskDelete, 
    taskPatch 
} from '../api/index.js';

/**
 * Crea una nueva tarea
 * @param {string} titulo - Título de la tarea
 * @param {string} descripcion - Descripción de la tarea
 * @param {string} userId - ID del usuario
 * @returns {Promise<Object>} - La tarea creada
 */
export async function crearTarea(titulo, descripcion, userId) {
    return await taskPost(titulo, descripcion, userId);
}

/**
 * Obtiene todas las tareas
 * @returns {Promise<Array>} - Array de todas las tareas
 */
export async function obtenerTodasTareas() {
    return await taskGet();
}

/**
 * Obtiene las tareas de un usuario específico
 * @param {string} userId - ID del usuario
 * @returns {Promise<Array>} - Array de tareas del usuario
 */
export async function obtenerTareasPorUsuario(userId) {
    const todas = await taskGetByUser(userId);
    // Tomar solo las últimas 5 del servidor
    return todas.slice(-5).reverse();
}

/**
 * Filtra tareas por estado
 * @param {Array} tareas - Array de tareas a filtrar
 * @param {string} estado - Estado a filtrar (pendiente, en progreso, completada)
 * @returns {Array} - Array de tareas filtradas
 */
export function filtrarTareasPorEstado(tareas, estado) {
    if (!estado) return tareas;
    return tareas.filter(tarea => tarea.estado === estado);
}

/**
 * Aplica filtros combinados y ordena el array de tareas.
 * @param {Array} tareas - Array de tareas a procesar
 * @param {Object} options - Opciones: { titulo, estado, sortBy, sortDir }
 * @returns {Array} - Array filtrado y ordenado
 */
export function aplicarFiltrosYOrdenar(tareas, options = {}) {
    const { titulo = '', estado = '', sortBy = 'fecha', sortDir = 'desc' } = options;

    let resultado = Array.isArray(tareas) ? [...tareas] : [];

    // Filtrar por título (coincidencia parcial, case-insensitive)
    if (titulo && titulo.trim() !== '') {
        const q = titulo.trim().toLowerCase();
        resultado = resultado.filter(t => (t.titulo || '').toLowerCase().includes(q));
    }

    // Filtrar por estado
    if (estado && estado.trim() !== '') {
        resultado = resultado.filter(t => t.estado === estado);
    }

    // Ordenar
    const dir = sortDir === 'asc' ? 1 : -1;

    resultado.sort((a, b) => {
        if (sortBy === 'titulo') {
            const A = (a.titulo || '').toLowerCase();
            const B = (b.titulo || '').toLowerCase();
            if (A < B) return -1 * dir;
            if (A > B) return 1 * dir;
            return 0;
        }

        if (sortBy === 'estado') {
            const A = (a.estado || '').toLowerCase();
            const B = (b.estado || '').toLowerCase(); 
            if (A < B) return -1 * dir;
            if (A > B) return 1 * dir;
            return 0;
        }

        // Por defecto: fecha de creación
        const aTime = a.createdAt ? Date.parse(a.createdAt) : 0;
        const bTime = b.createdAt ? Date.parse(b.createdAt) : 0;
        return (aTime - bTime) * dir;
    });

    return resultado;
}

/**
 * Elimina una tarea
 * @param {string} id - ID de la tarea a eliminar
 * @returns {Promise<boolean>} - true si se eliminó correctamente
 */
export async function eliminarTarea(id) {
    return await taskDelete(id);
}

/**
 * Actualiza una tarea existente
 * @param {string} id - ID de la tarea a actualizar
 * @param {string} titulo - Nuevo título
 * @param {string} descripcion - Nueva descripción
 * @param {string} userId - Nuevo ID de usuario
 * @returns {Promise<Object>} - La tarea actualizada
 */
export async function actualizarTarea(id, titulo, descripcion, userId) {
    return await taskPatch(id, titulo, descripcion, userId);
}

/**
 * Prepara los datos de las tareas para exportación (RF04)
 * @param {Array} tareas - Lista de tareas a exportar
 * @returns {string} - Cadena JSON formateada
 */
export function prepararDatosExportacion(tareas) {
    return JSON.stringify(tareas, null, 2);
}
