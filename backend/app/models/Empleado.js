const mongoose = require('mongoose');
const { Schema } = mongoose;

const contactoSchema = new Schema({
  correo: { type: String },
  celular: { type: String }
}, { _id: false }); // sin _id propio, porque no es un elemento de lista

const empleadoSchema = new Schema({
  restaurante_id: {
    type: Schema.Types.ObjectId,
    ref: 'Restaurante',
    required: true
  },
  nombre: {
    type: String,
    required: true
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
  contacto: contactoSchema,
  rol: {
    type: String,
    enum: ['mesero', 'cocina'],
    required: true
  },
  estado: {
    type: String,
    enum: ['ACTIVO', 'INACTIVO', 'BAJA'],
    default: 'ACTIVO'
  }
});

const Empleado = mongoose.model('Empleado', empleadoSchema);
module.exports = Empleado;