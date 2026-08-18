# QRTA - Documentación de la API

Backend API para la gestión completa de restaurantes, desarrollado con Node.js, Express y MongoDB.

**Base URL:** `http://localhost:3000/api`

**Documentación Swagger:** `http://localhost:3000/api-docs`

---

## Autenticación

Todas las rutas protegidas requieren el header:

```
Authorization: Bearer <token>
```

El token se obtiene en `POST /api/auth/login` y es válido por **8 horas**. Las respuestas de login y de `GET /api/auth/me` siempre retornan el token/sesión actual sin la contraseña.

### POST /api/auth/login
Inicia sesión como administrador o empleado.

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "usuario": "juanperez",
    "password": "password123",
    "tipo": "admin"
  }'
```

**Campos requeridos:**
- `usuario` (String): Nombre de usuario
- `password` (String): Contraseña
- `tipo` (String): `"admin"` o `"empleado"`

**Respuesta exitosa:**
```json
{
  "message": "Inicio de sesión exitoso",
  "tipo": "admin",
  "token": ":jwt_token",
  "user": {
    "_id": ":id",
    "nombre": "Juan Pérez",
    "email": "juan@example.com",
    "usuario": "juanperez",
    "plan": "pro",
    "plan_vencimiento": "2026-09-15T10:30:00.000Z",
    "fecha_registro": "2024-01-15T10:30:00.000Z",
    "estado": "ACTIVO"
  },
  "restaurante": {
    "_id": ":restauranteId",
    "nombre": "Restaurante La Cocina",
    "ubicacion": "Calle 123 #45-67"
  },
  "restaurantes": [":lista_completa"]
}
```

**Notas:**
- El campo `restaurante` es el primero de la lista; `restaurantes` contiene todos los del admin (vacío para empleados).
- **Errores:**
  - `400`: Datos faltantes o tipo inválido
  - `401`: Credenciales incorrectas
  - `403`: Cuenta inactiva

### GET /api/auth/me
Obtiene la sesión actual (restaura sesión al recargar la página).

```bash
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer :token"
```

Retorna el mismo formato que el login (sin token nuevo). `401` si el token falta/expiró, `403` si la cuenta está inactiva.

### PUT /api/auth/perfil
Actualiza el perfil del usuario autenticado.

```bash
curl -X PUT http://localhost:3000/api/auth/perfil \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer :token" \
  -d '{
    "nombre": "Juan Pérez Actualizado",
    "email": "juan.nuevo@example.com",
    "telefono": "+573001234567",
    "bio": "Dueño del restaurante"
  }'
```

- **Admin:** acepta `nombre`, `email` (validado y único), `telefono`, `bio`
- **Empleado:** acepta `nombre`, `bio`, `contacto.correo`, `contacto.celular`

### PUT /api/auth/avatar
Sube la foto de perfil del usuario autenticado (multipart, campo `avatar`, máx. 5 MB).

```bash
curl -X PUT http://localhost:3000/api/auth/avatar \
  -H "Authorization: Bearer :token" \
  -F "avatar=@foto.jpg"
```

La imagen se guarda en `public/uploads/perfiles/` y se sirve de forma estática. Retorna el usuario actualizado con `avatar: "/uploads/perfiles/:archivo"`.

### DELETE /api/auth/cuenta
Elimina la cuenta del usuario autenticado (confirmación con contraseña).

```bash
curl -X DELETE http://localhost:3000/api/auth/cuenta \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer :token" \
  -d '{
    "password": "password123"
  }'
```

**Nota:** la cuenta **no se borra de inmediato**: pasa a estado `BAJA` (pierde acceso al instante), se guarda un snapshot en el historial y se purga definitivamente a los **30 días** por el job automático. Si es admin, sus restaurantes y empleados también se marcan para purga.

### PUT /api/auth/suscripcion
Gestiona la suscripción del administrador autenticado.

```bash
curl -X PUT http://localhost:3000/api/auth/suscripcion \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer :token" \
  -d '{ "accion": "actualizar" }'
