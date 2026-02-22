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
const userSelect = document.getElementById('user-id');
const userSelectExternal = document.getElementById('user-select');
const refreshBtn = document.getElementById('refresh-btn');

// Sincronizar los dos campos de usuario
userSelectExternal.addEventListener('input', () => {
    userSelect.value = userSelectExternal.value;
});
userSelect.addEventListener('input', () => {
    userSelectExternal.value = userSelect.value;
});

// Elementos para mensajes
const globalError = document.getElementById('global-error');
const successMessage = document.getElementById('success-message');
const errorTitulo = document.getElementById('error-titulo');
const errorDescripcion = document.getElementById('error-descripcion');
const errorUsuario = document.getElementById('error-usuario');

// Elementos del modal de eliminación
const deleteModal = document.getElementById('delete-modal');
const confirmDeleteBtn = document.getElementById('confirm-delete');
const cancelDeleteBtn = document.getElementById('cancel-delete');

let deleteTaskId = null;
let deleteEventTarget = null;

// se guarda en memoria
let tareasActuales = [];

// ========================
// FUNCIONES DE VALIDACIÓN Y MENSAJES
// ========================

/**
 * Limpia todos los mensajes de error
 */
function clearErrorMessages() {
    globalError.style.display = 'none';
    globalError.textContent = '';
    
    successMessage.style.display = 'none';
    successMessage.textContent = '';
    
    errorTitulo.textContent = '';
    errorDescripcion.textContent = '';
    errorUsuario.textContent = '';
    
    taskTitle.classList.remove('error');
    taskDescription.classList.remove('error');
    userSelect.classList.remove('error');
}

/**
 * Muestra un mensaje de error global
 */
function showGlobalError(message) {
    globalError.textContent = message;
    globalError.style.display = 'block';
    successMessage.style.display = 'none';
}

/**
 * Muestra un mensaje de éxito
 */
function showSuccessMessage(message) {
    successMessage.textContent = message;
    successMessage.style.display = 'block';
    globalError.style.display = 'none';
    
    // Ocultar después de 5 segundos
    setTimeout(() => {
        successMessage.style.display = 'none';
    }, 5000);
}

/**
 * Muestra error en un campo específico
 */
function showFieldError(fieldElement, errorElement, message) {
    fieldElement.classList.add('error');
    errorElement.textContent = message;
}

/**
 * Valida los campos del formulario
 * @returns {Object} - Objeto con errores encontrados
 */
function validateForm() {
    const errors = {};
    const titulo = taskTitle.value.trim();
    const descripcion = taskDescription.value.trim();
    const usuario = userSelect.value.trim();
    
    // Validar título
    if (!titulo) {
        errors.titulo = 'El título es obligatorio. Por favor, ingréselo.';
    } else if (titulo.length < 3) {
        errors.titulo = 'El título debe tener al menos 3 caracteres.';
    }
    
    // Validar descripción
    if (!descripcion) {
        errors.descripcion = 'La descripción es obligatoria. Por favor, ingrésela.';
    } else if (descripcion.length < 10) {
        errors.descripcion = 'La descripción debe tener al menos 10 caracteres.';
    }
    
    // Validar usuario
    if (!usuario) {
        errors.usuario = 'El usuario es obligatorio. Por favor, seleccione un usuario.';
    }
    
    return errors;
}

/**
 * Aplica los errores de validación al formulario
 */
function applyValidationErrors(errors) {
    if (errors.titulo) {
        showFieldError(taskTitle, errorTitulo, errors.titulo);
    }
    
    if (errors.descripcion) {
        showFieldError(taskDescription, errorDescripcion, errors.descripcion);
    }
    
    if (errors.usuario) {
        showFieldError(userSelect, errorUsuario, errors.usuario);
    }
    
    // Si hay errores, mostrar mensaje global
    if (Object.keys(errors).length > 0) {
        showGlobalError('Por favor, corrija los errores indicados en el formulario.');
    }
}


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
        userSelect.value = tarea.userId;
        userSelectExternal.value = tarea.userId;

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

    // Validar campos obligatorios
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
