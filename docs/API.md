# QRTA - Documentación de la API

Backend API para la gestión completa de restaurantes, desarrollado con Node.js, Express y MongoDB.

**Base URL:** `http://localhost:3000/api`

**Documentación Swagger:** `http://localhost:3000/api-docs`

---

## Autenticación

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
  "user": {
    "_id": ":id",
    "nombre": "Juan Pérez",
    "email": "juan@example.com",
    "usuario": "juanperez",
    "plan": "pro",
    "fecha_registro": "2024-01-15T10:30:00.000Z",
    "estado": "ACTIVO"
  },
  "restaurante": {
    "_id": ":restauranteId",
    "nombre": "Restaurante La Cocina",
    "ubicacion": "Calle 123 #45-67"
  }
}
```

**Nota:** El campo `restaurante` solo se retorna si el tipo es `"admin"` y tiene un restaurante asociado.

**Errores:**
- `400`: Datos faltantes o tipo inválido
- `401`: Credenciales incorrectas
- `403`: Cuenta inactiva

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
Crea un nuevo plato.

```bash
curl -X POST http://localhost:3000/api/platos \
  -H "Content-Type: application/json" \
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

### PUT /api/platos/:id
Actualiza un plato.

```bash
curl -X PUT http://localhost:3000/api/platos/:id \
  -H "Content-Type: application/json" \
  -d '{
    "estado": "AGOTADO",
    "descripcion": "Descripción actualizada"
  }'
```

### DELETE /api/platos/:id
Elimina un plato.

```bash
curl -X DELETE http://localhost:3000/api/platos/:id
```

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

### DELETE /api/fidelizacion/:id
Elimina un programa de fidelización.

```bash
curl -X DELETE http://localhost:3000/api/fidelizacion/:id
```

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

## Seguridad

- Las contraseñas se encriptan utilizando bcrypt con un factor de costo de 10
- Los endpoints excluyen campos sensibles (como contraseñas) en las respuestas
- CORS habilitado para desarrollo
- Se recomienda implementar JWT y middleware de autorización para producción
