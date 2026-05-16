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
    setUsersIdSearch,
    setUsersRoleFilter,
    aplicarFiltrosUsuariosYRender,
    crearUsuarioNuevo,
    prepararEdicionUsuario,
    actualizarUsuarioExistente,
    prepararEliminacionUsuario,
    eliminarUsuarioConfirmado,
    cargarRoles,
    setRolesSearch,
    setRolesIdSearch,
    aplicarFiltrosRolesYRender,
    crearRolNuevo,
    prepararEdicionRol,
    actualizarRolExistente,
    prepararEliminacionRol,
    eliminarRolConfirmado,
    getRolePermissionsCatalog
} from './core/appController.js';
import {
    isAuthenticated,
    loginWithCredentials,
    logoutCurrentSession
} from './services/authService.js';
import {
    canReadRoles,
    canManageRoles,
    canCreateUsers,
    canUpdateUsers,
    canDeleteUsers,
    canCreateTasks,
    canUpdateTasks,
    canDeleteTasks
} from './core/permissions.js';

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

const usersIdSearch = document.getElementById('users-id-search');
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
const userPasswordInput = document.getElementById('user-password');

const deleteUserModal = document.getElementById('delete-user-modal');
const confirmDeleteUserBtn = document.getElementById('confirm-delete-user');
const cancelDeleteUserBtn = document.getElementById('cancel-delete-user');

const rolesNavLink = document.getElementById('roles-nav-link');
const rolesIdSearch = document.getElementById('roles-id-search');
const rolesSearch = document.getElementById('roles-search');
const rolesContainer = document.getElementById('roles-container');
const newRoleBtn = document.getElementById('new-role-btn');
const roleModal = document.getElementById('role-modal');
const roleForm = document.getElementById('role-form');
const roleModalTitle = document.getElementById('role-modal-title');
const roleNameInput = document.getElementById('role-name');
const roleDescriptionInput = document.getElementById('role-description');
const rolePermissionsInput = document.getElementById('role-permissions');
const closeRoleModalBtn = document.getElementById('close-role-modal');
const deleteRoleModal = document.getElementById('delete-role-modal');
const confirmDeleteRoleBtn = document.getElementById('confirm-delete-role');
const cancelDeleteRoleBtn = document.getElementById('cancel-delete-role');

let userEditingId = null;
let roleEditingId = null;

const authView = document.getElementById('auth-view');
const appShell = document.getElementById('app-shell');
const loginForm = document.getElementById('login-form');
const loginDocumentInput = document.getElementById('login-document');
const loginPasswordInput = document.getElementById('login-password');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('logout-btn');

function showAuthView(sessionExpired = false) {
    authView?.classList.remove('hidden');
    appShell?.classList.add('hidden');
    if (sessionExpired && loginError) {
        loginError.textContent = 'Tu sesión expiró. Inicia sesión nuevamente.';
    }
}

function showAppView() {
    authView?.classList.add('hidden');
    appShell?.classList.remove('hidden');
}

function showView(viewId) {
    views.forEach((v) => v.classList.toggle('active', v.id === viewId));
    navLinks.forEach((btn) => btn.classList.toggle('active', btn.dataset.view === viewId));
}

function applyPermissionBasedUi() {
    if (newUserBtn) newUserBtn.style.display = canCreateUsers() ? '' : 'none';
    if (taskForm) taskForm.style.display = canCreateTasks() ? '' : 'none';

    const taskListActions = document.getElementById('task-list-actions');
    if (taskListActions) {
        taskListActions.style.display = (canDeleteTasks() || canUpdateTasks()) ? '' : '';
    }

    if (rolesNavLink) {
        rolesNavLink.style.display = canReadRoles() ? '' : 'none';
    }

    if (newRoleBtn) {
        newRoleBtn.style.display = canManageRoles() ? '' : 'none';
    }
}

function getFirstAllowedView() {
    if (canCreateTasks() || canUpdateTasks() || canDeleteTasks()) return 'tasks-view';
    if (canCreateUsers() || canUpdateUsers() || canDeleteUsers()) return 'users-view';
    if (canReadRoles()) return 'roles-view';
    return 'dashboard-view';
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
        if (userPasswordInput) {
            userPasswordInput.value = '';
            userPasswordInput.required = false;
            userPasswordInput.placeholder = 'Dejar vacío para conservar contraseña actual';
        }
    } else {
        userEditingId = null;
        userModalTitle.textContent = 'Nuevo Usuario';
        userForm.reset();
        if (userPasswordInput) {
            userPasswordInput.required = true;
            userPasswordInput.placeholder = 'Mínimo 6 caracteres';
        }
    }
    userModal.classList.add('show');
}

function closeUserModal() {
    userModal?.classList.remove('show');
    userEditingId = null;
    userForm?.reset();
    if (userPasswordInput) {
        userPasswordInput.required = true;
        userPasswordInput.placeholder = 'Mínimo 6 caracteres';
    }
}

if (userSelectExternal && userSelect) {
    userSelectExternal.addEventListener('input', () => { userSelect.value = userSelectExternal.value; });
    userSelect.addEventListener('input', () => { userSelectExternal.value = userSelect.value; });
}

document.addEventListener("DOMContentLoaded", async () => {
    if (!isAuthenticated()) {
        showAuthView();
        return;
    }

    showAppView();
    applyPermissionBasedUi();
    showView(getFirstAllowedView());
    await cargarUsuarios();
    if (canReadRoles()) await cargarRoles();
    if (userSelect?.value) await cargarTareasPorUsuario(userSelect.value);
});

