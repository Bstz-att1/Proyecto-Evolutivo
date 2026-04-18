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
} from '../services/tasksService.js';
import {
    obtenerTodosUsuarios,
    crearUsuario,
    reemplazarUsuario,
    eliminarUsuario
} from '../services/usersService.js';

// Importar UI (manipulación del DOM)
import { 
    renderTasks, 
    showSearchError,
    clearUiErrors, 
    showFieldErrors,
    showDeleteModal,
    hideDeleteModal,
    prepareEditForm,
    resetForm,
    downloadFile
} from '../ui/tasksUi.js';

// Importar Notificaciones (RF03)
import { showSuccess, showError, showInfo } from '../ui/notificationsUi.js';

// Importar validaciones (utilidades)
import { validarFormulario } from '../utils/validaciones.js';

// ========================
// ESTADO DE LA APLICACIÓN
// ========================
const estado = {
    tareasActuales: [],
    usuariosActuales: [],
    deleteTaskId: null,
    deleteEventTarget: null,
    deleteUserId: null,
    estadoActual: '',
    tituloActual: '',
    sortBy: 'fecha',
    sortDir: 'desc',
    usersSearch: '',
    usersRoleFilter: ''
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

export function getUsuariosActuales() {
    return estado.usuariosActuales;
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
        estado.tareasActuales = [];
        aplicarFiltrosYRender();
        actualizarKpis();
        showSearchError('Por favor, ingrese un ID de usuario.');
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
        showSearchError("Error al mostrar tareas. Verifique el usuario o la conexión.");
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
    renderTasks(resultado, tasksContainer);
    actualizarKpis();
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
    prepareEditForm(tarea);
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
    showDeleteModal();
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
        showSuccess('✅ Tarea eliminada correctamente.');

    } catch (error) {
        console.error(error);
        showError('Error del sistema: No se pudo eliminar la tarea. Por favor, intente más tarde.');
    } finally {
        // Cerrar modal y limpiar variables
        hideDeleteModal();
        estado.deleteTaskId = null;
        estado.deleteEventTarget = null;
    }
}

/**
 * Cancela la eliminación y limpia el estado
 */
export function cancelarEliminacion() {
    hideDeleteModal();
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
        showError('Por favor, corrija los errores en el formulario.');
        showFieldErrors(validationErrors);
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
        showSuccess('✅ Tarea registrada exitosamente.');

        // Resetear formulario
        resetForm();

    } catch (error) {
        console.error(error);
        // Determinar el tipo de error para mostrar mensaje apropiado
        if (error.message && error.message.includes('Failed to fetch')) {
            showError('Error de conexión: No se pudo conectar con el servidor. Verifique su conexión a internet e intente más tarde.');
        } else if (error.message && error.message.includes('500')) {
            showError('Error del servidor: Ocurrió un problema interno. Por favor, intente más tarde.');
        } else if (error.message && error.message.includes('404')) {
            showError('Error: No se encontró el recurso solicitado. Contacte al administrador.');
        } else {
            showError('Error del sistema: No se pudo registrar la tarea. Por favor, intente más tarde.');
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
        showSuccess('✅ Tarea actualizada correctamente.');

        // Resetear formulario y botón
        resetForm();

    } catch (error) {
        console.error(error);
        showError('Error del sistema: No se pudo actualizar la tarea. Por favor, intente más tarde.');
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
        showInfo('ℹ️ No hay tareas visibles para exportar.');
        return;
    }

    const datosJson = prepararDatosExportacion(estado.tareasActuales);
    downloadFile(datosJson, 'tareas_exportadas.json', 'application/json');
    showSuccess('✅ Tareas exportadas correctamente.');
}

// ========================
// FUNCIONES DE USUARIOS
// ========================

export async function cargarUsuarios() {
    const usersSkeleton = document.getElementById('users-skeleton');
    if (usersSkeleton) {
        usersSkeleton.classList.remove('hidden');
        usersSkeleton.innerHTML = Array.from({ length: 4 }).map(() => '<div class="skeleton-item"></div>').join('');
    }

    try {
        estado.usuariosActuales = await obtenerTodosUsuarios();
    } catch (error) {
        console.error(error);
        showError('Error al cargar usuarios');
        estado.usuariosActuales = [];
    } finally {
        if (usersSkeleton) usersSkeleton.classList.add('hidden');
        aplicarFiltrosUsuariosYRender();
        actualizarKpis();
    }
}

export async function aplicarFiltrosUsuariosYRender() {
    const container = document.getElementById('users-container');
    if (!container) return;

    const search = (estado.usersSearch || '').trim().toLowerCase();
    const role = String(estado.usersRoleFilter || '').trim().toLowerCase();

    const filtrados = (estado.usuariosActuales || []).filter((u) => {
        const okSearch = !search || (u.nombre || '').toLowerCase().includes(search) || (u.email || '').toLowerCase().includes(search);
        const userRole = String(u.rol || '').trim().toLowerCase();
        const okRole = !role || userRole === role;
        return okSearch && okRole;
    });

    const { renderUsers } = await import('../ui/usersUi.js');
    renderUsers(filtrados, container);
}

export function setUsersSearch(value) {
    estado.usersSearch = value || '';
}

export function setUsersRoleFilter(value) {
    estado.usersRoleFilter = value || '';
}

export async function crearUsuarioNuevo(nombre, correo, documento, rol) {
    const nuevo = await crearUsuario(nombre, correo, documento, rol);
    estado.usuariosActuales.unshift(nuevo);
    aplicarFiltrosUsuariosYRender();
    actualizarKpis();
    showSuccess('Usuario creado');
}

export async function prepararEdicionUsuario(id) {
    const user = estado.usuariosActuales.find((u) => String(u.id) === String(id));
    if (!user) return null;
    return user;
}

export async function actualizarUsuarioExistente(id, nombre, correo, documento, rol) {
    const actualizado = await reemplazarUsuario(id, nombre, correo, documento, rol);
    const idx = estado.usuariosActuales.findIndex((u) => String(u.id) === String(id));
    if (idx !== -1) estado.usuariosActuales[idx] = actualizado;
    aplicarFiltrosUsuariosYRender();
    actualizarKpis();
    showSuccess('Usuario actualizado');
}

export function prepararEliminacionUsuario(id) {
    estado.deleteUserId = id;
}

export async function eliminarUsuarioConfirmado() {
    if (!estado.deleteUserId) return;
    await eliminarUsuario(estado.deleteUserId);
    estado.usuariosActuales = estado.usuariosActuales.filter((u) => String(u.id) !== String(estado.deleteUserId));
    estado.deleteUserId = null;
    aplicarFiltrosUsuariosYRender();
    actualizarKpis();
    showSuccess('Usuario eliminado');
}

export function actualizarKpis() {
    const kpiTasks = document.getElementById('kpi-total-tareas');
    const kpiUsers = document.getElementById('kpi-total-usuarios');
    if (kpiTasks) kpiTasks.textContent = String((estado.tareasActuales || []).length);
    if (kpiUsers) kpiUsers.textContent = String((estado.usuariosActuales || []).length);
}
