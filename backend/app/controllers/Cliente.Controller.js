const Cliente = require('../models/Cliente');

// Guardar cliente

const store = async (req, res) => {
    try {
        const cliente = new Cliente({
            nombre: req.body.nombre,
            cedula: req.body.cedula,
            contacto: req.body.contacto,
            estado: req.body.estado || 'ACTIVO'
        });
        await cliente.save();
        res.status(201).json({ message: 'Cliente guardado correctamente' })
    } catch (err) {
        res.status(500).json({ message: 'Error al guardar el cliente', error: err.message })
    }
}

// Listar clientes

const index = async (req, res) => {
    try {
        const clientes = await Cliente.find();
        res.json(clientes);
    } catch (err) {
        res.status(500).json({ message: 'Error al listar los clientes' })
    }
}

// Consultar un cliente por ID

const show = async (req, res) => {
    try {
        const cliente = await Cliente.findById(req.params.id);
        if (!cliente) return res.status(404).json({ message: 'Cliente no encontrado' });
        res.json(cliente);
    } catch (err) {
        res.status(500).json({ message: 'Error al consultar el cliente', error: err.message });
    }
}

// Modificar cliente
const update = async (req, res) => {
    try {
        const cliente = await Cliente.findByIdAndUpdate(
            req.params.id,
            {
                nombre: req.body.nombre,
                cedula: req.body.cedula,
                contacto: req.body.contacto
            },
            { new: true, runValidators: true }
        );
        if (!cliente) return res.status(404).json({ message: 'Cliente no encontrado' });
        res.json(cliente);
    } catch (err) {
        res.status(500).json({ message: 'Error al modificar el cliente', error: err.message });
    }
}

// Cambiar estado del cliente
const cambiarEstado = async (req, res) => {
    try {
        const cliente = await Cliente.findByIdAndUpdate(
            req.params.id,
            { estado: req.body.estado },
            { new: true, runValidators: true }
        );
        if (!cliente) return res.status(404).json({ message: 'Cliente no encontrado' });
        res.json(cliente);
    } catch (err) {
        res.status(500).json({ message: 'Error al cambiar el estado del cliente', error: err.message });
    }
}

// Eliminar cliente
const destroy = async (req, res) => {
    try {
        const cliente = await Cliente.findByIdAndDelete(req.params.id);
        if (!cliente) return res.status(404).json({ message: 'Cliente no encontrado' });
        res.json({ message: 'Cliente eliminado correctamente' });
    } catch (err) {
        res.status(500).json({ message: 'Error al eliminar el cliente', error: err.message });
    }
}

module.exports = {
    store,
    index,
    show,
    update,
    cambiarEstado,
    destroy
}
