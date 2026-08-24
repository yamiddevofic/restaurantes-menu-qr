const HistorialEliminacion = require('../models/HistorialEliminacion');
const Administrador = require('../models/Administrador');
const Empleado = require('../models/Empleado');
const Restaurante = require('../models/Restaurante');

// Borra definitivamente todo lo que superó los 30 días de espera.
// Además, si la entidad real sigue existiendo (ej. cuenta en estado BAJA),
// se elimina físicamente de la colección activa.
const purgar = async () => {
  try {
    const vencidos = await HistorialEliminacion.find({
      estado: 'PENDIENTE',
      fecha_eliminacion: { $lte: new Date() }
    });

    for (const h of vencidos) {
      try {
        if (h.entidad_tipo === 'admin') {
          const restaurantes = await Restaurante.find({ adm_id: h.entidad_ref });
          const restauranteIds = restaurantes.map((r) => r._id);
          await Empleado.deleteMany({ restaurante_id: { $in: restauranteIds } });
          await Restaurante.deleteMany({ adm_id: h.entidad_ref });
          await Administrador.findByIdAndDelete(h.entidad_ref);
        } else if (h.entidad_tipo === 'empleado') {
          await Empleado.findByIdAndDelete(h.entidad_ref);
        } else if (h.entidad_tipo === 'restaurante') {
          await Restaurante.findByIdAndDelete(h.entidad_ref);
        }
        h.estado = 'COMPLETADA';
        await h.save();
      } catch (err) {
        console.error(`Error purgando historial ${h._id}:`, err.message);
      }
    }

    if (vencidos.length > 0) {
      console.log(`Historial: ${vencidos.length} eliminación(es) definitiva(s) ejecutada(s)`);
    }
  } catch (err) {
    console.error('Error purgando historial:', err.message);
  }
};

const iniciar = () => {
  purgar(); // al arrancar el servidor
  setInterval(purgar, 6 * 60 * 60 * 1000); // cada 6 horas
};

module.exports = { iniciar };