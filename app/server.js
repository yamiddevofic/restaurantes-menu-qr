const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");

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

dotenv.config();
const URI = process.env.MONGO_URI || `mongodb+srv://yamiddev_db_user:${process.env.pass}@cluster-dev.loe0ymb.mongodb.net/qrta?appName=Cluster-Dev`;

mongoose.connect(URI);
const db = mongoose.connection;

db.addListener('error', (err) => {
  console.error('Error connecting to MongoDB:', err);
});

db.addListener('open', () => {
  console.log('Connected to MongoDB');
});

const app = express();
app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec)
);


const PORT = process.env.PORT || 3000;

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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
