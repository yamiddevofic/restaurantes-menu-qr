const Restaurante = require('../models/Restaurante');
const Plato = require('../models/Plato');
const Administrador = require('../models/Administrador');
const HistorialEliminacion = require('../models/HistorialEliminacion');
const QRCode = require('qrcode');
const bcrypt = require('bcrypt');

const DIAS_PURGA = 30;
const fechaPurga = () => new Date(Date.now() + DIAS_PURGA * 24 * 60 * 60 * 1000);

const generatedQRCode = (restauranteId, numeroMesa) => {
    // Generar código único para la mesa basado en restaurante y número
    return `${restauranteId}_mesa_${numeroMesa}_${Date.now()}`;
};

// URL absoluta del menú público que codifica el QR.
// En producción se define QR_BASE_URL (dominio); en desarrollo cae al host de la petición.
const generarMenuUrl = (qrCode, req) => {
    const base = process.env.QR_BASE_URL || `${req.protocol}://${req.get('host')}`;
    return `${base}/api/restaurantes/menu/${qrCode}`;
};

// Guardar restaurante (se crea vacío, sin mesas ni categorías todavía)
const store = async (req, res) => {
    try {
        const restaurante = new Restaurante({
            nombre: req.body.nombre,
            ubicacion: req.body.ubicacion,
            adm_id: req.body.adm_id
        });
        await restaurante.save();
        res.status(201).json(restaurante);
    } catch (err) {
        res.status(500).json({ message: 'Error al guardar el restaurante' });
    }
};

// Listar restaurantes del administrador autenticado
const misRestaurantes = async (req, res) => {
    try {
        if (req.user.tipo !== 'admin') {
            return res.status(403).json({ message: 'Solo administradores' });
        }
        const restaurantes = await Restaurante.find({ adm_id: req.user.id });
        res.json(restaurantes);
    } catch (err) {
        res.status(500).json({ message: 'Error al listar tus restaurantes' });
    }
};

// Crear un restaurante para el administrador autenticado
const crearMiRestaurante = async (req, res) => {
    try {
        if (req.user.tipo !== 'admin') {
            return res.status(403).json({ message: 'Solo administradores' });
        }
        const { nombre, ubicacion } = req.body;
        if (!nombre || !String(nombre).trim() || !ubicacion || !String(ubicacion).trim()) {
            return res.status(400).json({ message: 'Nombre y ubicación son obligatorios' });
        }
        const restaurante = new Restaurante({
            nombre: String(nombre).trim(),
            ubicacion: String(ubicacion).trim(),
            adm_id: req.user.id
        });
        await restaurante.save();
        res.status(201).json(restaurante);
    } catch (err) {
        res.status(500).json({ message: 'Error al crear el restaurante' });
    }
};

// Listar restaurantes
const index = async (req, res) => {
    try {
        const restaurantes = await Restaurante.find();
        res.json(restaurantes);
    } catch (err) {
        res.status(500).json({ message: 'Error al listar los restaurantes' });
    }
};

// Consultar un restaurante por ID
const show = async (req, res) => {
    try {
        const restaurante = await Restaurante.findById(req.params.id);
        if (!restaurante) return res.status(404).json({ message: 'Restaurante no encontrado' });
        res.json(restaurante);
    } catch (err) {
        res.status(500).json({ message: 'Error al consultar el restaurante' });
    }
};

// Agregar una mesa nueva (operación separada de "crear restaurante")
const agregarMesa = async (req, res) => {
    try {
        const restaurante = await Restaurante.findById(req.params.id);
        if (!restaurante) return res.status(404).json({ message: 'Restaurante no encontrado' });

        const qrCode = generatedQRCode(restaurante._id, req.body.numero);
        const menuUrl = generarMenuUrl(qrCode, req);
        
        // Generar imagen QR en base64
        const qrImage = await QRCode.toDataURL(menuUrl);
        
        restaurante.mesas.push({
            numero: req.body.numero,
            qr_code: qrCode,
            qr_image: qrImage
        });
        await restaurante.save();
        res.status(201).json({
            ...restaurante.mesas[restaurante.mesas.length - 1].toObject(),
            menu_url: menuUrl
        });
    } catch (err) {
        res.status(500).json({ message: 'Error al agregar la mesa' });
    }
};


// Agregar una categoría nueva
const agregarCategoria = async (req, res) => {
    try {
        const restaurante = await Restaurante.findById(req.params.id);
        if (!restaurante) return res.status(404).json({ message: 'Restaurante no encontrado' });

        restaurante.categorias.push({
            nombre: req.body.nombre,
            descripcion: req.body.descripcion
        });
        await restaurante.save();
        res.status(201).json(restaurante.categorias[restaurante.categorias.length - 1]);
    } catch (err) {
        res.status(500).json({ message: 'Error al agregar la categoría' });
    }
};

// Listar todas las mesas de un restaurante
const listarMesas = async (req, res) => {
    try {
        const restaurante = await Restaurante.findById(req.params.id);
        if (!restaurante) return res.status(404).json({ message: 'Restaurante no encontrado' });
        res.json(restaurante.mesas);
    } catch (err) {
        res.status(500).json({ message: 'Error al listar las mesas' });
    }
};

