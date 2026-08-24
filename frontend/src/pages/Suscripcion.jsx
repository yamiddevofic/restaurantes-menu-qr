import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { useAuth, API_URL } from '../auth'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Spinner } from '../components/ui/Spinner'
import { Button } from '../components/ui/Button'
import { SideDrawer, DrawerItem } from '../components/SideDrawer'
import {
  FiArrowLeft, FiLogOut, FiGrid, FiSettings, FiUser, FiStar, FiCheck,
  FiChevronDown, FiHome, FiTrendingUp, FiHeart, FiShoppingCart, FiShield
} from 'react-icons/fi'

function Suscripcion() {
  const { user, loading, logout, token, saveSession } = useAuth()
  const navigate = useNavigate()

  const [toast, setToast] = useState(null)
  const [susAccion, setSusAccion] = useState(null)
  const [historialSus, setHistorialSus] = useState([])
  const [verBeneficios, setVerBeneficios] = useState(false)

  useEffect(() => {
    if (!token) return
    fetch(`${API_URL}/auth/suscripcion`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : []))
      .then(setHistorialSus)
      .catch(() => setHistorialSus([]))
  }, [token])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3200)
    return () => clearTimeout(t)
  }, [toast])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
          <Spinner className="h-5 w-5" />
          Cargando sesión...
        </div>
      </div>
    )
  }

  if (!user || !token) {
    navigate('/login')
    return null
  }

  if (user.tipo !== 'admin') {
    navigate('/dashboard')
    return null
  }

  const irA = (to) => navigate(to)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const gestionarSus = async (accion) => {
    setSusAccion(accion)
    try {
      const res = await fetch(`${API_URL}/auth/suscripcion`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ accion }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.message || 'No se pudo actualizar la suscripción')
      saveSession({ token, user: data.user })
      setHistorialSus((prev) => [
        {
          accion,
          plan_anterior: accion === 'actualizar' ? 'free' : accion === 'renovar' ? 'pro' : 'pro',
          plan_nuevo: accion === 'cancelar' ? 'free' : 'pro',
          fecha: new Date().toISOString(),
        },
        ...prev,
      ])
      setToast(
        accion === 'actualizar'
          ? 'Plan Pro activado'
          : accion === 'renovar'
            ? 'Plan Pro renovado +30 días'
            : 'Suscripción eliminada; volviste al plan Gratis'
      )
    } catch (err) {
      setToast(err.message)
    } finally {
      setSusAccion(null)
    }
  }

  const planPro = user?.plan === 'pro'
  const fechaVencimiento = user?.plan_vencimiento ? new Date(user.plan_vencimiento) : null
  const diasRestantes = fechaVencimiento
    ? Math.max(0, Math.ceil((fechaVencimiento.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0
  const planVencido = planPro && diasRestantes <= 0

  return (
    <div className="min-h-screen bg-gray-50 pb-16 dark:bg-gray-950">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 border-b border-gray-100 bg-white/80 backdrop-blur-md dark:border-gray-800 dark:bg-gray-900/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <button
            onClick={() => irA('/dashboard/perfil?tab=config')}
            title="Volver a Configuración"
            className="hidden min-h-11 items-center gap-2 rounded-full px-3 text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 xl:flex"
          >
            <FiArrowLeft className="h-4 w-4" />
            Configuración
          </button>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 font-bold text-lg text-white">Q</span>
            <span className="text-lg font-bold tracking-tight text-gray-900 dark:text-gray-100">Mi suscripción</span>
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

            <SideDrawer user={user}>
              <div className="flex flex-1 flex-col overflow-y-auto p-2">
                <DrawerItem icon={FiGrid} label="Panel" onClick={() => irA('/dashboard')} />
                <DrawerItem icon={FiUser} label="Perfil" onClick={() => irA('/dashboard/perfil')} />
                <DrawerItem icon={FiSettings} label="Configuración" onClick={() => irA('/dashboard/perfil?tab=config')} />
              </div>
              <div className="border-t border-gray-100 p-2 dark:border-gray-800">
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
            </SideDrawer>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-4 pt-3 pb-24 sm:px-6 lg:pb-6">
        <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-800 sm:px-6">
            <div>
              <h2 id="seccion-suscripcion" className="font-semibold text-gray-900 dark:text-gray-100">
                Mi suscripción
              </h2>
              <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                Gestiona el plan de tu cuenta.
              </p>
            </div>
            <Badge tone={planPro ? (planVencido ? 'warning' : 'success') : 'info'} className="shrink-0">
              {planPro ? <FiStar className="mr-1 h-3 w-3" /> : null}
              {planPro ? (planVencido ? 'Pro vencido' : 'Plan Pro') : 'Plan Gratis'}
            </Badge>
          </div>

          <div className="px-5 py-5 sm:px-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {planPro
                    ? planVencido
                      ? 'Tu plan Pro está vencido'
                      : `Tu plan Pro está activo (${diasRestantes} día${diasRestantes === 1 ? '' : 's'} restantes)`
                    : 'Estás en el plan Gratis'}
                </p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {fechaVencimiento
                    ? `Vence el ${fechaVencimiento.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}`
                    : planPro
                      ? 'Sin fecha de vencimiento registrada'
                      : 'Actualiza cuando quieras para desbloquear funciones Pro.'}
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                {!planPro && (
                  <Button type="button" onClick={() => gestionarSus('actualizar')} disabled={susAccion !== null}>
                    <FiStar className="h-4 w-4" />
                    {susAccion === 'actualizar' ? 'Actualizando...' : 'Actualizar a Pro'}
                  </Button>
                )}
                {planPro && (
                  <>
                    <Button type="button" onClick={() => gestionarSus('renovar')} disabled={susAccion !== null}>
                      <FiCheck className="h-4 w-4" />
                      {susAccion === 'renovar' ? 'Renovando...' : 'Renovar 30 días'}
                    </Button>
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => gestionarSus('cancelar')}
                      disabled={susAccion !== null}
                      className="border-error-200 text-error-600 hover:bg-error-50 hover:text-error-700 dark:border-error-500/30 dark:text-error-400 dark:hover:bg-error-500/10 dark:hover:text-error-400"
                    >
                      {susAccion === 'cancelar' ? 'Eliminando...' : 'Eliminar suscripción'}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={() => setVerBeneficios((v) => !v)}
              aria-expanded={verBeneficios}
              title={verBeneficios ? 'Ocultar beneficios del plan Pro' : 'Ver beneficios del plan Pro'}
              className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 sm:px-6"
            >
              <span className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                <FiStar className="h-4 w-4 shrink-0 text-accent-500" />
                ¿Quieres ver los beneficios?
              </span>
              <FiChevronDown
                className={`h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200 dark:text-gray-500 ${
                  verBeneficios ? 'rotate-180' : ''
                }`}
              />
            </button>
            {verBeneficios && (
              <div className="border-t border-gray-100 p-3 dark:border-gray-800">
                <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-accent-400 via-accent-500 to-brand-600 px-6 py-12 text-center shadow-lg shadow-accent-500/20 sm:py-14">
                  <div aria-hidden="true" className="absolute inset-0">
                    <div className="absolute -top-16 -left-12 h-56 w-56 rounded-full bg-white/15 blur-3xl"></div>
                    <div className="absolute -right-10 -bottom-24 h-64 w-64 rounded-full bg-brand-500/50 blur-3xl"></div>
                    <div className="absolute top-8 right-12 h-16 w-16 rounded-full border-2 border-white/25"></div>
                    <div className="absolute bottom-10 left-10 h-8 w-8 rounded-full bg-white/20"></div>
                  </div>
                  <div className="relative mx-auto max-w-sm px-6">
                    <span className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-white shadow-lg shadow-accent-900/20 ring-4 ring-white/25 backdrop-blur-md">
                      <FiStar className="h-7 w-7" />
                      <span className="absolute -right-1 -bottom-1 flex h-6 w-6 items-center justify-center rounded-full bg-white text-accent-500 shadow-md">
                        <FiCheck className="h-3.5 w-3.5" />
                      </span>
                    </span>
                    <span className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-widest text-white ring-1 ring-white/30 backdrop-blur-md">
                      <FiCheck className="h-3 w-3" />
                      Plan Pro
                    </span>
                    <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                      Beneficios del plan Pro
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-white/85 sm:text-base">
                      Desbloquea todo el potencial de tu restaurante
                    </p>
                  </div>
                </div>
                <div className="grid gap-3 pt-3 sm:grid-cols-2 sm:gap-4">
                  {[
                    { icon: FiHome, titulo: 'Múltiples restaurantes', desc: 'Gestiona todas tus sedes desde una sola cuenta' },
                    { icon: FiGrid, titulo: 'Mesas ilimitadas', desc: 'QR dinámicos por mesa, sin límites' },
                    { icon: FiTrendingUp, titulo: 'Reportes avanzados', desc: 'Ventas y pedidos con estadísticas detalladas' },
                    { icon: FiHeart, titulo: 'Fidelización', desc: 'Programa de clientes frecuentes incluido' },
                    { icon: FiShoppingCart, titulo: 'Pedidos a flujo completo', desc: 'Del comensal a la cocina en tiempo real' },
                    { icon: FiShield, titulo: 'Soporte prioritario', desc: 'Atención preferente cuando más lo necesitas' },
                  ].map((b) => (
                    <div
                      key={b.titulo}
                      className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-gray-50 px-4 py-7 text-center transition-colors hover:bg-accent-50 dark:bg-gray-800/70 dark:hover:bg-accent-500/10"
                    >
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent-500 text-white shadow-md shadow-accent-500/30">
                        <b.icon className="h-6 w-6" />
                      </span>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">{b.titulo}</p>
                        <p className="mt-1 text-xs leading-relaxed text-gray-500 dark:text-gray-400">{b.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>

        <div className="h-fit overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800">
          <div className="border-b border-gray-100 px-5 py-4 dark:border-gray-800 sm:px-6">
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">Historial de suscripción</h2>
            <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
              Registro de cambios de tu plan.
            </p>
          </div>
          {historialSus.length === 0 ? (
            <p className="px-5 py-6 text-sm text-gray-400 dark:text-gray-500 sm:px-6">
              Aún no hay cambios registrados.
            </p>
          ) : (
            <ul className="divide-y divide-gray-100 dark:divide-gray-800">
              {historialSus.map((h, i) => (
                <li key={h._id || i} className="flex items-center justify-between gap-3 px-5 py-3.5 sm:px-6">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {h.accion === 'actualizar'
                        ? 'Actualización de plan'
                        : h.accion === 'renovar'
                          ? 'Renovación de plan'
                          : 'Eliminación de suscripción'}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                      {h.accion === 'cancelar' ? (
                        <>
                          Plan <span className="font-semibold text-gray-700 dark:text-gray-300">Pro</span> →{' '}
                          <span className="font-semibold text-gray-700 dark:text-gray-300">Gratis</span>
                        </>
                      ) : (
                        <>
                          Plan <span className="font-semibold text-gray-700 dark:text-gray-300">{h.plan_anterior}</span> →{' '}
                          <span className="font-semibold text-gray-700 dark:text-gray-300">{h.plan_nuevo}</span>
                        </>
                      )}
                    </p>
                  </div>
                  <p className="shrink-0 text-xs text-gray-400 dark:text-gray-500">
                    {new Date(h.fecha).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
        </div>

        <button
          type="button"
          onClick={() => irA('/dashboard/perfil?tab=config')}
          className="mt-6 flex min-h-11 items-center gap-2 rounded-full px-3 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
        >
          <FiArrowLeft className="h-4 w-4" />
          Volver a Configuración
        </button>
      </main>

      {/* Toast */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-24 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-2 rounded-full bg-gray-900 px-5 py-3 text-sm font-medium text-white shadow-2xl dark:bg-white dark:text-gray-900 lg:bottom-6"
          style={{ animation: 'toast-slide-up 250ms ease-out' }}
        >
          <FiCheck className="h-4 w-4 text-success-500 dark:text-success-600" />
          {toast}
        </div>
      )}
    </div>
  )
}

export default Suscripcion