```

**Acciones:**
- `actualizar`: pasa del plan free al pro (30 días desde hoy)
- `renovar`: extiende 30 días (suma al vencimiento actual si no venció)
- `cancelar`: vuelve al plan gratis

Cada cambio queda registrado en el historial de suscripción (auditoría).

### GET /api/auth/suscripcion
Obtiene el historial de cambios de suscripción del admin (últimos 50, ordenados por fecha desc). Solo administradores.

---

## Administradores

### GET /api/administradores
Lista todos los administradores registrados.

```bash
curl http://localhost:3000/api/administradores
```

**Respuesta:**
```json
[
  {
    "_id": ":id",
    "nombre": "Juan Pérez",
    "email": "juan@example.com",
    "usuario": "juanperez",
    "plan": "pro",
    "fecha_registro": "2024-01-15T10:30:00.000Z",
    "estado": "ACTIVO"
  }
]
```

### GET /api/administradores/:id
Obtiene un administrador específico por su ID.

```bash
curl http://localhost:3000/api/administradores/:id
```

### POST /api/administradores
Crea un nuevo administrador.

```bash
curl -X POST http://localhost:3000/api/administradores \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan Pérez",
    "email": "juan@example.com",
    "usuario": "juanperez",
    "password": "password123",
    "plan": "pro"
  }'
```

**Campos requeridos:**
- `nombre` (String): Nombre completo del administrador
- `email` (String): Correo electrónico único
- `usuario` (String): Nombre de usuario único
- `password` (String): Contraseña (se encripta automáticamente)

**Campos opcionales:**
- `plan` (String): `'free'` o `'pro'` (default: `'free'`)

**Respuesta:**
```json
{
  "message": "Administrador guardado correctamente",
  "_id": ":id"
}
```

### PUT /api/administradores/:id
Actualiza un administrador existente.

```bash
curl -X PUT http://localhost:3000/api/administradores/:id \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan Pérez Actualizado",
    "email": "juan.nuevo@example.com",
    "usuario": "juanperez2",
    "plan": "pro"
  }'
```

### PATCH /api/administradores/:id/estado
Cambia el estado del administrador.

```bash
curl -X PATCH http://localhost:3000/api/administradores/:id/estado \
  -H "Content-Type: application/json" \
  -d '{
    "estado": "INACTIVO"
  }'
```

**Estados disponibles:** `'ACTIVO'`, `'INACTIVO'`, `'BAJA'`

### DELETE /api/administradores/:id
Elimina un administrador.

```bash
curl -X DELETE http://localhost:3000/api/administradores/:id
```

---

## Restaurantes

### GET /api/restaurantes
Lista todos los restaurantes.

```bash
curl http://localhost:3000/api/restaurantes
```

### GET /api/restaurantes/:id
Obtiene un restaurante específico.

```bash
curl http://localhost:3000/api/restaurantes/:id
```

### POST /api/restaurantes
Crea un nuevo restaurante.

```bash
curl -X POST http://localhost:3000/api/restaurantes \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Restaurante La Cocina",
    "ubicacion": "Calle 123 #45-67",
    "adm_id": ":id"
  }'
```

**Campos requeridos:**
- `nombre` (String): Nombre del restaurante
- `ubicacion` (String): Dirección del restaurante
- `adm_id` (ObjectId): ID del administrador

### PUT /api/restaurantes/:id
Actualiza un restaurante.

```bash
curl -X PUT http://localhost:3000/api/restaurantes/:id \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Restaurante La Cocina Actualizado",
    "ubicacion": "Calle 456 #78-90"
  }'
