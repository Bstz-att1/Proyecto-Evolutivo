const API_URL = "http://localhost:3000/todos";

async function taskDelete(id) {

    const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE"
    });

    if (!response.ok) {
        throw new Error("No se pudo borrar la tarea");
    }

    return true;
}

export { taskDelete };
