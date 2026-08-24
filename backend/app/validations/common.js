const { z } = require('zod');

// ObjectId de MongoDB (24 hex)
const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Identificador inválido');

// Campo de texto obligatorio con límites
const nombreCampo = (mensaje) =>
    z.string().trim().min(1, mensaje).max(100, 'Máximo 100 caracteres');

const email = z
    .string()
    .trim()
    .toLowerCase()
    .email('El correo no es válido')
    .max(100, 'Máximo 100 caracteres');

const password = z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(72, 'La contraseña es demasiado larga');

const usuario = z
    .string()
    .trim()
    .min(3, 'El usuario debe tener al menos 3 caracteres')
    .max(30, 'Máximo 30 caracteres')
    .regex(/^[a-zA-Z0-9_.-]+$/, 'El usuario solo puede contener letras, números, punto, guion y guion bajo');

module.exports = { objectId, nombreCampo, email, password, usuario };