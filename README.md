# QRTA — Sistema de Gestión de Restaurantes

Sistema completo de gestión de restaurantes con menú digital por código QR. Backend API con Node.js, Express y MongoDB; frontend moderno con React y Tailwind CSS.

## Características

- **Gestión de Administradores**: CRUD completo con autenticación y control de estados
- **Autenticación JWT**: Login para administradores y empleados con tokens Bearer (8h)
- **Gestión de Empleados**: Administración del personal con roles (mesero/cocina)
- **Gestión de Clientes**: Base de datos de clientes con cédula única
- **Sistema de Pedidos**: Gestión completa con estados (PENDIENTE → LISTO → ENTREGADO)
- **Gestión de Platos**: Catálogo con precios, ingredientes, disponibilidad e imágenes
- **Gestión de Restaurantes**: Multi-restaurante con menú propio y subdocumentos (mesas, categorías)
- **Códigos QR por mesa**: Generación automática de `qr_code` e imagen QR en base64
- **Menú Digital**: Endpoint público para comensales que escanean el QR de la mesa
- **Reportes**: Generación automática de reportes diarios
- **Fidelización**: Programa de puntos y recompensas (único por cliente + restaurante)
- **Suscripciones**: Plan Free/Pro con vencimiento, renovación y historial de auditoría
- **Eliminación diferida**: Las cuentas eliminadas pasan a `BAJA` y se purgan 30 días después (job automático)
- **Estadísticas del panel**: Pedidos/ventas del día, mesas y clientes fidelizados
- **Subida de imágenes**: Avatares y fotos de platos con multer (máx. 5 MB)
- **Documentación Swagger**: `/api-docs`

## Tecnologías

### Backend (`backend/`)
- **Node.js** + **Express 5** — Framework web
- **MongoDB** + **Mongoose 9** — Base de datos NoSQL
- **jsonwebtoken** — Tokens JWT para autenticación
- **bcrypt** — Encriptación de contraseñas
- **multer** — Subida de imágenes (platos y avatares)
- **qrcode** — Generación de códigos QR en base64
- **swagger-jsdoc** + **swagger-ui-express** — Documentación API
- **cors** — Habilitación de CORS
- **morgan** — Logger de solicitudes HTTP

### Frontend (`frontend/`)
- **React 19** — Biblioteca de interfaces
- **Vite 8** — Build tool
- **Tailwind CSS 4** — Estilos utility-first (design system en `src/theme.css`)
- **React Router 8** — Enrutamiento SPA
- **motion** — Animaciones de la landing
- **react-icons** — Iconografía

## Estructura del Proyecto

```
restaurante-qr/
├── backend/                       # Backend API
│   ├── app/
│   │   ├── controllers/           # Lógica de negocio
│   │   │   ├── Admin.Controller.js
│   │   │   ├── Auth.Controller.js # Login JWT, perfil, avatar, cuenta, suscripción
│   │   │   ├── Cliente.Controller.js
│   │   │   ├── Empleado.Controller.js
│   │   │   ├── Fidelizacion.Controller.js
│   │   │   ├── Pedido.Controller.js
│   │   │   ├── Plato.Controller.js
│   │   │   ├── Reporte.Controller.js
│   │   │   └── Restaurante.Controller.js
│   │   ├── models/                # Schemas de Mongoose
│   │   │   ├── Administrador.js
│   │   │   ├── Cliente.js
│   │   │   ├── Empleado.js
│   │   │   ├── Fidelizacion.js
│   │   │   ├── HistorialEliminacion.js
│   │   │   ├── HistorialSuscripcion.js
│   │   │   ├── Pedido.js
│   │   │   ├── Plato.js
│   │   │   ├── Reporte.js
│   │   │   └── Restaurante.js
│   │   ├── routes/                # Rutas de la API
│   │   │   ├── adminRoutes.js
│   │   │   ├── authRoutes.js      # POST /api/auth/login, GET /api/auth/me, ...
│   │   │   ├── clienteRoutes.js
│   │   │   ├── empleadoRoutes.js
│   │   │   ├── fidelizacionRoutes.js
│   │   │   ├── pedidoRoutes.js
│   │   │   ├── platoRoutes.js
│   │   │   ├── reporteRoutes.js
│   │   │   ├── restauranteRoutes.js
│   │   │   └── statsRoutes.js     # GET /api/stats
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js  # Valida Bearer token JWT
│   │   │   └── uploadMiddleware.js # Multer: imágenes a public/uploads/
│   │   ├── jobs/
│   │   │   └── purgarHistorial.js # Eliminación definitiva cada 6 h
│   │   ├── config/
│   │   │   └── swagger.js
│   │   ├── public/
│   │   │   └── uploads/           # Imágenes servidas estáticamente
│   │   ├── .env
│   │   ├── server.js
│   │   └── README.md
│   └── package.json
├── frontend/                      # Aplicación React
│   ├── src/
│   │   ├── App.jsx                # Landing page
│   │   ├── main.jsx               # Router principal
│   │   ├── auth.jsx               # Contexto de sesión (JWT + localStorage)
│   │   ├── index.css
│   │   ├── theme.css              # Design system Tailwind 4 (brand, dark mode)
│   │   ├── pages/
│   │   │   ├── Login.jsx          # Login admin/empleado
│   │   │   ├── Registro.jsx       # Registro multipaso (admin + restaurante)
│   │   │   ├── Dashboard.jsx      # Panel con stats y módulos
│   │   │   ├── Platos.jsx         # CRUD de categorías y platos
│   │   │   ├── Perfil.jsx         # Perfil, avatares, restaurantes y configuración
│   │   │   ├── Suscripcion.jsx    # Planes Free/Pro e historial
│   │   │   ├── Modulo.jsx         # "Próximamente" para módulos sin implementar
│   │   │   ├── Privacidad.jsx     # Política de privacidad
│   │   │   └── Terminos.jsx       # Términos y condiciones
│   │   ├── components/            # Componentes reutilizables (Avatar, Modal, SideDrawer, ui/)
│   │   ├── data/                  # Datos separados de UI (nav, hero, features, faq, precios, ...)
│   │   ├── utils/                 # formatCOP, useTheme
│   │   └── assets/
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── docs/                          # Documentación del producto (PRODUCT, BUSINESS, API, ...)
├── start.ps1                      # Script de inicio
├── start.bat                      # Wrapper Windows
└── README.md
```

