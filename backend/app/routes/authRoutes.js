const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/Auth.Controller');
const authMiddleware = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { uploadAvatar } = require('../middleware/uploadMiddleware');
const {
    loginSchema,
    perfilSchema,
    eliminarCuentaSchema,
    suscripcionSchema
} = require('../validations/auth.validations');

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
router.post('/login', validate(loginSchema), AuthController.login);

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
router.put('/perfil', authMiddleware, validate(perfilSchema), AuthController.actualizarPerfil);

/**
 * @swagger
 * /api/auth/avatar:
 *   put:
 *     summary: Sube la foto de perfil del usuario autenticado
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Foto actualizada con su ruta en la base de datos
 *       400:
 *         description: Falta la imagen
 *       401:
 *         description: No autorizado
 */
router.put('/avatar', authMiddleware, uploadAvatar, AuthController.subirAvatar);

/**
 * @swagger
 * /api/auth/cuenta:
 *   delete:
 *     summary: Elimina la cuenta del usuario autenticado (admin borra sus restaurantes y empleados)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cuenta eliminada
 *       401:
 *         description: No autorizado
 */
router.delete('/cuenta', authMiddleware, validate(eliminarCuentaSchema), AuthController.eliminarCuenta);

/**
 * @swagger
 * /api/auth/suscripcion:
 *   put:
 *     summary: Actualiza, renueva o cancela la suscripción del administrador autenticado
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - accion
 *             properties:
 *               accion:
 *                 type: string
 *                 enum: [actualizar, renovar, cancelar]
 *                 description: actualizar = pasar al plan Pro; renovar = extender 30 días; cancelar = volver al plan gratis
 *     responses:
 *       200:
 *         description: Suscripción actualizada
 *       400:
 *         description: Acción inválida o no aplicable
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Solo administradores
 */
router.put('/suscripcion', authMiddleware, validate(suscripcionSchema), AuthController.gestionarSuscripcion);

/**
 * @swagger
 * /api/auth/suscripcion:
 *   get:
 *     summary: Obtiene el historial de cambios de suscripción del administrador autenticado
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Historial de suscripciones
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Solo administradores
 */
router.get('/suscripcion', authMiddleware, AuthController.historialSuscripcion);

module.exports = router;
