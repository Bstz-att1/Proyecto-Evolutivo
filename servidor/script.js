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

// Elementos para mensajes
const globalError = document.getElementById('global-error');
const successMessage = document.getElementById('success-message');
const errorTitulo = document.getElementById('error-titulo');
const errorDescripcion = document.getElementById('error-descripcion');
const errorUsuario = document.getElementById('error-usuario');

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
// GUARDAR TAREA (CREATE - POST)
// ========================
totalForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const submitBtn = totalForm.querySelector(".submit");
    const editId = submitBtn.dataset.editId;

    // Limpiar mensajes anteriores
    clearErrorMessages();

    // si hay un ID de edición, actualizar (PATCH)
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

            // Mostrar mensaje de éxito
            showSuccessMessage('✅ Tarea actualizada correctamente.');

            // resetear formulario y botón
            totalForm.reset();
            submitBtn.textContent = "Guardar Tarea";
            delete submitBtn.dataset.editId;

        } catch (error) {
            console.error(error);
            showGlobalError('Error del sistema: No se pudo actualizar la tarea. Por favor, intente más tarde.');
        }

    } else {
        // Validar campos antes de enviar
        const validationErrors = validateForm();
        
        // Si hay errores de validación, mostrarlos
        if (Object.keys(validationErrors).length > 0) {
            applyValidationErrors(validationErrors);
            return; // Detener el envío del formulario
        }
        
        // Comportamiento original: crear nueva tarea
        try {
            const usuarioSeleccionado = userSelect.value.trim();
            
            const nueva = await taskPost(
                taskTitle.value.trim(),
                taskDescription.value.trim(),
                usuarioSeleccionado
            );

            // insertar arriba en memoria
            tareasActuales.unshift(nueva);

            // volver a pintar
            renderTasks(tareasActuales, tasksContainer);

            // Mostrar mensaje de éxito
            showSuccessMessage('✅ Tarea registrada exitosamente.');

            totalForm.reset();

        } catch (error) {
            console.error(error);
            // Determinar el tipo de error para mostrar mensaje apropiado
            if (error.message && error.message.includes('Failed to fetch')) {
                showGlobalError('Error de conexión: No se pudo conectar con el servidor. Verifique su conexión a internet e intente más tarde.');
            } else if (error.message && error.message.includes('500')) {
                showGlobalError('Error del servidor: Ocurrió un problema interno. Por favor, intente más tarde.');
            } else if (error.message && error.message.includes('404')) {
                showGlobalError('Error: No se encontró el recurso solicitado. Contacte al administrador.');
            } else {
                showGlobalError('Error del sistema: No se pudo registrar la tarea. Por favor, intente más tarde.');
            }
        }
    }
});
