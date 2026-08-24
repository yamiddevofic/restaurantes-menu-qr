const Administrador = require('../models/Administrador');
const Empleado = require('../models/Empleado');
const Restaurante = require('../models/Restaurante');
const HistorialEliminacion = require('../models/HistorialEliminacion');
const HistorialSuscripcion = require('../models/HistorialSuscripcion');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const env = require('../config/env');

// Snapshot sin contraseña para guardar en el historial de eliminación
const snapshotDe = (doc) => {
    const data = doc.toObject();
    if (data.password) delete data.password;
    return data;
};

const DIAS_PURGA = 30;
const fechaPurga = () => new Date(Date.now() + DIAS_PURGA * 24 * 60 * 60 * 1000);

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

        let restaurantes = [];
        if (tipo === 'admin') {
            restaurantes = await Restaurante.find({ adm_id: userData._id });
        }

        const token = jwt.sign(
            { id: userData._id, tipo },
            env.JWT_SECRET,
            { expiresIn: '8h', algorithm: 'HS256' }
        );

        res.json({
            message: 'Inicio de sesión exitoso',
            tipo,
            token,
            user: userData,
            restaurante: restaurantes[0] || null,
            restaurantes
        });
    } catch (err) {
        res.status(500).json({ message: 'Error al iniciar sesión' });
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

        let restaurantes = [];
        if (tipo === 'admin') {
            restaurantes = await Restaurante.find({ adm_id: userData._id });
        }

        res.json({ tipo, user: userData, restaurante: restaurantes[0] || null, restaurantes });
    } catch (err) {
        res.status(500).json({ message: 'Error al obtener la sesión' });
    }
};

const actualizarPerfil = async (req, res) => {
    try {
        const { id, tipo } = req.user;
        const Model = getModelByTipo(tipo);
        const user = await Model.findById(id);

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        const { nombre, email, telefono, bio, contacto } = req.body;

        if (nombre !== undefined) {
            const limpio = String(nombre).trim();
            if (!limpio) {
                return res.status(400).json({ message: 'El nombre no puede estar vacío' });
            }
            user.nombre = limpio;
        }

        if (tipo === 'admin') {
            if (email !== undefined) {
                const correo = String(email).trim().toLowerCase();
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
                    return res.status(400).json({ message: 'El correo no es válido' });
                }
                const duplicado = await Administrador.findOne({ email: correo, _id: { $ne: user._id } });
                if (duplicado) {
                    return res.status(409).json({ message: 'Ese correo ya está en uso' });
                }
                user.email = correo;
            }
            if (telefono !== undefined) user.telefono = String(telefono).trim();
            if (bio !== undefined) user.bio = String(bio).trim();
        } else {
            if (contacto?.correo !== undefined) {
                user.contacto = user.contacto || {};
                user.contacto.correo = String(contacto.correo).trim();
            }
            if (contacto?.celular !== undefined) {
                user.contacto = user.contacto || {};
                user.contacto.celular = String(contacto.celular).trim();
            }
            if (bio !== undefined) user.bio = String(bio).trim();
        }

        await user.save();

        const userData = user.toObject();
        delete userData.password;
        userData.tipo = tipo;

        res.json({ message: 'Perfil actualizado', user: userData });
    } catch (err) {
        res.status(500).json({ message: 'Error al actualizar el perfil' });
    }
};

const subirAvatar = async (req, res) => {
    try {
        const { id, tipo } = req.user;
        const Model = getModelByTipo(tipo);
        const user = await Model.findById(id);

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'Selecciona una imagen' });
        }

        user.avatar = `/uploads/perfiles/${req.file.filename}`;
        await user.save();

        const userData = user.toObject();
        delete userData.password;
        userData.tipo = tipo;

        res.json({ message: 'Foto de perfil actualizada', user: userData });
    } catch (err) {
        res.status(500).json({ message: 'Error al subir la foto' });
    }
};

