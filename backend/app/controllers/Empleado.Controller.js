const Empleado = require('../models/Empleado');
const bcrypt = require('bcrypt');

// Guardar empleado

const store = async (req, res, next) => {
    try {
        const empleado = new Empleado({
            restaurante_id: req.body.restaurante_id,
            nombre: req.body.nombre,
            usuario: req.body.usuario,
            password: bcrypt.hashSync(req.body.password, 12),
            rol: req.body.rol,
            contacto: req.body.contacto,
            estado: req.body.estado || 'ACTIVO'
        });
        await empleado.save();
        res.status(201).json({ message: 'Empleado guardado correctamente' })
    } catch (err) {
        res.status(500).json({ message: 'Error al guardar el empleado' })
    }
}

// Listar empleados

const index = async (req, res, next) => {
    try {
        const empleados = await Empleado.find();
        res.json(empleados);
    } catch (err) {
        res.status(500).json({ message: 'Error al listar los empleados' })
    }
}

// Consultar un empleado por ID

const show = async (req, res, next) => {
    try {
        const empleado = await Empleado.findById(req.params.id).select('-password');
        if (!empleado) return res.status(404).json({ message: 'Empleado no encontrado' });
        res.json(empleado);
    } catch (err) {
        res.status(500).json({ message: 'Error al consultar el empleado' });
    }
}

// Modificar empleado
const update = async (req, res) => {
    try {
        const updateData = {
            restaurante_id: req.body.restaurante_id,
            nombre: req.body.nombre,
            usuario: req.body.usuario,
            rol: req.body.rol,
            contacto: req.body.contacto
        };
        if (req.body.password) {
            updateData.password = bcrypt.hashSync(req.body.password, 12);
        }
        const empleado = await Empleado.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');
        if (!empleado) return res.status(404).json({ message: 'Empleado no encontrado' });
        res.json(empleado);
    } catch (err) {
        res.status(500).json({ message: 'Error al modificar el empleado' });
    }
}

// Cambiar estado del empleado
const cambiarEstado = async (req, res) => {
    try {
        const empleado = await Empleado.findByIdAndUpdate(
            req.params.id,
            { estado: req.body.estado },
            { new: true, runValidators: true }
        ).select('-password');
        if (!empleado) return res.status(404).json({ message: 'Empleado no encontrado' });
        res.json(empleado);
    } catch (err) {
        res.status(500).json({ message: 'Error al cambiar el estado del empleado' });
    }
}

// Eliminar empleado
const destroy = async (req, res) => {
    try {
        const empleado = await Empleado.findByIdAndDelete(req.params.id);
        if (!empleado) return res.status(404).json({ message: 'Empleado no encontrado' });
        res.json({ message: 'Empleado eliminado correctamente' });
    } catch (err) {
        res.status(500).json({ message: 'Error al eliminar el empleado' });
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
