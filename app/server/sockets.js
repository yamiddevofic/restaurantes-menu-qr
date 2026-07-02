const cookie = require('cookie');
const { verifyToken } = require('./utils/auth');
const db = require('./db');

function attachSockets(io) {
  io.use((socket, next) => {
    try {
      const rawCookies = socket.handshake.headers.cookie || '';
      const parsed = cookie.parse(rawCookies);
      const token = parsed.session;

      // Clientes publicos (mesa) pueden conectarse sin sesion, solo para ver el estado de SU pedido.
      if (!token) {
        socket.data.authenticated = false;
        return next();
      }

      const payload = verifyToken(token);
      const user = db.prepare('SELECT id, restaurant_id, role FROM users WHERE id = ?').get(payload.sub);
      if (user) {
        socket.data.authenticated = true;
        socket.data.user = user;
      } else {
        socket.data.authenticated = false;
      }
      next();
    } catch (e) {
      socket.data.authenticated = false;
      next();
    }
  });

  io.on('connection', (socket) => {
    // El dashboard de cocina se une a la sala de su restaurante
    socket.on('join_kitchen', () => {
      if (socket.data.authenticated && ['admin', 'cocina'].includes(socket.data.user.role)) {
        socket.join(`kitchen:${socket.data.user.restaurant_id}`);
        socket.emit('joined_kitchen', { ok: true });
      } else {
        socket.emit('joined_kitchen', { ok: false, error: 'No autorizado' });
      }
    });

    // El cliente en la mesa puede seguir el estado de un pedido especifico
    socket.on('join_order', (orderId) => {
      const id = parseInt(orderId, 10);
      if (Number.isInteger(id) && id > 0) {
        socket.join(`order:${id}`);
      }
    });
  });
}

module.exports = { attachSockets };
