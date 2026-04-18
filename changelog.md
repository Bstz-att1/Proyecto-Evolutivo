# Changelog

## Objetivo del cambio
Reparar y completar la conexión total de capas (**API -> Services -> UI**) después del renombrado de archivos a inglés, manteniendo el estilo de desarrollo existente y corrigiendo la integración con la estructura real de datos usada por el proyecto.

---

## Cambios realizados

### 1) `src/core/appController.js` (actualizado)
Se corrigieron imports y referencias para restablecer la conexión con los módulos renombrados en inglés.

**Cambios:**
- Import de service corregido:
  - `../services/tareasService.js` -> `../services/tasksService.js`
- Import de UI actualizado:
  - `../ui/tareasUi.js` -> `../ui/tasksUi.js`
- Import de notificaciones actualizado:
  - `../ui/notificacionesUi.js` -> `../ui/notificationsUi.js`
- Se reemplazaron llamadas de funciones UI/notificaciones por sus equivalentes en inglés:
  - `renderizarTareas` -> `renderTasks`
  - `mostrarErrorBusqueda` -> `showSearchError`
  - `mostrarModalEliminar` -> `showDeleteModal`
  - `ocultarModalEliminar` -> `hideDeleteModal`
  - `prepararFormularioEditar` -> `prepareEditForm`
  - `resetearFormulario` -> `resetForm`
  - `descargarArchivo` -> `downloadFile`
  - `mostrarExito`, `mostrarError`, `mostrarInfo` -> `showSuccess`, `showError`, `showInfo`
- Se corrigieron referencias residuales para evitar errores en tiempo de ejecución (ej. eliminación y reseteo de formulario).

**Resultado:**
- El controlador vuelve a conectar correctamente servicios y UI tras el renombrado.

---

### 2) `src/ui/tasksUi.js` (nuevo)
Se creó el módulo UI de tareas en inglés como reemplazo funcional de `tareasUi.js`, manteniendo la misma lógica y estilo modular.

**Funciones principales:**
- `renderTasks(...)`
- `clearUiErrors()`
- `showSearchError(...)`
- `showFieldErrors(...)`
- `showDeleteModal()`
- `hideDeleteModal()`
- `prepareEditForm(...)`
- `resetForm()`
- `downloadFile(...)`

**Resultado:**
- Capa UI de tareas alineada con convención de nombres en inglés.

---

### 3) `src/ui/notificationsUi.js` (nuevo)
Se creó el módulo de notificaciones en inglés como reemplazo de `notificacionesUi.js`, preservando comportamiento y enfoque desacoplado.

**Funciones exportadas:**
- `showSuccess(...)`
- `showError(...)`
- `showInfo(...)`

**Resultado:**
- Notificaciones compatibles con los nuevos imports del controlador.

---

### 4) `src/ui/usersUi.js` (nuevo)
Se añadió módulo UI para usuarios, solicitado para mantener consistencia estructural con el módulo de tareas.

**Funciones implementadas:**
- `renderUsers(...)`
- `syncUserSelectors()`
- `showUserSearchError(...)`
- `clearUserSearchError()`

**Resultado:**
- Se incorpora capa de UI de users con patrón modular homogéneo.

---

### 5) `src/api/tasks.api.js` (actualizado)
Se corrigió la integración de endpoints de tareas para alinearse con la fuente de datos actual confirmada por el proyecto.

**Cambios:**
- Endpoints de tasks normalizados a:
  - `GET /tasks`
  - `GET /tasks` + filtrado local por `userId`
  - `POST /tasks`
  - `PUT /tasks/:id`
  - `PATCH /tasks/:id`
  - `DELETE /tasks/:id`
- Se conserva payload con campos usados por el frontend/base:
  - `titulo`
  - `descripcion`
  - `estado`
  - `userId`
- Filtro por usuario robustecido:
  - `String(tarea.userId) === String(userId)`

**Resultado:**
- Se corrige el error de obtención de tareas por desalineación de endpoint/estructura.

---

### 6) `src/services/tasksService.js` (actualizado)
Se reforzó la capa intermedia para mantener compatibilidad estable entre API y UI.

**Cambios:**
- `crearTarea(...)` ajustado para invocar correctamente `taskPost(...)` con estado por defecto.
- Se añadió mapeo centralizado:
  - `mapApiTaskToUiTask(task)`
- Se normalizan resultados en:
  - `obtenerTodasTareas()`
  - `obtenerTareasPorUsuario()`
  - `actualizarTarea()`
  - `actualizarParcialTarea()`

**Resultado:**
- Se evita ruptura por diferencias de forma entre respuestas de API y consumo de UI.

---

### 7) `src/api/users.api.js` (actualizado)
Se ajustaron payloads de creación/actualización de usuarios para compatibilidad con el esquema usado por datos del proyecto.

