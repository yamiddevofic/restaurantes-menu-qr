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
- Backend: Express + MongoDB Atlas (funcional)
- Frontend: React + Vite + Tailwind CSS (funcional)
- Login/Registro: Funcional
- Landing page: Funcional, con copies mejorados
- Responsive: Mejorado, con menú hamburguesa
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
├── app/                    # Backend (Express + MongoDB)
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── config/
│   ├── server.js
│   └── .env
├── frontend/               # Frontend (React + Vite + Tailwind)
│   ├── src/
│   │   ├── data/           # Datos separados de UI
│   │   │   ├── nav.js
│   │   │   ├── hero.js
│   │   │   ├── features.js
│   │   │   ├── steps.js
│   │   │   ├── footer.js
│   │   │   └── auth.js
│   │   ├── pages/
│   │   │   ├── App.jsx     # Landing page
│   │   │   ├── Login.jsx
│   │   │   └── Registro.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   └── public/
│       └── media/
│           └── hero.mp4
├── start.ps1               # Script de inicio
├── start.bat               # Wrapper Windows
└── README.md
```

---

## Funcionalidades del sistema

### Backend (API REST)
- CRUD de administradores, restaurantes, platos, mesas, empleados, clientes
- Sistema de autenticación (login admin/empleado)
- Generación de códigos QR por mesa
- Sistema de pedidos con estados (pendiente → listo → entregado)
- Reportes automáticos diarios
- Sistema de fidelización (puntos y recompensas)
- Documentación Swagger en `/api-docs`

### Frontend
- Landing page marketing
- Registro multi-paso (admin + restaurante)
- Login con roles (admin/empleado)
- Panel de administración (pendiente)

---

## Preguntas pendientes

- [ ] Definir identidad de marca (colores, logo, tipografía)
- [ ] Crear sección de testimonios
- [ ] Crear sección de FAQ
- [ ] Crear página de precios
- [ ] Crear panel de administración
- [ ] Integrar frontend con backend (API calls)
- [ ] Configurar dominio y hosting
- [ ] Crear política de privacidad y términos

---

*Documento generado el 04/08/2026 — QRTa by Chitagá Tech*
