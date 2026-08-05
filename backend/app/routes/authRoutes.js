const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/Auth.Controller');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Inicia sesión como administrador o empleado
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - usuario
 *               - password
 *               - tipo
 *             properties:
 *               usuario:
 *                 type: string
 *                 description: Nombre de usuario
 *               password:
 *                 type: string
 *                 description: Contraseña
 *               tipo:
 *                 type: string
 *                 enum: [admin, empleado]
 *                 description: Tipo de usuario
 *     responses:
 *       200:
 *         description:Inicio de sesión exitoso
 *       400:
 *         description: Datos faltantes o tipo inválido
 *       401:
 *         description: Credenciales incorrectas
 *       403:
 *         description: Cuenta inactiva
 *       500:
 *         description: Error del servidor
 */
router.post('/login', AuthController.login);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Obtiene el usuario autenticado
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sesión actual
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Cuenta inactiva
 */
router.get('/me', authMiddleware, AuthController.me);

module.exports = router;
