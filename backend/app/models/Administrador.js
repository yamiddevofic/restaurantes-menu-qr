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
  telefono: {
    type: String
  },
  bio: {
    type: String
  },
  avatar: {
    type: String
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
  plan_vencimiento: {
    type: Date
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