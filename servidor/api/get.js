const API_URL = "http://localhost:3000/todos";

async function taskGet() {
    const response = await fetch(API_URL);

    if (!response.ok) {
        throw new Error("Error al obtener tareas");
    }

    return await response.json();
}

async function taskGetByUser(userId) {
    const response = await fetch(API_URL);

    if (!response.ok) {
        throw new Error("Error al obtener tareas");
    }

    const todas = await response.json();
    
    // Filtrar tareas por userId
    return todas.filter(tarea => tarea.userId === userId);
}

export { taskGet, taskGetByUser };
