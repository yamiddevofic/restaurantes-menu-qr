# QRTA — Sistema de Gestión de Restaurantes

Sistema completo de gestión de restaurantes con menú digital por código QR. Backend API con Node.js, Express y MongoDB; frontend moderno con React y Tailwind CSS.

## Características

- **Gestión de Administradores**: CRUD completo con autenticación y control de estados
- **Gestión de Empleados**: Administración del personal con roles (mesero/cocina)
- **Gestión de Clientes**: Base de datos de clientes
- **Sistema de Pedidos**: Gestión completa con estados (PENDIENTE → LISTO → ENTREGADO)
- **Gestión de Platos**: Catálogo de platos con precios, ingredientes y disponibilidad
- **Gestión de Restaurantes**: Multi-restaurante con menú propio
- **Gestión de Mesas**: CRUD con generación automática de códigos QR
- **Gestión de Categorías**: Organización del menú por categorías
- **Menú Digital**: Endpoint para comensales que escanean el QR de la mesa
- **Reportes**: Generación automática de reportes diarios
- **Fidelización**: Programa de puntos y recompensas para clientes
- **Autenticación**: Login para administradores y empleados con bcrypt
- **CORS**: Configurado para desarrollo con frontend en puerto separado

## Tecnologías

### Backend (`app/`)
- **Node.js** + **Express** — Framework web
- **MongoDB** + **Mongoose** — Base de datos NoSQL
- **bcrypt** — Encriptación de contraseñas
- **qrcode** — Generación de códigos QR en base64
- **cors** — Habilitación de CORS
- **morgan** — Logger de solicitudes HTTP
- **swagger-ui-express** — Documentación API

### Frontend (`frontend/`)
- **React 19** — Biblioteca de interfaces
- **Vite** — Build tool
- **Tailwind CSS 4** — Estilos utility-first
- **React Router** — Enrutamiento SPA

## Estructura del Proyecto

```
restaurante-qr/
├── app/                          # Backend API
│   ├── controllers/              # Lógica de negocio
│   │   ├── Admin.Controller.js
│   │   ├── Auth.Controller.js    # Login admin/empleado
│   │   ├── Cliente.Controller.js
│   │   ├── Empleado.Controller.js
│   │   ├── Fidelizacion.Controller.js
│   │   ├── Pedido.Controller.js
│   │   ├── Plato.Controller.js
│   │   ├── Reporte.Controller.js
│   │   └── Restaurante.Controller.js
│   ├── models/                   # Schemas de Mongoose
│   │   ├── Administrador.js
│   │   ├── Cliente.js
│   │   ├── Empleado.js
│   │   ├── Fidelizacion.js
│   │   ├── Pedido.js
│   │   ├── Plato.js
│   │   ├── Reporte.js
│   │   └── Restaurante.js
│   ├── routes/                   # Rutas de la API
│   │   ├── adminRoutes.js
│   │   ├── authRoutes.js         # POST /api/auth/login
│   │   ├── clienteRoutes.js
│   │   ├── empleadoRoutes.js
│   │   ├── fidelizacionRoutes.js
│   │   ├── pedidoRoutes.js
│   │   ├── platoRoutes.js
│   │   ├── reporteRoutes.js
│   │   └── restauranteRoutes.js
│   ├── config/
│   │   └── swagger.js
│   ├── .env
│   ├── package.json
│   ├── server.js
│   └── README.md
├── frontend/                     # Aplicación React
│   ├── src/
│   │   ├── App.jsx               # Landing page
│   │   ├── main.jsx              # Router principal
│   │   ├── index.css
│   │   ├── pages/
│   │   │   ├── Login.jsx         # Login admin/empleado
│   │   │   └── Registro.jsx      # Registro multipaso
│   │   └── assets/
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## Instalación

### Requisitos previos
- Node.js v18 o superior
- MongoDB (local o Atlas)

### Backend

```bash
cd app
npm install
```

Crear archivo `.env`:
```env
MONGO_URI=mongodb+srv://usuario:password@cluster.mongodb.net/database
pass=tu_contraseña_mongodb
PORT=3000
```

Iniciar servidor:
```bash
npm start
```

El servidor corre en `http://localhost:3000`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

El frontend corre en `http://localhost:5173`

## API Endpoints

