const express = require('express');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const db = require('../db');
const { signToken } = require('../utils/auth');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Anti fuerza-bruta en login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos. Intenta de nuevo en unos minutos.' },
});

router.post(
  '/login',
  loginLimiter,
  [
    body('username').trim().isLength({ min: 1, max: 100 }).escape(),
    body('password').isLength({ min: 1, max: 200 }),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Usuario o contrasena invalidos' });
    }

    const { username, password } = req.body;

    const user = db.prepare(
      'SELECT u.*, r.slug as restaurant_slug, r.name as restaurant_name FROM users u ' +
      'JOIN restaurants r ON r.id = u.restaurant_id ' +
      'WHERE u.username = ? AND u.active = 1'
    ).get(username);

    // Mensaje generico para no revelar si el usuario existe
    const genericError = () => res.status(401).json({ error: 'Usuario o contrasena incorrectos' });

    if (!user) return genericError();

    const ok = bcrypt.compareSync(password, user.password_hash);
    if (!ok) return genericError();

    const token = signToken({ sub: user.id, role: user.role, restaurant_id: user.restaurant_id });

    res.cookie('session', token, {
      httpOnly: true,
      secure: false, // false en desarrollo para permitir acceso desde IP
      sameSite: 'lax',
      maxAge: 12 * 60 * 60 * 1000,
    });

    res.json({
      ok: true,
      user: {
        username: user.username,
        role: user.role,
        restaurant_slug: user.restaurant_slug,
        restaurant_name: user.restaurant_name,
      },
    });
  }
);

router.post('/logout', (req, res) => {
  res.clearCookie('session');
  res.json({ ok: true });
});

router.get('/me', requireAuth, (req, res) => {
  const restaurant = db.prepare('SELECT name, slug FROM restaurants WHERE id = ?').get(req.user.restaurant_id);
  res.json({
    username: req.user.username,
    role: req.user.role,
    restaurant,
  });
});

module.exports = router;
