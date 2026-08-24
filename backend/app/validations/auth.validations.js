const { z } = require('zod');
const { email, password } = require('./common');

const loginSchema = z.object({
    usuario: z.string().trim().min(1, 'El usuario es obligatorio').max(50),
    password: z.string().min(1, 'La contraseña es obligatoria').max(72),
    tipo: z.enum(['admin', 'empleado'], 'Tipo debe ser "admin" o "empleado"')
});

const perfilSchema = z.object({
    nombre: z.string().trim().min(1, 'El nombre no puede estar vacío').max(100).optional(),
    email: email.optional(),
    telefono: z.string().trim().max(30, 'Máximo 30 caracteres').optional(),
    bio: z.string().trim().max(500, 'Máximo 500 caracteres').optional(),
    contacto: z
        .object({
            correo: email.optional(),
            celular: z.string().trim().max(30, 'Máximo 30 caracteres').optional()
        })
        .optional()
});

const eliminarCuentaSchema = z.object({
    password: z.string().min(1, 'Ingresa tu contraseña para confirmar la eliminación').max(72)
});

const suscripcionSchema = z.object({
    accion: z.enum(['actualizar', 'renovar', 'cancelar'], 'Acción inválida')
});

module.exports = { loginSchema, perfilSchema, eliminarCuentaSchema, suscripcionSchema };