/**
 * Punto de entrada de la aplicación
 * Coordina el flujo general y registra eventos principales
 * delega la lógica al controlador de aplicación
 */

// Importar controlador de aplicación (lógica de estado y flujo)
import { 
    cargarTareasPorUsuario,
    aplicarFiltrosYRender,
    setEstadoFilter,
    setTituloFilter,
    setSortBy,
    toggleSortDir,
    prepararEdicionTarea,
    prepararEliminacionTarea,
    executeDelete,
    cancelarEliminacion,
    crearNuevaTarea,
    actualizarTareaExistente,
    exportarTareas
} from './core/appController.js';

// ========================
// REFERENCIAS AL DOM
// ========================
const taskForm = document.getElementById('task-form');
const taskTitle = document.getElementById('titulo');
const taskDescription = document.getElementById('descripcion');
const userSelect = document.getElementById('user-id');
const userSelectExternal = document.getElementById('user-select');
const refreshBtn = document.getElementById('refresh-btn');
const estadoFilter = document.getElementById('estado-filter');
const tituloFilter = document.getElementById('titulo-filter');
const sortBySelect = document.getElementById('sort-by');
const sortDirBtn = document.getElementById('sort-dir');
const tasksContainer = document.querySelector(".tasks-container");

// Elementos del modal de eliminación
const deleteModal = document.getElementById('delete-modal');
const confirmDeleteBtn = document.getElementById('confirm-delete');
const cancelDeleteBtn = document.getElementById('cancel-delete');

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
// CARGA INICIAL
// ========================
document.addEventListener("DOMContentLoaded", async () => {
    // Cargar tareas si hay un usuario seleccionado por defecto
    if (userSelect.value) {
        await cargarTareasPorUsuario(userSelect.value);
    }
});

// ========================
// CAMBIO DE USUARIO (Enter en el input)
// ========================
if (userSelectExternal) {
    userSelectExternal.addEventListener("keypress", async (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            await cargarTareasPorUsuario(userSelectExternal.value);
        }
    });
}

// ========================
// BOTÓN ACTUALIZAR
// ========================
if (refreshBtn) {
    refreshBtn.addEventListener("click", async () => {
        await cargarTareasPorUsuario(userSelect.value);
    });
}

// ========================
// FILTROS Y ORDENAMIENTO
// ========================

// Filtro por estado
if (estadoFilter) {
    estadoFilter.addEventListener("change", (e) => {
        setEstadoFilter(e.target.value);
    });
}

// Filtrado por título (input)
if (tituloFilter) {
    tituloFilter.addEventListener('input', (e) => {
        setTituloFilter(e.target.value);
    });
}

// Ordenamiento - campo
if (sortBySelect) {
    sortBySelect.addEventListener('change', (e) => {
        setSortBy(e.target.value);
    });
}

// Ordenamiento - dirección
if (sortDirBtn) {
    sortDirBtn.addEventListener('click', () => {
        toggleSortDir();
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
        exportarTareas();
    });
}

// ========================
// MANEJO DE TAREAS (EDITAR - BORRAR)
// ========================
if (tasksContainer) {
    tasksContainer.addEventListener("click", async (e) => {
        // Manejar botón Editar
        if (e.target.classList.contains("edit")) {
            const id = e.target.dataset.id;
            prepararEdicionTarea(id);
        }

        // Manejar botón Borrar
        if (e.target.classList.contains("delete")) {
            const id = e.target.dataset.id;
            prepararEliminacionTarea(id, e.target);
        }
    });
}

// ========================
// EVENT LISTERS DEL MODAL
// ========================
if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener('click', executeDelete);
}

if (cancelDeleteBtn) {
    cancelDeleteBtn.addEventListener('click', cancelarEliminacion);
}

// Cerrar modal al hacer clic fuera del contenido
if (deleteModal) {
    deleteModal.addEventListener('click', (e) => {
        if (e.target === deleteModal) {
            cancelarEliminacion();
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

        const titulo = taskTitle.value.trim();
        const descripcion = taskDescription.value.trim();
        const usuario = userSelect.value.trim();

        // Si hay un ID de edición, actualizar (PATCH)
        if (editId) {
            await actualizarTareaExistente(editId, titulo, descripcion, usuario);
        } else {
            await crearNuevaTarea(titulo, descripcion, usuario);
        }
    });
}
