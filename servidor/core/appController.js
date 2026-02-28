/**
 * Módulo de Controlador de Aplicación
 * Gestiona el estado de la aplicación y la lógica de flujo
 * Coordina servicios, UI y notificaciones
 */

// Importar servicios (lógica intermedia)
import { 
    crearTarea, 
    obtenerTareasPorUsuario, 
    eliminarTarea, 
    actualizarTarea,
    aplicarFiltrosYOrdenar,
    prepararDatosExportacion
} from '../services/tareasService.js';

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
} from '../ui/tareasUi.js';

// Importar Notificaciones (RF03)
import { mostrarExito, mostrarError, mostrarInfo } from '../ui/notificacionesUi.js';

// Importar validaciones (utilidades)
import { validarFormulario } from '../utils/validaciones.js';

// ========================
// ESTADO DE LA APLICACIÓN
// ========================
const estado = {
    tareasActuales: [],
    deleteTaskId: null,
    deleteEventTarget: null,
    estadoActual: '',
    tituloActual: '',
    sortBy: 'fecha',
    sortDir: 'desc'
};

// ========================
// GETTERS DEL ESTADO
// ========================
export function getTareasActuales() {
    return estado.tareasActuales;
}

export function getEstadoActual() {
    return estado.estadoActual;
}

export function getTituloActual() {
    return estado.tituloActual;
}

export function getSortBy() {
    return estado.sortBy;
}

export function getSortDir() {
    return estado.sortDir;
}

// ========================
// FUNCIONES DE CARGA DE DATOS
// ========================

/**
 * Carga las tareas de un usuario específico
 * @param {string} usuarioSeleccionado - ID del usuario
 */
export async function cargarTareasPorUsuario(usuarioSeleccionado) {
    if (!usuarioSeleccionado) {
        mostrarErrorBusqueda('Por favor, ingrese un ID de usuario.');
        return;
    }
    
    try {
        // Usar el servicio para obtener tareas del usuario
        estado.tareasActuales = await obtenerTareasPorUsuario(usuarioSeleccionado);

        // Resetear filtro de estado
        estado.estadoActual = '';

        // Reset filtros adicionales
        estado.tituloActual = '';
        estado.sortBy = 'fecha';
        estado.sortDir = 'desc';

        // Actualizar UI de filtros
        actualizarUIFiltros();

        // Renderizar aplicando filtros/ordenamiento
        aplicarFiltrosYRender();

    } catch (error) {
        console.error(error);
        mostrarErrorBusqueda("Error al mostrar tareas. Verifique el usuario o la conexión.");
    }
}

/**
 * Actualiza los elementos UI de filtros con los valores del estado
 */
function actualizarUIFiltros() {
    const estadoFilter = document.getElementById('estado-filter');
    const tituloFilter = document.getElementById('titulo-filter');
    const sortBySelect = document.getElementById('sort-by');
    const sortDirBtn = document.getElementById('sort-dir');

    if (estadoFilter) {
        estadoFilter.value = '';
    }
    if (tituloFilter) tituloFilter.value = '';
    if (sortBySelect) sortBySelect.value = 'fecha';
    if (sortDirBtn) sortDirBtn.textContent = 'Desc';
}

// ========================
// FUNCIONES DE FILTRADO Y RENDERIZADO
// ========================

/**
 * Función que aplica filtros+orden y renderiza
 */
export function aplicarFiltrosYRender() {
    const opciones = {
        titulo: estado.tituloActual,
        estado: estado.estadoActual,
        sortBy: estado.sortBy,
        sortDir: estado.sortDir
    };

    const resultado = aplicarFiltrosYOrdenar(estado.tareasActuales, opciones);
    
    const tasksContainer = document.querySelector(".tasks-container");
    renderizarTareas(resultado, tasksContainer);
}

/**
 * Actualiza el estado de filtro por estado
 * @param {string} nuevoEstado - Nuevo valor del filtro
 */
export function setEstadoFilter(nuevoEstado) {
    estado.estadoActual = nuevoEstado;
    aplicarFiltrosYRender();
}

/**
 * Actualiza el estado de filtro por título
 * @param {string} nuevoTitulo - Nuevo valor del filtro
 */
export function setTituloFilter(nuevoTitulo) {
    estado.tituloActual = nuevoTitulo;
    aplicarFiltrosYRender();
}

/**
 * Actualiza el estado de ordenamiento
 * @param {string} nuevoSortBy - Campo por el cual ordenar
 */
