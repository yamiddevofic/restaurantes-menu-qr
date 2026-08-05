const mongoose = require('mongoose');
const { Schema } = mongoose;

const platoPedidoSchema = new Schema({
  plato_id: {
    type: Schema.Types.ObjectId,
    ref: 'Plato'
  },
  nombre: {
    type: String,
    required: true
  },
  precio: {
    type: Number,
    required: true
  },
  cantidad: {
    type: Number,
    required: true
  }
}); 

const pedidoSchema = new Schema({
  mesa_id: {
    type: String,
    required: true
  },
  platos: [platoPedidoSchema],
  estado: {
    type: String,
    enum: ['PENDIENTE', 'CANCELADO', 'ELIMINADO', 'LISTO', 'ENTREGADO', 'DEVOLUCION'],
    default: 'PENDIENTE'
  },
  fecha_cierre: {
    type: Date
  },
  cliente_id: {
    type: Schema.Types.ObjectId,
    ref: 'Cliente'
  }
}, {
  timestamps: { createdAt: 'datetime_created', updatedAt: false }
});

const Pedido = mongoose.model('Pedido', pedidoSchema);
module.exports = Pedido;