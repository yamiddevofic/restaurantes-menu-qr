const express = require('express');
const router = express.Router();
const RestauranteController = require('../controllers/Restaurante.Controller');
const authMiddleware = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const {
    restauranteSchema,
    crearMiRestauranteSchema,
    updateRestauranteSchema,
    categoriaSchema,
    updateCategoriaSchema,
    mesaSchema,
    updateMesaSchema
} = require('../validations/restaurante.validations');

/**
 * @swagger
 * /api/restaurantes:
 *   get:
 *     summary: Obtiene todos los restaurantes
 *     tags: [Restaurantes]
 *     responses:
 *       200:
 *         description: Lista de restaurantes
 */
router.get('/', RestauranteController.index);

/**
 * @swagger
 * /api/restaurantes/menu/{qr_code}:
 *   get:
 *     summary: Visualiza el menú por código QR de mesa
 *     tags: [Restaurantes]
 *     parameters:
 *       - in: path
 *         name: qr_code
 *         required: true
 *         schema:
 *           type: string
 *         description: Código QR de la mesa
 *     responses:
 *       200:
 *         description: Menú del restaurante
 *       404:
 *         description: Mesa no encontrada
 */
router.get('/menu/:qr_code', RestauranteController.verMenu);

// === Rutas de Mesas ===

/**
 * @swagger
 * /api/restaurantes/{id}/mesas:
 *   get:
 *     summary: Lista las mesas de un restaurante
 *     tags: [Mesas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del restaurante
 *     responses:
 *       200:
 *         description: Lista de mesas
 */
router.get('/:id/mesas', authMiddleware, RestauranteController.listarMesas);

/**
 * @swagger
 * /api/restaurantes/{id}/mesas/{mesaId}:
 *   get:
 *     summary: Obtiene una mesa por ID
 *     tags: [Mesas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: mesaId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Mesa encontrada
 *       404:
 *         description: Mesa no encontrada
 */
router.get('/:id/mesas/:mesaId', authMiddleware, RestauranteController.mostrarMesa);

/**
 * @swagger
 * /api/restaurantes/{id}/mesas:
 *   post:
 *     summary: Agrega una mesa a un restaurante
 *     tags: [Mesas]
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
 *             required:
 *               - numero
 *               - qr_code
 *             properties:
 *               numero:
 *                 type: number
 *               qr_code:
 *                 type: string
 *               qr_image:
 *                 type: string
 *     responses:
 *       201:
 *         description: Mesa agregada
 */
router.post('/:id/mesas', authMiddleware, validate(mesaSchema), RestauranteController.agregarMesa);

/**
 * @swagger
 * /api/restaurantes/{id}/mesas/{mesaId}:
 *   put:
 *     summary: Edita una mesa
 *     tags: [Mesas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: mesaId
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
 *               numero:
 *                 type: number
 *               qr_code:
 *                 type: string
 *               qr_image:
 *                 type: string
 *     responses:
 *       200:
 *         description: Mesa editada
 */
router.put('/:id/mesas/:mesaId', authMiddleware, validate(updateMesaSchema), RestauranteController.editarMesa);

/**
 * @swagger
 * /api/restaurantes/{id}/mesas/{mesaId}:
 *   delete:
 *     summary: Elimina una mesa
 *     tags: [Mesas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: mesaId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Mesa eliminada
 */
router.delete('/:id/mesas/:mesaId', authMiddleware, RestauranteController.eliminarMesa);

/**
 * @swagger
 * /api/restaurantes/{id}/mesas:
 *   delete:
 *     summary: Elimina todas las mesas de un restaurante
 *     tags: [Mesas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Todas las mesas eliminadas
 */
router.delete('/:id/mesas', authMiddleware, RestauranteController.eliminarTodasMesas);

// === Rutas de Categorías ===

/**
 * @swagger
 * /api/restaurantes/{id}/categorias:
 *   get:
 *     summary: Lista las categorías de un restaurante
 *     tags: [Categorías]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de categorías
 */
router.get('/:id/categorias', authMiddleware, RestauranteController.listarCategorias);

/**
 * @swagger
 * /api/restaurantes/{id}/categorias/{categoriaId}:
 *   get:
 *     summary: Obtiene una categoría por ID
 *     tags: [Categorías]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: categoriaId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Categoría encontrada
 *       404:
 *         description: Categoría no encontrada
 */
router.get('/:id/categorias/:categoriaId', authMiddleware, RestauranteController.mostrarCategoria);