**Cambios:**
- En `userPost(...)` y `userPut(...)` se envía:
  - `nombre`
  - `email`
  - `rol`
- Se mantiene el contrato de métodos y estructura de capa API existente.

**Resultado:**
- Operaciones de escritura de users alineadas con el modelo actual de datos.

---

## Actualización adicional - Integración Backend Node.js + MySQL (2026-04-18)

### 8) `src/api/tasks.api.js` (refactor)
Se adaptó la capa API de tareas para backend real en Express con respuesta envuelta (`{ success, message, data, errors }`) y estructura de MySQL.

**Cambios:**
- Lectura de respuestas usando `json.data` (con fallback para arrays anidados).
- Payload alineado al backend:
  - `title`
  - `description`
  - `status`
  - `user_id`
  - `created_by`
- `headers` JSON explícitos en operaciones de escritura.
- Soporte para creación con retorno tipo MySQL:
  - captura de `insertId`
  - retorno compatible para capa de servicios.
- Robustez en filtrado por usuario:
  - compatibilidad con `user_id` y `userId`
  - comparación consistente con `String(...)`.

**Resultado:**
- Recuperación y creación de tareas compatibles con backend Express + MySQL sin romper contratos de UI.

---

### 9) `src/api/users.api.js` (refactor)
Se actualizó la capa API de usuarios para consumir correctamente el backend real con respuesta envuelta y payload de servidor.

**Cambios:**
- Lectura de respuestas en `json.data`.
- Payload alineado con backend:
  - `name`
  - `email`
  - `role`
- `headers` JSON en POST/PUT/PATCH.
- Soporte de creación MySQL (`insertId`) para retornar un objeto utilizable por servicios.

**Resultado:**
- Operaciones de usuarios (lectura y escritura) consistentes con el backend Node/MySQL.

---

### 10) `src/services/tasksService.js` (refactor de mapeo)
Se reforzó la transformación de datos API -> UI para tareas, evitando romper la interfaz por diferencias de nombres y tipos.

**Cambios:**
- Mapeo flexible:
  - `title -> titulo`
  - `description -> descripcion`
  - `status -> estado`
  - `user_id -> userId`
- Normalización de IDs en servicio:
  - `id` como `String`
  - `userId` como `String`

**Resultado:**
- La UI mantiene compatibilidad sin depender del nombre de columnas SQL y los filtros por usuario siguen funcionando correctamente.

---

### 11) `src/services/usersService.js` (refactor de mapeo)
Se añadió transformación de usuarios API -> UI para mantener consistencia con los nombres consumidos en frontend.

**Cambios:**
- Mapeo flexible:
  - `name -> nombre`
  - `role -> rol`
- Normalización:
  - `id` como `String`
- Aplicación del transformador en:
  - listado
  - obtención por ID
  - creación
  - actualización total/parcial.

**Resultado:**
- Capa de servicios desacoplada de la forma SQL/Backend y compatible con la UI actual.

---

## Resumen de impacto Frontend
- Integración completa de capa API/Servicios con backend real Node.js/Express + MySQL.
- Manejo explícito de respuestas envueltas y de `insertId` en operaciones de creación.
- Compatibilidad de naming (snake_case <-> camelCase/español) sin romper componentes de interfaz.
- Consistencia de tipos de ID para preservar filtros y comparaciones en UI.

---

## Actualización - Frontend completo (API + Services + Controller + UI + script + index + styles) 

### 12) `src/api/tasks.api.js` (ajustes de integración backend real)
Se consolidó el consumo de endpoints de tareas para backend Express/MySQL, contemplando respuestas envueltas y estructuras variables en `data`.

**Cambios:**
- Se añadió helper `extractData(json)` para centralizar lectura de `json.data`.
- `taskGet()`:
  - tolera respuestas con `data` como array directo.
  - soporta estructuras anidadas (`data.tasks`, `data.rows`).
- `taskGetByUser(userId)`:
  - filtrado robusto por `user_id` o `userId`.
  - comparación estable mediante `String(...)`.
- `taskPost(...)`, `taskPut(...)`, `taskPatch(...)`:
  - payload alineado al backend:
    - `title`
    - `description`
    - `status`
    - `user_id` (cast a `Number` cuando aplica)
    - `created_by` (en creación/reemplazo)
  - `headers` JSON explícitos.
  - manejo de fallback cuando backend no retorna objeto completo.
- `taskPost(...)`:
  - soporte explícito para `insertId`/`id` de respuestas de creación.

**Resultado:**
- Operaciones CRUD de tareas consistentes contra backend real, sin romper el contrato esperado por servicios/UI.

---

