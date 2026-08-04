const mongoose = require('mongoose');
const { Schema } = mongoose;

const administradorSchema = new Schema({
  nombre: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  usuario: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  plan: {
    type: String,
    enum: ['free', 'pro'],
    default: 'free'
  },
  fecha_registro: {
    type: Date,
    default: Date.now
  },
  estado: {
    type: String,
    enum: ['ACTIVO', 'INACTIVO', 'BAJA'],
    default: 'ACTIVO'
  }
});

const Administrador = mongoose.model('Administrador', administradorSchema);
module.exports = Administrador;