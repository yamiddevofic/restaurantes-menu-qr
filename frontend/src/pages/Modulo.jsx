import { useNavigate, useParams } from 'react-router'
import { useAuth } from '../auth'
import {
  FiArrowLeft, FiLogOut, FiGrid, FiShoppingCart,
  FiUsers, FiHeart, FiBarChart2, FiSettings, FiUser
} from 'react-icons/fi'
import { HeaderMenu } from '../components/HeaderMenu'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'

const modules = {
  mesas: { icon: FiGrid, title: 'Mesas', desc: 'Gestiona tus mesas y sus códigos QR.' },
  pedidos: { icon: FiShoppingCart, title: 'Pedidos', desc: 'Consulta y gestiona los pedidos.' },
  empleados: { icon: FiUsers, title: 'Empleados', desc: 'Administra meseros y cocina.' },
  fidelizacion: { icon: FiHeart, title: 'Fidelización', desc: 'Puntos y clientes frecuentes.' },
  reportes: { icon: FiBarChart2, title: 'Reportes', desc: 'Métricas y ventas de tu negocio.' },
}

function Modulo() {
  const { modulo } = useParams()
  const navigate = useNavigate()
  const { user, loading, logout } = useAuth()
  const module = modules[modulo]

  if (loading) return null

  if (!user || !module) {
    navigate(module ? '/login' : '/dashboard')
    return null
  }

  const Icon = module.icon

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16 dark:bg-gray-950">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 border-b border-gray-100 dark:border-gray-800 bg-white/80 backdrop-blur-md dark:bg-gray-900/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <button
            onClick={() => navigate('/dashboard')}
            title="Volver al panel de administración"
            className="hidden min-h-11 items-center gap-2 rounded-full px-3 text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 xl:flex"
          >
            <FiArrowLeft className="h-4 w-4" />
            Panel
          </button>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 font-bold text-lg text-white">Q</span>
            <span className="text-lg font-bold tracking-tight text-gray-900 dark:text-gray-100">{module.title}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 xl:flex">
              <button
                onClick={handleLogout}
                aria-label="Cerrar sesión"
                title="Cerrar sesión"
                className="flex min-h-11 items-center justify-center rounded-full px-3 text-gray-500 dark:text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-200"
              >
                <FiLogOut className="h-5 w-5" />
              </button>
            </div>

            <HeaderMenu>
              <div className="flex flex-col p-2">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  title="Volver al panel de administración"
                  className="flex min-h-12 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800"
                >
                  <FiArrowLeft className="h-5 w-5" />
                  Panel
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/dashboard/perfil')}
                  title="Ver mi perfil"
                  className="flex min-h-12 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800"
                >
                  <FiUser className="h-5 w-5" />
                  Perfil
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/dashboard/perfil?tab=config')}
                  title="Configuración"
                  className="flex min-h-12 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800"
                >
                  <FiSettings className="h-5 w-5" />
                  Configuración
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  title="Cerrar sesión"
                  className="flex min-h-12 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium text-error-600 transition-colors hover:bg-error-50 dark:text-error-400 dark:hover:bg-error-500/10"
                >
                  <FiLogOut className="h-5 w-5" />
                  Cerrar sesión
                </button>
              </div>
            </HeaderMenu>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <Card className="mx-auto max-w-xl p-8 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
            <Icon className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{module.title}</h1>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-gray-500 dark:text-gray-400">
            {module.desc} Este módulo estará disponible próximamente.
          </p>
          <Button
            className="mt-6"
            onClick={() => navigate('/dashboard')}
            title="Volver al panel de administración"
          >
            <FiArrowLeft className="h-4 w-4" />
            Volver al panel
          </Button>
        </Card>
      </main>
    </div>
  )
}

export default Modulo