## Instalación

### Requisitos previos
- Node.js v18 o superior
- MongoDB (local o Atlas)

### Backend

```bash
cd backend
npm install
```

Crear archivo `.env` en `backend/app/`:
```env
MONGO_URI=mongodb+srv://usuario:password@cluster.mongodb.net/qrta
pass=tu_contraseña_mongodb
JWT_SECRET=clave_secreta_fuerte
PORT=3000
```

> **Nota:** `MONGO_URI` es opcional; si no existe, el servidor construye la URI usando `pass`. `JWT_SECRET` es obligatorio en producción (en desarrollo usa un valor por defecto).

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

El frontend corre en `http://localhost:5173` y consume la API en `http://localhost:3000/api`

## Autenticación

Todas las rutas protegidas requieren el header:

```
Authorization: Bearer <token>
```

- El token se obtiene en `POST /api/auth/login` (válido por 8 horas)
- `GET /api/auth/me` restaura la sesión al recargar la página
- Rutas protegidas: platos (todo el CRUD), categorías, `restaurantes/mios`, `PUT/DELETE /restaurantes/:id`, perfil, avatar, cuenta, suscripción y stats

## API Endpoints

### Autenticación

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/login` | Login admin/empleado (retorna JWT) |
| GET | `/api/auth/me` | Sesión actual (Bearer) |
| PUT | `/api/auth/perfil` | Actualizar perfil (Bearer) |
| PUT | `/api/auth/avatar` | Subir foto de perfil, multipart (Bearer) |
| DELETE | `/api/auth/cuenta` | Eliminar cuenta (baja diferida 30 días) |
| PUT | `/api/auth/suscripcion` | `actualizar` / `renovar` / `cancelar` plan |
| GET | `/api/auth/suscripcion` | Historial de suscripción |

**POST /api/auth/login**
```json
{
  "usuario": "juanperez",
  "password": "password123",
  "tipo": "admin"
}
```
- `tipo`: `"admin"` o `"empleado"`
- Retorna: `token`, datos del usuario, restaurante principal y lista de restaurantes del admin

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
| GET | `/api/restaurantes/menu/:qr_code` | Menú público por QR de mesa |
| GET | `/api/restaurantes/mios` | Restaurantes del admin autenticado (Bearer) |
| POST | `/api/restaurantes/mios` | Crear restaurante propio (Bearer) |
| GET | `/api/restaurantes/:id` | Obtener uno |
| POST | `/api/restaurantes` | Crear (registro) |
| PUT | `/api/restaurantes/:id` | Actualizar (Bearer) |
| DELETE | `/api/restaurantes/:id` | Eliminar (Bearer) |

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
| GET | `/api/restaurantes/:id/categorias` | Listar (Bearer) |
| GET | `/api/restaurantes/:id/categorias/:categoriaId` | Obtener (Bearer) |
| POST | `/api/restaurantes/:id/categorias` | Crear (Bearer) |
| PUT | `/api/restaurantes/:id/categorias/:categoriaId` | Editar (Bearer) |
| DELETE | `/api/restaurantes/:id/categorias/:categoriaId` | Eliminar (Bearer) |
| DELETE | `/api/restaurantes/:id/categorias` | Eliminar todas (Bearer) |

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
| GET | `/api/platos` | Listar todos (Bearer, acepta `?restaurante_id=`) |
| GET | `/api/platos/:id` | Obtener uno (Bearer) |
| POST | `/api/platos` | Crear, acepta imagen multipart (Bearer) |
| PUT | `/api/platos/:id` | Actualizar, acepta imagen multipart (Bearer) |
| PATCH | `/api/platos/:id/estado` | Cambiar estado DISPONIBLE/AGOTADO (Bearer) |
| DELETE | `/api/platos/:id` | Eliminar (Bearer) |

### Clientes

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/clientes` | Listar todos |
| GET | `/api/clientes/:id` | Obtener uno |
| POST | `/api/clientes` | Crear |
| PUT | `/api/clientes/:id` | Actualizar |
| PATCH | `/api/clientes/:id/estado` | Cambiar estado |
| DELETE | `/api/clientes/:id` | Eliminar |

