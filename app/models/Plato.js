const mongoose = require('mongoose');
const { Schema } = mongoose;


const ingredienteSchema = new Schema({
  nombre: {
    type: String,
    required: true
  },
  cantidad: {
    type: Number,
    required: true
  },
  medida: {
    type: String,
    required: true
  }
});


const platoSchema = new Schema({
  nombre: {
    type: String,
    required: true
  },
  descripcion: {
    type: String
  },
  ingredientes: [ingredienteSchema],
  restaurante_id: {
    type: Schema.Types.ObjectId,
    ref: 'Restaurante',
    required: true
  },
  categoria_id: {
    type: Schema.Types.ObjectId,
    required: true
  },
  precio: {
    type: Number,
    required: true
  },
  estado: {
    type: String,
    enum: ['DISPONIBLE', 'AGOTADO'],
    default: 'DISPONIBLE'
  }
});


const Plato = mongoose.model('Plato', platoSchema);
module.exports = Plato;