const { z } = require('zod');
const { nombreCampo, email, password, usuario } = require('./common');

const registroAdminSchema = z.object({
    nombre: nombreCampo('El nombre es obligatorio'),
    email,
    usuario,
    password,
    plan: z.enum(['free', 'pro']).optional()
});

const updateAdminSchema = z.object({
    nombre: nombreCampo('El nombre es obligatorio').optional(),
    email: email.optional(),
    usuario: usuario.optional(),
    password: password.optional(),
    plan: z.enum(['free', 'pro']).optional()
});

const estadoSchema = z.object({
    estado: z.enum(['ACTIVO', 'INACTIVO', 'BAJA'])
});

module.exports = { registroAdminSchema, updateAdminSchema, estadoSchema };