const API_URL = "http://localhost:3000/todos";

// Crea una nueva tarea
async function taskPost(titulo, descripcion, userId) {
    const response = await fetch(API_URL, {
        method: 'POST',
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
        throw new Error("No se pudo crear la tarea");
    }

    return await response.json();
}

export { taskPost };
