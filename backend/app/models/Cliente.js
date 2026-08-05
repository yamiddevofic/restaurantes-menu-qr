const mongoose = require('mongoose');
const { Schema } = mongoose;

// Subdocumento embebido: Contacto
const contactoSchema = new Schema({
  celular: {
    type: String
  },
  correo: {
    type: String
  }
}, {_id: false});

const clienteSchema = new Schema({
  nombre: {
    type: String,
    required: true
  },
  cedula: {
    type: String,
    required: true,
    unique: true
  },
  contacto: contactoSchema,
  estado: {
    type: String,
    enum: ['ACTIVO', 'INACTIVO'],
    default: 'ACTIVO'
  }
});

const Cliente = mongoose.model('Cliente', clienteSchema);
module.exports = Cliente;
