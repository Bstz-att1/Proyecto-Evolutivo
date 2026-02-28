import { API_URL } from '../core/config.js';

export async function taskDelete(id) {

    const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE"
    });

    if (!response.ok) {
        throw new Error("No se pudo borrar la tarea");
    }

    return true;
}
