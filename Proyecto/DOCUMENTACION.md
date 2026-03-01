# Documentación del Proyecto: Gestor de Tareas Modular

## 1. Introducción

Este documento describe la arquitectura y el funcionamiento interno del proyecto "Gestor de Tareas". La aplicación es un CRUD (Crear, Leer, Actualizar, Eliminar) de tareas que se comunica con una API RESTful y está construida siguiendo un enfoque modular para garantizar la mantenibilidad, escalabilidad y claridad del código.

## 2. Arquitectura por Capas

El proyecto implementa una arquitectura de software por capas, donde cada capa tiene una responsabilidad única y bien definida. Esto promueve la **separación de conceptos (SoC)** y reduce el acoplamiento entre las diferentes partes del sistema.

La comunicación entre capas es unidireccional (de arriba hacia abajo), donde una capa superior solo puede invocar a la capa inmediatamente inferior.

```
   ┌─────────────────────────────────────────────────────────────────────┐
   │  CAPA DE PRESENTACIÓN (UI)                                          │
   │  (servidor/ui/)                                                     │
   │  → Responsable de manipular el DOM y mostrar datos al usuario.      │
   │  → No contiene lógica de negocio.                                   │
   └─────────────────────────────────────────────────────────────────────┘
                                    ▲
                                    │ (El script principal la invoca)
                                    │
   ┌─────────────────────────────────────────────────────────────────────┐
   │  PUNTO DE ENTRADA / ORQUESTADOR                                     │
   │  (servidor/script.js)                                               │
   │  → Escucha eventos del usuario y coordina las acciones.             │
   │  → Llama a los servicios y a la UI para ejecutar las operaciones.   │
   └─────────────────────────────────────────────────────────────────────┘
                                    ▲
                                    │ (Invoca a los servicios)
                                    │
   ┌─────────────────────────────────────────────────────────────────────┐
   │  CAPA DE SERVICIOS (LÓGICA DE NEGOCIO)                              │
   │  (servidor/services/tareasService.js)                               │
   │  → Contiene la lógica de la aplicación (filtrar, ordenar, etc.).    │
   │  → Actúa como intermediario entre la API y el orquestador.          │
   └─────────────────────────────────────────────────────────────────────┘
                                    ▲
                                    │ (Invoca a la API)
                                    │
   ┌─────────────────────────────────────────────────────────────────────┐
   │  CAPA DE API (ACCESO A DATOS)                                       │
   │  (servidor/api/)                                                    │
   │  → Abstrae la comunicación HTTP (fetch) con el servidor externo.    │
   │  → Proporciona funciones claras para cada endpoint (GET, POST, etc.)│
   └─────────────────────────────────────────────────────────────────────┘
```

### Beneficios de esta Arquitectura

*   **Mantenibilidad:** Aislar una capa permite modificarla sin afectar a las demás. Por ejemplo, se puede cambiar la librería de notificaciones en la capa de UI sin tocar la lógica de negocio.
*   **Testabilidad:** Cada capa puede ser probada de forma independiente.
*   **Reusabilidad:** Componentes como las validaciones o el sistema de notificaciones pueden ser fácilmente reutilizados en otros módulos o proyectos.
*   **Claridad:** El código es más fácil de entender, ya que cada archivo tiene un propósito claro y definido.

## 3. Descripción Detallada de Módulos

### 3.1. Capa de Presentación (UI) - `servidor/ui/`

Responsable exclusivamente de la interacción con el DOM.

*   **`tareasUi.js`**: Contiene funciones para renderizar la lista de tareas, preparar formularios, mostrar/ocultar modales y manejar la descarga de archivos. No sabe *de dónde* vienen los datos, solo cómo mostrarlos.
*   **`notificacionesUi.js` (RF03)**: Módulo independiente que muestra notificaciones flotantes (toasts) de éxito, error o información. Es un ejemplo perfecto de un componente de UI reutilizable y desacoplado.

### 3.2. Punto de Entrada - `servidor/script.js`

Es el "cerebro" de la aplicación en el lado del cliente.

