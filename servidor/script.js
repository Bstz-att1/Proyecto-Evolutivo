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
// SISTEMA DE NOTIFICACIONES
// ========================
// Muestra mensajes visuales con feedback al usuario (éxito, error, advertencia, info)
function mostrarNotificacion(mensaje, tipo = 'info') {
    // Crear/obtener contenedor de notificaciones
    let contenedor = document.getElementById('notificacion-contenedor');
    if (!contenedor) {
        contenedor = document.createElement('div');
        contenedor.id = 'notificacion-contenedor';
        document.body.appendChild(contenedor);
    }

    // Crear y estilizar notificación
    const notificacion = document.createElement('div');
    notificacion.className = `notificacion notificacion-${tipo}`;
    notificacion.textContent = mensaje;
    contenedor.appendChild(notificacion);

    // Auto-eliminar después de 4 segundos
    setTimeout(() => {
        notificacion.classList.add('notificacion-salida');
        setTimeout(() => notificacion.remove(), 300);
    }, 4000);
}


// ========================
// CARGAR TAREAS POR USUARIO
// ========================
// Obtiene tareas del servidor filtradas por usuario y las renderiza
async function cargarTareasPorUsuario() {
    const usuarioSeleccionado = userSelect.value.trim();
    
    // Validar entrada user
    if (!usuarioSeleccionado) {
        mostrarNotificacion("Por favor ingresa un ID de usuario", 'advertencia');
        return;
    }
    
    try {
        // Obtener tareas del usuario
        const todas = await taskGetByUser(usuarioSeleccionado);
        
        // Tomar últimas 5 tareas en orden descendente
        tareasActuales = todas.slice(-5).reverse();
        renderTasks(tareasActuales, tasksContainer);
        
        // Notificar estado
        if (tareasActuales.length === 0) {
            mostrarNotificacion(`No hay tareas para el usuario: ${usuarioSeleccionado}`, 'info');
        } else {
            mostrarNotificacion(`Se cargaron ${tareasActuales.length} tarea(s)`, 'éxito');
        }

    } catch (error) {
        console.error(error);
        mostrarNotificacion(`Error al cargar tareas: ${error.message}`, 'error');
    }
}


// ========================
// CARGA INICIAL
// ========================
document.addEventListener("DOMContentLoaded", async () => {
    await cargarTareasPorUsuario();
});


// ========================
// CAMBIO DE USUARIO (Enter en el input)
// ========================
userSelect.addEventListener("keypress", async (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        await cargarTareasPorUsuario();
    }
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
        // Cargar datos de tarea en formulario para edición
        const id = e.target.dataset.id;
        const tarea = tareasActuales.find(t => t.id == id);
        if (!tarea) return;

        taskTitle.value = tarea.titulo;
        taskDescription.value = tarea.descripcion;

        // Cambiar botón a modo actualización
        const submitBtn = totalForm.querySelector(".submit");
        submitBtn.textContent = "Actualizar Tarea";
        submitBtn.dataset.editId = id;

        mostrarNotificacion("Editando tarea. Realiza los cambios y presiona 'Actualizar Tarea'", 'info');
        totalForm.scrollIntoView({ behavior: "smooth" });
    }

    if (e.target.classList.contains("delete")) {
        // Eliminar tarea tras confirmación
        const id = e.target.dataset.id;
        const confirmar = confirm("¿Seguro que deseas eliminar esta tarea?");

        if (!confirmar) {
            mostrarNotificacion("Eliminación cancelada", 'advertencia');
            return;
        }

        try {
            await taskDelete(id);
            e.target.closest(".task-card").remove();
            tareasActuales = tareasActuales.filter(t => t.id != id);
            mostrarNotificacion("Tarea eliminada correctamente", 'éxito');
        } catch (error) {
            console.error(error);
            mostrarNotificacion(`Error al eliminar tarea: ${error.message}`, 'error');
        }
    }
});

// ========================
// CREAR/ACTUALIZAR TAREA
// ========================
// Valida campos y envía datos al servidor (POST o PATCH)
totalForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const submitBtn = totalForm.querySelector(".submit");
    const editId = submitBtn.dataset.editId;
    const titulo = taskTitle.value.trim();
    const descripcion = taskDescription.value.trim();


    if (!titulo) {
        mostrarNotificacion("El título es obligatorio", 'advertencia');
        return;
    }
    if (!descripcion) {
        mostrarNotificacion("La descripción es obligatoria", 'advertencia');
        return;
    }

    // Modo actualización (PATCH)
    if (editId) {
        try {
            await taskPatch(editId, titulo, descripcion);
            
            // Actualizar en memoria y re-renderizar
            const index = tareasActuales.findIndex(t => t.id == editId);
            if (index !== -1) {
                tareasActuales[index].titulo = titulo;
                tareasActuales[index].descripcion = descripcion;
            }
            renderTasks(tareasActuales, tasksContainer);
            
            // Limpiar formulario
            totalForm.reset();
            submitBtn.textContent = "Guardar Tarea";
            delete submitBtn.dataset.editId;
            mostrarNotificacion("Tarea actualizada correctamente", 'éxito');
        } catch (error) {
            console.error(error);
            mostrarNotificacion(`Error al actualizar tarea: ${error.message}`, 'error');
        }
    } else {
        // Modo creación (POST)
        const usuarioSeleccionado = userSelect.value.trim();
        if (!usuarioSeleccionado) {
            mostrarNotificacion("Por favor selecciona un usuario para crear tareas", 'advertencia');
            return;
        }

        try {
            const nueva = await taskPost(titulo, descripcion, usuarioSeleccionado);
            tareasActuales.unshift(nueva);
            renderTasks(tareasActuales, tasksContainer);
            totalForm.reset();
            mostrarNotificacion("Tarea creada correctamente", 'éxito');
        } catch (error) {
            console.error(error);
            mostrarNotificacion(`Error al crear tarea: ${error.message}`, 'error');
        }
    }
});
