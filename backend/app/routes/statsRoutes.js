const Pedido = require('../models/Pedido');
const Fidelizacion = require('../models/Fidelizacion');
const Restaurante = require('../models/Restaurante');
const Empleado = require('../models/Empleado');
const authMiddleware = require('../middleware/authMiddleware');

const getRestaurante = async (user) => {
    if (user.tipo === 'admin') {
        return Restaurante.findOne({ adm_id: user.id });
    }
    if (user.tipo === 'empleado') {
        const empleado = await Empleado.findById(user.id);
        if (!empleado) return null;
        return Restaurante.findById(empleado.restaurante_id);
    }
    return null;
};

const getStats = async (req, res) => {
    try {
        const restaurante = await getRestaurante(req.user);
        if (!restaurante) {
            return res.status(404).json({ message: 'Restaurante no encontrado' });
        }

        const mesaIds = restaurante.mesas.map((m) => String(m._id));

        const inicioHoy = new Date();
        inicioHoy.setHours(0, 0, 0, 0);

        const filtroMesas = mesaIds.length > 0 ? { mesa_id: { $in: mesaIds } } : {};

        const [pedidosHoy, pedidosEntregadoHoy, totalClientes] = await Promise.all([
            // Pedidos creados hoy
            Pedido.countDocuments({
                ...filtroMesas,
                datetime_created: { $gte: inicioHoy }
            }),
            // Pedidos ENTREGADO hoy (para ventas)
            Pedido.find({
                ...filtroMesas,
                estado: 'ENTREGADO',
                fecha_cierre: { $gte: inicioHoy }
            }),
            // Clientes fidelizados en este restaurante (único por cliente)
            Fidelizacion.distinct('cliente_id', {
                restaurante_id: restaurante._id,
                estado: 'ACTIVO'
            }).then((ids) => ids.length)
        ]);

        const ventasHoy = pedidosEntregadoHoy.reduce(
            (acc, pedido) => acc + pedido.platos.reduce((s, p) => s + p.precio * p.cantidad, 0),
            0
        );

        res.json({
            mesas: restaurante.mesas.length,
            pedidosHoy,
            clientes: totalClientes,
            ventasHoy
        });
    } catch (err) {
        res.status(500).json({ message: 'Error al calcular estadísticas', error: err.message });
    }
};

const router = require('express').Router();
router.get('/', authMiddleware, getStats);

module.exports = router;