import { API_URL } from '../core/config.js';
import { authFetch } from './httpClient.js';

function extractData(json) {
    return json?.data;
}

// ======================================================================
//                             METHOD | GET
// ======================================================================
/**
 * Obtiene el listado completo de todos los usuarios del sistema.
 * @returns {Promise<Array>} - Un arreglo con todos los usuarios.
 */
export async function userGet() {
    const response = await authFetch(`${API_URL}/users`);

    if (!response.ok) {
        throw new Error('Error al obtener usuarios');
    }

    const json = await response.json();
    return Array.isArray(extractData(json)) ? extractData(json) : [];
}

/**
 * Obtiene un usuario por su ID.
 * @param {number|string} id - ID del usuario a consultar.
 * @returns {Promise<Object>} - Objeto usuario encontrado.
 */
export async function userGetById(id) {
    const response = await authFetch(`${API_URL}/users/${id}`);

    if (!response.ok) {
        throw new Error('Error al obtener el usuario');
    }

    const json = await response.json();
    return extractData(json) || {};
}


// ======================================================================
//                             METHOD | POST
// ======================================================================
/**
 * Crea un nuevo usuario en la base de datos.
 * @param {string} name - Nombre del usuario.
 * @param {string} email - Correo del usuario.
 * @param {string} role - Rol del usuario (administrador | usuario).
 * @returns {Promise<Object>} - El usuario creado.
 */
export async function userPost(name, email, document, role) {
    const normalizedRole = role === 'administrador' ? 'admin' : role === 'usuario' ? 'user' : role;
    const payload = { name, email, document, role: normalizedRole };

    const response = await authFetch(`${API_URL}/users`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    const json = await response.json();

    if (!response.ok) {
        throw new Error(json?.message || 'Error al crear el usuario');
    }

    const data = extractData(json) || {};
    const insertId = data.insertId ?? data.id;

    return {
        id: insertId != null ? String(insertId) : undefined,
        ...payload
    };
}


// ======================================================================
//                             METHOD | PUT
// ======================================================================
/**
 * Reemplaza completamente un usuario existente.
 * @param {number|string} id - ID del usuario a reemplazar.
 * @param {string} name - Nombre del usuario.
 * @param {string} email - Correo del usuario.
 * @param {string} role - Rol del usuario.
 * @returns {Promise<Object>} - Usuario actualizado.
 */
export async function userPut(id, name, email, document, role) {
    const normalizedRole = role === 'administrador' ? 'admin' : role === 'usuario' ? 'user' : role;
    const payload = { name, email, document, role: normalizedRole };

    const response = await authFetch(`${API_URL}/users/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    const json = await response.json();

    if (!response.ok) {
        throw new Error(json?.message || 'Error al reemplazar el usuario');
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
 * Actualiza parcialmente un usuario existente.
 * @param {number|string} id - ID del usuario a actualizar.
 * @param {Object} changes - Campos parciales a modificar.
 * @returns {Promise<Object>} - Usuario actualizado.
 */
export async function userPatch(id, changes = {}) {
    const response = await authFetch(`${API_URL}/users/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(changes)
    });

    const json = await response.json();

    if (!response.ok) {
        throw new Error(json?.message || 'Error al actualizar parcialmente el usuario');
    }

    const data = extractData(json);

    if (data && !Array.isArray(data) && typeof data === 'object') {
        return data;
    }

    return {
        id: String(id),
        ...changes
    };
}


// ======================================================================
//                             METHOD | DELETE
// ======================================================================
/**
 * Elimina permanentemente un usuario de la base de datos.
 * @param {number|string} id - ID del usuario a eliminar.
 * @returns {Promise<boolean>} - True si la operación fue exitosa.
 */
export async function userDelete(id) {
    const response = await authFetch(`${API_URL}/users/${id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error('No se pudo borrar el usuario');
    }

    return true;
}
