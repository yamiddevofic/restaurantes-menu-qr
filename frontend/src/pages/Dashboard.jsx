import { useEffect, useState } from 'react'
import { useAuth, API_URL } from '../auth'
import { useNavigate } from 'react-router'
import { Card } from '../components/ui/Card'
import { Spinner } from '../components/ui/Spinner'
import { Button } from '../components/ui/Button'
import { formatCOP } from '../utils/format'
import {
  FiLogOut, FiStar, FiUsers,
  FiShoppingCart, FiCoffee, FiTrendingUp, FiHeart, FiBarChart2, FiGrid,
  FiUser, FiSettings
} from 'react-icons/fi'
import { MdWavingHand } from 'react-icons/md'
import { SideDrawer, DrawerItem } from '../components/SideDrawer'
import { Avatar } from '../components/Avatar'

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <Card hover className="cursor-pointer">
      <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${accent}`}>
        <Icon className="h-6 w-6" />
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{label}</p>
    </Card>
  )
}

function ModuleCard({ icon: Icon, title, desc, onClick }) {
  return (
    <Card
      hover
      className="cursor-pointer"
      onClick={onClick}
      role="button"
      tabIndex={0}
      title={desc}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
    >
      <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400`}>
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mb-1 font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
      <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400">{desc}</p>
    </Card>
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
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 to-accent-50 dark:from-gray-900 dark:to-gray-950">
        <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
          <Spinner className="h-5 w-5" />
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
        { icon: FiGrid, label: 'Mesas activas', value: numMesas, accent: 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400' },
        { icon: FiUsers, label: 'Clientes', value: stats?.clientes ?? '--', accent: 'bg-info-50 text-info-600 dark:bg-info-500/15 dark:text-info-400' },
        { icon: FiShoppingCart, label: 'Pedidos de hoy', value: stats?.pedidosHoy ?? '--', accent: 'bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-400' },
        { icon: FiBarChart2, label: 'Ventas del día', value: stats ? formatCOP(stats.ventasHoy) : '--', accent: 'bg-purple-50 text-purple-600 dark:bg-purple-500/15 dark:text-purple-400' },
      ]
    : [
        { icon: FiShoppingCart, label: 'Mis pedidos', value: stats?.pedidosHoy ?? '--', accent: 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400' },
        { icon: FiCoffee, label: 'Platos en carta', value: '--', accent: 'bg-info-50 text-info-600 dark:bg-info-500/15 dark:text-info-400' },
        { icon: FiHeart, label: 'Fidelización', value: '--', accent: 'bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-400' },
      ]

  const modules = isAdmin
    ? [
        { icon: FiGrid, title: 'Mesas', desc: 'Gestiona tus mesas y sus códigos QR.', to: '/dashboard/mesas' },
        { icon: FiCoffee, title: 'Platos', desc: 'Administra el menú de tu restaurante.', to: '/dashboard/platos' },
        { icon: FiShoppingCart, title: 'Pedidos', desc: 'Consulta y gestiona los pedidos.', to: '/dashboard/pedidos' },
        { icon: FiUsers, title: 'Empleados', desc: 'Administra meseros y cocina.', to: '/dashboard/empleados' },
        { icon: FiHeart, title: 'Fidelización', desc: 'Puntos y clientes frecuentes.', to: '/dashboard/fidelizacion' },
        { icon: FiBarChart2, title: 'Reportes', desc: 'Métricas y ventas de tu negocio.', to: '/dashboard/reportes' },
      ]
    : [
        { icon: FiShoppingCart, title: 'Tomar pedido', desc: 'Registra pedidos de las mesas.', to: '/dashboard/pedidos' },
        { icon: FiCoffee, title: 'Carta', desc: 'Consulta los platos disponibles.', to: '/dashboard/platos' },
        { icon: FiGrid, title: 'Mesas', desc: 'Estado de las mesas asignadas.', to: '/dashboard/mesas' },
      ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Navbar */}
      <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-md dark:border-gray-800 dark:bg-gray-900/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <a href="/" className="flex items-center gap-2" title="Ir al inicio de QRTa">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 font-bold text-lg text-white">Q</div>
            <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-2xl">QRTa</span>
          </a>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-3 xl:flex">
              <div className="flex items-center gap-3 text-right">
                  <button
                    type="button"
                    onClick={() => navigate('/dashboard/perfil')}
                    className="flex items-center gap-3 rounded-xl px-2 py-1.5 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                    title="Ver mi perfil"
                  >
                    <Avatar user={user} />
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{user.nombre}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{isAdmin ? 'Administrador' : user.rol || 'Empleado'}</p>
                    </div>
                  </button>
                </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                title="Cierra tu sesión actual"
              >
                <FiLogOut className="h-4 w-4" />
                Cerrar sesión
              </Button>
            </div>
<SideDrawer user={user}>
              <div className="flex flex-1 flex-col overflow-y-auto p-2">
                <DrawerItem
                  icon={FiUser}
                  label="Perfil"
                  onClick={() => navigate('/dashboard/perfil')}
                />
                <DrawerItem
                  icon={FiSettings}
                  label="Configuración"
                  onClick={() => navigate('/dashboard/perfil?tab=config')}
                />
              </div>
              <div className="border-t border-gray-100 p-2 dark:border-gray-800">
                <button
                  type="button"
                  onClick={handleLogout}
                  title="Cierra tu sesión actual"
                  className="flex min-h-12 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium text-error-600 transition-colors hover:bg-error-50 dark:text-error-400 dark:hover:bg-error-500/10"
                >
                  <FiLogOut className="h-5 w-5" />
                  Cerrar sesión
                </button>
              </div>
            </SideDrawer>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        {/* Saludo */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 sm:text-3xl">
                Hola, {user.nombre}
              </h1>
              <MdWavingHand
                className="h-7 w-7 text-accent-500"
                aria-label="Saludo"
              />
            </div>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 sm:text-base">
              {isAdmin
                ? 'Resumen de tu restaurante'
                : 'Bienvenido a tu panel de trabajo'}
            </p>
          </div>
          </div>

        {/* Plan */}
        {isAdmin && (
          <div className="mb-8">
            {user.plan === 'pro' ? (
              <Card className="relative max-w-md overflow-hidden bg-gradient-to-r from-brand-600 via-brand-500 to-accent-500 shadow-lg shadow-brand-600/20">
                <div aria-hidden="true" className="absolute inset-0">
                  <div className="absolute -top-10 left-1/4 h-32 w-32 rounded-full bg-white/10 blur-2xl"></div>
                  <div className="absolute -bottom-14 right-1/4 h-36 w-36 rounded-full bg-white/10 blur-2xl"></div>
                </div>
                <div className="relative">
                  <div className="mb-3 flex items-center gap-2 text-white">
                    <FiStar className="h-5 w-5" />
                    <h3 className="font-semibold">Plan</h3>
                  </div>
                  <p className="font-semibold text-white">Plan Pro</p>
                  <p className="mt-1 text-sm text-white/85">Todas las funciones desbloqueadas.</p>
                </div>
              </Card>
            ) : (
              <Card className="max-w-md">
                <h3 className="mb-1 font-semibold text-gray-900 dark:text-gray-100">Plan</h3>
                <p className="font-semibold text-gray-900 dark:text-gray-100">Plan Gratis</p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Mejora para acceder a más funciones.
                </p>
              </Card>
            )}
          </div>
        )}

        {/* Stats */}
        <section className="mb-10">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">Estadísticas</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {statsCards.map((s, i) => (
              <StatCard key={i} {...s} />
            ))}
          </div>
        </section>

        {/* Módulos */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">Módulos</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {modules.map((m, i) => (
              <ModuleCard key={i} {...m} onClick={m.to ? () => navigate(m.to) : undefined} />
            ))}
          </div>
        </section>

        <p className="mt-12 flex items-center justify-center gap-2 text-sm text-gray-400 dark:text-gray-500">
          <FiTrendingUp className="h-4 w-4" />
          Los módulos estarán disponibles próximamente.
        </p>
      </main>
    </div>
  )
}

export default Dashboard