*   **Responsabilidades**:
    *   Obtener referencias a los elementos del DOM.
    *   Registrar todos los `event listeners` (clicks, submits, inputs).
    *   Orquestar el flujo de las operaciones: cuando un usuario hace clic en "Guardar", este script llama primero a las `utils` para validar, luego al `service` para enviar los datos, y finalmente a la `UI` para actualizar la vista y mostrar una notificación.

### 3.3. Capa de Servicios - `servidor/services/`

Contiene la lógica de negocio de la aplicación.

*   **`tareasService.js`**:
    *   Actúa como fachada para la capa de API, proporcionando métodos más descriptivos (`crearTarea` en lugar de `taskPost`).
    *   Implementa lógica que no pertenece ni a la API ni a la UI, como filtrar, ordenar o preparar datos para su exportación (`prepararDatosExportacion` - RF04).

### 3.4. Capa de API - `servidor/api/`

La capa más baja, responsable de la comunicación con el servidor.

*   **Abstracción de `fetch`**: Encapsula las llamadas `fetch` de JavaScript, manejando la configuración de `headers`, `body` y el método HTTP.
*   **Manejo de Respuestas**: Convierte las respuestas del servidor (JSON) en objetos JavaScript y maneja errores básicos de red.
*   **`index.js`**: Actúa como un exportador centralizado para que el resto de la aplicación importe desde un único punto, simplificando las rutas de importación.

### 3.5. Capa de Utilidades - `servidor/utils/`

Contiene funciones puras y reutilizables.

*   **`validaciones.js`**: Proporciona funciones para validar los datos de los formularios (ej. `validarTitulo`). Estas funciones no tienen efectos secundarios y pueden ser usadas en cualquier parte del proyecto.

## 4. Flujo de Datos: Ejemplo "Crear una Tarea"

1.  **Usuario (UI)**: El usuario llena el formulario y hace clic en "Guardar Tarea".
2.  **`script.js` (Orquestador)**:
    *   Captura el evento `submit`.
    *   Llama a `validarFormulario()` en `utils/validaciones.js`.
    *   Si la validación falla, llama a `mostrarErroresCampos()` y `mostrarError()` en la capa de UI.
    *   Si la validación es exitosa, llama a `crearTarea()` en `services/tareasService.js`.
3.  **`tareasService.js` (Servicio)**:
    *   Recibe los datos de la tarea.
    *   Llama a `taskPost()` en la capa de API.
4.  **`api/post.js` (API)**:
    *   Realiza la petición `fetch` con el método `POST` al servidor.
    *   Retorna la respuesta del servidor (la nueva tarea con su ID).
5.  **Retorno del Flujo**:
    *   La promesa se resuelve hacia arriba: `API` -> `Service` -> `script.js`.
    *   `script.js` recibe la nueva tarea.
    *   Llama a `renderizarTareas()` en la UI para añadir la nueva tarea a la lista.
    *   Llama a `resetearFormulario()` en la UI.
    *   Llama a `mostrarExito()` en `ui/notificacionesUi.js` para notificar al usuario.

## 5. Implementación de Requerimientos Adicionales

La arquitectura modular facilitó la implementación de los requerimientos RF03 y RF04.

*   **RF03 – Sistema de notificaciones**: Se creó un nuevo módulo `notificacionesUi.js` dentro de la capa de UI. No requirió ninguna modificación en las capas de servicio o API, demostrando el bajo acoplamiento.
*   **RF04 – Exportación de tareas**: La responsabilidad se dividió limpiamente:
    *   `tareasService.js` se encarga de la lógica de datos: `prepararDatosExportacion()` convierte el array de tareas a JSON.
    *   `tareasUi.js` se encarga de la lógica de interfaz: `descargarArchivo()` crea un `Blob` y simula un clic para iniciar la descarga en el navegador.

## 6. Guía de Inicio

Para ejecutar este proyecto, se necesita `json-server` para simular la API backend.

1.  **Instalar dependencias**:
    ```bash
    npm install -g json-server
    ```
2.  **Iniciar el servidor**:
    Navega a la carpeta `servidor/` y ejecuta el siguiente comando. Esto levantará un servidor en `http://localhost:3000`.
    ```bash
    json-server --watch db.json
    ```
3.  **Abrir la aplicación**:
    Abre el archivo `index.html` en tu navegador.