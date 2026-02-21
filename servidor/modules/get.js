const API_URL = "http://localhost:3000/todos";

// Obtiene todas las tareas
async function taskGet() {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("Error al obtener tareas");
    return await response.json();
}

// Obtiene tareas filtradas por usuario
async function taskGetByUser(userId) {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("Error al obtener tareas");

    const todas = await response.json();
    if (!Array.isArray(todas)) throw new Error("Formato de respuesta inválido");
    
    return todas.filter(tarea => tarea.userId === userId);
}

// Renderiza tareas como tarjetas en el DOM
function renderTasks(tareas, container) {
    container.innerHTML = "";

    tareas.forEach(tarea => {
        // Crear tarjeta para cada tarea
        const card = document.createElement("div");
        card.classList.add("task-card");

        // Estructura HTML con botones de edición y eliminación
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
