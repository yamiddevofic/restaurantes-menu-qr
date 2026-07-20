require('dotenv').config();

const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const http = require('http');
const os = require('os');
const { Server } = require('socket.io');

const authRoutes = require('./routes/auth');
const { router: publicRoutes } = require('./routes/public');
const kitchenRoutes = require('./routes/kitchen');
const adminRoutes = require('./routes/admin');
const { attachSockets } = require('./sockets');

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 3000;

/* ---------- Auto-detectar IP local para BASE_URL ---------- */
if (!process.env.BASE_URL) {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        process.env.BASE_URL = `http://${iface.address}:${PORT}`;
        break;
      }
    }
    if (process.env.BASE_URL) break;
  }
  if (!process.env.BASE_URL) {
    process.env.BASE_URL = `http://localhost:${PORT}`;
  }
  console.log(`BASE_URL auto-detectada: ${process.env.BASE_URL}`);
}
const corsOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:3000').split(',').map((s) => s.trim()).filter(Boolean);

const io = new Server(server, {
  cors: {
    origin: corsOrigins.length ? corsOrigins : ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  },
});
app.set('io', io);
attachSockets(io);

/* ---------- Seguridad y utilidades base ---------- */
app.use(helmet({
  contentSecurityPolicy: false, // el front usa scripts propios servidos localmente; ajustar si se agregan CDNs
}));
app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(cookieParser());
app.use(express.json({ limit: '200kb' }));
app.use(
  cors({
    origin: corsOrigins.length ? corsOrigins : ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  })
);

// Limite general anti-abuso sobre toda la API
const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', globalLimiter);

/* ---------- Rutas API ---------- */
app.use('/api/auth', authRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/kitchen', kitchenRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (req, res) => res.json({ ok: true, time: new Date().toISOString() }));

/* ---------- Frontend estatico (para desarrollo) ---------- */
// En producción, el frontend se servirá desde el build de React
app.use('/data', express.static(path.join(__dirname, '..', 'public', 'data')));

/* ---------- Manejo de errores ---------- */
app.use((req, res) => {
  res.status(404).json({ error: 'No encontrado' });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

server.listen(PORT, '0.0.0.0', () => {
  const localIP = process.env.BASE_URL.replace(/^https?:\/\//, '').replace(/:\d+$/, '');
  
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log(`Red local:   http://${localIP}:${PORT}`);
  console.log(`Admin:       http://${localIP}:${PORT}/admin`);
  console.log(`Cocina:      http://${localIP}:${PORT}/kitchen`);
  console.log(`Base URL:    ${process.env.BASE_URL}`);
});
