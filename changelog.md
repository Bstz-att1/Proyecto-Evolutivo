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