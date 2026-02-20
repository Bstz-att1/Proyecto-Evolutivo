import {
    taskPost,
    taskGet,
    taskGetByUser,
    renderTasks,
    taskDelete,
    taskPatch
} from './modules/index.js';

const totalForm = document.getElementById('task-form');
const taskTitle = document.getElementById('titulo');
const taskDescription = document.getElementById('descripcion');
const tasksContainer = document.querySelector(".tasks-container");
const userSelect = document.getElementById('user-select');
const refreshBtn = document.getElementById('refresh-btn');

// se guarda en memoria
let tareasActuales = [];


// ========================
// CARGAR TAREAS POR USUARIO
// ========================
async function cargarTareasPorUsuario() {
    const usuarioSeleccionado = userSelect.value;
    
    try {
        // Consulta la API RESTful para obtener tareas del usuario seleccionado
        const todas = await taskGetByUser(usuarioSeleccionado);
        
        // tomar solo las últimas 5 del servidor
        tareasActuales = todas.slice(-5).reverse();

        renderTasks(tareasActuales, tasksContainer);

    } catch (error) {
        console.error(error);
        alert("Error al mostrar tareas.");
    }
}


// ========================
// CARGA INICIAL
// ========================
document.addEventListener("DOMContentLoaded", async () => {
    await cargarTareasPorUsuario();
});


// ========================
// CAMBIO DE USUARIO
// ========================
userSelect.addEventListener("change", async () => {
    await cargarTareasPorUsuario();
});


// ========================
// BOTÓN ACTUALIZAR
// ========================
refreshBtn.addEventListener("click", async () => {
    await cargarTareasPorUsuario();
});


// ========================
// BORRAR TAREA
// ========================
// ========================
// EDITAR TAREA
// ========================
tasksContainer.addEventListener("click", async (e) => {

    if (e.target.classList.contains("edit")) {

        const id = e.target.dataset.id;
        const tarea = tareasActuales.find(t => t.id == id);

        if (!tarea) return;

        // cargar datos en el formulario
        taskTitle.value = tarea.titulo;
        taskDescription.value = tarea.descripcion;

        // cambiar el texto del botón
        const submitBtn = totalForm.querySelector(".submit");
        submitBtn.textContent = "Actualizar Tarea";
        submitBtn.dataset.editId = id;

        
        totalForm.scrollIntoView({ behavior: "smooth" });
    }

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

// ========================
// ACTUALIZAR TAREA (PATCH)
// ========================
totalForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const submitBtn = totalForm.querySelector(".submit");
    const editId = submitBtn.dataset.editId;

    // si hay un ID de edición, actualizar
    if (editId) {

        try {
            await taskPatch(
                editId,
                taskTitle.value.trim(),
                taskDescription.value.trim()
            );

            // actualizar en memoria
            const index = tareasActuales.findIndex(t => t.id == editId);
            if (index !== -1) {
                tareasActuales[index].titulo = taskTitle.value.trim();
                tareasActuales[index].descripcion = taskDescription.value.trim();
            }

            // volver a pintar
            renderTasks(tareasActuales, tasksContainer);

            // resetear formulario y botón
            totalForm.reset();
            submitBtn.textContent = "Guardar Tarea";
            delete submitBtn.dataset.editId;

        } catch (error) {
            console.error(error);
            alert("Error al actualizar la tarea");
        }

    } else {
        // comportamiento original: crear nueva tarea
        try {
            const usuarioSeleccionado = userSelect.value;
            
            const nueva = await taskPost(
                taskTitle.value.trim(),
                taskDescription.value.trim(),
                usuarioSeleccionado
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
    }
});
