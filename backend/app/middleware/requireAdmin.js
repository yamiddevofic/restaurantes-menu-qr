// Restringe una ruta a administradores autenticados (va después de authMiddleware)
const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.tipo !== 'admin') {
        return res.status(403).json({ message: 'Solo administradores' });
    }
    next();
};

module.exports = requireAdmin;