```

### DELETE /api/restaurantes/:id
Elimina un restaurante.

```bash
curl -X DELETE http://localhost:3000/api/restaurantes/:id
```

### GET /api/restaurantes/menu/:qr_code
Obtiene el menú de un restaurante escaneando el código QR de una mesa. Incluye información del restaurante, mesa y platos organizados por categoría.

```bash
curl http://localhost:3000/api/restaurantes/menu/:qr_code
```

**Respuesta:**
```json
{
  "restaurante": {
    "_id": ":id",
    "nombre": "Restaurante La Cocina",
    "ubicacion": "Calle 123 #45-67"
  },
  "mesa": {
    "numero": 1,
    "qr_code": ":qr_code"
  },
  "categorias": [
    {
      "_id": ":categoriaId",
      "nombre": "Entradas",
      "descripcion": "Platos de entrada",
      "platos": [...]
    }
  ]
}
```

### GET /api/restaurantes/mios
Lista los restaurantes del administrador autenticado.

```bash
curl http://localhost:3000/api/restaurantes/mios \
  -H "Authorization: Bearer :token"
```

### POST /api/restaurantes/mios
Crea un restaurante para el administrador autenticado (el `adm_id` se toma del token, no del body).

```bash
curl -X POST http://localhost:3000/api/restaurantes/mios \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer :token" \
  -d '{
    "nombre": "Restaurante La Cocina",
    "ubicacion": "Calle 123 #45-67"
  }'
```

---

## Mesas

### GET /api/restaurantes/:id/mesas
Lista todas las mesas de un restaurante.

```bash
curl http://localhost:3000/api/restaurantes/:id/mesas
```

### GET /api/restaurantes/:id/mesas/:mesaId
Obtiene una mesa específica de un restaurante.

```bash
curl http://localhost:3000/api/restaurantes/:id/mesas/:mesaId
```

### POST /api/restaurantes/:id/mesas
Agrega una nueva mesa a un restaurante existente. Genera automáticamente el código QR y la imagen QR.

```bash
curl -X POST http://localhost:3000/api/restaurantes/:id/mesas \
  -H "Content-Type: application/json" \
  -d '{
    "numero": 1
  }'
```

**Campos requeridos:**
- `numero` (Number): Número de la mesa

**Respuesta incluye:**
- `numero`: Número de la mesa
- `qr_code`: Código QR generado automáticamente
- `qr_image`: Imagen QR en base64
- `menu_url`: URL para acceder al menú de la mesa

### PUT /api/restaurantes/:id/mesas/:mesaId
Edita una mesa existente.

```bash
curl -X PUT http://localhost:3000/api/restaurantes/:id/mesas/:mesaId \
  -H "Content-Type: application/json" \
  -d '{
    "numero": 2
  }'
```

### DELETE /api/restaurantes/:id/mesas/:mesaId
Elimina una mesa específica.

```bash
curl -X DELETE http://localhost:3000/api/restaurantes/:id/mesas/:mesaId
```

### DELETE /api/restaurantes/:id/mesas
Elimina todas las mesas de un restaurante.

```bash
curl -X DELETE http://localhost:3000/api/restaurantes/:id/mesas
```

---

## Categorías

### GET /api/restaurantes/:id/categorias
Lista todas las categorías de un restaurante.

```bash
curl http://localhost:3000/api/restaurantes/:id/categorias
```

### GET /api/restaurantes/:id/categorias/:categoriaId
Obtiene una categoría específica de un restaurante.

```bash
curl http://localhost:3000/api/restaurantes/:id/categorias/:categoriaId
```

### POST /api/restaurantes/:id/categorias
Agrega una nueva categoría a un restaurante existente.

```bash
curl -X POST http://localhost:3000/api/restaurantes/:id/categorias \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Entradas",
    "descripcion": "Platos de entrada"
  }'
