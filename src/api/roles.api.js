import { API_URL } from '../core/config.js';
import { authFetch } from './httpClient.js';

const ROLES_BASE = `${API_URL}/roles`;

function extractData(json) {
    return json?.data;
}

function extractErrorMessage(json, fallback) {
    if (json?.message) return json.message;
    if (Array.isArray(json?.errors) && json.errors.length > 0) return json.errors.join(', ');
    if (Array.isArray(json?.details) && json.details.length > 0) return json.details.join(', ');
    return fallback;
}

async function safeJson(response) {
    return response.json().catch(() => ({}));
}

export async function roleGet() {
    const response = await authFetch(ROLES_BASE);
    const json = await safeJson(response);

    if (!response.ok) {
        throw new Error(extractErrorMessage(json, 'Error al obtener roles'));
    }

    const data = extractData(json);
    return Array.isArray(data) ? data : [];
}

export async function roleGetById(id) {
    const response = await authFetch(`${ROLES_BASE}/${id}`);
    const json = await safeJson(response);

    if (!response.ok) {
        throw new Error(extractErrorMessage(json, 'Error al obtener el rol'));
    }

    return extractData(json) || {};
}

export async function roleGetPermissionsById(id) {
    const response = await authFetch(`${ROLES_BASE}/${id}/permissions`);
    const json = await safeJson(response);

    if (!response.ok) {
        throw new Error(extractErrorMessage(json, 'Error al obtener permisos del rol'));
    }

    const data = extractData(json);
    return Array.isArray(data) ? data : [];
}

export async function rolePost(name, description = '', permissions = []) {
    const payload = { name, description, permissions };

    const response = await authFetch(ROLES_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    const json = await safeJson(response);

    if (!response.ok) {
        throw new Error(extractErrorMessage(json, 'Error al crear rol'));
    }

    return extractData(json) || {};
}

export async function rolePut(id, name, description = '', permissions = []) {
    const payload = { name, description, permissions };

    const response = await authFetch(`${ROLES_BASE}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    const json = await safeJson(response);

    if (!response.ok) {
        throw new Error(extractErrorMessage(json, 'Error al actualizar rol'));
    }

    return extractData(json) || {};
}

export async function rolePatch(id, changes = {}) {
    const response = await authFetch(`${ROLES_BASE}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(changes)
    });

    const json = await safeJson(response);

    if (!response.ok) {
        throw new Error(extractErrorMessage(json, 'Error al actualizar rol parcialmente'));
    }

    return extractData(json) || {};
}

export async function roleDelete(id) {
    const response = await authFetch(`${ROLES_BASE}/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
    });

    const json = await safeJson(response);

    if (!response.ok) {
        throw new Error(extractErrorMessage(json, 'No se pudo eliminar el rol'));
    }

    return true;
}
