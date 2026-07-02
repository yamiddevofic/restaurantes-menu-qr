const express = require('express');
const { body, param, validationResult } = require('express-validator');
const QRCode = require('qrcode');
const crypto = require('crypto');
const db = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth, requireRole('admin'));

function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: 'Datos invalidos', details: errors.array() });
  next();
}

/* ---------- Categorias ---------- */

router.get('/categories', (req, res) => {
  const rows = db.prepare(
    'SELECT * FROM categories WHERE restaurant_id = ? ORDER BY sort_order, name'
  ).all(req.user.restaurant_id);
  res.json({ categories: rows });
});

router.post(
  '/categories',
  [body('name').trim().isLength({ min: 1, max: 100 }).escape(), body('sort_order').optional().isInt()],
  handleValidation,
  (req, res) => {
    const info = db.prepare(
      'INSERT INTO categories (restaurant_id, name, sort_order) VALUES (?, ?, ?)'
    ).run(req.user.restaurant_id, req.body.name, req.body.sort_order || 0);
    res.status(201).json({ id: info.lastInsertRowid });
  }
);

router.put(
  '/categories/:id',
  [param('id').isInt(), body('name').trim().isLength({ min: 1, max: 100 }).escape(), body('sort_order').optional().isInt(), body('active').optional().isBoolean()],
  handleValidation,
  (req, res) => {
    const existing = db.prepare('SELECT id FROM categories WHERE id = ? AND restaurant_id = ?').get(req.params.id, req.user.restaurant_id);
    if (!existing) return res.status(404).json({ error: 'Categoria no encontrada' });

    db.prepare('UPDATE categories SET name = ?, sort_order = ?, active = ? WHERE id = ?')
      .run(req.body.name, req.body.sort_order ?? 0, req.body.active === undefined ? 1 : (req.body.active ? 1 : 0), req.params.id);
    res.json({ ok: true });
  }
);

