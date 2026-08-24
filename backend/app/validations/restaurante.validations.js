const { z } = require('zod');
const { nombreCampo, objectId } = require('./common');

const restauranteBase = {
    nombre: nombreCampo('El nombre es obligatorio'),
    ubicacion: z.string().trim().min(1, 'La ubicación es obligatoria').max(150, 'Máximo 150 caracteres')
};

// Creación directa (con adm_id explícito) — usada por el registro público
const restauranteSchema = z.object({
    ...restauranteBase,
    adm_id: objectId
});

// Creación desde el admin autenticado (adm_id se toma del token)
const crearMiRestauranteSchema = z.object(restauranteBase);

const updateRestauranteSchema = z.object({
    nombre: restauranteBase.nombre.optional(),
    ubicacion: restauranteBase.ubicacion.optional()
});

const categoriaSchema = z.object({
    nombre: nombreCampo('El nombre es obligatorio'),
    descripcion: z.string().trim().max(300, 'Máximo 300 caracteres').optional()
});

const updateCategoriaSchema = z.object({
    nombre: nombreCampo('El nombre es obligatorio').optional(),
    descripcion: z.string().trim().max(300, 'Máximo 300 caracteres').optional()
});

const mesaSchema = z.object({
    numero: z.coerce.number().int('El número de mesa debe ser entero').positive('El número de mesa debe ser positivo').max(10000, 'Número de mesa inválido')
});

const updateMesaSchema = z.object({
    numero: z.coerce.number().int('El número de mesa debe ser entero').positive('El número de mesa debe ser positivo').max(10000, 'Número de mesa inválido').optional()
});

module.exports = {
    restauranteSchema,
    crearMiRestauranteSchema,
    updateRestauranteSchema,
    categoriaSchema,
    updateCategoriaSchema,
    mesaSchema,
    updateMesaSchema
};