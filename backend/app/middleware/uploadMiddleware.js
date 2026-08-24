const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Solo imágenes reales: se valida la extensión Y el mimetype (el mimetype
// solo no es confiable porque el cliente puede enviarlo a mano).
const TIPOS_PERMITIDOS = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
    '.avif': 'image/avif'
};

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

// Las imágenes se guardan en public/uploads (platos y perfiles), que Express
// ya sirve de forma estática (ver server.js), así el frontend puede mostrarlas
// sin necesidad de una ruta especial.
const makeStorage = (subdir) => {
    const dir = path.join(__dirname, '..', 'public', 'uploads', subdir);
    fs.mkdirSync(dir, { recursive: true });

    const storage = multer.diskStorage({
        destination: (req, file, cb) => cb(null, dir),
        filename: (req, file, cb) => {
            const ext = path.extname(file.originalname).toLowerCase();
            // ext ya fue validado por fileFilter; por seguridad se usa el real
            const name = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;
            cb(null, name);
        }
    });

    return multer({
        storage,
        fileFilter: (req, file, cb) => {
            const ext = path.extname(file.originalname).toLowerCase();
            if (TIPOS_PERMITIDOS[ext] && TIPOS_PERMITIDOS[ext] === file.mimetype) {
                return cb(null, true);
            }
            cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'Solo se permiten imágenes (jpg, png, webp, gif, avif)'));
        },
        limits: { fileSize: MAX_SIZE }
    });
};

// Solo se usa en rutas donde la imagen es opcional
const uploadPlatoImagen = makeStorage('platos').single('imagen');
const uploadAvatar = makeStorage('perfiles').single('avatar');

module.exports = { uploadPlatoImagen, uploadAvatar, MAX_SIZE };