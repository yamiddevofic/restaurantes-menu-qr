const Pedido = require('../models/Pedido');
const Plato = require('../models/Plato');
const { registrarCompra } = require('./Fidelizacion.Controller');

// Guardar pedido — el snapshot de nombre/precio se construye en el
// servidor, consultando Plato real, nunca confiando en lo que manda el cliente
const store = async (req, res) => {
    try {
        const { mesa_id, platos, cliente_id } = req.body;

        if (!platos || platos.length === 0) {
            return res.status(400).json({ message: 'El pedido debe tener al menos un plato' });
        }

        const platosSnapshot = await Promise.all(
            platos.map(async (item) => {
                const platoDB = await Plato.findById(item.plato_id);
                if (!platoDB) throw new Error(`Plato ${item.plato_id} no encontrado`);
                if (platoDB.estado !== 'DISPONIBLE') throw new Error(`El plato "${platoDB.nombre}" no está disponible`);

                return {
                    plato_id: platoDB._id,
                    nombre: platoDB.nombre,   // copiado del plato real, no del body
                    precio: platoDB.precio,   // copiado del plato real, no del body
                    cantidad: item.cantidad
                };
            })
        );

        const pedido = new Pedido({
            mesa_id,
            platos: platosSnapshot,
            estado: 'PENDIENTE',
            cliente_id: cliente_id || undefined
        });

        await pedido.save();
        res.status(201).json(pedido);
    } catch (err) {
        res.status(400).json({ message: 'Error al guardar el pedido', error: err.message });
    }
};

// Listar pedidos (filtrando por mesa, útil para "mesero visualiza pedidos por mesa")
const index = async (req, res) => {
    try {
        const filtro = req.query.mesa_id ? { mesa_id: req.query.mesa_id } : {};
        const pedidos = await Pedido.find(filtro).sort({ datetime_created: -1 });
        res.json(pedidos);
    } catch (err) {
        res.status(500).json({ message: 'Error al listar los pedidos', error: err.message });
    }
};

// Consultar un pedido por ID
const show = async (req, res) => {
    try {
        const pedido = await Pedido.findById(req.params.id);
        if (!pedido) return res.status(404).json({ message: 'Pedido no encontrado' });
        res.json(pedido);
    } catch (err) {
        res.status(500).json({ message: 'Error al consultar el pedido', error: err.message });
    }
};

// Cambiar estado (cocina marca LISTO, mesero marca ENTREGADO, etc.)
const cambiarEstado = async (req, res) => {
    try {
        const { estado } = req.body;
        const pedido = await Pedido.findById(req.params.id);
        
        if (!pedido) return res.status(404).json({ message: 'Pedido no encontrado' });

        const estadoAnterior = pedido.estado;
        pedido.estado = estado;

        let premioGanado = false;
        // Solo actualizar fidelización si cambia a ENTREGADO desde un estado diferente
        if (estado === 'ENTREGADO' && estadoAnterior !== 'ENTREGADO') {
            pedido.fecha_cierre = new Date();

            if (pedido.cliente_id) {
                const totalPedido = pedido.platos.reduce((acc, p) => acc + p.precio * p.cantidad, 0);
                
                // Obtener restaurante_id del primer plato del pedido
                const primerPlato = await Plato.findById(pedido.platos[0].plato_id);
                const restaurante_id = primerPlato ? primerPlato.restaurante_id : null;
                
                if (restaurante_id) {
                    const resultado = await registrarCompra(pedido.cliente_id, restaurante_id, totalPedido);
                    if (resultado) premioGanado = resultado.premioGanado;
                }
            }
        }

        await pedido.save();
        res.json({ pedido, premioGanado });
    } catch (err) {
        res.status(500).json({ message: 'Error al cambiar el estado del pedido', error: err.message });
    }
};

// Modificar pedido
const update = async (req, res) => {
    try {
        const pedido = await Pedido.findById(req.params.id);
        if (!pedido) return res.status(404).json({ message: 'Pedido no encontrado' });

        if (req.body.platos && req.body.platos.length > 0) {
            const platosSnapshot = await Promise.all(
                req.body.platos.map(async (item) => {
                    const platoDB = await Plato.findById(item.plato_id);
                    if (!platoDB) throw new Error(`Plato ${item.plato_id} no encontrado`);
                    if (platoDB.estado !== 'DISPONIBLE') throw new Error(`El plato "${platoDB.nombre}" no está disponible`);

                    return {
                        plato_id: platoDB._id,
                        nombre: platoDB.nombre,
                        precio: platoDB.precio,
                        cantidad: item.cantidad
                    };
                })
            );
            pedido.platos = platosSnapshot;
        }

        if (req.body.mesa_id) pedido.mesa_id = req.body.mesa_id;
        if (req.body.cliente_id !== undefined) pedido.cliente_id = req.body.cliente_id || undefined;

        await pedido.save();
        res.json(pedido);
    } catch (err) {
        res.status(500).json({ message: 'Error al modificar el pedido', error: err.message });
    }
};

// Eliminar pedido
const destroy = async (req, res) => {
    try {
        const pedido = await Pedido.findByIdAndDelete(req.params.id);
        if (!pedido) return res.status(404).json({ message: 'Pedido no encontrado' });
        res.json({ message: 'Pedido eliminado correctamente' });
    } catch (err) {
        res.status(500).json({ message: 'Error al eliminar el pedido', error: err.message });
    }
};

module.exports = {
    store,
    index,
    show,
    cambiarEstado,
    update,
    destroy
};