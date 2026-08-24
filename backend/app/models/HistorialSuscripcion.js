const mongoose = require('mongoose');
const { Schema } = mongoose;

// Historial de suscripciones: cada actualización, renovación o cancelación
// del plan queda registrada (auditoría) junto con el estado antes y después.
const historialSuscripcionSchema = new Schema({
  admin_id: {
    type: Schema.Types.ObjectId,
    ref: 'Administrador',
    required: true,
    index: true
  },
  accion: {
    type: String,
    enum: ['actualizar', 'renovar', 'cancelar'],
    required: true
  },
  plan_anterior: {
    type: String,
    enum: ['free', 'pro'],
    required: true
  },
  plan_nuevo: {
    type: String,
    enum: ['free', 'pro'],
    required: true
  },
  fecha: {
    type: Date,
    default: Date.now,
    index: true
  }
});

const HistorialSuscripcion = mongoose.model('HistorialSuscripcion', historialSuscripcionSchema);
module.exports = HistorialSuscripcion;