```

**Campos requeridos:**
- `nombre` (String): Nombre de la categoría

**Campos opcionales:**
- `descripcion` (String): Descripción de la categoría

### PUT /api/restaurantes/:id/categorias/:categoriaId
Edita una categoría existente.

```bash
curl -X PUT http://localhost:3000/api/restaurantes/:id/categorias/:categoriaId \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Entradas Actualizado",
    "descripcion": "Nueva descripción"
  }'
```

### DELETE /api/restaurantes/:id/categorias/:categoriaId
Elimina una categoría específica.

```bash
curl -X DELETE http://localhost:3000/api/restaurantes/:id/categorias/:categoriaId
```

### DELETE /api/restaurantes/:id/categorias
Elimina todas las categorías de un restaurante.

```bash
curl -X DELETE http://localhost:3000/api/restaurantes/:id/categorias
```

---

## Empleados

### GET /api/empleados
Lista todos los empleados.

```bash
curl http://localhost:3000/api/empleados
```

### GET /api/empleados/:id
Obtiene un empleado específico.

```bash
curl http://localhost:3000/api/empleados/:id
```

### POST /api/empleados
Crea un nuevo empleado.

```bash
curl -X POST http://localhost:3000/api/empleados \
  -H "Content-Type: application/json" \
  -d '{
    "restaurante_id": ":id",
    "nombre": "María García",
    "usuario": "mariagarcia",
    "password": "password123",
    "rol": "mesero",
    "contacto": {
      "celular": "+573001234567",
      "correo": "maria@example.com"
    }
  }'
```

**Campos requeridos:**
- `restaurante_id` (ObjectId): ID del restaurante
- `nombre` (String): Nombre completo
- `usuario` (String): Nombre de usuario único
- `password` (String): Contraseña (se encripta automáticamente)
- `rol` (String): `'mesero'` o `'cocina'`

**Campos opcionales:**
- `contacto` (Object): Objeto con `celular` y `correo`

### PUT /api/empleados/:id
Actualiza un empleado.

```bash
curl -X PUT http://localhost:3000/api/empleados/:id \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "María García Actualizado",
    "rol": "cocina"
  }'
```

### PATCH /api/empleados/:id/estado
Cambia el estado del empleado.

```bash
curl -X PATCH http://localhost:3000/api/empleados/:id/estado \
  -H "Content-Type: application/json" \
  -d '{
    "estado": "INACTIVO"
  }'
```

**Estados disponibles:** `'ACTIVO'`, `'INACTIVO'`

### DELETE /api/empleados/:id
Elimina un empleado.

```bash
curl -X DELETE http://localhost:3000/api/empleados/:id
```

---

## Platos

### GET /api/platos
Lista todos los platos.

```bash
curl http://localhost:3000/api/platos
```

### GET /api/platos/:id
Obtiene un plato específico.

```bash
curl http://localhost:3000/api/platos/:id
```

### POST /api/platos
Crea un nuevo plato. **Requiere Bearer token.** Acepta `application/json` o `multipart/form-data` (para incluir la imagen del plato en el campo `imagen`, máx. 5 MB).

```bash
curl -X POST http://localhost:3000/api/platos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer :token" \
  -d '{
    "nombre": "Pizza Margarita",
    "descripcion": "Pizza con tomate, mozzarella y albahaca",
    "restaurante_id": ":id",
    "categoria_id": ":categoriaId",
    "precio": 15000,
    "ingredientes": [
      {
        "nombre": "Tomate",
        "cantidad": 200,
        "medida": "g"
      },
      {
        "nombre": "Mozzarella",
        "cantidad": 150,
        "medida": "g"
      }
    ],
    "estado": "DISPONIBLE"
  }'
