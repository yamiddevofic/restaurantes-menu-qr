const { ZodError } = require('zod');

// 404 para rutas no existentes
const notFound = (req, res) => {
    res.status(404).json({ message: 'Ruta no encontrada' });
};

// Manejador central de errores: nunca se filtra err.message al cliente
const errorHandler = (err, req, res, next) => {
    // Errores de validación Zod (400 con detalle por campo)
    if (err instanceof ZodError) {
        return res.status(400).json({
            message: 'Datos inválidos',
            errores: err.issues.map((i) => ({
                campo: i.path.join('.') || i.code,
                mensaje: i.message
            }))
        });
    }

    // Errores de multer (imagen no permitida o demasiado grande)
    if (err && err.name === 'MulterError') {
        const mensaje =
            err.code === 'LIMIT_FILE_SIZE'
                ? 'La imagen supera el tamaño máximo permitido (5 MB)'
                : 'Error al procesar la imagen';
        return res.status(400).json({ message: mensaje });
    }

    // ID mal formado (CastError de Mongoose)
    if (err && err.name === 'CastError') {
        return res.status(400).json({ message: 'Identificador inválido' });
    }

    // Errores de validación de Mongoose (schemas)
    if (err && err.name === 'ValidationError') {
        return res.status(400).json({
            message: 'Datos inválidos',
            errores: Object.values(err.errors).map((e) => e.message)
        });
    }

    // Índice único duplicado
    if (err && err.code === 11000) {
        return res.status(409).json({ message: 'Ya existe un registro con esos datos' });
    }

    // Errores con código HTTP explícito (rate limit, etc.)
    if (err && typeof err.status === 'number' && err.status >= 400 && err.status < 500) {
        return res.status(err.status).json({ message: err.message || 'Solicitud inválida' });
    }

    // Error no esperado: se loguea internamente, respuesta genérica
    console.error('[Error no controlado]', err);
    res.status(500).json({ message: 'Error interno del servidor' });
};

module.exports = { notFound, errorHandler };