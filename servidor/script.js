import {
    taskPost,
    taskGet,
    renderTasks,
    taskDelete
} from './modules/index.js';

const totalForm = document.getElementById('task-form');
const taskTitle = document.getElementById('titulo');
const taskDescription = document.getElementById('descripcion');
const tasksContainer = document.querySelector(".tasks-container");

// se guarda en memoria
let tareasActuales = [];


// ========================
// CARGA INICIAL (solo 5)
// ========================
document.addEventListener("DOMContentLoaded", async () => {
    try {
        // obtiene todas las tareas anteriormente registradas
        const todas = await taskGet();

        // tomar solo las últimas 5 del servidor
        tareasActuales = todas.slice(-5).reverse();

        renderTasks(tareasActuales, tasksContainer);

    } catch (error) {
        console.error(error);
        alert("Error al mostrar tareas.");
    }
});


// ========================
// CREAR TAREA
// ========================
totalForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
        const nueva = await taskPost(
            taskTitle.value.trim(),
            taskDescription.value.trim()
        );

        // insertar arriba en memoria
        tareasActuales.unshift(nueva);

        // volver a pintar
        renderTasks(tareasActuales, tasksContainer);

        totalForm.reset();

    } catch (error) {
        console.error(error);
        alert("Error al crear la tarea");
    }
});


// ========================
// BORRAR TAREA
// ========================
tasksContainer.addEventListener("click", async (e) => {

    if (e.target.classList.contains("delete")) {

        const id = e.target.dataset.id;

        // confirmación antes de borrar
        const confirmar = confirm("¿Seguro que deseas eliminar esta tarea?");

        if (!confirmar) return;

        try {
            await taskDelete(id);

            const card = e.target.closest(".task-card");
            card.remove();

            // actualiza el array de las tareas registradas
            tareasActuales = tareasActuales.filter(t => t.id != id);

        } catch (error) {
            console.error(error);
            alert("Error al borrar tarea");
        }
    }
});

