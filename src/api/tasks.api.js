import { API_URL } from '../core/config.js';

// ======================================================================
//                             METHOD | GET
// ======================================================================
/**
 * Obtiene el listado completo de todas las tareas del sistema.
 * @returns {Promise<Array>} - Un arreglo con todos los objetos de tareas.
 */
export async function taskGet() {
    const response = await fetch(`${API_URL}/tasks`);

    if (!response.ok) {
        throw new Error("Error al obtener tareas");
    }

    const res = await response.json();
    return res;
}

/**
 * Obtiene y filtra las tareas que pertenecen a un usuario específico.
 * @param {number} userId - El ID del usuario a consultar.
 * @returns {Promise<Array>} - Lista de tareas vinculadas al usuario.
 */
export async function taskGetByUser(userId) {
    const response = await fetch(`${API_URL}/tasks`);

    if (!response.ok) {
        throw new Error("Error al obtener tareas");
    }

    const todas = await response.json();

    // 2. Filtramos por el ID del usuario. 
    return todas.filter(tarea => tarea.user_id === userId);
}


// ======================================================================
//                             METHOD | POST
// ======================================================================
/**
 * Crea una nueva tarea en la base de datos.
 * @param {string} titulo - El encabezado de la tarea.
 * @param {string} descripcion - Detalle extenso de la actividad.
 * @param {string} status - Estado inicial (pendiente, en progreso, completada).
 * @param {number} userId - ID del usuario dueño de la tarea.
 * @param {string} created_by - Rol de quien crea la tarea (administrador | usuario).
 * @returns {Promise<Object>} - La tarea creada devuelta por el servidor.
 */
export async function taskPost(titulo, descripcion, status, userId, created_by) {
    const response = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            title: titulo,
            description: descripcion,
            user_id: userId,
            status: status,
            created_by: created_by
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al crear la tarea");
    }

    return await response.json();
}


// ======================================================================
//                             METHOD | PUT
// ======================================================================
/**
 * Reemplaza completamente una tarea existente.
 * @param {number|string} id - ID único de la tarea a reemplazar.
 * @param {string} titulo - Nuevo título.
 * @param {string} descripcion - Nueva descripción.
 * @param {string} status - Nuevo estado.
 * @param {number|string} userId - ID del usuario responsable.
 * @param {string} created_by - Rol de quien crea/gestiona la tarea.
 * @returns {Promise<Object>} - La tarea reemplazada.
 */
export async function taskPut(id, titulo, descripcion, status, userId, created_by) {
    const response = await fetch(`${API_URL}/tasks/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            title: titulo,
            description: descripcion,
            status: status,
            user_id: userId,
            created_by: created_by
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al reemplazar la tarea');
    }

    return await response.json();
}


// ======================================================================
//                             METHOD | PATCH
// ======================================================================
/**
 * Actualiza de forma parcial los datos de una tarea existente.
 * @param {number} id - ID único de la tarea a modificar.
 * @param {string} titulo - Nuevo título (opcional).
 * @param {string} descripcion - Nueva descripción (opcional).
 * @param {string} status - Nuevo estado de la tarea.
 * @param {number} userId - ID del usuario responsable.
 * @returns {Promise<Object>} - La tarea actualizada.
 */
export async function taskPatch(id, titulo, descripcion, status, userId) {
    const response = await fetch(`${API_URL}/tasks/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            title: titulo,
            description: descripcion,
            status: status,
            user_id: userId
        })
    });

    if (!response.ok) {
        console.log("Error al actualizar la tarea");
    }

    return await response.json();
}

// ======================================================================
//                             METHOD | DELETE
// ======================================================================
/**
 * Elimina permanentemente una tarea de la base de datos.
 * @param {number} id - ID de la tarea que se desea borrar.
 * @returns {Promise<boolean>} - True si la operación fue exitosa.
 */
export async function taskDelete(id) {
    const response = await fetch(`${API_URL}/tasks/${id}`, {
        method: "DELETE"
    });

    if (!response.ok) {
        throw new Error("No se pudo borrar la tarea");
    }

    return true;
}



