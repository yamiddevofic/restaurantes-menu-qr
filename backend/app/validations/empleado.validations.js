const { z } = require('zod');
const { nombreCampo, email, password, usuario, objectId } = require('./common');

const empleadoBase = {
    restaurante_id: objectId,
    nombre: nombreCampo('El nombre es obligatorio'),
    usuario,
    rol: z.enum(['mesero', 'cocina']),
    contacto: z
        .object({
            correo: email.optional(),
            celular: z.string().trim().max(30, 'Máximo 30 caracteres').optional()
        })
        .optional()
};

const empleadoSchema = z.object({
    ...empleadoBase,
    password,
    estado: z.enum(['ACTIVO', 'INACTIVO']).optional()
});

// Todos los campos opcionales, pero con las mismas reglas si llegan
const updateEmpleadoSchema = z.object({
    ...empleadoBase,
    password: password.optional(),
    estado: z.enum(['ACTIVO', 'INACTIVO']).optional()
});

module.exports = { empleadoSchema, updateEmpleadoSchema };