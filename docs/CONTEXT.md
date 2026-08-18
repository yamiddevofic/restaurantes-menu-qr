# QRTa — Contexto del Proyecto

## Visión general

**QRTa** es un sistema de menús digitales con código QR para restaurantes del municipio de Chitagá, Norte de Santander, Colombia. Creado por **Chitagá Tech**, una empresa sin ánimo de lucro enfocada en educación y desarrollo tecnológico.

---

## Público objetivo

- **Restaurantes pequeños/medianos de Chitagá** — Negocios familiares, 1-2 sedes, 10-50 mesas
- Geografía: Norte de Santander, Colombia
- Contexto: Zona rural/urbana pequeña, acceso limitado a tecnología

---

## Problema principal

1. **Falta de menús visibles** — El cliente no sabe qué hay, el mesero tiene que explicar todo
2. **Retrasos en la atención** — Pedidos perdidos, errores de escritura, mesas sin atención

### Soluciones actuales (competencia)
- WhatsApp (solo para domicilios)
- Menús en papel
- Comunicación voz a voz (mesero ↔ cocina)
- Formularios de Google estáticos
- **No existe competencia digital local**

---

## Diferenciadores de QRTa

| Diferenciador | Descripción |
|---------------|-------------|
| **Local** | Diseñado para restaurantes de Chitagá, no es una plataforma genérica |
| **Sin apps** | El cliente escanea el QR y ve el menú. Sin descargas, sin registros |
| **Control desde el celular** | El dueño gestiona todo desde su celular en tiempo real |
| **Precios accesibles** | Precio adaptado a restaurantes pequeños del municipio |
| **Empresa sin fines de lucro** | Chitagá Tech enfocado en educación y desarrollo, no en maximizar ganancias |

---

## Modelo de negocio

**Freemium:**
- **Plan Gratis:** Prueba con restricciones (número de mesas, platos, categorías limitados)
- **Plan Pro:** Funciones completas + reportes avanzados
- Objetivo: Que el restaurante pruebe gratis y si le gusta, pague

---

## Objetivos del sitio web

1. **Generar registros** — Que el dueño se registre y empiece a usarlo
2. **Generar leads/consultas** — Que llamen o escriban para más información
3. **Informar y generar confianza** — Que entiendan qué es QRTa y sientan confianza

---

## Tono de marca

**Cercano/casual** — Como un amigo que te ayuda, no una empresa corporativa. El usuario es el dueño de un restaurante pequeño, no un ejecutivo de tecnología.

---

## Canal de contacto preferido

Todos los canales deben estar disponibles:
- WhatsApp/teléfono
- Formulario web
- Registro directo en la app

---

## Idioma

**Español (Colombia)** — Nada de inglés. Usar expresiones locales cuando sea apropiado.

---

## Identidad de marca

**Estado:** En definición — Necesita ayuda para definir:
- Colores de marca
- Logo
- Tipografías
- Guía de estilo visual

