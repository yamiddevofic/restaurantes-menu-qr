const Reporte = require('../models/Reporte');
const Pedido = require('../models/Pedido');

// GET /reportes/:restauranteId — listar reportes de un restaurante (lectura)
exports.getReportes = async (req, res) => {
  try {
    const reportes = await Reporte.find({ restaurante_id: req.params.restauranteId })
      .sort({ fecha: -1 });
    res.json(reportes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /reportes/:restauranteId/:fecha — un reporte puntual (lectura)
exports.getReportePorFecha = async (req, res) => {
  try {
    const reporte = await Reporte.findOne({
      restaurante_id: req.params.restauranteId,
      fecha: req.params.fecha
    });
    if (!reporte) return res.status(404).json({ error: 'Reporte no encontrado' });
    res.json(reporte);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /reportes/generar/:restauranteId — generar el reporte del día (escritura)
// Esto es la parte de "agregación sobre Pedido" que hablamos: no se llena a
// mano, se calcula recorriendo los pedidos del día con el aggregation
// framework de MongoDB.
exports.generarReporte = async (req, res) => {
  try {
    const restauranteId = req.params.restauranteId;
    const fecha = req.body.fecha ? new Date(req.body.fecha) : new Date();

    // Rango del día (00:00 a 23:59)
    const inicioDia = new Date(fecha.setHours(0, 0, 0, 0));
    const finDia = new Date(fecha.setHours(23, 59, 59, 999));

    const pipeline = [
      {
        $match: {
          mesa_id: { $exists: true }, // filtro base; se ajusta con restaurante_id si el pedido lo referencia
          datetime_created: { $gte: inicioDia, $lte: finDia }
        }
      },
      { $unwind: '$platos' },
      {
        $group: {
          _id: '$platos.plato_id',
          nombre: { $first: '$platos.nombre' },
          cantidad: { $sum: '$platos.cantidad' },
          ingresos: { $sum: { $multiply: ['$platos.precio', '$platos.cantidad'] } }
        }
      }
    ];

    const ingresosPorPlato = await Pedido.aggregate(pipeline);

    const totalIngresos = ingresosPorPlato.reduce((acc, p) => acc + p.ingresos, 0);

    const totalEntregados = await Pedido.countDocuments({
      datetime_created: { $gte: inicioDia, $lte: finDia },
      estado: 'ENTREGADO'
    });
    const totalCancelados = await Pedido.countDocuments({
      datetime_created: { $gte: inicioDia, $lte: finDia },
      estado: 'CANCELADO'
    });
    const totalDevueltos = await Pedido.countDocuments({
      datetime_created: { $gte: inicioDia, $lte: finDia },
      estado: 'DEVOLUCION'
    });

    const reporte = new Reporte({
      restaurante_id: restauranteId,
      fecha: inicioDia,
      total_ingresos: totalIngresos,
      total_platos_entregados: totalEntregados,
      total_platos_cancelados: totalCancelados,
      total_platos_devueltos: totalDevueltos,
      ingresos_por_plato: ingresosPorPlato.map(p => ({
        plato_id: p._id,
        nombre: p.nombre,
        cantidad: p.cantidad,
        ingresos: p.ingresos
      }))
    });

    await reporte.save();
    res.status(201).json(reporte);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Modificar reporte
exports.updateReporte = async (req, res) => {
  try {
    const reporte = await Reporte.findByIdAndUpdate(
      req.params.id,
      {
        total_ingresos: req.body.total_ingresos,
        total_platos_entregados: req.body.total_platos_entregados,
        total_platos_cancelados: req.body.total_platos_cancelados,
        total_platos_devueltos: req.body.total_platos_devueltos,
        promedio_tiempo_entrega: req.body.promedio_tiempo_entrega,
        ingresos_por_plato: req.body.ingresos_por_plato,
        categoria_mas_vendida: req.body.categoria_mas_vendida,
        categoria_menos_vendida: req.body.categoria_menos_vendida
      },
      { new: true, runValidators: true }
    );
    if (!reporte) return res.status(404).json({ error: 'Reporte no encontrado' });
    res.json(reporte);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Eliminar reporte
exports.deleteReporte = async (req, res) => {
  try {
    const reporte = await Reporte.findByIdAndDelete(req.params.id);
    if (!reporte) return res.status(404).json({ error: 'Reporte no encontrado' });
    res.json({ message: 'Reporte eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};