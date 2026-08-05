const Restaurante = require('../models/Restaurante');
const Plato = require('../models/Plato');
const QRCode = require('qrcode');

const generatedQRCode = (restauranteId, numeroMesa) => {
    // Generar código único para la mesa basado en restaurante y número
    return `${restauranteId}_mesa_${numeroMesa}_${Date.now()}`;
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
        res.status(500).json({ message: 'Error al guardar el restaurante', error: err.message });
    }
};

// Listar restaurantes
const index = async (req, res) => {
    try {
        const restaurantes = await Restaurante.find();
        res.json(restaurantes);
    } catch (err) {
        res.status(500).json({ message: 'Error al listar los restaurantes', error: err.message });
    }
};

// Consultar un restaurante por ID
const show = async (req, res) => {
    try {
        const restaurante = await Restaurante.findById(req.params.id);
        if (!restaurante) return res.status(404).json({ message: 'Restaurante no encontrado' });
        res.json(restaurante);
    } catch (err) {
        res.status(500).json({ message: 'Error al consultar el restaurante', error: err.message });
    }
};

// Agregar una mesa nueva (operación separada de "crear restaurante")
const agregarMesa = async (req, res) => {
    try {
        const restaurante = await Restaurante.findById(req.params.id);
        if (!restaurante) return res.status(404).json({ message: 'Restaurante no encontrado' });

        const qrCode = generatedQRCode(restaurante._id, req.body.numero);
        const menuUrl = `/restaurantes/menu/${qrCode}`;
        
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
        res.status(500).json({ message: 'Error al agregar la mesa', error: err.message });
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
        res.status(500).json({ message: 'Error al agregar la categoría', error: err.message });
    }
};

// Listar todas las mesas de un restaurante
const listarMesas = async (req, res) => {
    try {
        const restaurante = await Restaurante.findById(req.params.id);
        if (!restaurante) return res.status(404).json({ message: 'Restaurante no encontrado' });
        res.json(restaurante.mesas);
    } catch (err) {
        res.status(500).json({ message: 'Error al listar las mesas', error: err.message });
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
        res.status(500).json({ message: 'Error al consultar la mesa', error: err.message });
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
        res.status(500).json({ message: 'Error al editar la mesa', error: err.message });
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
        res.status(500).json({ message: 'Error al eliminar la mesa', error: err.message });
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
        res.status(500).json({ message: 'Error al eliminar todas las mesas', error: err.message });
    }
};

// Listar todas las categorías de un restaurante
const listarCategorias = async (req, res) => {
    try {
        const restaurante = await Restaurante.findById(req.params.id);
        if (!restaurante) return res.status(404).json({ message: 'Restaurante no encontrado' });
        res.json(restaurante.categorias);
    } catch (err) {
        res.status(500).json({ message: 'Error al listar las categorías', error: err.message });
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
        res.status(500).json({ message: 'Error al consultar la categoría', error: err.message });
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
        res.status(500).json({ message: 'Error al editar la categoría', error: err.message });
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
        res.status(500).json({ message: 'Error al eliminar la categoría', error: err.message });
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
        res.status(500).json({ message: 'Error al eliminar todas las categorías', error: err.message });
    }
};

// Modificar restaurante
const update = async (req, res) => {
    try {
        const restaurante = await Restaurante.findByIdAndUpdate(
            req.params.id,
            {
                nombre: req.body.nombre,
                ubicacion: req.body.ubicacion,
                adm_id: req.body.adm_id
            },
            { new: true, runValidators: true }
        );
        if (!restaurante) return res.status(404).json({ message: 'Restaurante no encontrado' });
        res.json(restaurante);
    } catch (err) {
        res.status(500).json({ message: 'Error al modificar el restaurante', error: err.message });
    }
};

// Eliminar restaurante
const destroy = async (req, res) => {
    try {
        const restaurante = await Restaurante.findByIdAndDelete(req.params.id);
        if (!restaurante) return res.status(404).json({ message: 'Restaurante no encontrado' });
        res.json({ message: 'Restaurante eliminado correctamente' });
    } catch (err) {
        res.status(500).json({ message: 'Error al eliminar el restaurante', error: err.message });
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
        res.status(500).json({ message: 'Error al obtener el menú', error: err.message });
    }
};

module.exports = {
    store,
    index,
    show,
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