export function setSortBy(nuevoSortBy) {
    estado.sortBy = nuevoSortBy;
    aplicarFiltrosYRender();
}

/**
 * Invierte la dirección del ordenamiento
 */
export function toggleSortDir() {
    estado.sortDir = estado.sortDir === 'asc' ? 'desc' : 'asc';
    
    const sortDirBtn = document.getElementById('sort-dir');
    if (sortDirBtn) {
        sortDirBtn.textContent = estado.sortDir === 'asc' ? 'Asc' : 'Desc';
    }
    
    aplicarFiltrosYRender();
}

// ========================
// FUNCIONES DE MANEJO DE TAREAS
// ========================

/**
 * Prepara la edición de una tarea
 * @param {number|string} id - ID de la tarea
 */
export function prepararEdicionTarea(id) {
    const tarea = estado.tareasActuales.find(t => t.id == id);

    if (!tarea) return;

    // Usar UI para preparar el formulario
    prepararFormularioEditar(tarea);
}

/**
 * Prepara la eliminación de una tarea
 * @param {number|string} id - ID de la tarea
 * @param {EventTarget} target - Elemento que triggered el evento
 */
export function prepararEliminacionTarea(id, target) {
    // Guardar el ID y referencia del evento
    estado.deleteTaskId = id;
    estado.deleteEventTarget = target;

    // Mostrar modal de confirmación
    mostrarModalEliminar();
}

/**
 * Ejecuta la eliminación de una tarea
 */
export async function executeDelete() {
    if (!estado.deleteTaskId) return;

    try {
        // Usar el servicio para eliminar
        await eliminarTarea(estado.deleteTaskId);

        // Eliminar visualmente la tarjeta
        const card = estado.deleteEventTarget.closest(".task-card");
        if (card) {
            card.remove();
        }

        // Actualizar el array de tareas
        estado.tareasActuales = estado.tareasActuales.filter(t => t.id != estado.deleteTaskId);

        // Mostrar mensaje de éxito
        mostrarExito('✅ Tarea eliminada correctamente.');

    } catch (error) {
        console.error(error);
        mostrarError('Error del sistema: No se pudo eliminar la tarea. Por favor, intente más tarde.');
    } finally {
        // Cerrar modal y limpiar variables
        ocultarModalEliminar();
        estado.deleteTaskId = null;
        estado.deleteEventTarget = null;
    }
}

/**
 * Cancela la eliminación y limpia el estado
 */
export function cancelarEliminacion() {
    ocultarModalEliminar();
    estado.deleteTaskId = null;
    estado.deleteEventTarget = null;
}

// ========================
// FUNCIONES DE CREACIÓN Y ACTUALIZACIÓN
// ========================

/**
 * Crea una nueva tarea
 * @param {string} titulo - Título de la tarea
 * @param {string} descripcion - Descripción de la tarea
 * @param {string} usuario - ID del usuario
 */
export async function crearNuevaTarea(titulo, descripcion, usuario) {
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
        estado.tareasActuales.unshift(nueva);

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

/**
 * Actualiza una tarea existente
 * @param {string} editId - ID de la tarea a actualizar
 * @param {string} titulo - Nuevo título
 * @param {string} descripcion - Nueva descripción
 * @param {string} usuario - Nuevo ID de usuario
 */
export async function actualizarTareaExistente(editId, titulo, descripcion, usuario) {
    try {
        // Usar el servicio para actualizar
        await actualizarTarea(editId, titulo, descripcion, usuario);

        // Actualizar en memoria
        const index = estado.tareasActuales.findIndex(t => t.id == editId);
        if (index !== -1) {
            estado.tareasActuales[index].titulo = titulo;
            estado.tareasActuales[index].descripcion = descripcion;
            estado.tareasActuales[index].userId = usuario;
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

// ========================
// FUNCIONES DE EXPORTACIÓN
// ========================

/**
 * Exporta las tareas actuales a JSON
 */
export function exportarTareas() {
    const tasksContainer = document.querySelector(".tasks-container");
    
    if (!estado.tareasActuales || estado.tareasActuales.length === 0) {
        mostrarInfo('ℹ️ No hay tareas visibles para exportar.');
        return;
    }
    
    const datosJson = prepararDatosExportacion(estado.tareasActuales);
    descargarArchivo(datosJson, 'tareas_exportadas.json', 'application/json');
    mostrarExito('✅ Tareas exportadas correctamente.');
}
