import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { useAuth, API_URL } from '../auth'
import Modal from '../components/Modal'
import { Spinner } from '../components/ui/Spinner'
import { Button, ButtonLink } from '../components/ui/Button'
import { Field, inputCls } from '../components/ui/Field'
import { SideDrawer, DrawerItem } from '../components/SideDrawer'
import {
  FiArrowLeft, FiLogOut, FiPlus, FiEdit2, FiTrash2, FiGrid,
  FiAlertCircle, FiUser, FiSettings, FiRefreshCw, FiDownload,
  FiCopy, FiCheck
} from 'react-icons/fi'
import { MdQrCode2 } from 'react-icons/md'

// El backend sirve el menú público en /api/restaurantes/menu/:qr_code
const API_ORIGIN = API_URL.replace(/\/api$/, '')
const menuUrlDe = (qrCode) => `${API_ORIGIN}/api/restaurantes/menu/${qrCode}`

const ESTADOS_OCUPADOS = ['PENDIENTE', 'LISTO']

function fetchApi(token, url, options = {}) {
  return fetch(`${API_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  })
}

function MesaForm({ token, restauranteId, initial, mesas, onCancel, onDone }) {
  const [numero, setNumero] = useState(initial?.numero ?? '')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const n = Number(numero)
    if (!Number.isInteger(n) || n <= 0) {
      setError('El número de mesa debe ser un entero positivo')
      return
    }
    const duplicada = mesas.some((m) => m._id !== initial?._id && Number(m.numero) === n)
    if (duplicada) {
      setError(`La mesa ${n} ya existe`)
      return
    }
    setSaving(true)
    try {
      const url = initial
        ? `/restaurantes/${restauranteId}/mesas/${initial._id}`
        : `/restaurantes/${restauranteId}/mesas`
      const res = await fetchApi(token, url, {
        method: initial ? 'PUT' : 'POST',
        body: JSON.stringify({ numero: n }),
      })
      if (!res.ok) throw new Error(initial ? 'No se pudo guardar la mesa' : 'No se pudo crear la mesa')
      onDone()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-xl border border-error-200 bg-error-50 p-3 text-sm text-error-700 dark:bg-error-500/10 dark:text-error-400">{error}</div>
      )}
      <Field label="Número de mesa" htmlFor="mesa-numero">
        <input
          id="mesa-numero"
          type="number"
          min="1"
          step="1"
          value={numero}
          onChange={(e) => setNumero(e.target.value)}
          placeholder="Ej: 1, 2, 3..."
          className={inputCls}
          required
          autoFocus
        />
      </Field>
      <p className="text-xs text-gray-400 dark:text-gray-500">
        Al crear la mesa se genera su código QR automáticamente. Podrás verlo y descargarlo después.
      </p>
      <div className="flex gap-3 pt-1">
        <Button variant="outline" type="button" onClick={onCancel} className="flex-1">
          Cancelar
        </Button>
        <Button type="submit" disabled={saving} className="flex-1">
          {saving ? 'Guardando...' : initial ? 'Guardar cambios' : 'Crear mesa'}
        </Button>
      </div>
    </form>
  )
}

function QrModal({ mesa, onClose }) {
  const [copiado, setCopiado] = useState(false)
  const menuUrl = menuUrlDe(mesa.qr_code)

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(menuUrl)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch {
      /* portapapeles no disponible */
    }
  }

  return (
    <Modal title={`Mesa ${mesa.numero} — Código QR`} onClose={onClose}>
      <div className="flex flex-col items-center gap-4">
        <div className="rounded-3xl bg-gradient-to-br from-brand-50 to-accent-50 p-5 ring-1 ring-brand-100 dark:from-brand-500/10 dark:to-accent-500/10 dark:ring-brand-500/20">
          <img
            src={mesa.qr_image}
            alt={`Código QR de la mesa ${mesa.numero}`}
            className="h-52 w-52 rounded-2xl bg-white object-contain dark:bg-gray-800"
          />
        </div>
        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          Imprime este código y pégalo en la mesa. Tus clientes lo escanean y ven el menú al instante, sin apps ni registros.
        </p>
        <div className="flex w-full items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 p-2 pl-3 dark:border-gray-700 dark:bg-gray-800">
          <span className="min-w-0 flex-1 truncate text-xs text-gray-500 dark:text-gray-400">{menuUrl}</span>
          <button
            type="button"
            onClick={copiar}
            title="Copiar enlace del menú"
            aria-label="Copiar enlace del menú"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700"
          >
            {copiado ? <FiCheck className="h-4 w-4 text-success-600 dark:text-success-400" /> : <FiCopy className="h-4 w-4" />}
          </button>
        </div>
        <div className="grid w-full grid-cols-2 gap-3">
          <ButtonLink href={mesa.qr_image} download={`qrta-mesa-${mesa.numero}.png`} variant="outline">
            <FiDownload className="h-4 w-4" />
            Descargar
          </ButtonLink>
          <Button variant="primary" onClick={onClose}>
            Listo
          </Button>
        </div>
      </div>
    </Modal>
  )
}

function Mesas() {
  const { user, restaurante, loading, logout, token } = useAuth()
  const navigate = useNavigate()
  const [mesas, setMesas] = useState([])
  const [pedidosActivos, setPedidosActivos] = useState([])
  const [modals, setModals] = useState({ mesa: null, qr: null })
  const [error, setError] = useState('')

  const restauranteId = restaurante?._id

  const loadMesas = async () => {
    if (!restauranteId) return
    try {
      const res = await fetchApi(token, `/restaurantes/${restauranteId}/mesas`)
      if (!res.ok) throw new Error('No se pudieron cargar las mesas')
      const data = await res.json()
      setMesas(data.map((m) => ({ ...m, restaurante_id: restauranteId })))
    } catch (err) {
      setError(err.message)
    }
  }

  const loadPedidos = async () => {
    if (!restauranteId) return
    try {
      const res = await fetchApi(token, '/pedidos')
      if (!res.ok) throw new Error('No se pudieron cargar los pedidos')
      const data = await res.json()
      setPedidosActivos(data.filter((p) => ESTADOS_OCUPADOS.includes(p.estado)))
    } catch {
      // El estado de las mesas es un extra: si falla, las mesas siguen visibles
      setPedidosActivos([])
    }
  }

  const cargarTodo = async () => {
    setError('')
    await Promise.all([loadMesas(), loadPedidos()])
  }

  useEffect(() => {
    if (loading || !restauranteId || !token) return
    let active = true
    Promise.all([
      fetchApi(token, `/restaurantes/${restauranteId}/mesas`),
      fetchApi(token, '/pedidos'),
    ])
      .then(([resMesas, resPedidos]) =>
        Promise.all([resMesas.ok ? resMesas.json() : Promise.reject(new Error('No se pudieron cargar las mesas')), resPedidos.json()])
      )
      .then(([mesasData, pedidosData]) => {
        if (!active) return
        setMesas(mesasData.map((m) => ({ ...m, restaurante_id: restauranteId })))
        setPedidosActivos(pedidosData.filter((p) => ESTADOS_OCUPADOS.includes(p.estado)))
      })
      .catch((err) => {
        if (active) setError(err.message)
      })
    return () => {
      active = false
    }
  }, [loading, restauranteId, token])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
          <Spinner className="h-5 w-5" />
          Cargando...
        </div>
      </div>
    )
  }

  if (!user || !restaurante) {
    navigate('/login')
    return null
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const closeMesaModal = () => setModals((m) => ({ ...m, mesa: null }))
  const closeQrModal = () => setModals((m) => ({ ...m, qr: null }))

  const mesaOcupada = (mesa) => pedidosActivos.some((p) => String(p.mesa_id) === String(mesa._id))

  const borrarMesa = async (mesa) => {
    if (!window.confirm(`¿Eliminar la mesa ${mesa.numero}?`)) return
    try {
      const res = await fetchApi(token, `/restaurantes/${restauranteId}/mesas/${mesa._id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('No se pudo eliminar la mesa')
      cargarTodo()
    } catch (err) {
      setError(err.message)
    }
  }

  const borrarTodas = async () => {
    if (!window.confirm('¿Eliminar TODAS las mesas? Se perderán sus códigos QR.')) return
    try {
      const res = await fetchApi(token, `/restaurantes/${restauranteId}/mesas`, { method: 'DELETE' })
      if (!res.ok) throw new Error('No se pudieron eliminar las mesas')
      cargarTodo()
    } catch (err) {
      setError(err.message)
    }
  }

  const ocupadas = mesas.filter(mesaOcupada).length

  return (
    <div className="min-h-screen bg-gray-50 pb-16 dark:bg-gray-950">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 border-b border-gray-100 bg-white/80 backdrop-blur-md dark:border-gray-800 dark:bg-gray-900/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <button
            onClick={() => navigate('/dashboard')}
            title="Volver al panel de administración"
            className="hidden min-h-11 items-center gap-2 rounded-full px-3 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 xl:flex"
          >
            <FiArrowLeft className="h-4 w-4" />
            Panel
          </button>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 font-bold text-lg text-white">Q</span>
            <span className="text-lg font-bold tracking-tight text-gray-900 dark:text-gray-100">Mesas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 xl:flex">
              <button
                onClick={handleLogout}
                aria-label="Cerrar sesión"
                title="Cerrar sesión"
                className="flex min-h-11 items-center justify-center rounded-full px-3 text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-200"
              >
                <FiLogOut className="h-5 w-5" />
              </button>
            </div>

            <SideDrawer user={user}>
              <div className="flex flex-1 flex-col overflow-y-auto p-2">
                <DrawerItem icon={FiGrid} label="Panel" onClick={() => navigate('/dashboard')} />
                <DrawerItem icon={FiUser} label="Perfil" onClick={() => navigate('/dashboard/perfil')} />
                <DrawerItem icon={FiSettings} label="Configuración" onClick={() => navigate('/dashboard/perfil?tab=config')} />
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

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {error && (
          <div className="mb-6 flex items-start gap-2 rounded-xl border border-error-200 bg-error-50 p-4 text-sm text-error-700 dark:bg-error-500/10 dark:text-error-400">
            <FiAlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Encabezado */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 sm:text-2xl">Mesas de {restaurante.nombre}</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Cada mesa tiene su código QR: tus clientes lo escanean y ven el menú al instante.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-500/10 dark:text-brand-400">
                <FiGrid className="h-3.5 w-3.5" />
                {mesas.length} mesa(s)
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-500/15 dark:text-amber-400">
                {ocupadas} en pedido
              </span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={cargarTodo} title="Actualizar el estado de las mesas">
              <FiRefreshCw className="h-4 w-4" />
              Actualizar
            </Button>
            {mesas.length > 0 && (
              <Button variant="outline" size="sm" onClick={borrarTodas} className="text-error-600 hover:bg-error-50 dark:text-error-400 dark:hover:bg-error-500/10">
                <FiTrash2 className="h-4 w-4" />
                Eliminar todas
              </Button>
            )}
            <Button size="sm" onClick={() => setModals((m) => ({ ...m, mesa: { initial: null } }))}>
              <FiPlus className="h-4 w-4" />
              Nueva mesa
            </Button>
          </div>
        </div>

        {/* Grid de mesas */}
        {mesas.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-50 to-accent-50 text-brand-600 dark:from-brand-500/10 dark:to-accent-500/10 dark:text-brand-400">
              <FiGrid className="h-8 w-8" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Aún no tienes mesas</h2>
            <p className="mt-1 max-w-sm text-sm text-gray-500 dark:text-gray-400">
              Crea tu primera mesa y QRTa generará su código QR listo para imprimir y pegar en el salón.
            </p>
            <Button className="mt-5" onClick={() => setModals((m) => ({ ...m, mesa: { initial: null } }))}>
              <FiPlus className="h-4 w-4" />
              Crear primera mesa
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {mesas.map((mesa) => {
              const ocupada = mesaOcupada(mesa)
              return (
                <article
                  key={mesa._id}
                  className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-brand-100/50 dark:bg-gray-900 dark:ring-gray-800 dark:hover:shadow-brand-500/10"
                >
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br font-bold text-xl text-white shadow-lg ${
                          ocupada
                            ? 'from-amber-400 to-orange-500 shadow-amber-500/20'
                            : 'from-brand-500 to-accent-500 shadow-brand-600/20'
                        }`}
                      >
                        {mesa.numero}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">Mesa {mesa.numero}</h3>
                        <span
                          className={`mt-1 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                            ocupada
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400'
                              : 'bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-400'
                          }`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${ocupada ? 'bg-amber-500' : 'bg-success-500'}`} />
                          {ocupada ? 'En pedido' : 'Libre'}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setModals((m) => ({ ...m, qr: mesa }))}
                      title={`Ver código QR de la mesa ${mesa.numero}`}
                      aria-label={`Ver código QR de la mesa ${mesa.numero}`}
                      className="shrink-0 rounded-xl transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                    >
                      <img
                        src={mesa.qr_image}
                        alt={`QR de la mesa ${mesa.numero}`}
                        className="h-14 w-14 rounded-xl bg-white object-contain ring-1 ring-gray-100 dark:bg-gray-800 dark:ring-gray-800"
                      />
                    </button>
                  </div>
                  <p className="mb-4 text-xs text-gray-400 dark:text-gray-500">
                    QR listo para imprimir y pegar en la mesa
                  </p>
                  <div className="flex items-center justify-between gap-2 border-t border-gray-100 pt-3 dark:border-gray-800">
                    <button
                      onClick={() => setModals((m) => ({ ...m, qr: mesa }))}
                      className="flex min-h-11 items-center gap-1.5 rounded-lg px-2 text-xs font-semibold text-brand-600 transition-colors hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-500/10"
                    >
                      <MdQrCode2 className="h-4 w-4" />
                      Ver QR
                    </button>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setModals((m) => ({ ...m, mesa: { initial: mesa } }))}
                        aria-label={`Editar mesa ${mesa.numero}`}
                        className="flex h-11 w-11 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-brand-100 hover:text-brand-700 dark:text-gray-400 dark:hover:bg-brand-500/20 dark:hover:text-brand-400"
                      >
                        <FiEdit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => borrarMesa(mesa)}
                        aria-label={`Eliminar mesa ${mesa.numero}`}
                        className="flex h-11 w-11 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-error-50 hover:text-error-600 dark:text-gray-400 dark:hover:bg-error-500/10 dark:hover:text-error-400"
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}

        <p className="mt-10 flex items-center justify-center gap-2 text-sm text-gray-400 dark:text-gray-500">
          <MdQrCode2 className="h-4 w-4" />
          Los clientes escanean el QR con la cámara del celular, sin descargar ninguna app.
        </p>
      </main>

      {/* Modales */}
      {modals.mesa && (
        <Modal title={modals.mesa.initial ? `Editar mesa ${modals.mesa.initial.numero}` : 'Nueva mesa'} onClose={closeMesaModal}>
          <MesaForm
            token={token}
            restauranteId={restauranteId}
            initial={modals.mesa.initial}
            mesas={mesas}
            onCancel={closeMesaModal}
            onDone={() => {
              closeMesaModal()
              cargarTodo()
            }}
          />
        </Modal>
      )}
      {modals.qr && <QrModal mesa={modals.qr} onClose={closeQrModal} />}
    </div>
  )
}

export default Mesas