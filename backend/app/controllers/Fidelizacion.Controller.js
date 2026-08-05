const Fidelizacion = require('../models/Fidelizacion');

// Umbral de compras para ganar el premio — en el futuro puede venir de
// Restaurante.programa_fidelizacion.compras_requeridas en vez de estar fijo aquí.
const COMPRAS_REQUERIDAS = 10;

// GET /fidelizacion — listar todos los programas de fidelización
const index = async (req, res) => {
  try {
    const fidelizaciones = await Fidelizacion.find();
    res.json(fidelizaciones);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /fidelizacion/:id — obtener un programa de fidelización específico
const show = async (req, res) => {
  try {
    const fidelizacion = await Fidelizacion.findById(req.params.id);
    if (!fidelizacion) return res.status(404).json({ error: 'Fidelización no encontrada' });
    res.json(fidelizacion);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /fidelizacion/:clienteId/:restauranteId — ver el progreso de un cliente
// en un restaurante específico (lectura)
const getFidelizacion = async (req, res) => {
  try {
    const { clienteId, restauranteId } = req.params;
    const fidelizacion = await Fidelizacion.findOne({
      cliente_id: clienteId,
      restaurante_id: restauranteId
    });
    if (!fidelizacion) return res.status(404).json({ error: 'El cliente no está fidelizado en este restaurante' });
    res.json(fidelizacion);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /fidelizacion — suscribir a un cliente al programa de un restaurante (escritura)
const crearFidelizacion = async (req, res) => {
  try {
    const { cliente_id, restaurante_id } = req.body;
    const existente = await Fidelizacion.findOne({ cliente_id, restaurante_id });
    if (existente) return res.status(409).json({ error: 'El cliente ya está fidelizado en este restaurante' });

    const fidelizacion = new Fidelizacion({ cliente_id, restaurante_id });
    await fidelizacion.save();
    res.status(201).json(fidelizacion);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// PATCH interno — se llama desde el controller de Pedido cuando un pedido
// con cliente_id se marca como ENTREGADO. No es una ruta HTTP propia, es una
// función que reutiliza el controller de Pedido.
const registrarCompra = async (clienteId, restauranteId, montoGastado) => {
  const fidelizacion = await Fidelizacion.findOne({
    cliente_id: clienteId,
    restaurante_id: restauranteId
  });

  if (!fidelizacion) return null; // el cliente no está suscrito a este restaurante

  fidelizacion.puntos += 1;
  fidelizacion.visitas += 1;
  fidelizacion.total_gastado += montoGastado;
  fidelizacion.compras_premio += 1;

  let premioGanado = false;
  if (fidelizacion.compras_premio >= COMPRAS_REQUERIDAS) {
    fidelizacion.compras_premio = 0; // se resetea el contador al canjear
    fidelizacion.premios_ganados += 1; // incrementa premios ganados
    premioGanado = true;
  }

  await fidelizacion.save();
  return { fidelizacion, premioGanado };
};

// Modificar fidelización
const update = async (req, res) => {
  try {
    const updateData = {};
    if (req.body.puntos !== undefined) updateData.puntos = req.body.puntos;
    if (req.body.compras_premio !== undefined) updateData.compras_premio = req.body.compras_premio;
    if (req.body.premios_ganados !== undefined) updateData.premios_ganados = req.body.premios_ganados;
    if (req.body.visitas !== undefined) updateData.visitas = req.body.visitas;
    if (req.body.total_gastado !== undefined) updateData.total_gastado = req.body.total_gastado;
    if (req.body.estado !== undefined) updateData.estado = req.body.estado;

    const fidelizacion = await Fidelizacion.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );
    if (!fidelizacion) return res.status(404).json({ error: 'Fidelización no encontrada' });
    res.json(fidelizacion);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Cambiar estado de la fidelización
const cambiarEstado = async (req, res) => {
  try {
    const fidelizacion = await Fidelizacion.findByIdAndUpdate(
      req.params.id,
      { estado: req.body.estado },
      { new: true, runValidators: true }
    );
    if (!fidelizacion) return res.status(404).json({ error: 'Fidelización no encontrada' });
    res.json(fidelizacion);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Eliminar fidelización
const destroy = async (req, res) => {
  try {
    const fidelizacion = await Fidelizacion.findByIdAndDelete(req.params.id);
    if (!fidelizacion) return res.status(404).json({ error: 'Fidelización no encontrada' });
    res.json({ message: 'Fidelización eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  index,
  show,
  getFidelizacion,
  crearFidelizacion,
  registrarCompra,
  update,
  cambiarEstado,
  destroy
};