// Consultar una mesa específica
const mostrarMesa = async (req, res) => {
    try {
        const restaurante = await Restaurante.findById(req.params.id);
        if (!restaurante) return res.status(404).json({ message: 'Restaurante no encontrado' });
        
        const mesa = restaurante.mesas.id(req.params.mesaId);
        if (!mesa) return res.status(404).json({ message: 'Mesa no encontrada' });
        
        res.json(mesa);
    } catch (err) {
        res.status(500).json({ message: 'Error al consultar la mesa' });
    }
};

// Editar una mesa
const editarMesa = async (req, res) => {
    try {
        const restaurante = await Restaurante.findById(req.params.id);
        if (!restaurante) return res.status(404).json({ message: 'Restaurante no encontrado' });
        
        const mesa = restaurante.mesas.id(req.params.mesaId);
        if (!mesa) return res.status(404).json({ message: 'Mesa no encontrada' });
        
        if (req.body.numero) mesa.numero = req.body.numero;
        
        await restaurante.save();
        res.json(mesa);
    } catch (err) {
        res.status(500).json({ message: 'Error al editar la mesa' });
    }
};

// Eliminar una mesa
const eliminarMesa = async (req, res) => {
    try {
        const restaurante = await Restaurante.findById(req.params.id);
        if (!restaurante) return res.status(404).json({ message: 'Restaurante no encontrado' });
        
        const mesa = restaurante.mesas.id(req.params.mesaId);
        if (!mesa) return res.status(404).json({ message: 'Mesa no encontrada' });
        
        restaurante.mesas.pull(req.params.mesaId);
        await restaurante.save();
        res.json({ message: 'Mesa eliminada correctamente' });
    } catch (err) {
        res.status(500).json({ message: 'Error al eliminar la mesa' });
    }
};

// Eliminar todas las mesas de un restaurante
const eliminarTodasMesas = async (req, res) => {
    try {
        const restaurante = await Restaurante.findById(req.params.id);
        if (!restaurante) return res.status(404).json({ message: 'Restaurante no encontrado' });
        
        restaurante.mesas = [];
        await restaurante.save();
        res.json({ message: 'Todas las mesas eliminadas correctamente' });
    } catch (err) {
        res.status(500).json({ message: 'Error al eliminar todas las mesas' });
    }
};

// Listar todas las categorías de un restaurante
const listarCategorias = async (req, res) => {
    try {
        const restaurante = await Restaurante.findById(req.params.id);
        if (!restaurante) return res.status(404).json({ message: 'Restaurante no encontrado' });
        res.json(restaurante.categorias);
    } catch (err) {
        res.status(500).json({ message: 'Error al listar las categorías' });
    }
};

// Consultar una categoría específica
const mostrarCategoria = async (req, res) => {
    try {
        const restaurante = await Restaurante.findById(req.params.id);
        if (!restaurante) return res.status(404).json({ message: 'Restaurante no encontrado' });
        
        const categoria = restaurante.categorias.id(req.params.categoriaId);
        if (!categoria) return res.status(404).json({ message: 'Categoría no encontrada' });
        
        res.json(categoria);
    } catch (err) {
        res.status(500).json({ message: 'Error al consultar la categoría' });
    }
};

// Editar una categoría
const editarCategoria = async (req, res) => {
    try {
        const restaurante = await Restaurante.findById(req.params.id);
        if (!restaurante) return res.status(404).json({ message: 'Restaurante no encontrado' });
        
        const categoria = restaurante.categorias.id(req.params.categoriaId);
        if (!categoria) return res.status(404).json({ message: 'Categoría no encontrada' });
        
        if (req.body.nombre) categoria.nombre = req.body.nombre;
        if (req.body.descripcion) categoria.descripcion = req.body.descripcion;
        
        await restaurante.save();
        res.json(categoria);
    } catch (err) {
        res.status(500).json({ message: 'Error al editar la categoría' });
    }
};

// Eliminar una categoría
const eliminarCategoria = async (req, res) => {
    try {
        const restaurante = await Restaurante.findById(req.params.id);
        if (!restaurante) return res.status(404).json({ message: 'Restaurante no encontrado' });
        
        const categoria = restaurante.categorias.id(req.params.categoriaId);
        if (!categoria) return res.status(404).json({ message: 'Categoría no encontrada' });
        
        restaurante.categorias.pull(req.params.categoriaId);
        await restaurante.save();
        res.json({ message: 'Categoría eliminada correctamente' });
    } catch (err) {
        res.status(500).json({ message: 'Error al eliminar la categoría' });
    }
};

// Eliminar todas las categorías de un restaurante
const eliminarTodasCategorias = async (req, res) => {
    try {
        const restaurante = await Restaurante.findById(req.params.id);
        if (!restaurante) return res.status(404).json({ message: 'Restaurante no encontrado' });
        
        restaurante.categorias = [];
        await restaurante.save();
        res.json({ message: 'Todas las categorías eliminadas correctamente' });
    } catch (err) {
        res.status(500).json({ message: 'Error al eliminar todas las categorías' });
    }
};

