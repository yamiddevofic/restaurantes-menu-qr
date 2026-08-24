const express = require('express');
const router = express.Router();
const ClienteController = require('../controllers/Cliente.Controller');
const authMiddleware = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { clienteSchema, updateClienteSchema } = require('../validations/pedido.validations');

/**
 * @swagger
 * /api/clientes:
 *   get:
 *     summary: Obtiene todos los clientes
 *     tags: [Clientes]
 *     responses:
 *       200:
 *         description: Lista de clientes
 */
router.get('/', authMiddleware, ClienteController.index);

/**
 * @swagger
 * /api/clientes/{id}:
 *   get:
 *     summary: Obtiene un cliente por ID
 *     tags: [Clientes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del cliente
 *     responses:
 *       200:
 *         description: Cliente encontrado
 *       404:
 *         description: Cliente no encontrado
 */
router.get('/:id', authMiddleware, ClienteController.show);

/**
 * @swagger
 * /api/clientes:
 *   post:
 *     summary: Crea un nuevo cliente
 *     tags: [Clientes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - cedula
 *             properties:
 *               nombre:
 *                 type: string
 *               cedula:
 *                 type: string
 *               contacto:
 *                 type: object
 *                 properties:
 *                   celular:
 *                     type: string
 *                   correo:
 *                     type: string
 *     responses:
 *       201:
 *         description: Cliente creado
 *       400:
 *         description: Datos inválidos
 */
// Público: el cliente se crea desde el flujo QR (pedir sin registro)
router.post('/', validate(clienteSchema), ClienteController.store);

/**
 * @swagger
 * /api/clientes/{id}:
 *   put:
 *     summary: Actualiza un cliente
 *     tags: [Clientes]
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
 *               nombre:
 *                 type: string
 *               cedula:
 *                 type: string
 *               contacto:
 *                 type: object
 *                 properties:
 *                   celular:
 *                     type: string
 *                   correo:
 *                     type: string
 *     responses:
 *       200:
 *         description: Cliente actualizado
 *       404:
 *         description: Cliente no encontrado
 */
router.put('/:id', authMiddleware, validate(updateClienteSchema), ClienteController.update);

/**
 * @swagger
 * /api/clientes/{id}/estado:
 *   patch:
 *     summary: Cambia el estado de un cliente
 *     tags: [Clientes]
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
 *                 enum: [ACTIVO, INACTIVO]
 *     responses:
 *       200:
 *         description: Estado actualizado
 *       404:
 *         description: Cliente no encontrado
 */
router.patch('/:id/estado', authMiddleware, ClienteController.cambiarEstado);

/**
 * @swagger
 * /api/clientes/{id}:
 *   delete:
 *     summary: Elimina un cliente
 *     tags: [Clientes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cliente eliminado
 *       404:
 *         description: Cliente no encontrado
 */
router.delete('/:id', authMiddleware, ClienteController.destroy);

module.exports = router;
