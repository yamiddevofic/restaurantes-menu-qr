const { z } = require('zod');
const { nombreCampo, objectId } = require('./common');

const ingredienteSchema = z.object({
    nombre: z.string().trim().min(1, 'El ingrediente no puede estar vacío').max(60, 'Máximo 60 caracteres'),
    cantidad: z.coerce.number('La cantidad debe ser un número').min(0, 'La cantidad no puede ser negativa'),
    medida: z.string().trim().min(1, 'La medida es obligatoria').max(20, 'Máximo 20 caracteres')
});

// En multipart los ingredientes llegan como string JSON; en JSON como array
const ingredientesSchema = z.preprocess(
    (val) => {
        if (typeof val === 'string' && val.trim()) {
            try {
                return JSON.parse(val);
            } catch {
                return val;
            }
        }
        return val;
    },
    z.array(ingredienteSchema).max(50, 'Máximo 50 ingredientes').default([])
);

const platoSchema = z.object({
    nombre: nombreCampo('El nombre del plato es obligatorio').max(80, 'Máximo 80 caracteres'),
    descripcion: z.string().trim().max(500, 'Máximo 500 caracteres').optional(),
    ingredientes: ingredientesSchema,
    restaurante_id: objectId,
    categoria_id: objectId,
    precio: z.coerce.number('El precio debe ser un número').positive('El precio debe ser mayor a 0').max(999999999, 'Precio inválido'),
    // El frontend manda imagen vacía ("") para quitar la foto; el archivo real va en multipart
    imagen: z.string().max(500).optional(),
    estado: z.enum(['DISPONIBLE', 'AGOTADO']).optional()
});

const updatePlatoSchema = z.object({
    nombre: nombreCampo('El nombre del plato es obligatorio').max(80, 'Máximo 80 caracteres').optional(),
    descripcion: z.string().trim().max(500, 'Máximo 500 caracteres').optional(),
    ingredientes: ingredientesSchema.optional(),
    restaurante_id: objectId.optional(),
    categoria_id: objectId.optional(),
    precio: z.coerce.number('El precio debe ser un número').positive('El precio debe ser mayor a 0').max(999999999, 'Precio inválido').optional(),
    imagen: z.string().max(500).optional(),
    estado: z.enum(['DISPONIBLE', 'AGOTADO']).optional()
});

const cambiarEstadoPlatoSchema = z.object({
    estado: z.enum(['DISPONIBLE', 'AGOTADO'])
});

module.exports = { platoSchema, updatePlatoSchema, cambiarEstadoPlatoSchema, ingredientesSchema };