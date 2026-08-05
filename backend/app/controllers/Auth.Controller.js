const Administrador = require('../models/Administrador');
const Empleado = require('../models/Empleado');
const Restaurante = require('../models/Restaurante');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'qrta_secret_key';

const getModelByTipo = (tipo) => (tipo === 'admin' ? Administrador : Empleado);

const login = async (req, res) => {
    try {
        const { usuario, password, tipo } = req.body;

        if (!usuario || !password || !tipo) {
            return res.status(400).json({ message: 'Usuario, contraseña y tipo son obligatorios' });
        }

        if (!['admin', 'empleado'].includes(tipo)) {
            return res.status(400).json({ message: 'Tipo debe ser "admin" o "empleado"' });
        }

        let user;

        if (tipo === 'admin') {
            user = await Administrador.findOne({ usuario });
            if (!user) {
                return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
            }
            if (user.estado !== 'ACTIVO') {
                return res.status(403).json({ message: 'Tu cuenta está inactiva' });
            }
        } else {
            user = await Empleado.findOne({ usuario });
            if (!user) {
                return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
            }
            if (user.estado !== 'ACTIVO') {
                return res.status(403).json({ message: 'Tu cuenta está inactiva' });
            }
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
        }

        const userData = user.toObject();
        delete userData.password;
        userData.tipo = tipo;

        let restaurante = null;
        if (tipo === 'admin') {
            restaurante = await Restaurante.findOne({ adm_id: userData._id });
        }

        const token = jwt.sign(
            { id: userData._id, tipo },
            JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.json({
            message: 'Inicio de sesión exitoso',
            tipo,
            token,
            user: userData,
            restaurante
        });
    } catch (err) {
        res.status(500).json({ message: 'Error al iniciar sesión', error: err.message });
    }
};

const me = async (req, res) => {
    try {
        if (!req.user || !req.user.id || !req.user.tipo) {
            return res.status(401).json({ message: 'No autorizado' });
        }

        const { id, tipo } = req.user;
        const Model = getModelByTipo(tipo);
        const user = await Model.findById(id);

        if (!user) {
            return res.status(401).json({ message: 'Usuario no encontrado' });
        }

        if (user.estado !== 'ACTIVO') {
            return res.status(403).json({ message: 'Tu cuenta está inactiva' });
        }

        const userData = user.toObject();
        delete userData.password;
        userData.tipo = tipo;

        let restaurante = null;
        if (tipo === 'admin') {
            restaurante = await Restaurante.findOne({ adm_id: userData._id });
        }

        res.json({ tipo, user: userData, restaurante });
    } catch (err) {
        res.status(500).json({ message: 'Error al obtener la sesión', error: err.message });
    }
};

module.exports = { login, me };
