/**
 * Punto de entrada de la aplicación
 * Coordina el flujo general y registra eventos principales
 */

// Importar servicios (lógica intermedia)
import { 
    crearTarea, 
    obtenerTareasPorUsuario, 
    eliminarTarea, 
    actualizarTarea,
    filtrarTareasPorEstado,
    aplicarFiltrosYOrdenar,
    prepararDatosExportacion
} from './services/tareasService.js';

// Importar UI (manipulación del DOM)
import { 
    renderizarTareas, 
    mostrarErrorBusqueda,
    limpiarErroresUI, 
    mostrarErroresCampos,
    mostrarModalEliminar,
    ocultarModalEliminar,
    prepararFormularioEditar,
    resetearFormulario,
    descargarArchivo
} from './ui/tareasUi.js';

// Importar Notificaciones (RF03)
import { mostrarExito, mostrarError, mostrarInfo } from './ui/notificacionesUi.js';

// Importar validaciones (utilidades)
import { validarFormulario } from './utils/validaciones.js';

// ========================
// REFERENCIAS AL DOM
// ========================
const taskForm = document.getElementById('task-form');
const taskTitle = document.getElementById('titulo');
const taskDescription = document.getElementById('descripcion');
const tasksContainer = document.querySelector(".tasks-container");
const userSelect = document.getElementById('user-id');
const userSelectExternal = document.getElementById('user-select');
const refreshBtn = document.getElementById('refresh-btn');
const estadoFilter = document.getElementById('estado-filter');
const tituloFilter = document.getElementById('titulo-filter');
const sortBySelect = document.getElementById('sort-by');
const sortDirBtn = document.getElementById('sort-dir');

// Elementos del modal de eliminación
const deleteModal = document.getElementById('delete-modal');
const confirmDeleteBtn = document.getElementById('confirm-delete');
const cancelDeleteBtn = document.getElementById('cancel-delete');

// Variables en memoria
let tareasActuales = [];
let deleteTaskId = null;
let deleteEventTarget = null;
let estadoActual = '';
let tituloActual = '';
let sortBy = 'fecha';
let sortDir = 'desc';

// ========================
// SINCRONIZAR CAMPOS DE USUARIO
// ========================
if (userSelectExternal && userSelect) {
    userSelectExternal.addEventListener('input', () => {
        userSelect.value = userSelectExternal.value;
    });
    userSelect.addEventListener('input', () => {
        userSelectExternal.value = userSelect.value;
    });
}

// ========================
// CARGAR TAREAS POR USUARIO
// ========================
async function cargarTareasPorUsuario() {
    const usuarioSeleccionado = userSelect.value;
    
    if (!usuarioSeleccionado) {
        mostrarErrorBusqueda('Por favor, ingrese un ID de usuario.');
        return;
    }
    
    try {
        // Usar el servicio para obtener tareas del usuario
        tareasActuales = await obtenerTareasPorUsuario(usuarioSeleccionado);

        // Resetear filtro de estado
        if (estadoFilter) {
            estadoFilter.value = '';
            estadoActual = '';
        }

        // Reset filtros adicionales
        if (tituloFilter) tituloFilter.value = '';
        tituloActual = '';
        if (sortBySelect) sortBySelect.value = 'fecha';
        sortBy = 'fecha';
        if (sortDirBtn) sortDirBtn.textContent = 'Desc';
        sortDir = 'desc';

        // Renderizar aplicando filtros/ordenamiento (si hay)
        aplicarFiltrosYRender();

    } catch (error) {
        console.error(error);
        mostrarErrorBusqueda("Error al mostrar tareas. Verifique el usuario o la conexión.");
    }
}

// ========================
// CARGA INICIAL
// ========================
document.addEventListener("DOMContentLoaded", async () => {
    // Cargar tareas si hay un usuario seleccionado por defecto
    if (userSelect.value) {
        await cargarTareasPorUsuario();
    }
});

// ========================
// CAMBIO DE USUARIO (Enter en el input)
// ========================
if (userSelectExternal) {
    userSelectExternal.addEventListener("keypress", async (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            await cargarTareasPorUsuario();
        }
    });
}

