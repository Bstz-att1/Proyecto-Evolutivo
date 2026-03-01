/**
 * Módulo de validaciones reutilizables
 * Funciones independientes para validar datos del formulario
 */

/**
 * Valida el título de la tarea
 * @param {string} titulo - El título a validar
 * @returns {Object} - Objeto con el resultado de la validación
 */
export function validarTitulo(titulo) {
    if (!titulo || titulo.trim() === '') {
        return { valido: false, error: 'El título es obligatorio. Por favor, ingréselo.' };
    }
    if (titulo.trim().length < 3) {
        return { valido: false, error: 'El título debe tener al menos 3 caracteres.' };
    }
    return { valido: true, error: null };
}

/**
 * Valida la descripción de la tarea
 * @param {string} descripcion - La descripción a validar
 * @returns {Object} - Objeto con el resultado de la validación
 */
export function validarDescripcion(descripcion) {
    if (!descripcion || descripcion.trim() === '') {
        return { valido: false, error: 'La descripción es obligatoria. Por favor, ingrésela.' };
    }
    if (descripcion.trim().length < 10) {
        return { valido: false, error: 'La descripción debe tener al menos 10 caracteres.' };
    }
    return { valido: true, error: null };
}

/**
 * Valida el usuario de la tarea
 * @param {string} usuario - El usuario a validar
 * @returns {Object} - Objeto con el resultado de la validación
 */
export function validarUsuario(usuario) {
    if (!usuario || usuario.trim() === '') {
        return { valido: false, error: 'El usuario es obligatorio. Por favor, seleccione un usuario.' };
    }
    return { valido: true, error: null };
}

/**
 * Valida todos los campos del formulario
 * @param {string} titulo - Título de la tarea
 * @param {string} descripcion - Descripción de la tarea
 * @param {string} usuario - Usuario de la tarea
 * @returns {Object} - Objeto con los errores encontrados
 */
export function validarFormulario(titulo, descripcion, usuario) {
    const errors = {};
    
    const resultadoTitulo = validarTitulo(titulo);
    if (!resultadoTitulo.valido) {
        errors.titulo = resultadoTitulo.error;
    }
    
    const resultadoDescripcion = validarDescripcion(descripcion);
    if (!resultadoDescripcion.valido) {
        errors.descripcion = resultadoDescripcion.error;
    }
    
    const resultadoUsuario = validarUsuario(usuario);
    if (!resultadoUsuario.valido) {
        errors.usuario = resultadoUsuario.error;
    }
    
    return errors;
}
