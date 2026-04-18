# Gestor de Tareas - Frontend

Frontend modular para gestión de tareas (CRUD) con arquitectura por capas, construido con **JavaScript ES Modules + Vite** y consumo de API REST (json-server).

Este `README.md` está ubicado en la **raíz del proyecto** para que sea accesible al subir el repositorio a GitHub.

---

## Tabla de contenido

- [1. Descripción general](#1-descripción-general)
- [2. Tecnologías y herramientas](#2-tecnologías-y-herramientas)
- [3. Arquitectura del frontend](#3-arquitectura-del-frontend)
- [4. Estructura actual del proyecto](#4-estructura-actual-del-proyecto)
- [5. Flujo de ejecución y datos](#5-flujo-de-ejecución-y-datos)
- [6. Módulos y responsabilidades](#6-módulos-y-responsabilidades)
- [7. Funcionalidades implementadas](#7-funcionalidades-implementadas)
- [8. Configuración](#8-configuración)
- [9. Instalación y ejecución](#9-instalación-y-ejecución)
- [10. API esperada (json-server)](#10-api-esperada-json-server)
- [11. Scripts disponibles](#11-scripts-disponibles)
- [12. Consideraciones técnicas y mejoras recomendadas](#12-consideraciones-técnicas-y-mejoras-recomendadas)

---

## 1. Descripción general

La aplicación permite:

- Crear tareas
- Consultar tareas por usuario
- Editar tareas existentes
- Eliminar tareas con confirmación modal
- Filtrar por estado
- Buscar por título
- Ordenar tareas
- Mostrar notificaciones tipo toast
- Exportar tareas visibles a archivo JSON

El proyecto está organizado por capas para mejorar mantenibilidad, separación de responsabilidades y escalabilidad.

---

## 2. Tecnologías y herramientas

- **JavaScript (ES Modules)**
- **Vite** (`^7.3.1`) para servidor de desarrollo y build
- **HTML5 + CSS3**
- **Fetch API** para consumo HTTP
- **json-server** como backend simulado
- **Node.js + npm** para entorno de desarrollo

---

## 3. Arquitectura del frontend

Arquitectura por capas (flujo principal de arriba hacia abajo):

1. **Entrada / Bootstrap** (`src/script.js`)
   - Registra eventos del DOM.
   - Coordina interacciones del usuario.
   - Invoca al controlador.

2. **Controlador de aplicación** (`src/core/appController.js`)
   - Administra estado en memoria.
   - Orquesta servicios, UI y validaciones.
   - Centraliza el flujo funcional.

3. **Servicios** (`src/services/*.js`)
   - Lógica de negocio intermedia.
   - Adaptación de datos API <-> UI.
   - Filtros, ordenamiento y exportación.

4. **API** (`src/api/*.js`)
   - Comunicación HTTP con backend (`fetch`).
   - Encapsulación de métodos GET/POST/PUT/PATCH/DELETE.

5. **UI + Utils** (`src/ui/*.js`, `src/utils/*.js`)
   - Render del DOM y manejo visual.
   - Notificaciones.
   - Validaciones reutilizables.

---

## 4. Estructura actual del proyecto

```text
Frontend/
├── .gitignore
├── changelog.md
├── db.json
├── index.html
├── package-lock.json
├── package.json
├── README.md
├── styles.css
├── vite.config.js
└── src/
    ├── script.js
    ├── api/
    │   ├── index.js
    │   ├── tasks.api.js
    │   └── users.api.js
    ├── core/
    │   ├── appController.js
    │   └── config.js
    ├── services/
    │   ├── tasksService.js
    │   └── usersService.js
    ├── ui/
    │   ├── notificationsUi.js
    │   ├── tasksUi.js
    │   └── usersUi.js
    └── utils/
        └── validaciones.js
```

> Nota: el frontend usa los módulos UI en inglés: `tasksUi.js`, `notificationsUi.js` y `usersUi.js`.

---

## 5. Flujo de ejecución y datos

### Flujo típico: crear tarea

1. Usuario completa formulario en `index.html`.
2. `src/script.js` captura `submit`.
3. Llama a `crearNuevaTarea(...)` en `appController`.
4. `appController` valida con `validarFormulario(...)`.
5. Si valida, llama a `crearTarea(...)` en `tasksService`.
6. `tasksService` invoca `taskPost(...)` en `tasks.api.js`.
7. API responde; el controlador actualiza estado local (`estado.tareasActuales`).
8. Se re-renderiza lista (`renderTasks`) y se muestra notificación (`showSuccess`).

### Flujo de consulta por usuario

- Input usuario (`#user-select`) + botón buscar / Enter.
- `cargarTareasPorUsuario(...)` consulta servicio.
- `obtenerTareasPorUsuario(...)` obtiene y limita a últimas 5.
- Se aplican filtros y orden actual.
- Render final en `.tasks-container`.

---

## 6. Módulos y responsabilidades

## `src/script.js`
- Punto de entrada del frontend.
- Referencia nodos principales del DOM.
- Registra listeners:
  - Carga inicial (`DOMContentLoaded`)
  - Buscar tareas por usuario
  - Refrescar
  - Filtros y orden
  - Exportación JSON
  - Editar / borrar (delegación en contenedor)
  - Confirmación/cancelación de borrado
  - Submit de formulario (crear/actualizar)

## `src/core/appController.js`
- Estado global de UI:
  - `tareasActuales`
  - `estadoActual`
  - `tituloActual`
  - `sortBy`
  - `sortDir`
  - variables de borrado modal
- Funciones principales:
  - `cargarTareasPorUsuario`
  - `aplicarFiltrosYRender`
  - `setEstadoFilter`, `setTituloFilter`, `setSortBy`, `toggleSortDir`
  - `prepararEdicionTarea`, `prepararEliminacionTarea`, `executeDelete`, `cancelarEliminacion`
  - `crearNuevaTarea`, `actualizarTareaExistente`
  - `exportarTareas`

## `src/services/tasksService.js`
- Abstracción de negocio de tareas:
  - `crearTarea`, `obtenerTodasTareas`, `obtenerTareasPorUsuario`
  - `eliminarTarea`, `actualizarTarea`, `actualizarParcialTarea`
- Utilidades de dominio:
  - `aplicarFiltrosYOrdenar`
  - `prepararDatosExportacion`
  - mapper `mapApiTaskToUiTask`

## `src/services/usersService.js`
- Capa de negocio para usuarios:
  - `obtenerTodosUsuarios`, `obtenerUsuarioPorId`
  - `crearUsuario`, `reemplazarUsuario`, `actualizarParcialUsuario`, `eliminarUsuario`

## `src/api/tasks.api.js`
- Endpoints de tareas:
  - `taskGet`
  - `taskGetByUser`
  - `taskPost`
  - `taskPut`
  - `taskPatch`
  - `taskDelete`

## `src/api/users.api.js`
- Endpoints de usuarios:
  - `userGet`
  - `userGetById`
  - `userPost`
  - `userPut`
  - `userPatch`
  - `userDelete`

## `src/api/index.js`
- Barrel file de exportaciones centralizadas para API de tareas y usuarios.

## `src/ui/tasksUi.js`
- Render de tarjetas de tareas.
- Errores de validación en campos.
- Modal de eliminación (show/hide).
- Preparación y reseteo del formulario.
- Descarga de archivo (export JSON).

## `src/ui/notificationsUi.js`
- Sistema de notificaciones tipo toast desacoplado:
  - `showSuccess`
  - `showError`
  - `showInfo`

## `src/ui/usersUi.js`
- Módulo de UI de usuarios (render y sincronización selectores).
- Útil para extender la vista de usuarios si se integra en el flujo principal.

## `src/utils/validaciones.js`
- Validaciones puras:
  - `validarTitulo`
  - `validarDescripcion`
  - `validarUsuario`
  - `validarFormulario`

## `src/core/config.js`
- Configuración central:
  - `API_URL = "http://localhost:3000"`
  - `APP_CONFIG` con timeout, límite por defecto y duración de notificaciones.

---

## 7. Funcionalidades implementadas

- CRUD de tareas sobre API REST.
- Consulta de tareas por `userId`.
- Filtros combinados:
  - por estado (`pendiente`, `en progreso`, `completada`)
  - por coincidencia parcial de título (case-insensitive)
- Ordenamiento:
  - por título
  - por estado
  - dirección asc/desc
- Confirmación de eliminación por modal.
- Validación de formulario con mensajes por campo.
- Notificaciones toast (éxito, error, info).
- Exportación de tareas a `tareas_exportadas.json`.

---

## 8. Configuración

Archivo: `src/core/config.js`

```js
export const API_URL = "http://localhost:3000";

export const APP_CONFIG = {
  REQUEST_TIMEOUT: 10000,
  DEFAULT_TASK_LIMIT: 5,
  NOTIFICATION_DURATION: 5000
};
```

La aplicación espera que el backend esté disponible en `http://localhost:3000`.

---

## 9. Instalación y ejecución

### Requisitos previos

- Node.js 18+ (recomendado)
- npm
- json-server (global o con npx)

### 1) Instalar dependencias del frontend

```bash
npm install
```

### 2) Levantar API simulada (json-server)

Opción global:
```bash
json-server --watch db.json --port 3000
```

Opción con npx:
```bash
npx json-server --watch db.json --port 3000
```

### 3) Ejecutar frontend en desarrollo

```bash
npm run dev
```

Vite mostrará una URL local (normalmente `http://localhost:5173`).

---

## 10. API esperada (json-server)

### Recursos

- `GET /tasks`
- `POST /tasks`
- `PUT /tasks/:id`
- `PATCH /tasks/:id`
- `DELETE /tasks/:id`

- `GET /users`
- `GET /users/:id`
- `POST /users`
- `PUT /users/:id`
- `PATCH /users/:id`
- `DELETE /users/:id`

### Modelo de tarea usado por frontend

```json
{
  "id": "string|number",
  "titulo": "string",
  "descripcion": "string",
  "estado": "pendiente|en progreso|completada",
  "userId": "string|number"
}
```

### Modelo de usuario esperado

```json
{
  "id": "string|number",
  "nombre": "string",
  "email": "string",
  "rol": "administrador|usuario"
}
```

---

## 11. Scripts disponibles

En `package.json`:

- `npm run dev` → inicia servidor de desarrollo Vite
- `npm run build` → genera build de producción
- `npm run preview` → previsualiza build generado

---

## 12. Consideraciones técnicas y mejoras recomendadas

1. **Consistencia de orden por fecha**
   - El `sortBy` por defecto usa `'fecha'`, pero el mapper de tareas no expone explícitamente `createdAt` en todos los casos.

2. **Manejo de errores HTTP homogéneo**
   - Estandarizar comportamiento en todos los métodos API (`taskPatch` actualmente no lanza error explícito).

3. **Carga de usuarios en UI**
   - Integrar visualización de usuarios (`usersUi.js`) si se requiere experiencia multiusuario completa.

4. **Pruebas**
   - Agregar pruebas unitarias para:
     - validaciones
     - filtros/orden
     - mapeo de tareas API/UI

---

Documentación actualizada para reflejar el estado real del frontend actual y optimizada para visibilidad en GitHub desde la raíz del repositorio.
