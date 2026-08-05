const mongoose = require('mongoose');
const { Schema } = mongoose;

const ingresoPorPlatoSchema = new Schema({
  plato_id: {
    type: Schema.Types.ObjectId,
    ref: 'Plato'
  },
  nombre: {
    type: String,
    required: true
  },
  cantidad: {
    type: Number,
    required: true
  },
  ingresos: {
    type: Number,
    required: true
  }
});

const reportSchema = new Schema({
  restaurante_id: {
    type: Schema.Types.ObjectId,
    ref: 'Restaurante',
    required: true
  },
  fecha: {
    type: Date,
    required: true
  },
  total_ingresos: {
    type: Number,
    default: 0
  },
  total_platos_entregados: {
    type: Number,
    default: 0
  },
  total_platos_cancelados: {
    type: Number,
    default: 0
  },
  total_platos_devueltos: {
    type: Number,
    default: 0
  },
  promedio_tiempo_entrega: {
    type: Number
  },
  ingresos_por_plato: [ingresoPorPlatoSchema],
  categoria_mas_vendida: {
    type: String
  },
  categoria_menos_vendida: {
    type: String
  }
});

const Reporte = mongoose.model('Reporte', reportSchema);
module.exports = Reporte;