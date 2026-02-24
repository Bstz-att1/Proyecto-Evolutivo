const API_URL = "http://localhost:3000/todos";

async function taskPost(titulo, descripcion, userId) {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            titulo: titulo,
            descripcion: descripcion,
            userId: userId,
            estado: 'pendiente'
        })

    });

    return await response.json();
}

export { taskPost };