### Colores actuales (en el código)
- Primario: `orange-600` (#ea580c)
- Secundario: `amber-300/400`
- Neutros: `gray-50/100/500/900`
- Overlay: `black/60`

---

## Estado actual del proyecto

**Funcional, falta pulir:**
- Backend: Express 5 + MongoDB Atlas con autenticación JWT (funcional)
- Frontend: React 19 + Vite 8 + Tailwind CSS 4 (funcional)
- Login/Registro: Funcional, con sesión JWT restaurada vía `/api/auth/me`
- Landing page: Funcional, data-driven (datos en `src/data/`)
- Panel de administración: Dashboard con estadísticas, módulo de platos y perfil
- Suscripciones: Plan Free/Pro con vencimiento, renovación e historial
- Eliminación de cuentas: Diferida (BAJA + purga a los 30 días)
- Responsive: Mejorado, con menú hamburguesa y drawer lateral
- Modo oscuro: Implementado por clase `.dark` con persistencia en localStorage
- Datos: Separados en archivos `.js` para mantenibilidad

---

## Prioridades

1. **Diseño y confianza** — Que se vea profesional y genere confianza
2. **Conversión/registro** — Que el registro sea fácil y rápido
3. **Mobile experience** — Que funcione bien en celular

---

## Arquitectura actual

```
restaurante-qr/
├── backend/                  # Backend (Express + MongoDB)
│   ├── app/
│   │   ├── controllers/      # Lógica de negocio
│   │   ├── models/           # Schemas de Mongoose
│   │   ├── routes/           # Rutas de la API
│   │   ├── middleware/       # JWT (authMiddleware) y multer (uploads)
│   │   ├── jobs/             # Purga de historial de eliminación (6 h)
│   │   ├── config/           # Swagger
│   │   ├── public/uploads/   # Imágenes servidas estáticamente
│   │   ├── .env
│   │   └── server.js
├── frontend/                 # Frontend (React + Vite + Tailwind)
│   ├── src/
│   │   ├── data/             # Datos separados de UI (nav, hero, features,
│   │   │                     #   steps, footer, auth, faq, legal, precios,
│   │   │                     #   testimonios)
│   │   ├── pages/            # Landing, Login, Registro, Dashboard, Platos,
│   │   │                     #   Perfil, Suscripcion, Modulo, Privacidad,
│   │   │                     #   Terminos
│   │   ├── components/       # Avatar, Modal, SideDrawer, HeaderMenu, ui/, ...
│   │   ├── utils/            # formatCOP, useTheme
│   │   ├── auth.jsx          # Contexto de sesión (JWT + localStorage)
│   │   ├── theme.css         # Design system Tailwind 4
│   │   ├── App.jsx           # Landing page
│   │   ├── main.jsx          # Router principal
│   │   └── index.css
│   └── public/
│       └── media/            # hero.mp4, chef-hero.png
├── docs/                     # Documentación (PRODUCT, BUSINESS, API, ...)
├── start.ps1                 # Script de inicio
├── start.bat                 # Wrapper Windows
└── README.md
```

---

## Funcionalidades del sistema

### Backend (API REST)
- CRUD de administradores, restaurantes, platos, mesas, empleados, clientes
- Autenticación JWT (login admin/empleado, token Bearer de 8 horas)
- Perfil de usuario: actualización, avatar (multipart) y eliminación diferida de cuenta
- Suscripciones: actualizar/renovar/cancelar plan + historial de auditoría
- Generación de códigos QR por mesa
- Sistema de pedidos con estados (pendiente → listo → entregado)
- Fidelización con actualización automática al entregar pedidos
- Reportes automáticos diarios
- Estadísticas del panel (pedidos/ventas del día, mesas, clientes)
- Job de purga: eliminación definitiva de historial vencido (30 días)
- Documentación Swagger en `/api-docs`

### Frontend
- Landing page marketing (data-driven)
- Registro multi-paso (admin + restaurante)
- Login con roles (admin/empleado) y sesión persistente
- Panel de administración: dashboard con stats, módulo de platos, perfil y suscripción
- Módulos pendientes (mesas, pedidos, empleados, fidelización, reportes) con página "próximamente"
- Política de privacidad y términos

---

## Preguntas pendientes

- [x] Definir identidad de marca (colores, logo, tipografía)
- [x] Crear sección de testimonios
- [x] Crear sección de FAQ
- [x] Crear página de precios
- [x] Crear panel de administración
- [x] Integrar frontend con backend (API calls)
- [x] Autenticación con JWT y sesión persistente
- [x] Módulo de platos (categorías + platos + imágenes)
- [x] Perfil de usuario (avatar, restaurantes, configuración)
- [x] Suscripción Free/Pro con historial
- [x] Eliminación diferida de cuentas (BAJA + purga 30 días)
- [x] Crear política de privacidad y términos
- [ ] Configurar dominio y hosting
- [ ] Módulos restantes del panel (mesas, pedidos, empleados, fidelización, reportes)

---

*Documento generado el 04/08/2026 — QRTa by Chitagá Tech*
