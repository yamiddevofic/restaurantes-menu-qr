const express = require('express');
const router = express.Router();
const EmpleadoController = require('../controllers/Empleado.Controller');
const authMiddleware = require('../middleware/authMiddleware');
const requireAdmin = require('../middleware/requireAdmin');
const validate = require('../middleware/validate');
const { empleadoSchema, updateEmpleadoSchema } = require('../validations/empleado.validations');
const { estadoSchema } = require('../validations/admin.validations');

// La gestión de empleados es administración: siempre se exige sesión
router.use(authMiddleware);
const soloAdmin = requireAdmin;

/**
 * @swagger
 * /api/empleados:
 *   get:
 *     summary: Obtiene todos los empleados
 *     tags: [Empleados]
 *     responses:
 *       200:
 *         description: Lista de empleados
 */
router.get('/', EmpleadoController.index);

/**
 * @swagger
 * /api/empleados/{id}:
 *   get:
 *     summary: Obtiene un empleado por ID
 *     tags: [Empleados]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del empleado
 *     responses:
 *       200:
 *         description: Empleado encontrado
 *       404:
 *         description: Empleado no encontrado
 */
router.get('/:id', EmpleadoController.show);

/**
 * @swagger
 * /api/empleados:
 *   post:
 *     summary: Crea un nuevo empleado
 *     tags: [Empleados]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - restaurante_id
 *               - nombre
 *               - usuario
 *               - password
 *               - rol
 *             properties:
 *               restaurante_id:
 *                 type: string
 *               nombre:
 *                 type: string
 *               usuario:
 *                 type: string
 *               password:
 *                 type: string
 *               contacto:
 *                 type: object
 *                 properties:
 *                   correo:
 *                     type: string
 *                   celular:
 *                     type: string
 *               rol:
 *                 type: string
 *                 enum: [mesero, cocina]
 *     responses:
 *       201:
 *         description: Empleado creado
 *       400:
 *         description: Datos inválidos
 */
router.post('/', soloAdmin, validate(empleadoSchema), EmpleadoController.store);

/**
 * @swagger
 * /api/empleados/{id}:
 *   put:
 *     summary: Actualiza un empleado
 *     tags: [Empleados]
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
 *               usuario:
 *                 type: string
 *               password:
 *                 type: string
 *               contacto:
 *                 type: object
 *                 properties:
 *                   correo:
 *                     type: string
 *                   celular:
 *                     type: string
 *               rol:
 *                 type: string
 *                 enum: [mesero, cocina]
 *     responses:
 *       200:
 *         description: Empleado actualizado
 *       404:
 *         description: Empleado no encontrado
 */
router.put('/:id', soloAdmin, validate(updateEmpleadoSchema), EmpleadoController.update);

/**
 * @swagger
 * /api/empleados/{id}/estado:
 *   patch:
 *     summary: Cambia el estado de un empleado
 *     tags: [Empleados]
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
 *         description: Empleado no encontrado
 */
router.patch('/:id/estado', soloAdmin, validate(estadoSchema), EmpleadoController.cambiarEstado);

/**
 * @swagger
 * /api/empleados/{id}:
 *   delete:
 *     summary: Elimina un empleado
 *     tags: [Empleados]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Empleado eliminado
 *       404:
 *         description: Empleado no encontrado
 */
router.delete('/:id', soloAdmin, EmpleadoController.destroy);

module.exports = router;
