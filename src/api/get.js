import { API_URL } from '../core/config.js';

export async function taskGet() {
    const response = await fetch(API_URL);

    if (!response.ok) {
        throw new Error("Error al obtener tareas");
    }

    return await response.json();
}

export async function taskGetByUser(userId) {
    const response = await fetch(API_URL);

    if (!response.ok) {
        throw new Error("Error al obtener tareas");
    }

    const todas = await response.json();
    
    // Filtrar tareas por userId
    return todas.filter(tarea => tarea.userId === userId);
}
