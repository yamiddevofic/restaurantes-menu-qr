const path = require('path');
const fs = require('fs');
const Plato = require('../models/Plato');

// Cuando se envía como multipart/form-data, ingredientes llega como un JSON
// en texto y precio como string, así que normalizamos antes de usar el body.
const parseIngredientes = (raw) => {
    if (Array.isArray(raw)) return raw;
    if (typeof raw === 'string' && raw.trim()) {
        try {
            return JSON.parse(raw);
        } catch {
            return [];
        }
    }
    return [];
};

// Imagen en el path público que Express sirve estáticamente
const imagenPath = (file) => (file ? `/uploads/platos/${file.filename}` : null);

// Borra un archivo de imagen si existe (se ignora si no existe o no es de plato)
const borrarArchivoImagen = (imagen) => {
    if (!imagen || !imagen.startsWith('/uploads/platos/')) return;
    const ruta = path.join(__dirname, '..', 'public', imagen);
    fs.unlink(ruta, () => {});
};

// Guardar plato
const store = async (req, res) => {
    try {
        const plato = new Plato({
            nombre: req.body.nombre,
            descripcion: req.body.descripcion,
            ingredientes: parseIngredientes(req.body.ingredientes),
            restaurante_id: req.body.restaurante_id,
            categoria_id: req.body.categoria_id,
            precio: Number(req.body.precio),
            imagen: imagenPath(req.file),
            estado: req.body.estado || 'DISPONIBLE'
        });
        await plato.save();
        res.status(201).json(plato);
    } catch (err) {
        res.status(500).json({ message: 'Error al guardar el plato' });
    }
};

// Listar platos (filtrando por restaurante y/o categoría)
const index = async (req, res) => {
    try {
        const filtro = { estado: { $ne: 'ELIMINADO' } };
        if (req.query.restaurante_id) filtro.restaurante_id = req.query.restaurante_id;
        if (req.query.categoria_id) filtro.categoria_id = req.query.categoria_id;
        const platos = await Plato.find(filtro);
        res.json(platos);
    } catch (err) {
        res.status(500).json({ message: 'Error al listar los platos' });
    }
};

// Consultar un plato por ID
const show = async (req, res) => {
    try {
        const plato = await Plato.findById(req.params.id);
        if (!plato) return res.status(404).json({ message: 'Plato no encontrado' });
        res.json(plato);
    } catch (err) {
        res.status(500).json({ message: 'Error al consultar el plato' });
    }
};

// Modificar plato (nombre, descripción, ingredientes, categoría, etc.)
const update = async (req, res) => {
    try {
        const platoActual = await Plato.findById(req.params.id);
        if (!platoActual) return res.status(404).json({ message: 'Plato no encontrado' });

        let imagen = platoActual.imagen;
        // Nueva imagen subida: reemplaza la anterior
        if (req.file) {
            imagen = imagenPath(req.file);
        } else if (req.body.imagen === '') {
            // El frontend manda imagen vacía cuando el usuario la quita
            imagen = null;
        }
        // Si la imagen cambió, borramos el archivo antiguo
        if (imagen !== platoActual.imagen) borrarArchivoImagen(platoActual.imagen);

        const plato = await Plato.findByIdAndUpdate(
            req.params.id,
            {
                nombre: req.body.nombre,
                descripcion: req.body.descripcion,
                ingredientes: parseIngredientes(req.body.ingredientes),
                categoria_id: req.body.categoria_id,
                precio: req.body.precio !== undefined ? Number(req.body.precio) : platoActual.precio,
                imagen,
                estado: req.body.estado
            },
            { new: true, runValidators: true }
        );
        res.json(plato);
    } catch (err) {
        res.status(500).json({ message: 'Error al modificar el plato' });
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
        res.status(500).json({ message: 'Error al cambiar el estado del plato' });
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
        res.status(500).json({ message: 'Error al eliminar el plato' });
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