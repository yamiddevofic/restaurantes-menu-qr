# Guía de instalación

Esta guía asume que no eres necesariamente un experto en servidores. Sigue los pasos en orden.

## 1. Requisitos

- **Node.js versión 22.5 o superior**. Verifica con:
  ```bash
  node -v
  ```
  Si no lo tienes o tienes una versión vieja, descárgalo de https://nodejs.org (elige la versión LTS más reciente).

## 2. Instalar el proyecto

1. Descomprime el archivo `.zip` en una carpeta, por ejemplo `restaurant-qr-menu`.
2. Abre una terminal dentro de esa carpeta.
3. Instala las dependencias:
   ```bash
   npm install
   ```

## 3. Configurar variables de entorno

1. Copia el archivo de ejemplo:
   ```bash
   cp .env.example .env
   ```
   (En Windows, puedes simplemente copiar y renombrar el archivo `.env.example` a `.env` desde el explorador de archivos).

2. Abre `.env` con un editor de texto y cambia estos valores:
   - `JWT_SECRET`: pon un texto largo y aleatorio (nunca dejes el valor de ejemplo). Puedes generar uno con:
     ```bash
     node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
     ```
   - `BASE_URL`: la dirección pública donde vivirá tu app. Mientras pruebas en tu computador, déjalo como `http://localhost:3000`. Cuando la subas a internet, cámbialo por tu dominio real, por ejemplo `https://menu.mirestaurante.com` (importante: los códigos QR se generan usando esta URL, así que debe estar correcta antes de imprimir los QR).

## 4. Probar rápido con un restaurante de ejemplo (opcional pero recomendado)

```bash
npm run seed-demo
npm start
```

Abre en tu navegador:
- Panel admin: http://localhost:3000/admin — usuario `demo`, contraseña `demo1234`
- Panel cocina: http://localhost:3000/kitchen — usuario `cocina`, contraseña `cocina1234`
- Ve a la pestaña "Mesas y códigos QR" en el panel admin, y ahí puedes escanear tú mismo el QR de una mesa con tu celular (debe estar en la misma red WiFi que tu computador — usa la IP de tu computador en vez de `localhost` en `BASE_URL`, ej. `http://192.168.1.15:3000`, si quieres probar desde el celular).

Cuando quieras crear tu restaurante real, simplemente sigue el paso 5.

## 5. Crear tu restaurante real

```bash
node scripts/setup-restaurant.js
```

Te va a preguntar:
- Nombre del restaurante
- Un "slug" (identificador corto para la URL, ej. `donpedro`)
- Usuario y contraseña del panel de administración
- Si quieres un usuario aparte para cocina (recomendado si el cocinero no debe poder editar el menú ni precios)

Luego:
```bash
npm start
```

Entra a `/admin`, inicia sesión, y desde ahí:
1. Crea tus **categorías** (Entradas, Platos fuertes, Bebidas, etc.)
2. Agrega tus **platos** con nombre, precio, descripción y foto (opcional).
3. Ve a la pestaña **Mesas y códigos QR** y crea una mesa por cada mesa física de tu restaurante. Cada una genera su propio código QR — descárgalo o imprímelo y pégalo en la mesa correspondiente.

También puedes exportar todos los QR de una vez como imágenes PNG listas para imprimir:
```bash
npm run gen-qr nombre-del-slug
```
Los archivos quedan en la carpeta `qr-exports/nombre-del-slug/`.

## 6. Dejarlo funcionando de forma permanente (producción)

Para que el sistema quede corriendo todo el tiempo (no solo mientras tengas la terminal abierta), lo más simple es usar un **VPS económico** (DigitalOcean, Hetzner, un droplet pequeño, etc. — con 1GB de RAM sobra para varios restaurantes de pueblo) y un gestor de procesos como `pm2`:

```bash
npm install -g pm2
pm2 start server/index.js --name menu-qr
pm2 save
pm2 startup   # sigue las instrucciones que te muestra para que arranque solo al reiniciar el servidor
```

### Dominio y HTTPS

Recomendado usar un dominio propio (ej. `menu.turestaurante.com`) apuntando a tu servidor, y poner
**Nginx** o **Caddy** delante de la app para manejar HTTPS gratis (Caddy lo hace automático con
Let's Encrypt). Ejemplo mínimo de Caddyfile:

```
menu.turestaurante.com {
  reverse_proxy localhost:3000
}
```

Recuerda: cuando cambies de `localhost:3000` a tu dominio real, **actualiza `BASE_URL` en `.env`**
y reinicia el servidor (`pm2 restart menu-qr`) antes de imprimir los códigos QR definitivos, ya que
la URL queda "grabada" dentro de cada QR impreso.

### Copias de seguridad

Toda la información vive en un solo archivo: `data/restaurant.db`. Para respaldar,
basta con copiar ese archivo periódicamente (ej. un cron diario que lo suba a un
Google Drive, Dropbox, o simplemente lo copie a otra carpeta). Ejemplo de cron diario a las 3am:

```bash
0 3 * * * cp /ruta/a/restaurant-qr-menu/data/restaurant.db /ruta/de/respaldos/restaurant-$(date +\%F).db
```

## 7. Agregar un segundo (o tercer, o décimo) restaurante

El sistema es multi-restaurante desde el diseño. No necesitas instalar nada de nuevo:

```bash
node scripts/setup-restaurant.js
```

Cada restaurante nuevo queda totalmente aislado del resto — con su propio slug (URL),
menú, mesas, pedidos y usuarios.

## Problemas comunes

- **"No se pudo cargar el menú" al escanear el QR**: usualmente significa que `BASE_URL`
  cambió después de generar el QR (por ejemplo, pasaste de probar en `localhost` a tu
  dominio real). Regenera el código QR de esa mesa desde `/admin` → Mesas → "Regenerar QR".
- **El dashboard de cocina no actualiza en tiempo real**: revisa que el servidor y el
  navegador no estén bloqueando WebSockets (algunos proxies mal configurados los bloquean).
  Como respaldo, el dashboard también se refresca solo cada 20 segundos aunque falle el
  tiempo real.
- **Olvidé la contraseña de un usuario**: por ahora no hay opción de "recuperar
  contraseña" desde la interfaz (por seguridad, ya que es un sistema pequeño y sin
  correo configurado). Puedes crear un usuario nuevo directamente en la base de datos,
  o pídele soporte a quien instaló el sistema.