window.addEventListener('auth:session-expired', () => {
    showAuthView(true);
});

navLinks.forEach((btn) => {
    btn.addEventListener('click', async () => {
        const target = btn.dataset.view;
        if (!target) return;

        if (target === 'roles-view' && !canReadRoles()) return;
        showView(target);

        if (target === 'users-view') await cargarUsuarios();
        if (target === 'roles-view') await cargarRoles();
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
const taskListActions = document.getElementById('task-list-actions');

if (taskListActions) {
    taskListActions.appendChild(exportBtn);
    exportBtn.addEventListener('click', () => exportarTareas());
} else if (tasksContainer) {
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

if (usersIdSearch) {
    usersIdSearch.addEventListener('input', async (e) => {
        setUsersIdSearch(e.target.value);
        await aplicarFiltrosUsuariosYRender();
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
        const password = userPasswordInput?.value?.trim() || '';

        if (!userEditingId && !password) {
            return;
        }

        if (userEditingId) await actualizarUsuarioExistente(userEditingId, nombre, correo, documento, rol, password);
        else await crearUsuarioNuevo(nombre, correo, documento, rol, password);

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

if (rolesIdSearch) {
    rolesIdSearch.addEventListener('input', async (e) => {
        setRolesIdSearch(e.target.value);
        await aplicarFiltrosRolesYRender();
    });
}

if (rolesSearch) {
    rolesSearch.addEventListener('input', async (e) => {
        setRolesSearch(e.target.value);
        await aplicarFiltrosRolesYRender();
    });
}

function populateRolePermissionsSelect(selected = []) {
    if (!rolePermissionsInput) return;
    const allPermissions = getRolePermissionsCatalog();
    rolePermissionsInput.innerHTML = allPermissions.map((code) => {
        const isSelected = selected.includes(code) ? 'selected' : '';
        return `<option value="${code}" ${isSelected}>${code}</option>`;
    }).join('');
}

function openRoleModal(role = null) {
    if (!roleModal || !roleForm) return;

    if (role) {
        roleEditingId = role.id;
        roleModalTitle.textContent = 'Editar Rol';
        roleNameInput.value = role.nombre || '';
        roleDescriptionInput.value = role.descripcion || '';
        populateRolePermissionsSelect(role.permissions || []);
    } else {
        roleEditingId = null;
        roleModalTitle.textContent = 'Nuevo Rol';
        roleForm.reset();
        populateRolePermissionsSelect([]);
    }

    roleModal.classList.add('show');
}

function closeRoleModal() {
    roleModal?.classList.remove('show');
    roleEditingId = null;
    roleForm?.reset();
    populateRolePermissionsSelect([]);
}

if (newRoleBtn) newRoleBtn.addEventListener('click', () => openRoleModal());
if (closeRoleModalBtn) closeRoleModalBtn.addEventListener('click', closeRoleModal);

if (roleModal) {
    roleModal.addEventListener('click', (e) => {
        if (e.target === roleModal) closeRoleModal();
    });
}

if (roleForm) {
    roleForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = roleNameInput?.value?.trim();
        const description = roleDescriptionInput?.value?.trim() || '';
        const permissions = Array.from(rolePermissionsInput?.selectedOptions || []).map((o) => o.value);

        if (!name) return;

        if (roleEditingId) await actualizarRolExistente(roleEditingId, name, description, permissions);
        else await crearRolNuevo(name, description, permissions);

        closeRoleModal();
    });
}

if (rolesContainer) {
    rolesContainer.addEventListener('click', async (e) => {
        const editBtn = e.target.closest('.role-edit');
        const deleteBtn = e.target.closest('.role-delete');

        if (editBtn) {
            const role = await prepararEdicionRol(editBtn.dataset.id);
            if (role) openRoleModal(role);
        }

        if (deleteBtn) {
            prepararEliminacionRol(deleteBtn.dataset.id);
            deleteRoleModal?.classList.add('show');
        }
    });
}

if (confirmDeleteRoleBtn) {
    confirmDeleteRoleBtn.addEventListener('click', async () => {
        await eliminarRolConfirmado();
        deleteRoleModal?.classList.remove('show');
    });
}

if (cancelDeleteRoleBtn) {
    cancelDeleteRoleBtn.addEventListener('click', () => {
        deleteRoleModal?.classList.remove('show');
    });
}

if (deleteRoleModal) {
    deleteRoleModal.addEventListener('click', (e) => {
        if (e.target === deleteRoleModal) deleteRoleModal.classList.remove('show');
    });
}

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (loginError) loginError.textContent = '';

        const documentValue = loginDocumentInput?.value?.trim();
        const passwordValue = loginPasswordInput?.value?.trim();

        if (!documentValue || !passwordValue) {
            if (loginError) loginError.textContent = 'Documento y contraseña son requeridos.';
            return;
        }

        try {
            await loginWithCredentials(documentValue, passwordValue);
            showAppView();
            applyPermissionBasedUi();
            showView(getFirstAllowedView());
            await cargarUsuarios();
            if (canReadRoles()) await cargarRoles();
            if (userSelect?.value) await cargarTareasPorUsuario(userSelect.value);
            loginForm.reset();
        } catch (error) {
            if (loginError) loginError.textContent = error.message || 'No fue posible iniciar sesión.';
        }
    });
}

if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        await logoutCurrentSession();
        showAuthView();
        if (loginError) loginError.textContent = '';
    });
}
