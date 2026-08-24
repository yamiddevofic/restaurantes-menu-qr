const mongoose = require('mongoose');
const { Schema } = mongoose;

// Colección de historial de eliminaciones: cuando un usuario o restaurante
// solicita ser eliminado, NO se borra de la base: el registro se mueve aquí
// (snapshot) y se purga definitivamente 30 días después.
const historialEliminacionSchema = new Schema({
  entidad_tipo: {
    type: String,
    enum: ['admin', 'empleado', 'restaurante'],
    required: true
  },
  entidad_ref: {
    type: Schema.Types.ObjectId,
    required: true,
    index: true
  },
  snapshot: {
    type: Schema.Types.Mixed,
    required: true
  },
  fecha_solicitud: {
    type: Date,
    default: Date.now
  },
  fecha_eliminacion: {
    type: Date,
    required: true // fecha en que se borra definitivamente (solicitud + 30 días)
  },
  estado: {
    type: String,
    enum: ['PENDIENTE', 'COMPLETADA'],
    default: 'PENDIENTE',
    index: true
  }
});

const HistorialEliminacion = mongoose.model('HistorialEliminacion', historialEliminacionSchema);
module.exports = HistorialEliminacion;