### Pedidos

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/pedidos` | Listar todos |
| GET | `/api/pedidos/:id` | Obtener uno |
| POST | `/api/pedidos` | Crear |
| PUT | `/api/pedidos/:id` | Actualizar |
| PATCH | `/api/pedidos/:id/estado` | Cambiar estado (actualiza fidelización al ENTREGAR) |
| DELETE | `/api/pedidos/:id` | Eliminar |

**Estados de pedido:** `PENDIENTE`, `LISTO`, `ENTREGADO`, `CANCELADO`, `ELIMINADO`, `DEVOLUCION`

### Fidelización

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/fidelizacion` | Listar todos |
| GET | `/api/fidelizacion/:id` | Obtener uno |
| GET | `/api/fidelizacion/cliente/:clienteId/restaurante/:restauranteId` | Por cliente y restaurante |
| POST | `/api/fidelizacion` | Crear (único por cliente + restaurante) |
| PUT | `/api/fidelizacion/:id` | Actualizar |
| PATCH | `/api/fidelizacion/:id/estado` | Cambiar estado |
| DELETE | `/api/fidelizacion/:id` | Eliminar |

### Reportes

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/reportes/:restauranteId` | Listar por restaurante |
| GET | `/api/reportes/:restauranteId/:fecha` | Obtener por fecha |
| POST | `/api/reportes/generar/:restauranteId` | Generar reporte |
| PUT | `/api/reportes/:id` | Actualizar |
| DELETE | `/api/reportes/:id` | Eliminar |

### Estadísticas

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/stats` | Mesas, pedidos de hoy, ventas de hoy, clientes fidelizados (Bearer) |

### Documentación Swagger

Disponible en: `http://localhost:3000/api-docs`

## Rutas del Frontend

| Ruta | Descripción |
|------|-------------|
| `/` | Landing page |
| `/registro` | Registro multipaso (admin + restaurante) |
| `/login` | Login administrador/empleado |
| `/dashboard` | Panel principal con estadísticas |
| `/dashboard/platos` | CRUD de categorías y platos |
| `/dashboard/perfil` | Perfil, restaurantes y configuración |
| `/dashboard/suscripcion` | Planes e historial de suscripción |
| `/dashboard/:modulo` | Módulos próximamente (mesas, pedidos, empleados, fidelización, reportes) |
| `/privacidad` | Política de privacidad |
| `/terminos` | Términos y condiciones |

## Documentación del producto

En `docs/` se encuentra la documentación de producto y técnica:

- `PRODUCT.md` — Propuesta de valor y objetivo
- `BUSINESS.md` — Modelo de negocio y competencia
- `USERS.md` — Personas (dueño, mesero, cliente)
- `CONTEXT.md` — Contexto general del proyecto
- `API.md` — Documentación detallada de la API
- `DECISIONS.md` — Decisiones de arquitectura (ADRs)
- `UX.md`, `DESIGN.md`, `DESIGN_SYSTEM.md`, `BRAND.md` — Diseño y marca

## Autor

**yamiddevofic**

## Licencia

Este proyecto está bajo la Licencia ISC.