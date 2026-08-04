const express = require('express');
const router = express.Router();
const PedidoController = require('../controllers/Pedido.Controller');

/**
 * @swagger
 * /api/pedidos:
 *   get:
 *     summary: Obtiene todos los pedidos
 *     tags: [Pedidos]
 *     responses:
 *       200:
 *         description: Lista de pedidos
 */
router.get('/', PedidoController.index);

/**
 * @swagger
 * /api/pedidos/{id}:
 *   get:
 *     summary: Obtiene un pedido por ID
 *     tags: [Pedidos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del pedido
 *     responses:
 *       200:
 *         description: Pedido encontrado
 *       404:
 *         description: Pedido no encontrado
 */
router.get('/:id', PedidoController.show);

/**
 * @swagger
 * /api/pedidos:
 *   post:
 *     summary: Crea un nuevo pedido
 *     tags: [Pedidos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mesa_id
 *               - platos
 *             properties:
 *               mesa_id:
 *                 type: string
 *               platos:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     plato_id:
 *                       type: string
 *                     nombre:
 *                       type: string
 *                     precio:
 *                       type: number
 *                     cantidad:
 *                       type: number
 *               cliente_id:
 *                 type: string
 *     responses:
 *       201:
 *         description: Pedido creado
 *       400:
 *         description: Datos inválidos
 */
router.post('/', PedidoController.store);

/**
 * @swagger
 * /api/pedidos/{id}:
 *   put:
 *     summary: Actualiza un pedido
 *     tags: [Pedidos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               mesa_id:
 *                 type: string
 *               platos:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     plato_id:
 *                       type: string
 *                     nombre:
 *                       type: string
 *                     precio:
 *                       type: number
 *                     cantidad:
 *                       type: number
 *               estado:
 *                 type: string
 *                 enum: [PENDIENTE, CANCELADO, ELIMINADO, LISTO, ENTREGADO, DEVOLUCION]
 *     responses:
 *       200:
 *         description: Pedido actualizado
 *       404:
 *         description: Pedido no encontrado
 */
router.put('/:id', PedidoController.update);

/**
 * @swagger
 * /api/pedidos/{id}/estado:
 *   patch:
 *     summary: Cambia el estado de un pedido
 *     tags: [Pedidos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               estado:
 *                 type: string
 *                 enum: [PENDIENTE, CANCELADO, ELIMINADO, LISTO, ENTREGADO, DEVOLUCION]
 *     responses:
 *       200:
 *         description: Estado actualizado
 *       404:
 *         description: Pedido no encontrado
 */
router.patch('/:id/estado', PedidoController.cambiarEstado);

/**
 * @swagger
 * /api/pedidos/{id}:
 *   delete:
 *     summary: Elimina un pedido
 *     tags: [Pedidos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Pedido eliminado
 *       404:
 *         description: Pedido no encontrado
 */
router.delete('/:id', PedidoController.destroy);

module.exports = router;
