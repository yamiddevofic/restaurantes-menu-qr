const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'qrta_secret_key';

const authMiddleware = (req, res, next) => {
    const header = req.headers.authorization;

    if (!header || !header.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No autorizado: token no proporcionado' });
    }

    const token = header.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'No autorizado: token inválido o expirado' });
    }
};

module.exports = authMiddleware;