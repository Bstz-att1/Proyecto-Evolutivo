import { API_URL } from '../core/config.js';

export async function taskPost(titulo, descripcion, userId) {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            titulo: titulo,
            descripcion: descripcion,
            userId: userId,
            estado: 'pendiente',
            createdAt: new Date().toISOString()
        })

    });

    return await response.json();
}
