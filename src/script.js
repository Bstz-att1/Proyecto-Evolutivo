/**
 * Punto de entrada de la SPA
 */
import {
    cargarTareasPorUsuario,
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
    exportarTareas,
    cargarUsuarios,
    setUsersSearch,
    setUsersRoleFilter,
    aplicarFiltrosUsuariosYRender,
    crearUsuarioNuevo,
    prepararEdicionUsuario,
    actualizarUsuarioExistente,
    prepararEliminacionUsuario,
    eliminarUsuarioConfirmado
} from './core/appController.js';

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

const deleteModal = document.getElementById('delete-modal');
const confirmDeleteBtn = document.getElementById('confirm-delete');
const cancelDeleteBtn = document.getElementById('cancel-delete');

const navLinks = document.querySelectorAll('.nav-link');
const views = document.querySelectorAll('.view');

const usersSearch = document.getElementById('users-search');
const usersRoleFilter = document.getElementById('users-role-filter');
const usersContainer = document.getElementById('users-container');
const newUserBtn = document.getElementById('new-user-btn');

const userModal = document.getElementById('user-modal');
const userForm = document.getElementById('user-form');
const closeUserModalBtn = document.getElementById('close-user-modal');
const userModalTitle = document.getElementById('user-modal-title');
const userNombreInput = document.getElementById('user-nombre');
const userEmailInput = document.getElementById('user-email');
const userRolInput = document.getElementById('user-rol');
const userDocumentoInput = document.getElementById('user-documento');

const deleteUserModal = document.getElementById('delete-user-modal');
const confirmDeleteUserBtn = document.getElementById('confirm-delete-user');
const cancelDeleteUserBtn = document.getElementById('cancel-delete-user');

let userEditingId = null;

function showView(viewId) {
    views.forEach((v) => v.classList.toggle('active', v.id === viewId));
    navLinks.forEach((btn) => btn.classList.toggle('active', btn.dataset.view === viewId));
}

function openUserModal(user = null) {
    if (!userModal || !userForm) return;
    if (user) {
        userEditingId = user.id;
        userModalTitle.textContent = 'Editar Usuario';
        userNombreInput.value = user.nombre || '';
        userEmailInput.value = user.email || '';
        userRolInput.value = user.rol || 'usuario';
        userDocumentoInput.value = user.document || user.documento || '';
    } else {
        userEditingId = null;
        userModalTitle.textContent = 'Nuevo Usuario';
        userForm.reset();
    }
    userModal.classList.add('show');
}

function closeUserModal() {
    userModal?.classList.remove('show');
    userEditingId = null;
    userForm?.reset();
}

if (userSelectExternal && userSelect) {
    userSelectExternal.addEventListener('input', () => { userSelect.value = userSelectExternal.value; });
    userSelect.addEventListener('input', () => { userSelectExternal.value = userSelect.value; });
}

document.addEventListener("DOMContentLoaded", async () => {
    showView('dashboard-view');
    await cargarUsuarios();
    if (userSelect?.value) await cargarTareasPorUsuario(userSelect.value);
});

navLinks.forEach((btn) => {
    btn.addEventListener('click', async () => {
        const target = btn.dataset.view;
        showView(target);
        if (target === 'users-view') await cargarUsuarios();
    });
});

if (userSelectExternal) {
    userSelectExternal.addEventListener("keypress", async (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            await cargarTareasPorUsuario(userSelectExternal.value);
        }
    });
}
if (refreshBtn) refreshBtn.addEventListener("click", async () => { await cargarTareasPorUsuario(userSelect.value); });
if (estadoFilter) estadoFilter.addEventListener("change", (e) => setEstadoFilter(e.target.value));
if (tituloFilter) tituloFilter.addEventListener('input', (e) => setTituloFilter(e.target.value));
if (sortBySelect) sortBySelect.addEventListener('change', (e) => setSortBy(e.target.value));
if (sortDirBtn) sortDirBtn.addEventListener('click', () => toggleSortDir());

const exportBtn = document.createElement('button');
exportBtn.textContent = '📥 Exportar JSON';
exportBtn.className = 'btn btn-secondary';
if (tasksContainer) {
    tasksContainer.parentNode.insertBefore(exportBtn, tasksContainer);
    exportBtn.addEventListener('click', () => exportarTareas());
}

if (tasksContainer) {
    tasksContainer.addEventListener("click", async (e) => {
        if (e.target.classList.contains("edit")) prepararEdicionTarea(e.target.dataset.id);
        if (e.target.classList.contains("delete")) prepararEliminacionTarea(e.target.dataset.id, e.target);
    });
}

if (confirmDeleteBtn) confirmDeleteBtn.addEventListener('click', executeDelete);
if (cancelDeleteBtn) cancelDeleteBtn.addEventListener('click', cancelarEliminacion);
if (deleteModal) {
    deleteModal.addEventListener('click', (e) => {
        if (e.target === deleteModal) cancelarEliminacion();
    });
}

if (taskForm) {
    taskForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const submitBtn = taskForm.querySelector(".submit");
        const editId = submitBtn?.dataset.editId;
        const titulo = taskTitle.value.trim();
        const descripcion = taskDescription.value.trim();
        const usuario = userSelect.value.trim();

        if (editId) await actualizarTareaExistente(editId, titulo, descripcion, usuario);
        else await crearNuevaTarea(titulo, descripcion, usuario);
    });
}

if (usersSearch) {
    usersSearch.addEventListener('input', async (e) => {
        setUsersSearch(e.target.value);
        await aplicarFiltrosUsuariosYRender();
    });
}
if (usersRoleFilter) {
    usersRoleFilter.addEventListener('change', async (e) => {
        setUsersRoleFilter(e.target.value);
        await aplicarFiltrosUsuariosYRender();
    });
}
if (newUserBtn) newUserBtn.addEventListener('click', () => openUserModal());
if (closeUserModalBtn) closeUserModalBtn.addEventListener('click', closeUserModal);
if (userModal) {
    userModal.addEventListener('click', (e) => {
        if (e.target === userModal) closeUserModal();
    });
}
if (userForm) {
    userForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nombre = userNombreInput.value.trim();
        const correo = userEmailInput.value.trim();
        const rol = userRolInput.value;
        const documento = userDocumentoInput.value.trim();

        if (userEditingId) await actualizarUsuarioExistente(userEditingId, nombre, correo, documento, rol);
        else await crearUsuarioNuevo(nombre, correo, documento, rol);

        closeUserModal();
    });
}

if (usersContainer) {
    usersContainer.addEventListener('click', async (e) => {
        const editBtn = e.target.closest('.user-edit');
        const deleteBtn = e.target.closest('.user-delete');

        if (editBtn) {
            const user = await prepararEdicionUsuario(editBtn.dataset.id);
            if (user) openUserModal(user);
        }

        if (deleteBtn) {
            prepararEliminacionUsuario(deleteBtn.dataset.id);
            deleteUserModal?.classList.add('show');
        }
    });
}

if (confirmDeleteUserBtn) {
    confirmDeleteUserBtn.addEventListener('click', async () => {
        await eliminarUsuarioConfirmado();
        deleteUserModal?.classList.remove('show');
    });
}

if (cancelDeleteUserBtn) {
    cancelDeleteUserBtn.addEventListener('click', () => {
        deleteUserModal?.classList.remove('show');
    });
}

if (deleteUserModal) {
    deleteUserModal.addEventListener('click', (e) => {
        if (e.target === deleteUserModal) {
            deleteUserModal.classList.remove('show');
        }
    });
}
