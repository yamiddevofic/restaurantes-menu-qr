const express = require('express');
const { param, body, validationResult } = require('express-validator');
const db = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');
const { buildOrderPayload } = require('./public');

const router = express.Router();

router.use(requireAuth, requireRole('admin', 'cocina'));

// GET /api/kitchen/orders?status=pending,preparing
router.get('/orders', (req, res) => {
  const statusFilter = (req.query.status || 'pending,preparing,ready')
    .split(',')
    .map((s) => s.trim())
    .filter((s) => ['pending', 'preparing', 'ready', 'delivered', 'cancelled'].includes(s));

  if (statusFilter.length === 0) return res.json({ orders: [] });

  const placeholders = statusFilter.map(() => '?').join(',');
  const orders = db.prepare(
    `SELECT o.*, t.table_number FROM orders o JOIN tables t ON t.id = o.table_id
     WHERE o.restaurant_id = ? AND o.status IN (${placeholders})
     ORDER BY o.created_at ASC`
  ).all(req.user.restaurant_id, ...statusFilter);

  const orderIds = orders.map((o) => o.id);
  let itemsByOrder = {};
  if (orderIds.length) {
    const ph = orderIds.map(() => '?').join(',');
    const allItems = db.prepare(
      `SELECT order_id, id, name_snapshot as name, price_snapshot as price, quantity, item_note
       FROM order_items WHERE order_id IN (${ph})`
    ).all(...orderIds);
    itemsByOrder = allItems.reduce((acc, it) => {
      (acc[it.order_id] = acc[it.order_id] || []).push(it);
      return acc;
    }, {});
  }

  const result = orders.map((o) => ({ ...o, items: itemsByOrder[o.id] || [] }));
  res.json({ orders: result });
});

const VALID_TRANSITIONS = {
  pending: ['preparing', 'cancelled'],
  preparing: ['ready', 'cancelled'],
  ready: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
};

// PATCH /api/kitchen/orders/:id/status
router.patch(
  '/orders/:id/status',
  [
    param('id').isInt({ min: 1 }),
    body('status').isIn(['pending', 'preparing', 'ready', 'delivered', 'cancelled']),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: 'Datos invalidos' });

    const order = db.prepare(
      'SELECT * FROM orders WHERE id = ? AND restaurant_id = ?'
    ).get(req.params.id, req.user.restaurant_id);

    if (!order) return res.status(404).json({ error: 'Pedido no encontrado' });

    const allowed = VALID_TRANSITIONS[order.status] || [];
    if (!allowed.includes(req.body.status)) {
      return res.status(409).json({ error: `No se puede pasar de "${order.status}" a "${req.body.status}"` });
    }

    db.prepare('UPDATE orders SET status = ?, updated_at = datetime(\'now\') WHERE id = ?')
      .run(req.body.status, order.id);

    const updated = buildOrderPayload(order.id);

    const io = req.app.get('io');
    if (io) {
      io.to(`kitchen:${req.user.restaurant_id}`).emit('order_updated', updated);
      io.to(`order:${order.id}`).emit('order_updated', updated);
    }

    res.json({ ok: true, order: updated });
  }
);

module.exports = router;