### Autenticación

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/login` | Login admin/empleado |

**POST /api/auth/login**
```json
{
  "usuario": "juanperez",
  "password": "password123",
  "tipo": "admin"
}
```
- `tipo`: `"admin"` o `"empleado"`
- Retorna: datos del usuario + restaurante asociado (si es admin)

### Administradores

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/administradores` | Listar todos |
| GET | `/api/administradores/:id` | Obtener uno |
| POST | `/api/administradores` | Crear |
| PUT | `/api/administradores/:id` | Actualizar |
| PATCH | `/api/administradores/:id/estado` | Cambiar estado |
| DELETE | `/api/administradores/:id` | Eliminar |

### Restaurantes

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/restaurantes` | Listar todos |
| GET | `/api/restaurantes/:id` | Obtener uno |
| POST | `/api/restaurantes` | Crear |
| PUT | `/api/restaurantes/:id` | Actualizar |
| DELETE | `/api/restaurantes/:id` | Eliminar |
| GET | `/api/restaurantes/menu/:qr_code` | Menú por QR |

### Mesas

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/restaurantes/:id/mesas` | Listar mesas |
| GET | `/api/restaurantes/:id/mesas/:mesaId` | Obtener mesa |
| POST | `/api/restaurantes/:id/mesas` | Agregar mesa (genera QR) |
| PUT | `/api/restaurantes/:id/mesas/:mesaId` | Editar mesa |
| DELETE | `/api/restaurantes/:id/mesas/:mesaId` | Eliminar mesa |
| DELETE | `/api/restaurantes/:id/mesas` | Eliminar todas |

### Categorías

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/restaurantes/:id/categorias` | Listar |
| GET | `/api/restaurantes/:id/categorias/:categoriaId` | Obtener |
| POST | `/api/restaurantes/:id/categorias` | Crear |
| PUT | `/api/restaurantes/:id/categorias/:categoriaId` | Editar |
| DELETE | `/api/restaurantes/:id/categorias/:categoriaId` | Eliminar |
| DELETE | `/api/restaurantes/:id/categorias` | Eliminar todas |

### Empleados

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/empleados` | Listar todos |
| GET | `/api/empleados/:id` | Obtener uno |
| POST | `/api/empleados` | Crear |
| PUT | `/api/empleados/:id` | Actualizar |
| PATCH | `/api/empleados/:id/estado` | Cambiar estado |
| DELETE | `/api/empleados/:id` | Eliminar |

### Platos

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/platos` | Listar todos |
| GET | `/api/platos/:id` | Obtener uno |
| POST | `/api/platos` | Crear |
| PUT | `/api/platos/:id` | Actualizar |
| DELETE | `/api/platos/:id` | Eliminar |

### Clientes

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/clientes` | Listar todos |
| GET | `/api/clientes/:id` | Obtener uno |
| POST | `/api/clientes` | Crear |
| PUT | `/api/clientes/:id` | Actualizar |
| DELETE | `/api/clientes/:id` | Eliminar |

### Pedidos

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/pedidos` | Listar todos |
| GET | `/api/pedidos/:id` | Obtener uno |
| POST | `/api/pedidos` | Crear |
| PUT | `/api/pedidos/:id` | Actualizar |
| PATCH | `/api/pedidos/:id/estado` | Cambiar estado |
| DELETE | `/api/pedidos/:id` | Eliminar |

**Estados de pedido:** `PENDIENTE`, `LISTO`, `ENTREGADO`, `CANCELADO`, `ELIMINADO`, `DEVOLUCION`

### Fidelización

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/fidelizacion` | Listar todos |
| GET | `/api/fidelizacion/:id` | Obtener uno |
| GET | `/api/fidelizacion/cliente/:clienteId/restaurante/:restauranteId` | Por cliente y restaurante |
| POST | `/api/fidelizacion` | Crear |
| PUT | `/api/fidelizacion/:id` | Actualizar |
| DELETE | `/api/fidelizacion/:id` | Eliminar |

### Reportes

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/reportes/:restauranteId` | Listar por restaurante |
| GET | `/api/reportes/:restauranteId/:fecha` | Obtener por fecha |
| POST | `/api/reportes/generar/:restauranteId` | Generar reporte |
| PUT | `/api/reportes/:id` | Actualizar |
| DELETE | `/api/reportes/:id` | Eliminar |

### Documentación Swagger

Disponible en: `http://localhost:3000/api-docs`

## Rutas del Frontend

| Ruta | Descripción |
|------|-------------|
| `/` | Landing page |
| `/registro` | Registro multipaso (admin + restaurante) |
| `/login` | Login administrador/empleado |

## Autor

**yamiddevofic**

## Licencia

Este proyecto está bajo la Licencia ISC.