router.delete('/categories/:id', param('id').isInt(), handleValidation, (req, res) => {
  const existing = db.prepare('SELECT id FROM categories WHERE id = ? AND restaurant_id = ?').get(req.params.id, req.user.restaurant_id);
  if (!existing) return res.status(404).json({ error: 'Categoria no encontrada' });
  db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

/* ---------- Platos (menu items) ---------- */

router.get('/menu-items', (req, res) => {
  const rows = db.prepare(
    'SELECT * FROM menu_items WHERE restaurant_id = ? ORDER BY sort_order, name'
  ).all(req.user.restaurant_id);
  res.json({ items: rows });
});

const menuItemValidators = [
  body('name').trim().isLength({ min: 1, max: 150 }).escape(),
  body('description').optional({ nullable: true }).isString().isLength({ max: 500 }).trim().escape(),
  body('price').isFloat({ min: 0, max: 100000000 }),
  body('category_id').optional({ nullable: true }).isInt(),
  body('image_url').optional({ nullable: true }).isString().isLength({ max: 500 }).trim(),
  body('available').optional().isBoolean(),
  body('sort_order').optional().isInt(),
];

router.post('/menu-items', menuItemValidators, handleValidation, (req, res) => {
  const { name, description, price, category_id, image_url, sort_order } = req.body;
  const info = db.prepare(
    `INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, available, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, 1, ?)`
  ).run(req.user.restaurant_id, category_id || null, name, description || '', price, image_url || '', sort_order || 0);
  res.status(201).json({ id: info.lastInsertRowid });
});

router.put('/menu-items/:id', [param('id').isInt(), ...menuItemValidators], handleValidation, (req, res) => {
  const existing = db.prepare('SELECT id FROM menu_items WHERE id = ? AND restaurant_id = ?').get(req.params.id, req.user.restaurant_id);
  if (!existing) return res.status(404).json({ error: 'Plato no encontrado' });

  const { name, description, price, category_id, image_url, available, sort_order } = req.body;
  db.prepare(
    `UPDATE menu_items SET name=?, description=?, price=?, category_id=?, image_url=?, available=?, sort_order=? WHERE id = ?`
  ).run(name, description || '', price, category_id || null, image_url || '', available === undefined ? 1 : (available ? 1 : 0), sort_order || 0, req.params.id);
  res.json({ ok: true });
});

router.delete('/menu-items/:id', param('id').isInt(), handleValidation, (req, res) => {
  const existing = db.prepare('SELECT id FROM menu_items WHERE id = ? AND restaurant_id = ?').get(req.params.id, req.user.restaurant_id);
  if (!existing) return res.status(404).json({ error: 'Plato no encontrado' });
  db.prepare('DELETE FROM menu_items WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

// Atajo rapido para 8-a-6 marcar agotado/disponible en un click
router.patch('/menu-items/:id/toggle-available', param('id').isInt(), handleValidation, (req, res) => {
  const existing = db.prepare('SELECT id, available FROM menu_items WHERE id = ? AND restaurant_id = ?').get(req.params.id, req.user.restaurant_id);
  if (!existing) return res.status(404).json({ error: 'Plato no encontrado' });
  const newVal = existing.available ? 0 : 1;
  db.prepare('UPDATE menu_items SET available = ? WHERE id = ?').run(newVal, req.params.id);
  res.json({ ok: true, available: !!newVal });
});

/* ---------- Mesas / QR ---------- */

router.get('/tables', (req, res) => {
  const rows = db.prepare('SELECT * FROM tables WHERE restaurant_id = ? ORDER BY table_number').all(req.user.restaurant_id);
  const restaurant = db.prepare('SELECT slug FROM restaurants WHERE id = ?').get(req.user.restaurant_id);
  const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
  const withUrls = rows.map((t) => ({
    ...t,
    menu_url: `${baseUrl}/menu/${restaurant.slug}/${t.qr_token}`,
  }));
  res.json({ tables: withUrls });
});

router.post('/tables', [body('table_number').trim().isLength({ min: 1, max: 20 }).escape()], handleValidation, (req, res) => {
  const token = crypto.randomBytes(16).toString('hex');
  try {
    const info = db.prepare(
      'INSERT INTO tables (restaurant_id, table_number, qr_token) VALUES (?, ?, ?)'
    ).run(req.user.restaurant_id, req.body.table_number, token);
    res.status(201).json({ id: info.lastInsertRowid, qr_token: token });
  } catch (e) {
    if (String(e.message).includes('UNIQUE')) {
      return res.status(409).json({ error: 'Ya existe una mesa con ese numero' });
    }
    throw e;
  }
});

router.delete('/tables/:id', param('id').isInt(), handleValidation, (req, res) => {
  const existing = db.prepare('SELECT id FROM tables WHERE id = ? AND restaurant_id = ?').get(req.params.id, req.user.restaurant_id);
  if (!existing) return res.status(404).json({ error: 'Mesa no encontrada' });
  db.prepare('DELETE FROM tables WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

// Regenerar el token de una mesa (si el QR se filtro o se daño el afiche)
router.post('/tables/:id/regenerate-qr', param('id').isInt(), handleValidation, (req, res) => {
  const existing = db.prepare('SELECT id FROM tables WHERE id = ? AND restaurant_id = ?').get(req.params.id, req.user.restaurant_id);
  if (!existing) return res.status(404).json({ error: 'Mesa no encontrada' });
  const token = crypto.randomBytes(16).toString('hex');
  db.prepare('UPDATE tables SET qr_token = ? WHERE id = ?').run(token, req.params.id);
  res.json({ ok: true, qr_token: token });
});

// Devuelve la imagen PNG del QR para imprimir
router.get('/tables/:id/qr.png', param('id').isInt(), handleValidation, async (req, res) => {
  const table = db.prepare('SELECT * FROM tables WHERE id = ? AND restaurant_id = ?').get(req.params.id, req.user.restaurant_id);
  if (!table) return res.status(404).json({ error: 'Mesa no encontrada' });

  const restaurant = db.prepare('SELECT slug FROM restaurants WHERE id = ?').get(req.user.restaurant_id);
  const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
  const url = `${baseUrl}/menu/${restaurant.slug}/${table.qr_token}`;

  res.setHeader('Content-Type', 'image/png');
  QRCode.toFileStream(res, url, { width: 500, margin: 2 });
});

module.exports = router;
