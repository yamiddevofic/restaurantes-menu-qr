export const preciosTitle = {
  tag: 'Precios',
  heading: 'Empieza gratis. Paga solo cuando crezcas',
  subtitle: 'Sin tarjetas, sin letra pequeña. Un plan sencillo pensado para restaurantes pequeños.',
}

export const planes = [
  {
    id: 'free',
    nombre: 'Gratis',
    precio: '$0',
    periodo: 'para siempre',
    descripcion: 'Perfecto para empezar a digitalizar tu restaurante hoy mismo.',
    destacado: false,
    cta: 'Empezar gratis',
    caracteristicas: [
      'Menú digital con código QR',
      'Hasta 10 mesas con QR propio',
      'Hasta 30 platos y 5 categorías',
      'Pedidos con estados',
      'Soporte por WhatsApp',
    ],
  },
  {
    id: 'pro',
    nombre: 'Pro',
    precio: '$25.000',
    periodo: '/mes',
    descripcion: 'Para restaurantes que quieren más control y crecer con datos.',
    destacado: true,
    cta: 'Probar Pro gratis 30 días',
    caracteristicas: [
      'Todo lo del plan Gratis',
      'Mesas, platos y categorías ilimitados',
      'Reportes diarios de ventas y platos',
      'Empleados con roles (mesero y cocina)',
      'Programa de fidelización con puntos',
      'Atención prioritaria por WhatsApp',
    ],
  },
]

export const preciosNota = {
  titulo: '¿Dudas sobre cuál elegir?',
  texto: 'Escríbenos por WhatsApp y te ayudamos a decidir. Sin compromiso.',
}
