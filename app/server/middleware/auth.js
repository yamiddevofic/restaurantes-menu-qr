const { verifyToken } = require('../utils/auth');
const db = require('../db');

/**
 * Exige sesion valida (cookie httpOnly "session"). Adjunta req.user = { id, restaurant_id, role, username }
 */
function requireAuth(req, res, next) {
  const token = req.cookies && req.cookies.session;
  if (!token) return res.status(401).json({ error: 'No autenticado' });

  try {
    const payload = verifyToken(token);
    const user = db.prepare(
      'SELECT id, restaurant_id, role, username, active FROM users WHERE id = ?'
    ).get(payload.sub);

    if (!user || !user.active) {
      return res.status(401).json({ error: 'Sesion invalida' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Sesion invalida o expirada' });
  }
}

/**
 * Exige que el usuario tenga uno de los roles permitidos.
 * Usar despues de requireAuth.
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'No tienes permiso para esta accion' });
    }
    next();
  };
}

/**
 * Carga el restaurante activo por slug en req.restaurant. Usado en rutas publicas.
 */
function loadRestaurantBySlug(req, res, next) {
  const { slug } = req.params;
  const restaurant = db.prepare(
    'SELECT id, name, slug, active, currency FROM restaurants WHERE slug = ?'
  ).get(slug);

  if (!restaurant || !restaurant.active) {
    return res.status(404).json({ error: 'Restaurante no encontrado' });
  }
  req.restaurant = restaurant;
  next();
}

/**
 * Valida que el token de la mesa pertenezca al restaurante cargado (req.restaurant).
 */
function loadTableByToken(req, res, next) {
  const { tableToken } = req.params;
  const table = db.prepare(
    'SELECT id, restaurant_id, table_number, active FROM tables WHERE qr_token = ?'
  ).get(tableToken);

  if (!table || !table.active || table.restaurant_id !== req.restaurant.id) {
    return res.status(404).json({ error: 'Mesa no encontrada o codigo QR invalido' });
  }
  req.table = table;
  next();
}

module.exports = { requireAuth, requireRole, loadRestaurantBySlug, loadTableByToken };
