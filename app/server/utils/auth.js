const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '12h';

if (!process.env.JWT_SECRET) {
  console.warn(
    '[AVISO DE SEGURIDAD] JWT_SECRET no esta configurado. ' +
    'Configura un secreto unico y largo en tu archivo .env antes de ir a produccion.'
  );
}

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

module.exports = { signToken, verifyToken, JWT_SECRET };