// ========================
// BOTÓN ACTUALIZAR
// ========================
if (refreshBtn) {
    refreshBtn.addEventListener("click", async () => {
        await cargarTareasPorUsuario();
    });
}

// ========================
// FILTRO POR ESTADO
// ========================
if (estadoFilter) {
    estadoFilter.addEventListener("change", (e) => {
        estadoActual = e.target.value;
        aplicarFiltrosYRender();
    });
}

// Filtrado por título (input)
if (tituloFilter) {
    tituloFilter.addEventListener('input', (e) => {
        tituloActual = e.target.value;
        aplicarFiltrosYRender();
    });
}

// Ordenamiento
if (sortBySelect) {
    sortBySelect.addEventListener('change', (e) => {
        sortBy = e.target.value;
        aplicarFiltrosYRender();
    });
}

if (sortDirBtn) {
    sortDirBtn.addEventListener('click', () => {
        sortDir = sortDir === 'asc' ? 'desc' : 'asc';
        sortDirBtn.textContent = sortDir === 'asc' ? 'Asc' : 'Desc';
        aplicarFiltrosYRender();
    });
}

// ========================
// EXPORTAR TAREAS (RF04)
// ========================
const exportBtn = document.createElement('button');
exportBtn.textContent = '📥 Exportar JSON';
exportBtn.className = 'btn'; // Reutilizar clase de botón existente
exportBtn.style.marginBottom = '15px';

if (tasksContainer) {
    tasksContainer.parentNode.insertBefore(exportBtn, tasksContainer);
    
    exportBtn.addEventListener('click', () => {
        if (!tareasActuales || tareasActuales.length === 0) {
            mostrarInfo('ℹ️ No hay tareas visibles para exportar.');
            return;
        }
        const datosJson = prepararDatosExportacion(tareasActuales);
        descargarArchivo(datosJson, 'tareas_exportadas.json', 'application/json');
        mostrarExito('✅ Tareas exportadas correctamente.');
    });
}

// Función que aplica filtros+orden y renderiza
function aplicarFiltrosYRender() {
    const opciones = {
        titulo: tituloActual,
        estado: estadoActual,
        sortBy: sortBy,
        sortDir: sortDir
    };

    const resultado = aplicarFiltrosYOrdenar(tareasActuales, opciones);
    renderizarTareas(resultado, tasksContainer);
}

// ========================
// MANEJO DE TAREAS (EDITAR - BORRAR)
// ========================
if (tasksContainer) {
    tasksContainer.addEventListener("click", async (e) => {
        // Manejar botón Editar
        if (e.target.classList.contains("edit")) {
            const id = e.target.dataset.id;
            const tarea = tareasActuales.find(t => t.id == id);

            if (!tarea) return;

            // Usar UI para preparar el formulario
            prepararFormularioEditar(tarea);
        }

        // Manejar botón Borrar
        if (e.target.classList.contains("delete")) {
            const id = e.target.dataset.id;

            // Guardar el ID y referencia del evento
            deleteTaskId = id;
            deleteEventTarget = e.target;

            // Mostrar modal de confirmación
            mostrarModalEliminar();
        }
    });
}

// ========================
// EJECUTAR ELIMINACIÓN
// ========================
async function executeDelete() {
    if (!deleteTaskId) return;

    try {
        // Usar el servicio para eliminar
        await eliminarTarea(deleteTaskId);

        // Eliminar visualmente la tarjeta
        const card = deleteEventTarget.closest(".task-card");
        if (card) {
            card.remove();
        }

        // Actualizar el array de tareas
        tareasActuales = tareasActuales.filter(t => t.id != deleteTaskId);

        // Mostrar mensaje de éxito
        mostrarExito('✅ Tarea eliminada correctamente.');

    } catch (error) {
        console.error(error);
        mostrarError('Error del sistema: No se pudo eliminar la tarea. Por favor, intente más tarde.');
    } finally {
        // Cerrar modal y limpiar variables
        ocultarModalEliminar();
        deleteTaskId = null;
        deleteEventTarget = null;
    }
}

