import { API_URL } from '../core/config.js';

export async function taskPatch(id, titulo, descripcion, userId) {
    const response = await fetch(`${API_URL}/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            titulo: titulo,
            descripcion: descripcion,
            userId: userId
        })
    });

    if (!response.ok) {
        throw new Error("No se pudo actualizar la tarea");
    }

    return await response.json();
}
