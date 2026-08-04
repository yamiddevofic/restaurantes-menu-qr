const Plato = require('../models/Plato');

// Guardar plato
const store = async (req, res) => {
    try {
        const plato = new Plato({
            nombre: req.body.nombre,
            descripcion: req.body.descripcion,
            ingredientes: req.body.ingredientes,
            restaurante_id: req.body.restaurante_id,
            categoria_id: req.body.categoria_id,
            precio: req.body.precio,
            estado: req.body.estado || 'DISPONIBLE'
        });
        await plato.save();
        res.status(201).json(plato);
    } catch (err) {
        res.status(500).json({ message: 'Error al guardar el plato', error: err.message });
    }
};

// Listar platos (filtrando por restaurante, que es como se va a usar en la práctica)
const index = async (req, res) => {
    try {
        const filtro = req.query.restaurante_id ? { restaurante_id: req.query.restaurante_id } : {};
        const platos = await Plato.find(filtro);
        res.json(platos);
    } catch (err) {
        res.status(500).json({ message: 'Error al listar los platos', error: err.message });
    }
};

// Consultar un plato por ID
const show = async (req, res) => {
    try {
        const plato = await Plato.findById(req.params.id);
        if (!plato) return res.status(404).json({ message: 'Plato no encontrado' });
        res.json(plato);
    } catch (err) {
        res.status(500).json({ message: 'Error al consultar el plato', error: err.message });
    }
};

// Modificar plato (nombre, descripción, ingredientes, categoría, etc.)
const update = async (req, res) => {
    try {
        const plato = await Plato.findByIdAndUpdate(
            req.params.id,
            {
                nombre: req.body.nombre,
                descripcion: req.body.descripcion,
                ingredientes: req.body.ingredientes,
                categoria_id: req.body.categoria_id,
                estado: req.body.estado
            },
            { new: true, runValidators: true }
        );
        if (!plato) return res.status(404).json({ message: 'Plato no encontrado' });
        res.json(plato);
    } catch (err) {
        res.status(500).json({ message: 'Error al modificar el plato', error: err.message });
    }
};

// Cambiar solo el estado (DISPONIBLE/AGOTADO) — la operación más frecuente,
// merece su propia ruta más liviana que no exige mandar todo el plato
const cambiarEstado = async (req, res) => {
    try {
        const plato = await Plato.findByIdAndUpdate(
            req.params.id,
            { estado: req.body.estado },
            { new: true, runValidators: true }
        );
        if (!plato) return res.status(404).json({ message: 'Plato no encontrado' });
        res.json(plato);
    } catch (err) {
        res.status(500).json({ message: 'Error al cambiar el estado del plato', error: err.message });
    }
};

// Eliminar plato — borrado lógico, no físico (para no romper el historial
// de pedidos que ya referencian este plato, como vimos antes)
const destroy = async (req, res) => {
    try {
        const plato = await Plato.findByIdAndUpdate(
            req.params.id,
            { estado: 'ELIMINADO' },
            { new: true }
        );
        if (!plato) return res.status(404).json({ message: 'Plato no encontrado' });
        res.json({ message: 'Plato eliminado correctamente' });
    } catch (err) {
        res.status(500).json({ message: 'Error al eliminar el plato', error: err.message });
    }
};

module.exports = {
    store,
    index,
    show,
    update,
    cambiarEstado,
    destroy
};