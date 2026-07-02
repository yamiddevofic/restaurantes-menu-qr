# 🍽️ Menu QR — Pedidos digitales para restaurantes

Sistema de menú digital por código QR y pedidos en tiempo real, pensado para
restaurantes de pueblo: **liviano, seguro, multi-restaurante (una sola instalación
puede atender a varios negocios) y capaz de aguantar picos de gente sin caerse**.

## ¿Cómo funciona?

1. El dueño crea su restaurante, su menú y sus mesas desde el **Panel de Administración** (`/admin`).
2. Por cada mesa se genera automáticamente un **código QR único**, listo para imprimir.
3. El cliente escanea el QR con su celular → ve el menú → arma su pedido → lo envía. No necesita instalar nada ni crear cuenta.
4. El pedido llega **al instante** al **Dashboard de Cocina** (`/kitchen`), organizado en columnas: Pendiente → Preparando → Listo.
5. El cocinero va cambiando el estado del pedido con un clic, y el cliente ve el estado actualizarse en su celular en tiempo real.

## Arquitectura (resumen técnico)

- **Backend:** Node.js + Express.
- **Base de datos:** SQLite, usando el módulo `node:sqlite` que ya viene integrado en Node.js (desde la versión 22.5). **No requiere compilar nada ni instalar un motor de base de datos aparte** — es un solo archivo (`data/restaurant.db`) que se puede respaldar copiándolo. Se activa el modo `WAL` para que se pueda leer y escribir al mismo tiempo sin bloquear, lo cual ayuda en las horas pico.
- **Tiempo real:** Socket.io — el pedido aparece en la cocina sin recargar la página, y el cliente ve el cambio de estado de su pedido sin recargar.
- **Frontend:** HTML/CSS/JS puro (sin frameworks pesados ni paso de compilación), así que carga rápido incluso con internet lento — algo típico en zonas rurales.
- **Multi-restaurante:** todo está aislado por `restaurant_id` en la base de datos. Una misma instalación del sistema puede alojar varios restaurantes distintos, cada uno con su propio menú, mesas, usuarios y pedidos, sin que se mezclen entre sí.

## ¿Por qué es escalable para "a veces hay pico, a veces no"?

- No paga por servidor corriendo 24/7 con capacidad fija: SQLite + Node corre perfecto en un servidor pequeño y barato (1 vCPU / 512MB-1GB RAM alcanza para varios restaurantes de pueblo).
- El modo WAL de SQLite permite muchas lecturas simultáneas (varios clientes viendo el menú a la vez) mientras se escriben pedidos, que es justamente el patrón de un fin de semana con full mesas.
- Si en el futuro un restaurante crece mucho (varias sedes, cientos de mesas simultáneas), el código está organizado para poder migrar fácilmente de SQLite a PostgreSQL sin rediseñar el sistema (toda el acceso a datos está centralizado en `server/db.js` y en las rutas).
- El límite de pedidos por mesa (anti-spam) es *por mesa*, no global — así que un pico real de clientes nunca se ve afectado, solo se frena el abuso (alguien mandando pedidos en bucle).

## Seguridad incluida

- Contraseñas de administrador/cocina con **hash bcrypt** (nunca se guardan en texto plano).
- Sesiones con **JWT en cookie `httpOnly`** (no accesible desde JavaScript malicioso).
- **Aislamiento multi-restaurante**: cada consulta a la base de datos está filtrada por el restaurante del usuario autenticado; un admin de un restaurante nunca puede ver ni tocar datos de otro.
- El **precio de cada plato se calcula en el servidor**, nunca se confía en lo que mande el celular del cliente (evita que alguien manipule el precio desde el navegador).
- **Rate limiting**: en login (anti fuerza bruta) y en creación de pedidos por mesa (anti spam).
- Validación estricta de todos los datos de entrada (`express-validator`) y escape de HTML para evitar inyección de scripts (XSS).
- Consultas SQL siempre parametrizadas (nunca se arma SQL concatenando texto), lo que previene inyección SQL.
- Cabeceras de seguridad HTTP con `helmet`.
- Cada mesa tiene un **token aleatorio impredecible** (no un simple número de mesa) en su URL de QR, y se puede regenerar en cualquier momento si un QR se pierde o se filtra.
- No hay registro público de restaurantes: solo quien tiene acceso al servidor puede crear uno nuevo (`npm run setup`), evitando que cualquiera cree cuentas falsas.

## Estructura del proyecto

```
restaurant-qr-menu/
├── server/
│   ├── index.js          # Servidor Express + Socket.io
│   ├── db.js              # Conexión SQLite (node:sqlite)
│   ├── schema.sql          # Esquema de la base de datos
│   ├── sockets.js          # Lógica de tiempo real
│   ├── middleware/
│   │   └── auth.js         # Autenticación y control de acceso
│   ├── routes/
│   │   ├── auth.js          # Login/logout
│   │   ├── public.js        # Menú público + creación de pedidos (QR)
│   │   ├── kitchen.js       # Dashboard de cocina
│   │   └── admin.js         # Gestión de menú, categorías y mesas/QR
│   └── utils/
│       └── auth.js         # Firma/verificación de JWT
├── public/
│   ├── menu/                # Página que ve el cliente al escanear el QR
│   ├── kitchen/              # Dashboard de cocina
│   └── admin/                # Panel de administración
├── scripts/
│   ├── setup-restaurant.js   # Crear un restaurante nuevo (CLI interactivo)
│   ├── seed-demo.js          # Datos de ejemplo para probar rápido
│   └── generate-qr.js        # Exportar todos los QR de un restaurante como PNG
├── data/                     # Aquí vive el archivo restaurant.db (se crea solo)
├── .env.example
└── package.json
```

Ver dentro de app **INSTALL.md** para la guía paso a paso de instalación y despliegue.

## Comandos disponibles

```bash
cd app
npm install           # Instala dependencias
npm run setup         # Crea un restaurante nuevo (te pregunta nombre, usuario, etc.)
npm run seed-demo     # Crea un restaurante de ejemplo ya cargado con menú y 5 mesas
npm start              # Inicia el servidor
npm run gen-qr <slug>  # Exporta todos los QR de un restaurante como imágenes PNG
```

## Notas sobre `node:sqlite`

El proyecto usa el módulo SQLite integrado de Node.js (`node:sqlite`) en vez de una
librería externa como `better-sqlite3`. Esto es intencional: evita que la instalación
dependa de compilar código nativo en el servidor (algo que frecuentemente falla en
hostings compartidos o económicos, justo los que suelen usar los negocios pequeños).
Actualmente esta API es "experimental" en Node.js (verás una advertencia en consola
al iniciar, es normal e inofensiva), pero es estable en la práctica y Node.js la
mantiene activamente. Requiere **Node.js 22.5 o superior**.
