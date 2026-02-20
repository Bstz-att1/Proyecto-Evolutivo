const API_URL = "http://localhost:3000/todos";

async function taskPatch(id, titulo, descripcion) {
    const response = await fetch(`${API_URL}/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            titulo: titulo,
            descripcion: descripcion
        })
    });

    if (!response.ok) {
        throw new Error("No se pudo actualizar la tarea");
    }

    return await response.json();
}

export { taskPatch };
