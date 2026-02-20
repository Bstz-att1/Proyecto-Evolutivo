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

function renderTasks(tareas, container) {

    container.innerHTML = "";

    tareas.forEach(tarea => {

        const card = document.createElement("div");
        card.classList.add("task-card");

        card.innerHTML = `
            <div class="div-task">
                <h3>${tarea.titulo}</h3>
                <p>${tarea.descripcion}</p>
                <div class="task-buttons">
                    <button class="btn edit" data-id="${tarea.id}">Editar</button>
                    <button class="btn delete" data-id="${tarea.id}">Borrar</button>
                </div>
            </div>
        `;


        container.appendChild(card);
    });
}

export { taskGet, taskGetByUser, renderTasks };
