const express = require('express');
const router = express.Router();
const PlatoController = require('../controllers/Plato.Controller');

/**
 * @swagger
 * /api/platos:
 *   get:
 *     summary: Obtiene todos los platos
 *     tags: [Platos]
 *     responses:
 *       200:
 *         description: Lista de platos
 */
router.get('/', PlatoController.index);

/**
 * @swagger
 * /api/platos/{id}:
 *   get:
 *     summary: Obtiene un plato por ID
 *     tags: [Platos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del plato
 *     responses:
 *       200:
 *         description: Plato encontrado
 *       404:
 *         description: Plato no encontrado
 */
router.get('/:id', PlatoController.show);

/**
 * @swagger
 * /api/platos:
 *   post:
 *     summary: Crea un nuevo plato
 *     tags: [Platos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - restaurante_id
 *               - categoria_id
 *               - precio
 *             properties:
 *               nombre:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               ingredientes:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     nombre:
 *                       type: string
 *                     cantidad:
 *                       type: number
 *                     medida:
 *                       type: string
 *               restaurante_id:
 *                 type: string
 *               categoria_id:
 *                 type: string
 *               precio:
 *                 type: number
 *               estado:
 *                 type: string
 *                 enum: [DISPONIBLE, AGOTADO]
 *     responses:
 *       201:
 *         description: Plato creado
 *       400:
 *         description: Datos inválidos
 */
router.post('/', PlatoController.store);

/**
 * @swagger
 * /api/platos/{id}:
 *   put:
 *     summary: Actualiza un plato
 *     tags: [Platos]
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
 *               descripcion:
 *                 type: string
 *               ingredientes:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     nombre:
 *                       type: string
 *                     cantidad:
 *                       type: number
 *                     medida:
 *                       type: string
 *               precio:
 *                 type: number
 *               estado:
 *                 type: string
 *                 enum: [DISPONIBLE, AGOTADO]
 *     responses:
 *       200:
 *         description: Plato actualizado
 *       404:
 *         description: Plato no encontrado
 */
router.put('/:id', PlatoController.update);

/**
 * @swagger
 * /api/platos/{id}/estado:
 *   patch:
 *     summary: Cambia el estado de un plato
 *     tags: [Platos]
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
 *                 enum: [DISPONIBLE, AGOTADO]
 *     responses:
 *       200:
 *         description: Estado actualizado
 *       404:
 *         description: Plato no encontrado
 */
router.patch('/:id/estado', PlatoController.cambiarEstado);

/**
 * @swagger
 * /api/platos/{id}:
 *   delete:
 *     summary: Elimina un plato
 *     tags: [Platos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Plato eliminado
 *       404:
 *         description: Plato no encontrado
 */
router.delete('/:id', PlatoController.destroy);

module.exports = router;