### 13) `src/api/users.api.js` (ajustes de payload y normalización de rol)
Se ajustó la capa API de usuarios para alinear los campos enviados/recibidos con el backend actual y el modelo de UI.

**Cambios:**
- Helper `extractData(json)` para leer `json.data`.
- `userGet()` y `userGetById()` consumen respuesta envuelta.
- `userPost(...)` y `userPut(...)`:
  - payload unificado: `{ name, email, document, role }`.
  - normalización de rol antes de enviar:
    - `administrador -> admin`
    - `usuario -> user`
  - headers JSON.
- `userPost(...)`:
  - soporte de retorno por `insertId` cuando aplica.
- `userPatch(...)` y `userDelete(...)`:
  - se mantiene contrato REST con manejo consistente de errores.

**Resultado:**
- Capa API de usuarios compatible con backend Node/MySQL y con los campos usados por el frontend actual.

---

### 14) `src/services/tasksService.js` (mapeo y normalización API -> UI)
Se reforzó la capa de servicios de tareas para desacoplar completamente la UI de la forma de datos del backend.

**Cambios:**
- `crearTarea(...)` usa `taskPost(...)` con estado por defecto `'pendiente'`.
- `obtenerTodasTareas()` y `obtenerTareasPorUsuario()` aplican mapeo centralizado.
- `actualizarTarea(...)` y `actualizarParcialTarea(...)` retornan datos normalizados.
- `mapApiTaskToUiTask(task)`:
  - mapeo flexible de nombres:
    - `title -> titulo`
    - `description -> descripcion`
    - `status -> estado`
    - `user_id -> userId`
    - `task_id -> id` (fallback)
    - `assigned_to/assignedTo -> asignadoA`
    - `created_by/createdBy -> created_by`
    - `created_at/updated_at -> createdAt/updatedAt`
  - normalización de tipos (`id`, `userId`, `asignadoA` como `String`).
- Se mantuvo utilitario de filtros y orden (`aplicarFiltrosYOrdenar`) y exportación JSON.

**Resultado:**
- Servicios de tareas estables ante cambios de naming y estructura del backend, preservando compatibilidad con la UI.

---

### 15) `src/services/usersService.js` (mapeo y normalización API -> UI)
Se actualizó el servicio de usuarios para transformar de forma uniforme la información del backend al formato consumido por interfaz.

**Cambios:**
- `obtenerTodosUsuarios()`, `obtenerUsuarioPorId()`, `crearUsuario()`, `reemplazarUsuario()`, `actualizarParcialUsuario()` retornan datos mapeados.
- `mapApiUserToUiUser(user)`:
  - mapeo flexible:
    - `name -> nombre`
    - `role -> rol`
    - `document/documento -> document`
    - `user_id -> id` (fallback)
  - normalización de `id` a `String`.
- `normalizeRol(...)`:
  - unifica variantes (`admin`, `administrator`, `administrador`) a `administrador`.
  - unifica (`user`, `usuario`) a `usuario`.

**Resultado:**
- Modelo de usuario homogéneo para UI, sin dependencia directa de cómo el backend nombre columnas/campos.

---

### 16) `src/core/appController.js` (orquestación integral tareas + usuarios)
Se consolidó el controlador como capa de coordinación entre servicios, UI y notificaciones para tareas y usuarios.

**Cambios:**
- Estado centralizado:
  - tareas, usuarios, filtros, orden, IDs de eliminación.
- Flujo de tareas:
  - carga por usuario (`cargarTareasPorUsuario`).
  - filtros y orden (`setEstadoFilter`, `setTituloFilter`, `setSortBy`, `toggleSortDir`).
  - creación, edición, eliminación con feedback de toasts.
  - exportación JSON (`exportarTareas`).
- Flujo de usuarios:
  - carga completa (`cargarUsuarios`) con skeleton.
  - filtros por búsqueda y rol (`setUsersSearch`, `setUsersRoleFilter`, `aplicarFiltrosUsuariosYRender`).
  - creación/edición/eliminación (`crearUsuarioNuevo`, `actualizarUsuarioExistente`, `eliminarUsuarioConfirmado`).
- KPIs:
  - `actualizarKpis()` para tareas visibles y usuarios registrados.
- Mensajería:
  - integración de `showSuccess`, `showError`, `showInfo`.

**Resultado:**
- Controlador robusto para ambos dominios (tasks/users), con estado consistente y mejor experiencia de interacción.

---

### 17) UI modules (`src/ui/tasksUi.js`, `src/ui/usersUi.js`, `src/ui/notificationsUi.js`)
Se completó la capa UI modular para renderizado, validación visual, modales y notificaciones toast reutilizables.