```

**Campos requeridos:**
- `nombre` (String): Nombre del plato
- `restaurante_id` (ObjectId): ID del restaurante
- `categoria_id` (ObjectId): ID de la categoría
- `precio` (Number): Precio del plato

**Campos opcionales:**
- `descripcion` (String): Descripción del plato
- `ingredientes` (Array): Array de objetos con `nombre`, `cantidad`, `medida`
- `estado` (String): `'DISPONIBLE'` o `'AGOTADO'` (default: `'DISPONIBLE'`)
- `imagen` (File, multipart): Foto del plato

### PUT /api/platos/:id
Actualiza un plato. **Requiere Bearer token.** Acepta `application/json` o `multipart/form-data`.

```bash
curl -X PUT http://localhost:3000/api/platos/:id \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer :token" \
  -d '{
    "estado": "AGOTADO",
    "descripcion": "Descripción actualizada"
  }'
```

### PATCH /api/platos/:id/estado
Cambia el estado de un plato. **Requiere Bearer token.**

```bash
curl -X PATCH http://localhost:3000/api/platos/:id/estado \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer :token" \
  -d '{
    "estado": "AGOTADO"
  }'
```

**Estados disponibles:** `'DISPONIBLE'`, `'AGOTADO'`

### DELETE /api/platos/:id
Elimina un plato. **Requiere Bearer token.**

```bash
curl -X DELETE http://localhost:3000/api/platos/:id \
  -H "Authorization: Bearer :token"
```

> **Nota:** todo el CRUD de platos está protegido; el menú público se sirve únicamente por `GET /api/restaurantes/menu/:qr_code`. `GET /api/platos` acepta `?restaurante_id=:id` para filtrar.

---

## Clientes

### GET /api/clientes
Lista todos los clientes.

```bash
curl http://localhost:3000/api/clientes
```

### GET /api/clientes/:id
Obtiene un cliente específico.

```bash
curl http://localhost:3000/api/clientes/:id
```

### POST /api/clientes
Crea un nuevo cliente.

```bash
curl -X POST http://localhost:3000/api/clientes \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Carlos López",
    "cedula": "123456789",
    "contacto": [
      {
        "celular": "+573009876543",
        "correo": "carlos@example.com"
      }
    ]
  }'
```

**Campos requeridos:**
- `nombre` (String): Nombre completo
- `cedula` (String): Cédula única

**Campos opcionales:**
- `contacto` (Array): Array de objetos con `celular` y `correo`
- `estado` (String): `'ACTIVO'` o `'INACTIVO'` (default: `'ACTIVO'`)

### PUT /api/clientes/:id
Actualiza un cliente.

```bash
curl -X PUT http://localhost:3000/api/clientes/:id \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Carlos López Actualizado",
    "estado": "INACTIVO"
  }'
```

### PATCH /api/clientes/:id/estado
Cambia el estado de un cliente.

```bash
curl -X PATCH http://localhost:3000/api/clientes/:id/estado \
  -H "Content-Type: application/json" \
  -d '{
    "estado": "INACTIVO"
  }'
```

**Estados disponibles:** `'ACTIVO'`, `'INACTIVO'`

### DELETE /api/clientes/:id
Elimina un cliente.

```bash
curl -X DELETE http://localhost:3000/api/clientes/:id
```

---

## Pedidos

### GET /api/pedidos
Lista todos los pedidos.

```bash
curl http://localhost:3000/api/pedidos
```

### GET /api/pedidos/:id
Obtiene un pedido específico.

```bash
curl http://localhost:3000/api/pedidos/:id
```

### POST /api/pedidos
Crea un nuevo pedido.

```bash
curl -X POST http://localhost:3000/api/pedidos \
  -H "Content-Type: application/json" \
  -d '{
    "mesa_id": ":mesaId",
    "cliente_id": ":clienteId",
    "platos": [
      {
        "plato_id": ":platoId",
        "nombre": "Pizza Margarita",
        "precio": 15000,
        "cantidad": 2
      },
      {
        "plato_id": ":platoId",
        "nombre": "Hamburguesa",
        "precio": 12000,
        "cantidad": 1
      }
    ],
    "estado": "PENDIENTE"
  }'
