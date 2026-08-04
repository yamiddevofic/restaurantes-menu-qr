// App.jsx — Versión moderna de QRTa
// Requiere: Tailwind CSS configurado en tu proyecto

function App() {
  return (
    <div className="min-h-screen bg-white font-sans antialiased">
      {/* Navbar */}
      <nav className="fixed top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-600 text-white font-bold text-lg">Q</div>
            <span className="text-2xl font-bold tracking-tight text-gray-900">QRTa</span>
          </div>
          <div className="hidden gap-8 md:flex">
            <a href="#features" className="text-sm font-medium text-gray-500 transition-colors hover:text-orange-600">Funciones</a>
            <a href="#como-funciona" className="text-sm font-medium text-gray-500 transition-colors hover:text-orange-600">Cómo funciona</a>
            <a href="#precios" className="text-sm font-medium text-gray-500 transition-colors hover:text-orange-600">Precios</a>
            <a href="#contacto" className="text-sm font-medium text-gray-500 transition-colors hover:text-orange-600">Contacto</a>
          </div>
          <button className="rounded-full bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-600/20 transition-all hover:bg-orange-700 hover:shadow-orange-600/30 hover:-translate-y-0.5" onClick={() => window.location.href = '/login'}>
            Iniciar sesión
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-20 md:pt-48 md:pb-32">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-0 h-[600px] w-[600px] rounded-full bg-orange-50 opacity-60 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-amber-50 opacity-60 blur-3xl"></div>
        </div>

        <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 px-6 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50/80 px-4 py-1.5 text-sm font-medium text-orange-700 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-500"></span>
            </span>
            Menús digitales con código QR
          </span>

          <h1 className="max-w-4xl text-5xl font-extrabold tracking-tight text-gray-900 md:text-7xl">
            El menú de tu restaurante,
            <span className="bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent"> directo desde la mesa</span>
          </h1>

          <p className="max-w-2xl text-lg leading-relaxed text-gray-500 md:text-xl">
            Tus clientes escanean el QR, ven el menú y ordenan sin esperar mesero.
            Gestiona pedidos, platos, mesas y fidelización desde un solo panel.
          </p>

          <div className="flex flex-col gap-4 pt-4 sm:flex-row">
            <button className="group rounded-full bg-orange-600 px-8 py-3.5 font-semibold text-white shadow-xl shadow-orange-600/25 transition-all hover:bg-orange-700 hover:shadow-orange-600/40 hover:-translate-y-0.5" onClick={() => window.location.href = '/registro'}>
              Crear mi restaurante
              <svg className="ml-2 inline-block h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
            </button>
            <button className="rounded-full border border-gray-200 bg-white px-8 py-3.5 font-semibold text-gray-700 shadow-sm transition-all hover:border-gray-300 hover:bg-gray-50 hover:-translate-y-0.5">
              Ver demo del menú
            </button>
          </div>

          {/* Stats */}
          <div className="mt-12 grid grid-cols-3 gap-8 border-t border-gray-100 pt-10">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">500+</div>
              <div className="mt-1 text-sm text-gray-500">Restaurantes</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">2M+</div>
              <div className="mt-1 text-sm text-gray-500">Pedidos gestionados</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">4.9</div>
              <div className="mt-1 text-sm text-gray-500">Valoración media</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative bg-gray-50/50 px-6 py-24 md:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-orange-600">Funciones</h2>
            <p className="mt-3 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
              Todo lo que necesita tu restaurante
            </p>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-500">
              Un sistema completo para digitalizar y optimizar cada aspecto de tu negocio gastronómico.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: "📱", title: "Menú digital por QR", desc: "Cada mesa tiene su propio código QR. El cliente escanea y ve el menú al instante, sin apps ni descargas." },
              { icon: "🍽️", title: "Gestión de pedidos", desc: "Recibe, actualiza y sigue el estado de cada pedido en tiempo real: pendiente, listo, entregado." },
              { icon: "🏪", title: "Multi-restaurante", desc: "Administra varios restaurantes desde una sola cuenta, cada uno con su menú y personal." },
              { icon: "🪑", title: "Gestión de mesas", desc: "Crea mesas, genera códigos QR únicos por mesa y gestiona la asignación de pedidos." },
              { icon: "📋", title: "Categorías y platos", desc: "Organiza tu menú en categorías. Agrega platos con precios, ingredientes y disponibilidad." },
              { icon: "📊", title: "Reportes automáticos", desc: "Ingresos, platos más vendidos, categorías top y tiempos de entrega calculados cada día." },
              { icon: "⭐", title: "Fidelización", desc: "Puntos y recompensas por cada visita. Seguimiento de compras y visitas por restaurante." },
              { icon: "👥", title: "Gestión de personal", desc: "Administra empleados con roles: mesero o cocina, cada uno con su acceso al sistema." },
            ].map((f, i) => (
              <div key={i} className="group rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 transition-all hover:shadow-lg hover:shadow-orange-100/50 hover:-translate-y-1">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-2xl transition-colors group-hover:bg-orange-100">{f.icon}</div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">{f.title}</h3>
                <p className="text-sm leading-relaxed text-gray-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section id="como-funciona" className="mx-auto max-w-6xl px-6 py-24 md:px-12">
        <div className="mb-16 text-center">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-orange-600">Proceso</h2>
          <p className="mt-3 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">Así de simple</p>
        </div>

        <div className="relative grid gap-12 md:grid-cols-4">
          <div className="absolute top-6 left-0 hidden h-0.5 w-full bg-gradient-to-r from-orange-200 via-orange-400 to-orange-600 md:block"></div>

          {[
            { num: "1", title: "Registra tu restaurante", desc: "Crea tu cuenta y registra la información de tu restaurante en minutos." },
            { num: "2", title: "Configura tu menú", desc: "Agrega categorías, platos con precios e ingredientes de forma intuitiva." },
            { num: "3", title: "Genera mesas y QR", desc: "Crea mesas y genera códigos QR únicos listos para imprimir y colocar." },
            { num: "4", title: "Gestiona pedidos", desc: "Los clientes escanean, ordenan y tú administras todo desde el panel." },
          ].map((s, i) => (
            <div key={i} className="relative text-center">
              <div className="relative z-10 mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-white text-xl font-bold text-orange-600 shadow-lg ring-4 ring-orange-50">
                {s.num}
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">{s.title}</h3>
              <p className="text-sm leading-relaxed text-gray-500">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="relative overflow-hidden bg-orange-600 px-6 py-20 text-center">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 h-64 w-64 rounded-full bg-orange-500 opacity-50 blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-amber-500 opacity-30 blur-3xl"></div>
        </div>

        <div className="mx-auto max-w-3xl">
          <h2 className="mb-4 text-3xl font-bold text-white md:text-5xl">
            Digitaliza el menú de tu restaurante hoy
          </h2>
          <p className="mb-10 text-lg text-orange-100">
            Sin instalaciones, sin complicaciones. Empieza gratis y escala cuando lo necesites.
          </p>
          <button className="rounded-full bg-white px-10 py-4 text-lg font-semibold text-orange-600 shadow-2xl shadow-orange-900/20 transition-all hover:bg-orange-50 hover:scale-105">
            Comenzar ahora — es gratis
          </button>
          <p className="mt-4 text-sm text-orange-200">No requiere tarjeta de crédito</p>
        </div>
      </section>

      {/* Footer */}
      <footer id="contacto" className="border-t border-gray-100 bg-gray-50 px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-600 text-white font-bold">Q</div>
              <span className="text-xl font-bold text-gray-900">QRTa</span>
            </div>
            <div className="flex gap-6 text-sm text-gray-500">
              <a href="#" className="hover:text-orange-600 transition-colors">Privacidad</a>
              <a href="#" className="hover:text-orange-600 transition-colors">Términos</a>
              <a href="#" className="hover:text-orange-600 transition-colors">Soporte</a>
            </div>
            <p className="text-sm text-gray-400">© 2026 QRTa — Sistema de Gestión de Restaurantes</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App