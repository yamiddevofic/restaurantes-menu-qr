const express = require('express');
const router = express.Router();
const ReporteController = require('../controllers/Reporte.Controller');

/**
 * @swagger
 * /api/reportes/{restauranteId}:
 *   get:
 *     summary: Obtiene los reportes de un restaurante
 *     tags: [Reportes]
 *     parameters:
 *       - in: path
 *         name: restauranteId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del restaurante
 *     responses:
 *       200:
 *         description: Lista de reportes
 */
router.get('/:restauranteId', ReporteController.getReportes);

/**
 * @swagger
 * /api/reportes/{restauranteId}/{fecha}:
 *   get:
 *     summary: Obtiene un reporte por fecha
 *     tags: [Reportes]
 *     parameters:
 *       - in: path
 *         name: restauranteId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: fecha
 *         required: true
 *         schema:
 *           type: string
 *         description: Fecha del reporte (formato YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Reporte encontrado
 *       404:
 *         description: Reporte no encontrado
 */
router.get('/:restauranteId/:fecha', ReporteController.getReportePorFecha);

/**
 * @swagger
 * /api/reportes/generar/{restauranteId}:
 *   post:
 *     summary: Genera un reporte para un restaurante
 *     tags: [Reportes]
 *     parameters:
 *       - in: path
 *         name: restauranteId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Reporte generado
 *       400:
 *         description: Error al generar reporte
 */
router.post('/generar/:restauranteId', ReporteController.generarReporte);

/**
 * @swagger
 * /api/reportes/{id}:
 *   put:
 *     summary: Actualiza un reporte
 *     tags: [Reportes]
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
 *         description: Reporte actualizado
 *       404:
 *         description: Reporte no encontrado
 */
router.put('/:id', ReporteController.updateReporte);

/**
 * @swagger
 * /api/reportes/{id}:
 *   delete:
 *     summary: Elimina un reporte
 *     tags: [Reportes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reporte eliminado
 *       404:
 *         description: Reporte no encontrado
 */
router.delete('/:id', ReporteController.deleteReporte);

module.exports = router;
