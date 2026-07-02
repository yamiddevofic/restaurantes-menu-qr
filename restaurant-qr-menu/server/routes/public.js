const express = require('express');
const rateLimit = require('express-rate-limit');
const { body, param, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { loadRestaurantBySlug, loadTableByToken } = require('../middleware/auth');

const router = express.Router();

const ORDER_RATE_LIMIT_MAX = parseInt(process.env.ORDER_RATE_LIMIT_MAX || '5', 10);
const ORDER_RATE_LIMIT_WINDOW_MIN = parseInt(process.env.ORDER_RATE_LIMIT_WINDOW_MIN || '10', 10);

// Evita que una misma mesa/dispositivo inunde de pedidos (spam o doble-click).
// No limita entre mesas distintas, asi que un pico de clientes reales no se ve afectado.
const orderLimiter = rateLimit({
  windowMs: ORDER_RATE_LIMIT_WINDOW_MIN * 60 * 1000,
  limit: ORDER_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => `${req.params.slug}:${req.params.tableToken}`,
  message: { error: 'Has enviado demasiados pedidos seguidos. Espera un momento o llama al mesero.' },
});

// GET /api/public/menu/:slug/:tableToken -> menu visible para esa mesa
router.get(
  '/menu/:slug/:tableToken',
  loadRestaurantBySlug,
  loadTableByToken,
  (req, res) => {
    const categories = db.prepare(
      'SELECT id, name, sort_order FROM categories WHERE restaurant_id = ? AND active = 1 ORDER BY sort_order, name'
    ).all(req.restaurant.id);

    const items = db.prepare(
      'SELECT id, category_id, name, description, price, image_url, sort_order ' +
      'FROM menu_items WHERE restaurant_id = ? AND available = 1 ORDER BY sort_order, name'
    ).all(req.restaurant.id);

    res.json({
      restaurant: { name: req.restaurant.name, currency: req.restaurant.currency },
      table: { number: req.table.table_number },
      categories,
      items,
    });
  }
);

// POST /api/public/orders/:slug/:tableToken -> crea un pedido
router.post(
  '/orders/:slug/:tableToken',
  orderLimiter,
  loadRestaurantBySlug,
  loadTableByToken,
  [
    body('items').isArray({ min: 1, max: 50 }).withMessage('El pedido debe tener al menos un plato'),
    body('items.*.menu_item_id').isInt({ min: 1 }),
    body('items.*.quantity').isInt({ min: 1, max: 50 }),
    body('items.*.note').optional({ nullable: true }).isString().isLength({ max: 300 }).trim().escape(),
    body('customer_note').optional({ nullable: true }).isString().isLength({ max: 300 }).trim().escape(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Pedido invalido', details: errors.array() });
    }

    const { items, customer_note } = req.body;
    const restaurantId = req.restaurant.id;

    // Trae los items reales de la BD para validar precio y disponibilidad (nunca confiar en el precio del cliente)
    const ids = [...new Set(items.map((i) => i.menu_item_id))];
    const placeholders = ids.map(() => '?').join(',');
    const dbItems = db.prepare(
      `SELECT id, name, price, available FROM menu_items WHERE restaurant_id = ? AND id IN (${placeholders})`
    ).all(restaurantId, ...ids);

    const itemMap = new Map(dbItems.map((i) => [i.id, i]));

    for (const line of items) {
      const dbItem = itemMap.get(line.menu_item_id);
      if (!dbItem || !dbItem.available) {
        return res.status(400).json({ error: `Uno de los platos ya no esta disponible. Actualiza el menu.` });
      }
    }

    const orderCode = uuidv4().split('-')[0].toUpperCase();

    const insertOrder = db.prepare(
      'INSERT INTO orders (restaurant_id, table_id, status, customer_note, total, order_code) VALUES (?, ?, ?, ?, ?, ?)'
    );
    const insertItem = db.prepare(
      'INSERT INTO order_items (order_id, menu_item_id, name_snapshot, price_snapshot, quantity, item_note) VALUES (?, ?, ?, ?, ?, ?)'
    );

    const createOrder = db.transaction(() => {
      let total = 0;
      const info = insertOrder.run(restaurantId, req.table.id, 'pending', customer_note || '', 0, orderCode);
      const orderId = info.lastInsertRowid;

      for (const line of items) {
        const dbItem = itemMap.get(line.menu_item_id);
        const lineTotal = dbItem.price * line.quantity;
        total += lineTotal;
        insertItem.run(orderId, dbItem.id, dbItem.name, dbItem.price, line.quantity, line.note || '');
      }

      db.prepare('UPDATE orders SET total = ? WHERE id = ?').run(total, orderId);
      return { orderId, total };
    });

    const { orderId, total } = createOrder();

    const fullOrder = buildOrderPayload(orderId);

    // Notifica al dashboard de cocina en tiempo real
    const io = req.app.get('io');
    if (io) {
      io.to(`kitchen:${restaurantId}`).emit('new_order', fullOrder);
    }

    res.status(201).json({
      ok: true,
      order: { id: orderId, code: orderCode, total, status: 'pending' },
    });
  }
);

// GET /api/public/orders/:slug/:tableToken/:orderId -> estado del pedido (solo si es de esa mesa)
router.get(
  '/orders/:slug/:tableToken/:orderId',
  loadRestaurantBySlug,
  loadTableByToken,
  param('orderId').isInt({ min: 1 }),
  (req, res) => {
    const order = db.prepare(
      'SELECT id, status, total, order_code, created_at, updated_at FROM orders WHERE id = ? AND table_id = ? AND restaurant_id = ?'
    ).get(req.params.orderId, req.table.id, req.restaurant.id);

    if (!order) return res.status(404).json({ error: 'Pedido no encontrado' });
    res.json({ order });
  }
);

function buildOrderPayload(orderId) {
  const order = db.prepare(
    'SELECT o.*, t.table_number FROM orders o JOIN tables t ON t.id = o.table_id WHERE o.id = ?'
  ).get(orderId);
  const items = db.prepare(
    'SELECT id, name_snapshot as name, price_snapshot as price, quantity, item_note FROM order_items WHERE order_id = ?'
  ).all(orderId);
  return { ...order, items };
}

module.exports = { router, buildOrderPayload };
