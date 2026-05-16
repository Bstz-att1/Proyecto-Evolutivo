import {
    roleGet,
    roleGetById,
    roleGetPermissionsById,
    rolePost,
    rolePut,
    rolePatch,
    roleDelete
} from '../api/index.js';

function mapApiRoleToUiRole(role = {}) {
    const rawId = role.id ?? role.role_id ?? '';
    return {
        id: rawId !== '' && rawId != null ? String(rawId) : '',
        nombre: role.nombre ?? role.name ?? '',
        descripcion: role.descripcion ?? role.description ?? '',
        createdAt: role.created_at ?? role.createdAt ?? null
    };
}

function mapApiPermissionToCode(permission = {}) {
    if (typeof permission === 'string') return permission;
    return permission?.code ?? '';
}

export async function obtenerRoles() {
    const roles = await roleGet();
    return roles.map(mapApiRoleToUiRole);
}

export async function obtenerRolPorId(id) {
    const role = await roleGetById(id);
    return mapApiRoleToUiRole(role);
}

export async function obtenerPermisosRol(id) {
    const permissions = await roleGetPermissionsById(id);
    return permissions.map(mapApiPermissionToCode).filter(Boolean);
}

export async function crearRol(nombre, descripcion = '', permissions = []) {
    const created = await rolePost(nombre, descripcion, permissions);
    return mapApiRoleToUiRole(created);
}

export async function reemplazarRol(id, nombre, descripcion = '', permissions = []) {
    const updated = await rolePut(id, nombre, descripcion, permissions);
    return mapApiRoleToUiRole(updated);
}

export async function actualizarParcialRol(id, changes = {}) {
    const patched = await rolePatch(id, changes);
    return mapApiRoleToUiRole(patched);
}

export async function eliminarRol(id) {
    return roleDelete(id);
}
