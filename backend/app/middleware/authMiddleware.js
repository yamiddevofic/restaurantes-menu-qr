const jwt = require('jsonwebtoken');
const env = require('../config/env');

const authMiddleware = (req, res, next) => {
    const header = req.headers.authorization;

    if (!header || !header.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No autorizado: token no proporcionado' });
    }

    const token = header.split(' ')[1];

    try {
        const decoded = jwt.verify(token, env.JWT_SECRET, { algorithms: ['HS256'] });
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'No autorizado: token inválido o expirado' });
    }
};

module.exports = authMiddleware;