```

**Campos requeridos:**
- `mesa_id` (ObjectId): ID de la mesa
- `platos` (Array): Array de objetos con `plato_id`, `nombre`, `precio`, `cantidad`

**Campos opcionales:**
- `cliente_id` (ObjectId): ID del cliente
- `estado` (String): `'PENDIENTE'`, `'CANCELADO'`, `'ELIMINADO'`, `'LISTO'`, `'ENTREGADO'`, `'DEVOLUCION'` (default: `'PENDIENTE'`)
- `fecha_cierre` (Date): Fecha de cierre del pedido

### PUT /api/pedidos/:id
Actualiza un pedido.

```bash
curl -X PUT http://localhost:3000/api/pedidos/:id \
  -H "Content-Type: application/json" \
  -d '{
    "estado": "LISTO",
    "fecha_cierre": "2024-01-15T12:00:00.000Z"
  }'
```

### PATCH /api/pedidos/:id/estado
Actualiza el estado de un pedido. Cuando el estado cambia a `'ENTREGADO'` y el pedido tiene un cliente asociado, se actualiza automáticamente el programa de fidelización.

```bash
curl -X PATCH http://localhost:3000/api/pedidos/:id/estado \
  -H "Content-Type: application/json" \
  -d '{
    "estado": "ENTREGADO"
  }'
```

**Estados disponibles:**
- `PENDIENTE`: Pedido creado, esperando ser preparado
- `CANCELADO`: Pedido cancelado
- `ELIMINADO`: Pedido eliminado
- `LISTO`: Pedido listo para ser entregado
- `ENTREGADO`: Pedido entregado al cliente (actualiza fidelización)
- `DEVOLUCION`: Pedido devuelto

**Nota:** La fidelización solo se actualiza cuando el estado cambia a `'ENTREGADO'` desde un estado diferente.

### DELETE /api/pedidos/:id
Elimina un pedido.

```bash
curl -X DELETE http://localhost:3000/api/pedidos/:id
```

---

## Fidelización

### GET /api/fidelizacion
Lista todos los programas de fidelización.

```bash
curl http://localhost:3000/api/fidelizacion
```

### GET /api/fidelizacion/:id
Obtiene un programa de fidelización específico.

```bash
curl http://localhost:3000/api/fidelizacion/:id
```

### GET /api/fidelizacion/cliente/:clienteId/restaurante/:restauranteId
Obtiene el programa de fidelización de un cliente en un restaurante específico.

```bash
curl http://localhost:3000/api/fidelizacion/cliente/:clienteId/restaurante/:restauranteId
```

### POST /api/fidelizacion
Crea un nuevo programa de fidelización.

```bash
curl -X POST http://localhost:3000/api/fidelizacion \
  -H "Content-Type: application/json" \
  -d '{
    "restaurante_id": ":id",
    "cliente_id": ":clienteId",
    "puntos": 100,
    "compras_premio": 0,
    "premios_ganados": 0,
    "visitas": 5,
    "total_gastado": 150000
  }'
```

**Campos requeridos:**
- `restaurante_id` (ObjectId): ID del restaurante
- `cliente_id` (ObjectId): ID del cliente

**Campos opcionales:**
- `puntos` (Number): Puntos acumulados (default: 0)
- `compras_premio` (Number): Compras hacia el próximo premio (default: 0)
- `premios_ganados` (Number): Total de premios ganados (default: 0)
- `visitas` (Number): Número de visitas (default: 0)
- `total_gastado` (Number): Total gastado (default: 0)
- `estado` (String): `'ACTIVO'` o `'INACTIVO'` (default: `'ACTIVO'`)

### PUT /api/fidelizacion/:id
Actualiza un programa de fidelización.

```bash
curl -X PUT http://localhost:3000/api/fidelizacion/:id \
  -H "Content-Type: application/json" \
  -d '{
    "puntos": 150,
    "compras_premio": 5,
    "premios_ganados": 1,
    "visitas": 6,
    "total_gastado": 180000
  }'
