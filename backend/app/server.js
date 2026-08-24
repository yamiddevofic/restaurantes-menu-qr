const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const env = require('./config/env');
const { notFound, errorHandler } = require('./middleware/errorHandler');

// Importar rutas
const adminRoute = require('./routes/adminRoutes');
const empleadoRoute = require('./routes/empleadoRoutes');
const clienteRoute = require('./routes/clienteRoutes');
const pedidoRoute = require('./routes/pedidoRoutes');
const platoRoute = require('./routes/platoRoutes');
const restauranteRoute = require('./routes/restauranteRoutes');
const reporteRoute = require('./routes/reporteRoutes');
const fidelizacionRoute = require('./routes/fidelizacionRoutes');
const authRoute = require('./routes/authRoutes');
const statsRoute = require('./routes/statsRoutes');
const { iniciar: iniciarPurgaHistorial } = require('./jobs/purgarHistorial');

mongoose.connect(env.MONGO_URI);
const db = mongoose.connection;

db.addListener('error', (err) => {
    console.error('Error connecting to MongoDB:', err);
});

db.addListener('open', () => {
    console.log('Connected to MongoDB');
});

const app = express();

// Confianza detrás de proxies (necesario para rate limiting en hosting)
app.set('trust proxy', 1);

// Headers de seguridad (CSP, X-Frame-Options, etc.)
app.use(helmet());

// CORS: en desarrollo se refleja cualquier origen (probar desde el celular en
// la LAN); en producción solo se permite la lista configurada (FRONTEND_URL).
const corsOptions = env.isProd
    ? { origin: env.FRONTEND_URLS }
    : { origin: true };
app.use(cors(corsOptions));

app.use(morgan(env.isProd ? 'combined' : 'dev'));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(express.json({ limit: '1mb' }));

// Límites de peticiones por IP
app.use(
    '/api',
    rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutos
        limit: 300,
        standardHeaders: 'draft-7',
        legacyHeaders: false,
        message: { message: 'Demasiadas peticiones, intenta de nuevo en unos minutos' }
    })
);
// Límite estricto para login (evitar fuerza bruta)
app.use(
    '/api/auth/login',
    rateLimit({
        windowMs: 15 * 60 * 1000,
        limit: 10,
        standardHeaders: 'draft-7',
        legacyHeaders: false,
        message: { message: 'Demasiados intentos de inicio de sesión, espera 15 minutos' }
    })
);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'views')));

// Montar rutas de la API
app.use('/api/administradores', adminRoute);
app.use('/api/empleados', empleadoRoute);
app.use('/api/clientes', clienteRoute);
app.use('/api/pedidos', pedidoRoute);
app.use('/api/platos', platoRoute);
app.use('/api/restaurantes', restauranteRoute);
app.use('/api/reportes', reporteRoute);
app.use('/api/fidelizacion', fidelizacionRoute);
app.use('/api/auth', authRoute);
app.use('/api/stats', statsRoute);

// 404 y manejo central de errores
app.use(notFound);
app.use(errorHandler);

app.listen(env.PORT, () => {
    console.log(`Server is running on port ${env.PORT}`);
    // Eliminación diferida: purga historial vencido (30 días) al arrancar y cada 6 h
    iniciarPurgaHistorial();
});