/**
 * Módulo de UI - Manipulación del DOM
 * Funciones para renderizar tareas y mostrar mensajes
 */

// Elementos del DOM (se obtienen cuando se necesitan o se almacenan en caché)
let elementos = null;

/**
 * Obtiene las referencias a los elementos del DOM
 * @returns {Object} - Objeto con las referencias a los elementos
 */
function obtenerElementos() {
    if (!elementos) {
        elementos = {
            errorTitulo: document.getElementById('error-titulo'),
            errorDescripcion: document.getElementById('error-descripcion'),
            errorUsuario: document.getElementById('error-usuario'),
            errorUsuarioBusqueda: document.getElementById('error-usuario-busqueda'),
            taskTitle: document.getElementById('titulo'),
            taskDescription: document.getElementById('descripcion'),
            userSelect: document.getElementById('user-id'),
            userSelectExternal: document.getElementById('user-select'),
            taskForm: document.getElementById('task-form'),
            deleteModal: document.getElementById('delete-modal')
        };
    }
    return elementos;
}

/**
 * Renderiza las tareas en el contenedor especificado
 * @param {Array} tareas - Array de tareas a renderizar
 * @param {HTMLElement} container - Contenedor donde se renderizarán las tareas
 */
export function renderizarTareas(tareas, container) {
    container.innerHTML = "";

    if (!tareas || tareas.length === 0) {
        container.innerHTML = '<p class="no-tasks">No hay tareas para mostrar.</p>';
        return;
    }

    tareas.forEach(tarea => {
        const card = document.createElement("div");
        card.classList.add("task-card");

        card.innerHTML = `
            <div class="div-task">
                <h3>${tarea.titulo}</h3>
                <p>${tarea.descripcion}</p>
                <div class="task-estado">
                    <span class="estado-badge estado-${tarea.estado?.replace(/\s+/g, '-')}">${tarea.estado || 'Sin estado'}</span>
                </div>
                <div class="task-buttons">
                    <button type="button" class="btn edit" data-id="${tarea.id}">Editar</button>
                    <button type="button" class="btn delete" data-id="${tarea.id}">Borrar</button>
                </div>
            </div>
        `;

        container.appendChild(card);
    });
}

/**
 * Limpia los errores de validación de la UI
 */
export function limpiarErroresUI() {
    const elementos = obtenerElementos();
    
    if (elementos.errorTitulo) {
        elementos.errorTitulo.textContent = '';
    }
    if (elementos.errorDescripcion) {
        elementos.errorDescripcion.textContent = '';
    }
    if (elementos.errorUsuario) {
        elementos.errorUsuario.textContent = '';
    }
    if (elementos.errorUsuarioBusqueda) {
        elementos.errorUsuarioBusqueda.textContent = '';
    }
    
    // Quitar clases de error de los campos
    if (elementos.taskTitle) {
        elementos.taskTitle.classList.remove('error');
    }
    if (elementos.taskDescription) {
        elementos.taskDescription.classList.remove('error');
    }
    if (elementos.userSelect) {
        elementos.userSelect.classList.remove('error');
    }
    if (elementos.userSelectExternal) {
        elementos.userSelectExternal.classList.remove('error');
    }
}

/**
 * Muestra un mensaje de error en el área de búsqueda de usuario
 * @param {string} message - Mensaje de error a mostrar
 */
export function mostrarErrorBusqueda(message) {
    const elementos = obtenerElementos();
    
    if (elementos.errorUsuarioBusqueda) {
        elementos.errorUsuarioBusqueda.textContent = message;
    }
    
    if (elementos.userSelectExternal) {
        elementos.userSelectExternal.classList.add('error');
    }
}

/**
 * Muestra error en un campo específico
 * @param {HTMLElement} fieldElement - Elemento del campo
 * @param {HTMLElement} errorElement - Elemento donde se muestra el error
 * @param {string} message - Mensaje de error
 */
function mostrarErrorCampo(fieldElement, errorElement, message) {
    if (fieldElement) {
        fieldElement.classList.add('error');
    }
    if (errorElement) {
        errorElement.textContent = message;
    }
}

/**
 * Muestra los errores de validación en los campos correspondientes
 * @param {Object} errors - Objeto con los errores {titulo, descripcion, usuario}
 */
export function mostrarErroresCampos(errors) {
    const elementos = obtenerElementos();
    
    if (errors.titulo) {
        mostrarErrorCampo(elementos.taskTitle, elementos.errorTitulo, errors.titulo);
    }
    
    if (errors.descripcion) {
        mostrarErrorCampo(elementos.taskDescription, elementos.errorDescripcion, errors.descripcion);
    }
    
    if (errors.usuario) {
        mostrarErrorCampo(elementos.userSelect, elementos.errorUsuario, errors.usuario);
    }
    
    // Si hay errores, mostrar mensaje global
}

/**
 * Muestra el modal de confirmación de eliminación
 */
export function mostrarModalEliminar() {
    const elementos = obtenerElementos();
    if (elementos.deleteModal) {
        elementos.deleteModal.classList.add('show');
    }
}

/**
 * Oculta el modal de confirmación de eliminación
 */
export function ocultarModalEliminar() {
    const elementos = obtenerElementos();
    if (elementos.deleteModal) {
        elementos.deleteModal.classList.remove('show');
    }
}

/**
 * Prepara el formulario para editar una tarea
 * @param {Object} tarea - Objeto con los datos de la tarea
 */
export function prepararFormularioEditar(tarea) {
    const elementos = obtenerElementos();
    const userSelectExternal = document.getElementById('user-select');
    
    if (elementos.taskTitle) {
        elementos.taskTitle.value = tarea.titulo;
    }
    if (elementos.taskDescription) {
        elementos.taskDescription.value = tarea.descripcion;
    }
    if (elementos.userSelect) {
        elementos.userSelect.value = tarea.userId;
    }
    if (userSelectExternal) {
        userSelectExternal.value = tarea.userId;
    }

    // Cambiar el texto del botón
    const submitBtn = elementos.taskForm?.querySelector(".submit");
    if (submitBtn) {
        submitBtn.textContent = "Actualizar Tarea";
        submitBtn.dataset.editId = tarea.id;
    }
    
    // Scroll al formulario
    if (elementos.taskForm) {
        elementos.taskForm.scrollIntoView({ behavior: "smooth" });
    }
}

/**
 * Resetea el formulario a su estado inicial
 */
export function resetearFormulario() {
    const elementos = obtenerElementos();
    
    if (elementos.taskForm) {
        elementos.taskForm.reset();
    }
    
    const submitBtn = elementos.taskForm?.querySelector(".submit");
    if (submitBtn) {
        submitBtn.textContent = "Guardar Tarea";
        delete submitBtn.dataset.editId;
    }
}

/**
 * Genera la descarga de un archivo (RF04 - UI Logic)
 * @param {string} contenido - Contenido del archivo
 * @param {string} nombreArchivo - Nombre del archivo a descargar
 * @param {string} tipoMime - Tipo MIME del archivo
 */
export function descargarArchivo(contenido, nombreArchivo, tipoMime) {
    const blob = new Blob([contenido], { type: tipoMime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nombreArchivo;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
