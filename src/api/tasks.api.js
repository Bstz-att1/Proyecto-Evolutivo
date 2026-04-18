import { API_URL } from '../core/config.js';

function extractData(json) {
    return json?.data;
}

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

    const json = await response.json();
    const data = extractData(json);

    if (Array.isArray(data)) {
        return data;
    }

    if (data && typeof data === 'object') {
        if (Array.isArray(data.tasks)) return data.tasks;
        if (Array.isArray(data.rows)) return data.rows;
    }

    return [];
}

/**
 * Obtiene y filtra las tareas que pertenecen a un usuario específico.
 * @param {number|string} userId - El ID del usuario a consultar.
 * @returns {Promise<Array>} - Lista de tareas vinculadas al usuario.
 */
export async function taskGetByUser(userId) {
    const todas = await taskGet();

    return todas.filter(tarea => {
        const ownerId = tarea.user_id ?? tarea.userId ?? '';
        return String(ownerId) === String(userId);
    });
}


// ======================================================================
//                             METHOD | POST
// ======================================================================
/**
 * Crea una nueva tarea en la base de datos.
 * @param {string} titulo - El encabezado de la tarea.
 * @param {string} descripcion - Detalle extenso de la actividad.
 * @param {string} status - Estado inicial (pendiente, en progreso, completada).
 * @param {number|string} userId - ID del usuario dueño de la tarea.
 * @param {string} created_by - Rol de quien crea la tarea (administrador | usuario).
 * @returns {Promise<Object>} - La tarea creada devuelta por el servidor.
 */
export async function taskPost(titulo, descripcion, status, userId, created_by) {
    const payload = {
        title: titulo,
        description: descripcion,
        status: status || 'pendiente',
        user_id: userId != null && userId !== '' ? Number(userId) : null,
        created_by: created_by || 'usuario'
    };

    const response = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    const json = await response.json();

    if (!response.ok) {
        throw new Error(json?.message || "Error al crear la tarea");
    }

    const data = extractData(json) || {};
    const insertId = data.insertId ?? data.id;

    return {
        id: insertId != null ? String(insertId) : '',
        ...payload
    };
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
    const payload = {
        title: titulo,
        description: descripcion,
        status: status,
        user_id: userId != null && userId !== '' ? Number(userId) : null,
        created_by: created_by || 'usuario'
    };

    const response = await fetch(`${API_URL}/tasks/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    const json = await response.json();

    if (!response.ok) {
        throw new Error(json?.message || 'Error al reemplazar la tarea');
    }

    const data = extractData(json);

    if (data && !Array.isArray(data) && typeof data === 'object') {
        return data;
    }

    return {
        id: String(id),
        ...payload
    };
}


// ======================================================================
//                             METHOD | PATCH
// ======================================================================
/**
 * Actualiza de forma parcial los datos de una tarea existente.
 * @param {number|string} id - ID único de la tarea a modificar.
 * @param {string} titulo - Nuevo título (opcional).
 * @param {string} descripcion - Nueva descripción (opcional).
 * @param {string} status - Nuevo estado de la tarea.
 * @param {number|string} userId - ID del usuario responsable.
 * @returns {Promise<Object>} - La tarea actualizada.
 */
export async function taskPatch(id, titulo, descripcion, status, userId) {
    const payload = {
        title: titulo,
        description: descripcion,
        status: status,
        user_id: userId != null && userId !== '' ? Number(userId) : null
    };

    const response = await fetch(`${API_URL}/tasks/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    const json = await response.json();

    if (!response.ok) {
        throw new Error(json?.message || "Error al actualizar la tarea");
    }

    const data = extractData(json);

    if (data && !Array.isArray(data) && typeof data === 'object') {
        return data;
    }

    return {
        id: String(id),
        ...payload
    };
}

// ======================================================================
//                             METHOD | DELETE
// ======================================================================
/**
 * Elimina permanentemente una tarea de la base de datos.
 * @param {number|string} id - ID de la tarea que se desea borrar.
 * @returns {Promise<boolean>} - True si la operación fue exitosa.
 */
export async function taskDelete(id) {
    const response = await fetch(`${API_URL}/tasks/${id}`, {
        method: "DELETE",
        headers: {
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error("No se pudo borrar la tarea");
    }

    return true;
}



