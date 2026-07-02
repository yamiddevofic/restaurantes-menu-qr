const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '12h';

if (!JWT_SECRET || JWT_SECRET === 'CAMBIA_ESTO_POR_UN_SECRETO_LARGO_Y_UNICO') {
  console.warn(
    '[AVISO DE SEGURIDAD] JWT_SECRET no esta configurado o usa el valor por defecto. ' +
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
