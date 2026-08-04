const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/Auth.Controller');

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

module.exports = router;