/**
 * @swagger
 * /api/restaurantes/{id}/categorias:
 *   post:
 *     summary: Agrega una categoría a un restaurante
 *     tags: [Categorías]
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
 *             required:
 *               - nombre
 *             properties:
 *               nombre:
 *                 type: string
 *               descripcion:
 *                 type: string
 *     responses:
 *       201:
 *         description: Categoría agregada
 */
router.post('/:id/categorias', authMiddleware, validate(categoriaSchema), RestauranteController.agregarCategoria);

/**
 * @swagger
 * /api/restaurantes/{id}/categorias/{categoriaId}:
 *   put:
 *     summary: Edita una categoría
 *     tags: [Categorías]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: categoriaId
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
 *     responses:
 *       200:
 *         description: Categoría editada
 */
router.put('/:id/categorias/:categoriaId', authMiddleware, validate(updateCategoriaSchema), RestauranteController.editarCategoria);

/**
 * @swagger
 * /api/restaurantes/{id}/categorias/{categoriaId}:
 *   delete:
 *     summary: Elimina una categoría
 *     tags: [Categorías]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: categoriaId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Categoría eliminada
 */
router.delete('/:id/categorias/:categoriaId', authMiddleware, RestauranteController.eliminarCategoria);

/**
 * @swagger
 * /api/restaurantes/{id}/categorias:
 *   delete:
 *     summary: Elimina todas las categorías de un restaurante
 *     tags: [Categorías]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Todas las categorías eliminadas
 */
router.delete('/:id/categorias', authMiddleware, RestauranteController.eliminarTodasCategorias);

// === Restaurantes del administrador autenticado ===

/**
 * @swagger
 * /api/restaurantes/mios:
 *   get:
 *     summary: Lista los restaurantes del administrador autenticado
 *     tags: [Restaurantes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de restaurantes del admin
 *       401:
 *         description: No autorizado
 */
router.get('/mios', authMiddleware, RestauranteController.misRestaurantes);

/**
 * @swagger
 * /api/restaurantes/mios:
 *   post:
 *     summary: Crea un restaurante para el administrador autenticado
 *     tags: [Restaurantes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - ubicacion
 *             properties:
 *               nombre:
 *                 type: string
 *               ubicacion:
 *                 type: string
 *     responses:
 *       201:
 *         description: Restaurante creado
 *       400:
 *         description: Datos faltantes
 */
router.post('/mios', authMiddleware, validate(crearMiRestauranteSchema), RestauranteController.crearMiRestaurante);

// === Rutas generales de restaurante ===

/**
 * @swagger
 * /api/restaurantes/{id}:
 *   get:
 *     summary: Obtiene un restaurante por ID
 *     tags: [Restaurantes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del restaurante
 *     responses:
 *       200:
 *         description: Restaurante encontrado
 *       404:
 *         description: Restaurante no encontrado
 */
router.get('/:id', authMiddleware, RestauranteController.show);

/**
 * @swagger
 * /api/restaurantes:
 *   post:
 *     summary: Crea un nuevo restaurante
 *     tags: [Restaurantes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - ubicacion
 *               - adm_id
 *             properties:
 *               nombre:
 *                 type: string
 *               ubicacion:
 *                 type: string
 *               adm_id:
 *                 type: string
 *     responses:
 *       201:
 *         description: Restaurante creado
 *       400:
 *         description: Datos inválidos
 */
// Público: parte del flujo de registro (crea admin + restaurante en dos pasos).
// Validado con Zod; el resto del CRUD exige sesión.
router.post('/', validate(restauranteSchema), RestauranteController.store);

/**
 * @swagger
 * /api/restaurantes/{id}:
 *   put:
 *     summary: Actualiza un restaurante
 *     tags: [Restaurantes]
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
 *               ubicacion:
 *                 type: string
 *     responses:
 *       200:
 *         description: Restaurante actualizado
 *       404:
 *         description: Restaurante no encontrado
 */
router.put('/:id', authMiddleware, validate(updateRestauranteSchema), RestauranteController.update);

/**
 * @swagger
 * /api/restaurantes/{id}:
 *   delete:
 *     summary: Elimina un restaurante
 *     tags: [Restaurantes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Restaurante eliminado
 *       404:
 *         description: Restaurante no encontrado
 */
router.delete('/:id', authMiddleware, RestauranteController.destroy);

module.exports = router;
