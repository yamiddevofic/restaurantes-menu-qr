const mongoose = require('mongoose');
const { Schema } = mongoose;

const fidelizacionSchema = new Schema({
  restaurante_id: {
    type: Schema.Types.ObjectId,
    ref: 'Restaurante',
    required: true
  },
  cliente_id: {
    type: Schema.Types.ObjectId,
    ref: 'Cliente',
    required: true
  },
  puntos: {
    type: Number,
    default: 0
  },
  compras_premio: {
    type: Number,
    default: 0
  },
  premios_ganados: {
    type: Number,
    default: 0
  },
  visitas: {
    type: Number,
    default: 0
  },
  total_gastado: {
    type: Number,
    default: 0
  },
  fecha_registro: {
    type: Date,
    default: Date.now
  },
  estado: {
    type: String,
    enum: ['ACTIVO', 'INACTIVO'],
    default: 'ACTIVO'
  }
});

fidelizacionSchema.index({ restaurante_id: 1, cliente_id: 1 }, { unique: true });

const Fidelizacion = mongoose.model('Fidelizacion', fidelizacionSchema);
module.exports = Fidelizacion;