// ========================
// EVENT LISTERS DEL MODAL
// ========================
if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener('click', executeDelete);
}

if (cancelDeleteBtn) {
    cancelDeleteBtn.addEventListener('click', () => {
        ocultarModalEliminar();
        deleteTaskId = null;
        deleteEventTarget = null;
    });
}

// Cerrar modal al hacer clic fuera del contenido
if (deleteModal) {
    deleteModal.addEventListener('click', (e) => {
        if (e.target === deleteModal) {
            ocultarModalEliminar();
            deleteTaskId = null;
            deleteEventTarget = null;
        }
    });
}

// ========================
// GUARDAR TAREA (CREATE - POST o UPDATE - PATCH)
// ========================
if (taskForm) {
    taskForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const submitBtn = taskForm.querySelector(".submit");
        const editId = submitBtn?.dataset.editId;

        // Limpiar mensajes anteriores
        limpiarErroresUI();

        // Si hay un ID de edición, actualizar (PATCH)
        if (editId) {
            await manejarActualizacion(editId);
        } else {
            await handleCreateTask();
        }
    });
}

// ========================
// CREAR NUEVA TAREA
// ========================
async function handleCreateTask() {
    const titulo = taskTitle.value.trim();
    const descripcion = taskDescription.value.trim();
    const usuario = userSelect.value.trim();

    // Usar utils para validar
    const validationErrors = validarFormulario(titulo, descripcion, usuario);
    
    // Si hay errores de validación, mostrarlos
    if (Object.keys(validationErrors).length > 0) {
        mostrarError('Por favor, corrija los errores en el formulario.');
        mostrarErroresCampos(validationErrors);
        return;
    }
    
    // Comportamiento original: crear nueva tarea
    try {
        // Usar el servicio para crear
        const nueva = await crearTarea(titulo, descripcion, usuario);

        // Insertar arriba en memoria
        tareasActuales.unshift(nueva);

        // Usar UI para renderizar (aplicando filtro si está activo)
        aplicarFiltrosYRender();

        // Mostrar mensaje de éxito
        mostrarExito('✅ Tarea registrada exitosamente.');

        // Resetear formulario
        resetearFormulario();

    } catch (error) {
        console.error(error);
        // Determinar el tipo de error para mostrar mensaje apropiado
        if (error.message && error.message.includes('Failed to fetch')) {
            mostrarError('Error de conexión: No se pudo conectar con el servidor. Verifique su conexión a internet e intente más tarde.');
        } else if (error.message && error.message.includes('500')) {
            mostrarError('Error del servidor: Ocurrió un problema interno. Por favor, intente más tarde.');
        } else if (error.message && error.message.includes('404')) {
            mostrarError('Error: No se encontró el recurso solicitado. Contacte al administrador.');
        } else {
            mostrarError('Error del sistema: No se pudo registrar la tarea. Por favor, intente más tarde.');
        }
    }
}

// ========================
// ACTUALIZAR TAREA EXISTENTE
// ========================
async function manejarActualizacion(editId) {
    const titulo = taskTitle.value.trim();
    const descripcion = taskDescription.value.trim();
    const usuario = userSelect.value.trim();

    try {
        // Usar el servicio para actualizar
        await actualizarTarea(editId, titulo, descripcion, usuario);

        // Actualizar en memoria
        const index = tareasActuales.findIndex(t => t.id == editId);
        if (index !== -1) {
            tareasActuales[index].titulo = titulo;
            tareasActuales[index].descripcion = descripcion;
            tareasActuales[index].userId = usuario;
        }

        // Usar UI para renderizar aplicando filtros y orden
        aplicarFiltrosYRender();

        // Mostrar mensaje de éxito
        mostrarExito('✅ Tarea actualizada correctamente.');

        // Resetear formulario y botón
        resetearFormulario();

    } catch (error) {
        console.error(error);
        mostrarError('Error del sistema: No se pudo actualizar la tarea. Por favor, intente más tarde.');
    }
}