const eliminarCuenta = async (req, res) => {
    try {
        const { id, tipo } = req.user;
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({ message: 'Ingresa tu contraseña para confirmar la eliminación' });
        }

        const user = await getModelByTipo(tipo).findById(id);

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        const valida = await bcrypt.compare(password, user.password);
        if (!valida) {
            return res.status(401).json({ message: 'Contraseña incorrecta' });
        }

        // No se borra en realidad: la cuenta pasa a BAJA (pierde acceso al
        // instante) y su información queda como historial, a purgarse en 30 días.
        user.estado = 'BAJA';
        await user.save();

        await HistorialEliminacion.create({
            entidad_tipo: tipo,
            entidad_ref: user._id,
            snapshot: snapshotDe(user),
            fecha_eliminacion: fechaPurga()
        });

        if (tipo === 'admin') {
            const restaurantes = await Restaurante.find({ adm_id: id });
            const restauranteIds = restaurantes.map((r) => r._id);

            const empleados = await Empleado.find({ restaurante_id: { $in: restauranteIds } });
            await Empleado.deleteMany({ restaurante_id: { $in: restauranteIds } });
            for (const e of empleados) {
                await HistorialEliminacion.create({
                    entidad_tipo: 'empleado',
                    entidad_ref: e._id,
                    snapshot: snapshotDe(e),
                    fecha_eliminacion: fechaPurga()
                });
            }

            await Restaurante.deleteMany({ adm_id: id });
            for (const r of restaurantes) {
                await HistorialEliminacion.create({
                    entidad_tipo: 'restaurante',
                    entidad_ref: r._id,
                    snapshot: {
                        ...snapshotDe(r),
                        adm_id: String(r.adm_id || '')
                    },
                    fecha_eliminacion: fechaPurga()
                });
            }
        }

        res.json({
            message: `Cuenta marcada para eliminación definitiva en ${DIAS_PURGA} días; tu acceso fue cerrado`
        });
    } catch (err) {
        res.status(500).json({ message: 'Error al eliminar la cuenta' });
    }
};

const gestionarSuscripcion = async (req, res) => {
    try {
        const { id, tipo } = req.user;
        if (tipo !== 'admin') {
            return res.status(403).json({ message: 'Solo administradores' });
        }
        const user = await Administrador.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        const { accion } = req.body;
        const DIAS_PLAN = 30;
        const hoy = new Date();
        const planAnterior = user.plan;

        if (accion === 'actualizar') {
            if (user.plan === 'pro') {
                return res.status(400).json({ message: 'Ya tienes el plan Pro' });
            }
            user.plan = 'pro';
            user.plan_vencimiento = new Date(hoy.getTime() + DIAS_PLAN * 24 * 60 * 60 * 1000);
        } else if (accion === 'renovar') {
            if (user.plan !== 'pro') {
                return res.status(400).json({ message: 'Solo puedes renovar el plan Pro' });
            }
            // Si está vencido, la nueva membresía empieza hoy; si no, se suma al vencimiento actual
            const base = user.plan_vencimiento && user.plan_vencimiento > hoy ? user.plan_vencimiento : hoy;
            user.plan_vencimiento = new Date(base.getTime() + DIAS_PLAN * 24 * 60 * 60 * 1000);
        } else if (accion === 'cancelar') {
            if (user.plan === 'free') {
                return res.status(400).json({ message: 'Ya estás en el plan gratis' });
            }
            user.plan = 'free';
            user.plan_vencimiento = null;
        } else {
            return res.status(400).json({ message: 'Acción inválida: actualizar, renovar o cancelar' });
        }

        await user.save();

        // Auditoría: registrar el cambio de suscripción en el historial
        await HistorialSuscripcion.create({
            admin_id: id,
            accion,
            plan_anterior: planAnterior,
            plan_nuevo: user.plan
        });

        const userData = user.toObject();
        delete userData.password;
        userData.tipo = tipo;

        res.json({ message: 'Suscripción actualizada', user: userData });
    } catch (err) {
        res.status(500).json({ message: 'Error al gestionar la suscripción' });
    }
};

const historialSuscripcion = async (req, res) => {
    try {
        const { id, tipo } = req.user;
        if (tipo !== 'admin') {
            return res.status(403).json({ message: 'Solo administradores' });
        }
        const historial = await HistorialSuscripcion.find({ admin_id: id })
            .sort({ fecha: -1 })
            .limit(50);
        res.json(historial);
    } catch (err) {
        res.status(500).json({ message: 'Error al consultar el historial' });
    }
};

module.exports = { login, me, actualizarPerfil, subirAvatar, eliminarCuenta, gestionarSuscripcion, historialSuscripcion };
