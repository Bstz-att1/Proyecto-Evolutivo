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
    const users = await userGet();
    return users.map(mapApiUserToUiUser);
}

/**
 * Obtiene un usuario por ID
 * @param {string|number} id - ID del usuario
 * @returns {Promise<Object>} - Usuario encontrado
 */
export async function obtenerUsuarioPorId(id) {
    const user = await userGetById(id);
    return mapApiUserToUiUser(user);
}

/**
 * Crea un nuevo usuario
 * @param {string} nombre - Nombre del usuario
 * @param {string} correo - Correo del usuario
 * @param {string} rol - Rol del usuario
 * @returns {Promise<Object>} - Usuario creado
 */
export async function crearUsuario(nombre, correo, documento, password, rol = 'usuario') {
    const created = await userPost(nombre, correo, documento, password, rol);
    return mapApiUserToUiUser(created);
}

/**
 * Reemplaza completamente un usuario existente (PUT)
 * @param {string|number} id - ID del usuario
 * @param {string} nombre - Nombre del usuario
 * @param {string} correo - Correo del usuario
 * @param {string} rol - Rol del usuario
 * @returns {Promise<Object>} - Usuario actualizado
 */
export async function reemplazarUsuario(id, nombre, correo, documento, password, rol = 'usuario') {
    const updated = await userPut(id, nombre, correo, documento, password, rol);
    return mapApiUserToUiUser(updated);
}

/**
 * Actualiza parcialmente un usuario existente (PATCH)
 * @param {string|number} id - ID del usuario
 * @param {Object} cambios - Campos parciales a modificar
 * @returns {Promise<Object>} - Usuario actualizado
 */
export async function actualizarParcialUsuario(id, cambios = {}) {
    const patched = await userPatch(id, cambios);
    return mapApiUserToUiUser(patched);
}

/**
 * Elimina un usuario
 * @param {string|number} id - ID del usuario
 * @returns {Promise<boolean>} - true si se eliminó correctamente
 */
export async function eliminarUsuario(id) {
    return await userDelete(id);
}

function normalizeRol(value) {
    const rol = String(value ?? '').trim().toLowerCase();
    if (['admin', 'administrator', 'administrador'].includes(rol)) return 'administrador';
    if (['supervisor'].includes(rol)) return 'supervisor';
    if (['user', 'usuario'].includes(rol)) return 'usuario';
    return 'usuario';
}

function normalizeRawRole(user = {}) {
    return user.role ?? user.rol ?? user.role_name ?? user.roleName ?? user.role_code ?? '';
}

function mapApiUserToUiUser(user = {}) {
    const rawId = user.id ?? user.user_id ?? '';
    return {
        id: rawId !== '' && rawId != null ? String(rawId) : '',
        nombre: user.nombre ?? user.name ?? '',
        email: user.email ?? '',
        document: user.document ?? user.documento ?? '',
        rol: normalizeRol(normalizeRawRole(user))
    };
}
