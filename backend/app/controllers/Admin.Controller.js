const Administrador = require('../models/Administrador');
const bcrypt = require('bcrypt');

// Guardar administrador
const store = async (req, res) => {
    try {
        const administrador = new Administrador({
            nombre: req.body.nombre,
            email: req.body.email,
            usuario: req.body.usuario,
            password: bcrypt.hashSync(req.body.password, 12),
            plan: req.body.plan || "free",
            fecha_registro: new Date(),
            estado: 'ACTIVO'
        });
        await administrador.save();
        res.status(201).json({ message: 'Administrador guardado correctamente', _id: administrador._id });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ message: 'El email o usuario ya está registrado' });
        }
        res.status(500).json({ message: 'Error al guardar el administrador' });
    }
};

// Listar Administradores
const index = async (req, res) => {
    try {
        const administradores = await Administrador.find().select('-password');
        res.json(administradores);
    } catch (err) {
        res.status(500).json({ message: 'Error al listar los administradores' });
    }
};

// Consultar un administrador por ID
const show = async (req, res) => {
    try {
        const administrador = await Administrador.findById(req.params.id).select('-password');
        if (!administrador) return res.status(404).json({ message: 'Administrador no encontrado' });
        res.json(administrador);
    } catch (err) {
        res.status(500).json({ message: 'Error al consultar el administrador' });
    }
};

// Modificar administrador
const update = async (req, res) => {
    try {
        const updateData = {
            nombre: req.body.nombre,
            email: req.body.email,
            usuario: req.body.usuario,
            plan: req.body.plan
        };
        if (req.body.password) {
            updateData.password = bcrypt.hashSync(req.body.password, 12);
        }
        const administrador = await Administrador.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');
        if (!administrador) return res.status(404).json({ message: 'Administrador no encontrado' });
        res.json(administrador);
    } catch (err) {
        res.status(500).json({ message: 'Error al modificar el administrador' });
    }
};

// Cambiar estado del administrador
const cambiarEstado = async (req, res) => {
    try {
        const administrador = await Administrador.findByIdAndUpdate(
            req.params.id,
            { estado: req.body.estado },
            { new: true, runValidators: true }
        ).select('-password');
        if (!administrador) return res.status(404).json({ message: 'Administrador no encontrado' });
        res.json(administrador);
    } catch (err) {
        res.status(500).json({ message: 'Error al cambiar el estado del administrador' });
    }
};

// Eliminar administrador
const destroy = async (req, res) => {
    try {
        const administrador = await Administrador.findByIdAndDelete(req.params.id);
        if (!administrador) return res.status(404).json({ message: 'Administrador no encontrado' });
        res.json({ message: 'Administrador eliminado correctamente' });
    } catch (err) {
        res.status(500).json({ message: 'Error al eliminar el administrador' });
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