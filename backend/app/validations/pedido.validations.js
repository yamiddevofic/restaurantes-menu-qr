const { z } = require('zod');
const { objectId, nombreCampo, email } = require('./common');

const itemPedidoSchema = z.object({
    plato_id: objectId,
    cantidad: z.coerce.number('La cantidad debe ser un número').int('La cantidad debe ser entera').min(1, 'La cantidad mínima es 1').max(100, 'La cantidad máxima es 100')
});

// Público: el cliente escanea el QR y pide sin iniciar sesión
const pedidoSchema = z.object({
    mesa_id: objectId,
    cliente_id: objectId.optional(),
    platos: z.array(itemPedidoSchema).min(1, 'El pedido debe tener al menos un plato').max(50, 'Máximo 50 platos por pedido')
});

const updatePedidoSchema = z.object({
    mesa_id: objectId.optional(),
    cliente_id: objectId.optional(),
    platos: z.array(itemPedidoSchema).min(1, 'El pedido debe tener al menos un plato').max(50, 'Máximo 50 platos por pedido').optional()
});

const cambiarEstadoPedidoSchema = z.object({
    estado: z.enum(['PENDIENTE', 'CANCELADO', 'LISTO', 'ENTREGADO', 'DEVOLUCION'])
});

const clienteSchema = z.object({
    nombre: nombreCampo('El nombre es obligatorio'),
    cedula: z.string().trim().min(1, 'La cédula es obligatoria').max(20, 'Máximo 20 caracteres'),
    contacto: z
        .object({
            correo: email.optional(),
            celular: z.string().trim().max(30, 'Máximo 30 caracteres').optional()
        })
        .optional(),
    estado: z.enum(['ACTIVO', 'INACTIVO']).optional()
});

const updateClienteSchema = z.object({
    nombre: nombreCampo('El nombre es obligatorio').optional(),
    cedula: z.string().trim().min(1, 'La cédula es obligatoria').max(20, 'Máximo 20 caracteres').optional(),
    contacto: z
        .object({
            correo: email.optional(),
            celular: z.string().trim().max(30, 'Máximo 30 caracteres').optional()
        })
        .optional()
});

module.exports = { pedidoSchema, updatePedidoSchema, cambiarEstadoPedidoSchema, clienteSchema, updateClienteSchema };