// Modificar restaurante (solo el administrador dueño)
const update = async (req, res) => {
    try {
        if (!req.user || req.user.tipo !== 'admin') {
            return res.status(403).json({ message: 'No autorizado' });
        }
        const restaurante = await Restaurante.findById(req.params.id);
        if (!restaurante) return res.status(404).json({ message: 'Restaurante no encontrado' });
        if (String(restaurante.adm_id) !== String(req.user.id)) {
            return res.status(403).json({ message: 'No tienes permisos sobre este restaurante' });
        }

        const { nombre, ubicacion } = req.body;
        if (nombre !== undefined) {
            if (!String(nombre).trim()) return res.status(400).json({ message: 'El nombre no puede estar vacío' });
            restaurante.nombre = String(nombre).trim();
        }
        if (ubicacion !== undefined) {
            if (!String(ubicacion).trim()) return res.status(400).json({ message: 'La ubicación no puede estar vacía' });
            restaurante.ubicacion = String(ubicacion).trim();
        }

        await restaurante.save();
        res.json(restaurante);
    } catch (err) {
        res.status(500).json({ message: 'Error al modificar el restaurante' });
    }
};

// Eliminar restaurante (solo el dueño y si no es el único que tiene).
// No se borra en realidad: pasa a la colección de historial de eliminación
// y se purga definitivamente 30 días después.
const destroy = async (req, res) => {
    try {
        if (!req.user || req.user.tipo !== 'admin') {
            return res.status(403).json({ message: 'No autorizado' });
        }
        const { password } = req.body;
        if (!password) {
            return res.status(400).json({ message: 'Ingresa tu contraseña para confirmar la eliminación' });
        }
        const admin = await Administrador.findById(req.user.id);
        if (!admin) {
            return res.status(401).json({ message: 'Administrador no encontrado' });
        }
        const valida = await bcrypt.compare(password, admin.password);
        if (!valida) {
            return res.status(401).json({ message: 'Contraseña incorrecta' });
        }
        if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(404).json({ message: 'Restaurante no encontrado' });
        }
        const restaurante = await Restaurante.findById(req.params.id);
        if (!restaurante) return res.status(404).json({ message: 'Restaurante no encontrado' });
        if (String(restaurante.adm_id) !== String(req.user.id)) {
            return res.status(403).json({ message: 'No tienes permisos sobre este restaurante' });
        }

        const total = await Restaurante.countDocuments({ adm_id: req.user.id });
        if (total <= 1) {
            return res.status(400).json({ message: 'Debes tener al menos un restaurante' });
        }

        const snapshot = restaurante.toObject();
        snapshot.adm_id = String(snapshot.adm_id || '');

        await Restaurante.deleteOne({ _id: restaurante._id });
        await HistorialEliminacion.create({
            entidad_tipo: 'restaurante',
            entidad_ref: restaurante._id,
            snapshot,
            fecha_eliminacion: fechaPurga()
        });

        res.json({
            message: `Restaurante eliminado; se purgará definitivamente en ${DIAS_PURGA} días`
        });
    } catch (err) {
        res.status(500).json({ message: 'Error al eliminar el restaurante' });
    }
};

// Ver menú para comensales (por QR de mesa)
const verMenu = async (req, res) => {
    try {
        const { qr_code } = req.params;
        
        // Buscar restaurante que tenga la mesa con ese QR
        const restaurante = await Restaurante.findOne({ 'mesas.qr_code': qr_code });
        if (!restaurante) return res.status(404).json({ message: 'Mesa no encontrada' });
        
        // Encontrar la mesa específica
        const mesa = restaurante.mesas.find(m => m.qr_code === qr_code);
        
        // Obtener todos los platos del restaurante
        const platos = await Plato.find({ 
            restaurante_id: restaurante._id,
            estado: 'DISPONIBLE'
        });
        
        // Agrupar platos por categoría
        const categoriasConPlatos = restaurante.categorias.map(categoria => ({
            _id: categoria._id,
            nombre: categoria.nombre,
            descripcion: categoria.descripcion,
            platos: platos.filter(plato => plato.categoria_id && plato.categoria_id.toString() === categoria._id.toString())
        })).filter(categoria => categoria.platos.length > 0); // Solo mostrar categorías con platos
        
        // Retornar menú completo
        res.json({
            restaurante: {
                _id: restaurante._id,
                nombre: restaurante.nombre,
                ubicacion: restaurante.ubicacion
            },
            mesa: {
                numero: mesa.numero,
                qr_code: mesa.qr_code
            },
            categorias: categoriasConPlatos
        });
    } catch (err) {
        res.status(500).json({ message: 'Error al obtener el menú' });
    }
};

module.exports = {
    store,
    index,
    show,
    misRestaurantes,
    crearMiRestaurante,
    agregarMesa,
    listarMesas,
    mostrarMesa,
    editarMesa,
    eliminarMesa,
    eliminarTodasMesas,
    agregarCategoria,
    listarCategorias,
    mostrarCategoria,
    editarCategoria,
    eliminarCategoria,
    eliminarTodasCategorias,
    update,
    destroy,
    verMenu
};