```

### PATCH /api/fidelizacion/:id/estado
Cambia el estado de una fidelización.

```bash
curl -X PATCH http://localhost:3000/api/fidelizacion/:id/estado \
  -H "Content-Type: application/json" \
  -d '{
    "estado": "INACTIVO"
  }'
```

### DELETE /api/fidelizacion/:id
Elimina un programa de fidelización.

```bash
curl -X DELETE http://localhost:3000/api/fidelizacion/:id
```

> **Nota:** existe un índice único por `restaurante_id` + `cliente_id`; cada cliente tiene un solo programa por restaurante.

---

## Reportes

### GET /api/reportes/:restauranteId
Obtiene todos los reportes de un restaurante específico.

```bash
curl http://localhost:3000/api/reportes/:id
```

### GET /api/reportes/:restauranteId/:fecha
Obtiene un reporte específico de un restaurante por fecha.

```bash
curl http://localhost:3000/api/reportes/:id/2024-01-15
```

### POST /api/reportes/generar/:restauranteId
Genera un nuevo reporte para un restaurante.

```bash
curl -X POST http://localhost:3000/api/reportes/generar/:id
```

### PUT /api/reportes/:id
Actualiza un reporte existente.

```bash
curl -X PUT http://localhost:3000/api/reportes/:id \
  -H "Content-Type: application/json" \
  -d '{
    "total_ingresos": 500000,
    "total_platos_entregados": 25
  }'
```

### DELETE /api/reportes/:id
Elimina un reporte.

```bash
curl -X DELETE http://localhost:3000/api/reportes/:id
```

**Campos del reporte:**
- `restaurante_id`: ID del restaurante
- `fecha`: Fecha del reporte
- `total_ingresos`: Total de ingresos del día
- `total_platos_entregados`: Cantidad de platos entregados
- `total_platos_cancelados`: Cantidad de platos cancelados
- `total_platos_devueltos`: Cantidad de platos devueltos
- `promedio_tiempo_entrega`: Tiempo promedio de entrega
- `ingresos_por_plato`: Array con ingresos por cada plato
- `categoria_mas_vendida`: Categoría más vendida
- `categoria_menos_vendida`: Categoría menos vendida

---

## Estadísticas

### GET /api/stats
Obtiene estadísticas del restaurante del usuario autenticado (admin o empleado). **Requiere Bearer token.**

```bash
curl http://localhost:3000/api/stats \
  -H "Authorization: Bearer :token"
```

**Respuesta:**
```json
{
  "mesas": 12,
  "pedidosHoy": 8,
  "clientes": 25,
  "ventasHoy": 185000
}
```

- `mesas`: total de mesas del restaurante
- `pedidosHoy`: pedidos creados hoy
- `clientes`: clientes fidelizados únicos (ACTIVO) del restaurante
- `ventasHoy`: suma de `precio × cantidad` de los pedidos ENTREGADO de hoy

**Errores:** `404` si el usuario no tiene restaurante asociado.

---

## Seguridad

- Autenticación por **JWT** (`Authorization: Bearer <token>`), token con expiración de 8 horas
- Rutas protegidas: platos (CRUD completo), categorías, `restaurantes/mios`, `PUT/DELETE /restaurantes/:id`, perfil, avatar, cuenta, suscripción y stats
- Las contraseñas se encriptan con **bcrypt** (costo 10)
- Los endpoints excluyen campos sensibles (contraseñas) en las respuestas
- Subida de imágenes con multer: solo archivos `image/*`, máx. 5 MB
- Eliminación de cuentas diferida: pasa a `BAJA` y se purga definitivamente a los 30 días (job automático)
- **Pendiente para producción:** forzar `JWT_SECRET` seguro en `.env`, HTTPS, rate limiting y validación de entrada con un esquema (Joi/Zod)
