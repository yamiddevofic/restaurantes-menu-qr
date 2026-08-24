const path = require('path');
const dotenv = require('dotenv');

// Carga .env desde backend/app/.env (ubicación actual del archivo)
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const NODE_ENV = process.env.NODE_ENV || 'development';
const isProd = NODE_ENV === 'production';

const requerida = (nombre) => {
    const valor = process.env[nombre];
    if (!valor) {
        throw new Error(
            `Falta la variable de entorno ${nombre}. Cópiala en backend/app/.env (ver backend/app/.env.example)`
        );
    }
    return valor;
};

let MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI && process.env.pass) {
    // Compatibilidad con el .env actual (solo desarrollo): la URI se arma desde la contraseña
    MONGO_URI = `mongodb+srv://yamiddev_db_user:${process.env.pass}@cluster-dev.loe0ymb.mongodb.net/qrta?appName=Cluster-Dev`;
}

const JWT_SECRET = process.env.JWT_SECRET || (!isProd ? 'qrta_dev_secret_no_usar_en_produccion' : null);

if (isProd && !JWT_SECRET) {
    throw new Error('En producción JWT_SECRET es obligatorio (backend/app/.env)');
}

// Varios orígenes permitidos separados por coma (ej: https://qrta.co,https://admin.qrta.co)
const FRONTEND_URLS = (process.env.FRONTEND_URL || 'http://localhost:5173')
    .split(',')
    .map((u) => u.trim())
    .filter(Boolean);

module.exports = {
    NODE_ENV,
    isProd,
    PORT: Number(process.env.PORT) || 3000,
    MONGO_URI: MONGO_URI || requerida('MONGO_URI'),
    JWT_SECRET,
    FRONTEND_URLS
};