**Cambios en `tasksUi.js`:**
- Cache de elementos DOM (`getElements`) para reducir consultas repetidas.
- `renderTasks(...)`:
  - tarjetas con metadatos (`created_by`, asignación, fechas formateadas).
  - badges de estado dinámicos.
  - estado vacío amigable.
- Manejo de errores visuales:
  - `clearUiErrors()`, `showSearchError()`, `showFieldErrors()`.
- Gestión de modal y formulario:
  - `showDeleteModal()`, `hideDeleteModal()`.
  - `prepareEditForm(...)`, `resetForm()`.
- Exportación:
  - `downloadFile(...)` para descarga de JSON.

**Cambios en `usersUi.js`:**
- `renderUsers(...)`:
  - tabla de usuarios con acciones editar/borrar.
  - estado vacío cuando no hay datos.
- utilidades:
  - `syncUserSelectors()`
  - `showUserSearchError()`
  - `clearUserSearchError()`.

**Cambios en `notificationsUi.js`:**
- Contenedor flotante de toasts creado dinámicamente.
- `showNotification(...)` con estilos por tipo (`success`, `error`, `info`) y animación.
- API pública:
  - `showSuccess(...)`
  - `showError(...)`
  - `showInfo(...)`.

**Resultado:**
- UI desacoplada por módulos, con renderizado consistente, feedback visual claro y mejor mantenibilidad.

---

### 18) `src/script.js` (wiring completo de la SPA)
Se fortaleció el punto de entrada para conectar eventos del DOM con el controlador y habilitar flujo completo de la aplicación.

**Cambios:**
- Importación de acciones para tareas y usuarios desde `appController`.
- Navegación entre vistas (`dashboard`, `tasks`, `users`) con sidebar.
- Inicialización:
  - carga de usuarios al `DOMContentLoaded`.
  - carga inicial de tareas si hay usuario seleccionado.
- Sincronización de inputs de usuario:
  - `#user-select` (externo) y `#user-id` (formulario).
- Eventos de tareas:
  - filtros, orden, recarga, submit crear/editar, editar/eliminar por delegación.
- Botón dinámico de exportación JSON insertado sobre contenedor de tareas.
- Eventos de usuarios:
  - búsqueda + filtro por rol.
  - modal crear/editar.
  - confirmación de eliminación con modal dedicado.

**Resultado:**
- Integración de eventos completa y coherente para operación diaria de tareas y usuarios.

---

### 19) `index.html` (estructura de vistas y modales)
Se amplió la estructura HTML para soportar dashboard, gestión de tareas y gestión de usuarios en una misma SPA.

**Cambios:**
- Layout principal con:
  - sidebar y navegación por vistas.
  - secciones `dashboard-view`, `tasks-view`, `users-view`.
- Dashboard:
  - tarjetas KPI para tareas y usuarios.
- Tareas:
  - panel de controles (usuario, estado, búsqueda, orden).
  - formulario de tarea con validación visual.
  - contenedor de listado + skeleton.
- Usuarios:
  - toolbar de búsqueda/rol + botón nuevo usuario.
  - contenedor de tabla + skeleton.
- Modales:
  - confirmación de eliminación de tarea.
  - modal de creación/edición de usuario (incluye `documento`).
  - confirmación de eliminación de usuario.

**Resultado:**
- Base estructural completa para soportar todos los flujos de frontend en una sola interfaz modular.

---

### 20) `styles.css` (sistema visual y componentes UI)
Se consolidó una hoja de estilos integral para layout, componentes y estados visuales de la SPA.

**Cambios:**
- Sistema de variables CSS (`:root`) para paleta y tokens visuales.
- Layout responsive:
  - grid con sidebar + content.
  - adaptación en `@media` para pantallas menores.
- Estilos de componentes:
  - paneles, formularios, botones, tarjetas de tarea, tabla de usuarios.
- Estados de tarea:
  - badges por estado (`pendiente`, `en progreso`, `completada`).
- Modales:
  - overlay, contenido, botones.
- Skeleton loaders:
  - grids/tablas con animación `loading`.
- Estados de error:
  - `field-error` y resaltado de inputs `.error`.
- Dashboard:
  - tarjetas KPI.

**Resultado:**
- Interfaz visual consistente, moderna y responsive para todos los módulos del frontend.

---

## Resumen de impacto Frontend (actualización completa)
- Documentación unificada del alcance completo de cambios en **API, Services, Controller, UI, script, HTML y estilos**.
- Integración estable con backend Node.js/Express + MySQL, incluyendo normalización de respuestas y campos.
- Arquitectura frontend más modular y mantenible (separación clara por capas).
- Mejoras funcionales y UX: vistas por dominio, CRUD completo de usuarios/tareas, notificaciones toast, modales de confirmación, filtros, ordenamientos, exportación y KPIs.
