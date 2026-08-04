const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/Admin.Controller');

/**
 * @swagger
 * /api/administradores:
 *   get:
 *     summary: Obtiene todos los administradores
 *     tags: [Administradores]
 *     responses:
 *       200:
 *         description: Lista de administradores
 */
router.get('/', AdminController.index);

/**
 * @swagger
 * /api/administradores/{id}:
 *   get:
 *     summary: Obtiene un administrador por ID
 *     tags: [Administradores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del administrador
 *     responses:
 *       200:
 *         description: Administrador encontrado
 *       404:
 *         description: Administrador no encontrado
 */
router.get('/:id', AdminController.show);

/**
 * @swagger
 * /api/administradores:
 *   post:
 *     summary: Crea un nuevo administrador
 *     tags: [Administradores]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - email
 *               - usuario
 *               - password
 *             properties:
 *               nombre:
 *                 type: string
 *               email:
 *                 type: string
 *               usuario:
 *                 type: string
 *               password:
 *                 type: string
 *               plan:
 *                 type: string
 *                 enum: [free, pro]
 *     responses:
 *       201:
 *         description: Administrador creado
 *       400:
 *         description: Datos inválidos
 */
router.post('/', AdminController.store);

/**
 * @swagger
 * /api/administradores/{id}:
 *   put:
 *     summary: Actualiza un administrador
 *     tags: [Administradores]
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
 *               email:
 *                 type: string
 *               usuario:
 *                 type: string
 *               password:
 *                 type: string
 *               plan:
 *                 type: string
 *                 enum: [free, pro]
 *     responses:
 *       200:
 *         description: Administrador actualizado
 *       404:
 *         description: Administrador no encontrado
 */
router.put('/:id', AdminController.update);

/**
 * @swagger
 * /api/administradores/{id}/estado:
 *   patch:
 *     summary: Cambia el estado de un administrador
 *     tags: [Administradores]
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
 *                 enum: [ACTIVO, INACTIVO, BAJA]
 *     responses:
 *       200:
 *         description: Estado actualizado
 *       404:
 *         description: Administrador no encontrado
 */
router.patch('/:id/estado', AdminController.cambiarEstado);

/**
 * @swagger
 * /api/administradores/{id}:
 *   delete:
 *     summary: Elimina un administrador
 *     tags: [Administradores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Administrador eliminado
 *       404:
 *         description: Administrador no encontrado
 */
router.delete('/:id', AdminController.destroy);

module.exports = router;
