/**
 * Módulo de Servicios de Usuarios - Lógica intermedia entre API y UI
 * Coordina las llamadas a la API y prepara los datos para la UI
 */

import {
    userGet,
    userGetById,
    userPost,
    userPut,
    userPatch,
    userDelete
} from '../api/index.js';

/**
 * Obtiene todos los usuarios
 * @returns {Promise<Array>} - Array de usuarios
 */
export async function obtenerTodosUsuarios() {
    return await userGet();
}

/**
 * Obtiene un usuario por ID
 * @param {string|number} id - ID del usuario
 * @returns {Promise<Object>} - Usuario encontrado
 */
export async function obtenerUsuarioPorId(id) {
    return await userGetById(id);
}

/**
 * Crea un nuevo usuario
 * @param {string} nombre - Nombre del usuario
 * @param {string} correo - Correo del usuario
 * @param {string} rol - Rol del usuario
 * @returns {Promise<Object>} - Usuario creado
 */
export async function crearUsuario(nombre, correo, rol = 'usuario') {
    return await userPost(nombre, correo, rol);
}

/**
 * Reemplaza completamente un usuario existente (PUT)
 * @param {string|number} id - ID del usuario
 * @param {string} nombre - Nombre del usuario
 * @param {string} correo - Correo del usuario
 * @param {string} rol - Rol del usuario
 * @returns {Promise<Object>} - Usuario actualizado
 */
export async function reemplazarUsuario(id, nombre, correo, rol = 'usuario') {
    return await userPut(id, nombre, correo, rol);
}

/**
 * Actualiza parcialmente un usuario existente (PATCH)
 * @param {string|number} id - ID del usuario
 * @param {Object} cambios - Campos parciales a modificar
 * @returns {Promise<Object>} - Usuario actualizado
 */
export async function actualizarParcialUsuario(id, cambios = {}) {
    return await userPatch(id, cambios);
}

/**
 * Elimina un usuario
 * @param {string|number} id - ID del usuario
 * @returns {Promise<boolean>} - true si se eliminó correctamente
 */
export async function eliminarUsuario(id) {
    return await userDelete(id);
}
