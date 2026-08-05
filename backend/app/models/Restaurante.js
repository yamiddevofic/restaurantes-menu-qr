const mongoose = require('mongoose');
const { Schema } = mongoose;


const mesaSchema = new Schema({
  numero: {
    type: Number,
    required: true
  },
  qr_code: {
    type: String,
    required: true
  },
  qr_image: {
    type: String // Base64 de la imagen QR
  }
}); 

const categoriaSchema = new Schema({
  nombre: {
    type: String,
    required: true
  },
  descripcion: {
    type: String
  },
  fecha_creacion: {
    type: Date,
    default: Date.now
  }
}); 

const restauranteSchema = new Schema({
  nombre: {
    type: String,
    required: true
  },
  ubicacion: {
    type: String,
    required: true
  },
  adm_id: {
    type: Schema.Types.ObjectId,
    ref: 'Administrador',
    required: true
  },
  mesas: [mesaSchema],
  categorias: [categoriaSchema],
  fecha_creacion: {
    type: Date,
    default: Date.now
  }
});

const Restaurante = mongoose.model('Restaurante', restauranteSchema);
module.exports = Restaurante;