const swaggerJsdoc = require("swagger-jsdoc");
const path = require("path");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Qrta API",
      version: "1.0.0",
      description: "Documentación de la API de Qrta - Sistema de gestión de restaurantes"
    },
    servers: [
      {
        url: "http://localhost:3000"
      }
    ],
    components: {
      schemas: {
        Administrador: {
          type: "object",
          properties: {
            _id: { type: "string" },
            nombre: { type: "string" },
            email: { type: "string" },
            usuario: { type: "string" },
            password: { type: "string" },
            plan: { type: "string", enum: ["free", "pro"] },
            fecha_registro: { type: "string", format: "date-time" },
            estado: { type: "string", enum: ["ACTIVO", "INACTIVO", "BAJA"] }
          }
        },
        Empleado: {
          type: "object",
          properties: {
            _id: { type: "string" },
            restaurante_id: { type: "string" },
            nombre: { type: "string" },
            usuario: { type: "string" },
            password: { type: "string" },
            contacto: {
              type: "object",
              properties: {
                correo: { type: "string" },
                celular: { type: "string" }
              }
            },
            rol: { type: "string", enum: ["mesero", "cocina"] },
            estado: { type: "string", enum: ["ACTIVO", "INACTIVO"] }
          }
        },
        Cliente: {
          type: "object",
          properties: {
            _id: { type: "string" },
            nombre: { type: "string" },
            cedula: { type: "string" },
            contacto: {
              type: "object",
              properties: {
                celular: { type: "string" },
                correo: { type: "string" }
              }
            },
            estado: { type: "string", enum: ["ACTIVO", "INACTIVO"] }
          }
        },
        Mesa: {
          type: "object",
          properties: {
            numero: { type: "number" },
            qr_code: { type: "string" },
            qr_image: { type: "string" }
          }
        },
        Categoria: {
          type: "object",
          properties: {
            nombre: { type: "string" },
            descripcion: { type: "string" },
            fecha_creacion: { type: "string", format: "date-time" }
          }
        },
        Restaurante: {
          type: "object",
          properties: {
            _id: { type: "string" },
            nombre: { type: "string" },
            ubicacion: { type: "string" },
            adm_id: { type: "string" },
            mesas: {
              type: "array",
              items: { "$ref": "#/components/schemas/Mesa" }
            },
            categorias: {
              type: "array",
              items: { "$ref": "#/components/schemas/Categoria" }
            },
            fecha_creacion: { type: "string", format: "date-time" }
          }
        },
        Ingrediente: {
          type: "object",
          properties: {
            nombre: { type: "string" },
            cantidad: { type: "number" },
            medida: { type: "string" }
          }
        },
        Plato: {
          type: "object",
          properties: {
            _id: { type: "string" },
            nombre: { type: "string" },
            descripcion: { type: "string" },
            ingredientes: {
              type: "array",
              items: { "$ref": "#/components/schemas/Ingrediente" }
            },
            restaurante_id: { type: "string" },
            categoria_id: { type: "string" },
            precio: { type: "number" },
            estado: { type: "string", enum: ["DISPONIBLE", "AGOTADO"] }
          }
        },
        PlatoPedido: {
          type: "object",
          properties: {
            plato_id: { type: "string" },
            nombre: { type: "string" },
            precio: { type: "number" },
            cantidad: { type: "number" }
          }
        },
        Pedido: {
          type: "object",
          properties: {
            _id: { type: "string" },
            mesa_id: { type: "string" },
            platos: {
              type: "array",
              items: { "$ref": "#/components/schemas/PlatoPedido" }
            },
            estado: { type: "string", enum: ["PENDIENTE", "CANCELADO", "ELIMINADO", "LISTO", "ENTREGADO", "DEVOLUCION"] },
            fecha_cierre: { type: "string", format: "date-time" },
            cliente_id: { type: "string" },
            datetime_created: { type: "string", format: "date-time" }
          }
        },
        Reporte: {
          type: "object",
          properties: {
            _id: { type: "string" },
            restaurante_id: { type: "string" },
            fecha: { type: "string", format: "date" },
            datos: { type: "object" }
          }
        },
        Fidelizacion: {
          type: "object",
          properties: {
            _id: { type: "string" },
            cliente_id: { type: "string" },
            restaurante_id: { type: "string" },
            puntos: { type: "number" },
            estado: { type: "string", enum: ["ACTIVO", "INACTIVO"] }
          }
        }
      }
    }
  },
  apis: [path.join(__dirname, "../routes/*.js").replace(/\\/g, "/")]
};

module.exports = swaggerJsdoc(options);
