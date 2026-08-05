import { useEffect, useState } from 'react'
import { useAuth, API_URL } from '../auth'
import { useNavigate } from 'react-router'
import {
  FiLogOut, FiUser, FiStar, FiMapPin, FiUsers,
  FiShoppingCart, FiCoffee, FiHeart, FiBarChart2, FiGrid, FiTrendingUp, FiHome as FiHomeIcon
} from 'react-icons/fi'

const formatCOP = (n) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="cursor-pointer rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-orange-100/50">
      <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${accent}`}>
        <Icon className="h-6 w-6" />
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="mt-1 text-sm text-gray-500">{label}</p>
    </div>
  )
}

function ModuleCard({ icon: Icon, title, desc, onClick }) {
  return (
    <div
      className="cursor-pointer rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-orange-100/50"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mb-1 font-semibold text-gray-900">{title}</h3>
      <p className="text-sm leading-relaxed text-gray-500">{desc}</p>
    </div>
  )
}

function Dashboard() {
  const { user, restaurante, loading, logout, token } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)

  useEffect(() => {
    if (!token) return
    fetch(`${API_URL}/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setStats(data))
      .catch(() => setStats(null))
  }, [token])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="flex items-center gap-3 text-gray-500">
          <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
          Cargando sesión...
        </div>
      </div>
    )
  }

  if (!user) {
    navigate('/login')
    return null
  }

  const isAdmin = user.tipo === 'admin'

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const numMesas = stats?.mesas ?? restaurante?.mesas?.length ?? '--'

  const statsCards = isAdmin
    ? [
        { icon: FiGrid, label: 'Mesas activas', value: numMesas, accent: 'bg-orange-50 text-orange-600' },
        { icon: FiUsers, label: 'Clientes', value: stats?.clientes ?? '--', accent: 'bg-blue-50 text-blue-600' },
        { icon: FiShoppingCart, label: 'Pedidos de hoy', value: stats?.pedidosHoy ?? '--', accent: 'bg-green-50 text-green-600' },
        { icon: FiBarChart2, label: 'Ventas del día', value: stats ? formatCOP(stats.ventasHoy) : '--', accent: 'bg-purple-50 text-purple-600' },
      ]
    : [
        { icon: FiShoppingCart, label: 'Mis pedidos', value: stats?.pedidosHoy ?? '--', accent: 'bg-orange-50 text-orange-600' },
        { icon: FiCoffee, label: 'Platos en carta', value: '--', accent: 'bg-blue-50 text-blue-600' },
        { icon: FiHeart, label: 'Fidelización', value: '--', accent: 'bg-green-50 text-green-600' },
      ]

  const modules = isAdmin
    ? [
        { icon: FiGrid, title: 'Mesas', desc: 'Gestiona tus mesas y sus códigos QR.' },
        { icon: FiCoffee, title: 'Platos', desc: 'Administra el menú de tu restaurante.', to: '/dashboard/platos' },
        { icon: FiShoppingCart, title: 'Pedidos', desc: 'Consulta y gestiona los pedidos.' },
        { icon: FiUsers, title: 'Empleados', desc: 'Administra meseros y cocina.' },
        { icon: FiHeart, title: 'Fidelización', desc: 'Puntos y clientes frecuentes.' },
        { icon: FiBarChart2, title: 'Reportes', desc: 'Métricas y ventas de tu negocio.' },
      ]
    : [
        { icon: FiShoppingCart, title: 'Tomar pedido', desc: 'Registra pedidos de las mesas.' },
        { icon: FiCoffee, title: 'Carta', desc: 'Consulta los platos disponibles.' },
        { icon: FiGrid, title: 'Mesas', desc: 'Estado de las mesas asignadas.' },
      ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <a href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-600 font-bold text-lg text-white">Q</div>
            <span className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">QRTa</span>
          </a>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 text-right sm:flex">
              <div>
                <p className="text-sm font-semibold text-gray-900">{user.nombre}</p>
                <p className="text-xs text-gray-500">{isAdmin ? 'Administrador' : user.rol || 'Empleado'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-50"
            >
              <FiLogOut className="h-4 w-4" />
              Cerrar sesión
            </button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        {/* Saludo */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Hola, {user.nombre} 👋
            </h1>
            <p className="mt-1 text-sm text-gray-500 sm:text-base">
              {isAdmin
                ? 'Resumen de tu restaurante'
                : 'Bienvenido a tu panel de trabajo'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
              {user.plan === 'pro' ? 'Plan Pro' : 'Plan Gratis'}
            </span>
          </div>
        </div>

        {/* Datos del restaurante */}
        {isAdmin && (
          <div className="mb-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
              <div className="mb-3 flex items-center gap-2 text-orange-600">
                <FiHomeIcon className="h-5 w-5" />
                <h3 className="font-semibold text-gray-900">Restaurante</h3>
              </div>
              {restaurante ? (
                <>
                  <p className="font-semibold text-gray-900">{restaurante.nombre}</p>
                  <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                    <FiMapPin className="h-4 w-4" />
                    {restaurante.ubicacion}
                  </p>
                </>
              ) : (
                <p className="text-sm text-gray-500">No tienes restaurante registrado.</p>
              )}
            </div>
            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
              <div className="mb-3 flex items-center gap-2 text-orange-600">
                <FiUser className="h-5 w-5" />
                <h3 className="font-semibold text-gray-900">Cuenta</h3>
              </div>
              <p className="font-semibold text-gray-900">{user.email}</p>
              <p className="mt-1 text-sm text-gray-500">@{user.usuario}</p>
            </div>
            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
              <div className="mb-3 flex items-center gap-2 text-orange-600">
                <FiStar className="h-5 w-5" />
                <h3 className="font-semibold text-gray-900">Plan</h3>
              </div>
              <p className="font-semibold text-gray-900">{user.plan === 'pro' ? 'Pro' : 'Gratis'}</p>
              <p className="mt-1 text-sm text-gray-500">
                {user.plan === 'pro' ? 'Todas las funciones desbloqueadas.' : 'Mejora para acceder a más funciones.'}
              </p>
            </div>
          </div>
        )}

        {/* Stats */}
        <section className="mb-10">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Estadísticas</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {statsCards.map((s, i) => (
              <StatCard key={i} {...s} />
            ))}
          </div>
        </section>

        {/* Módulos */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Módulos</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {modules.map((m, i) => (
              <ModuleCard key={i} {...m} onClick={m.to ? () => navigate(m.to) : undefined} />
            ))}
          </div>
        </section>

        <p className="mt-12 flex items-center justify-center gap-2 text-sm text-gray-400">
          <FiTrendingUp className="h-4 w-4" />
          Los módulos estarán disponibles próximamente.
        </p>
      </main>
    </div>
  )
}

export default Dashboard
