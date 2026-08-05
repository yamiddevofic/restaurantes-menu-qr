const express = require('express');
const router = express.Router();
const FidelizacionController = require('../controllers/Fidelizacion.Controller');

/**
 * @swagger
 * /api/fidelizacion:
 *   get:
 *     summary: Obtiene todas las fidelizaciones
 *     tags: [Fidelización]
 *     responses:
 *       200:
 *         description: Lista de fidelizaciones
 */
router.get('/', FidelizacionController.index);

/**
 * @swagger
 * /api/fidelizacion/cliente/{clienteId}/restaurante/{restauranteId}:
 *   get:
 *     summary: Obtiene la fidelización de un cliente en un restaurante
 *     tags: [Fidelización]
 *     parameters:
 *       - in: path
 *         name: clienteId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del cliente
 *       - in: path
 *         name: restauranteId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del restaurante
 *     responses:
 *       200:
 *         description: Fidelización encontrada
 *       404:
 *         description: Fidelización no encontrada
 */
router.get('/cliente/:clienteId/restaurante/:restauranteId', FidelizacionController.getFidelizacion);

/**
 * @swagger
 * /api/fidelizacion/{id}:
 *   get:
 *     summary: Obtiene una fidelización por ID
 *     tags: [Fidelización]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la fidelización
 *     responses:
 *       200:
 *         description: Fidelización encontrada
 *       404:
 *         description: Fidelización no encontrada
 */
router.get('/:id', FidelizacionController.show);

/**
 * @swagger
 * /api/fidelizacion:
 *   post:
 *     summary: Crea una nueva fidelización
 *     tags: [Fidelización]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cliente_id
 *               - restaurante_id
 *             properties:
 *               cliente_id:
 *                 type: string
 *               restaurante_id:
 *                 type: string
 *     responses:
 *       201:
 *         description: Fidelización creada
 *       400:
 *         description: Datos inválidos
 */
router.post('/', FidelizacionController.crearFidelizacion);

/**
 * @swagger
 * /api/fidelizacion/{id}:
 *   put:
 *     summary: Actualiza una fidelización
 *     tags: [Fidelización]
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
 *     responses:
 *       200:
 *         description: Fidelización actualizada
 *       404:
 *         description: Fidelización no encontrada
 */
router.put('/:id', FidelizacionController.update);

/**
 * @swagger
 * /api/fidelizacion/{id}/estado:
 *   patch:
 *     summary: Cambia el estado de una fidelización
 *     tags: [Fidelización]
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
 *     responses:
 *       200:
 *         description: Estado actualizado
 *       404:
 *         description: Fidelización no encontrada
 */
router.patch('/:id/estado', FidelizacionController.cambiarEstado);

/**
 * @swagger
 * /api/fidelizacion/{id}:
 *   delete:
 *     summary: Elimina una fidelización
 *     tags: [Fidelización]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Fidelización eliminada
 *       404:
 *         description: Fidelización no encontrada
 */
router.delete('/:id', FidelizacionController.destroy);

module.exports = router;
