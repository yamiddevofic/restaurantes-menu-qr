import { useEffect, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router'
import { useAuth, API_URL } from '../auth'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Spinner } from '../components/ui/Spinner'
import { Button } from '../components/ui/Button'
import { Field, inputCls } from '../components/ui/Field'
import Modal from '../components/Modal'
import { SideDrawer, DrawerItem } from '../components/SideDrawer'
import { Avatar, notifyAvatarChanged } from '../components/Avatar'
import { useTheme } from '../utils/useTheme'
import {
  FiArrowLeft, FiLogOut, FiUser, FiMail, FiPhone, FiEdit2, FiCheck,
  FiCamera, FiGrid, FiShield, FiBell, FiSettings, FiStar, FiChevronRight,
  FiMapPin, FiPlus, FiTrash2, FiAlertTriangle, FiHome
} from 'react-icons/fi'

const fieldErrCls = (err) =>
  err
    ? 'border-error-500 focus:border-error-500 focus:ring-error-500/20 dark:border-error-500'
    : ''

function Toggle({ checked, onChange, label = null, hint }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      {label && (
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{label}</p>
          {hint && <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{hint}</p>}
        </div>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label || 'Alternar'}
        onClick={() => onChange(!checked)}
        className={`relative h-11 w-[52px] shrink-0 rounded-full transition-colors duration-200 ${
          checked ? 'bg-brand-600' : 'bg-gray-200 dark:bg-gray-700'
        }`}
      >
        <span
          className={`absolute top-1.5 left-1.5 h-8 w-8 rounded-full bg-white shadow transition-transform duration-200 ${
            checked ? 'translate-x-2' : ''
          }`}
        />
      </button>
    </div>
  )
}

function Perfil() {
  const { user, restaurantes, loading, logout, token, saveSession } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { dark, toggle } = useTheme()

  const fileRef = useRef(null)

  const [tab, setTab] = useState(() => new URLSearchParams(location.search).get('tab') || 'info')
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)

  const [notifPedidos, setNotifPedidos] = useState(() => localStorage.getItem('qrta_notif_pedidos') !== '0')
  const [notifPromos, setNotifPromos] = useState(() => localStorage.getItem('qrta_notif_promos') !== '0')

  const [misRestaurantes, setMisRestaurantes] = useState(restaurantes || [])
  const [restEditandoId, setRestEditandoId] = useState(null)
  const [formRest, setFormRest] = useState({ nombre: '', ubicacion: '' })
  const [restFormNuevo, setRestFormNuevo] = useState({ nombre: '', ubicacion: '' })
  const [modalConfirm, setModalConfirm] = useState(null)
  const [passEliminar, setPassEliminar] = useState('')

  const esAdmin = user?.tipo === 'admin'

  const emailInicial = esAdmin ? user?.email || '' : user?.contacto?.correo || ''
  const telefonoInicial = esAdmin ? user?.telefono || '' : user?.contacto?.celular || ''

  const [form, setForm] = useState({
    nombre: user?.nombre || '',
    email: emailInicial,
    telefono: telefonoInicial,
    bio: user?.bio || '',
  })
  const [errors, setErrors] = useState({})

  const inicializarForm = () => ({
    nombre: user?.nombre || '',
    email: emailInicial,
    telefono: telefonoInicial,
    bio: user?.bio || '',
  })

  const empezarEdicion = () => {
    setForm(inicializarForm())
    setErrors({})
    setEditing(true)
  }

  const cargarRestaurantes = async () => {
    if (!token) return
    try {
      const res = await fetch(`${API_URL}/restaurantes/mios`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json().catch(() => [])
      if (res.ok) {
        setMisRestaurantes(data)
        saveSession({ token, restaurante: data[0] || null, restaurantes: data })
      }
    } catch {
      /* silencioso */
    }
  }

  useEffect(() => {
    if (esAdmin && token) cargarRestaurantes()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [esAdmin, token])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3200)
    return () => clearTimeout(t)
  }, [toast])

  useEffect(() => {
    const tabParam = new URLSearchParams(location.search).get('tab')
    if (tabParam) setTab(tabParam)
  }, [location.search])

  useEffect(() => {
    if (!editing) return
    const onKey = (e) => {
      if (e.key === 'Escape') setEditing(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [editing])

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

  const sinSesion = !user || !token

  if (sinSesion && tab !== 'config') {
    navigate('/login')
    return null
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const irA = (to) => navigate(to)

  const fechaMiembro = user.fecha_registro
    ? new Date(user.fecha_registro).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })
    : null

  const onAvatarChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setSaving(true)
    try {
      const formData = new FormData()
      formData.append('avatar', file)
      const res = await fetch(`${API_URL}/auth/avatar`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.message || 'No se pudo subir la foto')
      try {
        localStorage.setItem('qrta_avatar', data.user.avatar)
      } catch {
        /* sin espacio, no se guarda */
      }
      notifyAvatarChanged()
      saveSession({ token, user: data.user })
      setToast('Foto de perfil actualizada')
    } catch (err) {
      setToast(err.message)
    } finally {
      setSaving(false)
    }
    e.target.value = ''
  }

  const validar = () => {
    const errs = {}
    if (!form.nombre.trim()) errs.nombre = 'El nombre es obligatorio'
    if (esAdmin && form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'El correo no es válido'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const guardar = async () => {
    if (!validar()) return
    setSaving(true)
    try {
      const body = {
        nombre: form.nombre.trim(),
        bio: form.bio.trim(),
      }
      if (esAdmin) {
        body.email = form.email.trim().toLowerCase()
        body.telefono = form.telefono.trim()
      } else {
        body.contacto = {
          correo: form.email.trim(),
          celular: form.telefono.trim(),
        }
      }
      const res = await fetch(`${API_URL}/auth/perfil`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.message || 'No se pudo guardar el perfil')
      saveSession({ token, user: data.user })
      setEditing(false)
      setToast('Cambios guardados')
    } catch (err) {
      setToast(err.message)
    } finally {
      setSaving(false)
    }
  }

  const empezarEditarRest = (r) => {
    setRestEditandoId(r._id)
    setFormRest({ nombre: r.nombre, ubicacion: r.ubicacion })
  }

  const cancelarEdicionRest = () => {
    setRestEditandoId(null)
    setFormRest({ nombre: '', ubicacion: '' })
  }

  const guardarRest = async () => {
    if (!formRest.nombre.trim() || !formRest.ubicacion.trim()) {
      setToast('Nombre y ubicación son obligatorios')
      return
    }
    setSaving(true)
    try {
      const res = await fetch(`${API_URL}/restaurantes/${restEditandoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nombre: formRest.nombre.trim(), ubicacion: formRest.ubicacion.trim() }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.message || 'No se pudo guardar el restaurante')
      setMisRestaurantes((prev) => prev.map((r) => (r._id === restEditandoId ? data : r)))
      saveSession({ token, restaurante: misRestaurantes[0]?._id === restEditandoId ? data : misRestaurantes[0], restaurantes: undefined })
      cancelarEdicionRest()
      setToast('Restaurante actualizado')
    } catch (err) {
      setToast(err.message)
    } finally {
      setSaving(false)
    }
  }

  const crearRest = async (e) => {
    e.preventDefault()
    if (!restFormNuevo.nombre.trim() || !restFormNuevo.ubicacion.trim()) {
      setToast('Nombre y ubicación son obligatorios')
      return
    }
    setSaving(true)
    try {
      const res = await fetch(`${API_URL}/restaurantes/mios`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nombre: restFormNuevo.nombre.trim(), ubicacion: restFormNuevo.ubicacion.trim() }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.message || 'No se pudo crear el restaurante')
      const nueva = [...misRestaurantes, data]
      setMisRestaurantes(nueva)
      saveSession({ token, restaurante: data, restaurantes: nueva })
      setRestFormNuevo({ nombre: '', ubicacion: '' })
      setModalConfirm(null)
      setToast('Restaurante creado')
    } catch (err) {
      setToast(err.message)
    } finally {
      setSaving(false)
    }
  }

  const eliminarRest = async () => {
    const r = misRestaurantes.find((x) => x._id === modalConfirm)
    if (!r) return
    if (misRestaurantes.length <= 1) {
      setToast('Debes tener al menos un restaurante')
      setModalConfirm(null)
      return
    }
    if (!passEliminar) {
      setToast('Ingresa tu contraseña para confirmar')
      return
    }
    setSaving(true)
    try {
      const res = await fetch(`${API_URL}/restaurantes/${modalConfirm}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password: passEliminar }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.message || 'No se pudo eliminar el restaurante')
      const nueva = misRestaurantes.filter((x) => x._id !== modalConfirm)
      setMisRestaurantes(nueva)
      saveSession({ token, restaurante: nueva[0] || null, restaurantes: nueva })
      setModalConfirm(null)
      setPassEliminar('')
      setToast('Restaurante eliminado; se purgará definitivamente en 30 días')
    } catch (err) {
      setToast(err.message)
    } finally {
      setSaving(false)
    }
  }

  const eliminarCuenta = async () => {
    if (!passEliminar) {
      setToast('Ingresa tu contraseña para confirmar')
      return
    }
    setSaving(true)
    try {
      const res = await fetch(`${API_URL}/auth/cuenta`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password: passEliminar }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.message || 'No se pudo eliminar la cuenta')
      }
      setModalConfirm(null)
      setPassEliminar('')
      logout()
      navigate('/')
    } catch (err) {
      setModalConfirm(null)
      setPassEliminar('')
      setToast(err.message)
    } finally {
      setSaving(false)
    }
  }

  const tabs = [
    { id: 'info', label: 'Información', icon: FiUser },
    ...(esAdmin ? [{ id: 'restaurantes', label: 'Mi restaurante', icon: FiHome }] : []),
  ]

  return (
    <div className="min-h-screen bg-gray-50 pb-16 dark:bg-gray-950">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 border-b border-gray-100 bg-white/80 backdrop-blur-md dark:border-gray-800 dark:bg-gray-900/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <button
            onClick={() => irA(sinSesion ? '/' : '/dashboard')}
            title={sinSesion ? 'Volver al inicio' : 'Volver al panel de administración'}
            className="hidden min-h-11 items-center gap-2 rounded-full px-3 text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 xl:flex"
          >
            <FiArrowLeft className="h-4 w-4" />
            {sinSesion ? 'Inicio' : 'Panel'}
          </button>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 font-bold text-lg text-white">Q</span>
            <span className="text-lg font-bold tracking-tight text-gray-900 dark:text-gray-100">
              {tab === 'config' ? 'Configuración' : 'Mi perfil'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {!sinSesion && (
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
            )}

            {!sinSesion && (
            <SideDrawer user={user}>
              <div className="flex flex-1 flex-col overflow-y-auto p-2">
                <DrawerItem icon={FiGrid} label="Panel" onClick={() => irA('/dashboard')} />
                <DrawerItem
                  icon={FiUser}
                  label="Perfil"
                  onClick={() => {
                    setTab('info')
                    irA('/dashboard/perfil')
                  }}
                />
                <DrawerItem icon={FiSettings} label="Configuración" onClick={() => setTab('config')} />
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
            )}
          </div>
        </div>
      </nav>

      <main className={`mx-auto max-w-6xl px-4 ${tab === 'config' ? 'pt-1' : 'pt-6'} pb-24 sm:px-6 lg:pb-6`}>
        {/* Header / banner (solo en la vista de perfil) */}
        {tab !== 'config' && (
        <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800">
          <div className="relative h-36 bg-gradient-to-r from-brand-600 via-brand-500 to-accent-500 sm:h-44">
            <div aria-hidden="true" className="absolute inset-0">
              <div className="absolute -top-16 left-1/4 h-48 w-48 rounded-full bg-white/10 blur-2xl"></div>
              <div className="absolute -bottom-20 right-1/4 h-56 w-56 rounded-full bg-accent-400/30 blur-2xl"></div>
            </div>
          </div>

          <div className="relative px-5 pb-6 text-center sm:px-8">
            <div className="-mt-14 sm:-mt-16">
              <div className="relative inline-block">
                <Avatar
                  user={user}
                  size="h-28 w-28 sm:h-32 sm:w-32"
                  className="text-3xl ring-4 ring-white dark:ring-gray-900"
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  aria-label="Editar foto de perfil"
                  title="Editar foto"
                  disabled={saving}
                  className="absolute right-0 bottom-0 flex h-11 w-11 items-center justify-center rounded-full bg-gray-900/80 text-white shadow-lg transition-colors hover:bg-brand-600 disabled:opacity-60"
                >
                  {saving ? <Spinner className="h-4 w-4" /> : <FiCamera className="h-4 w-4" />}
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={onAvatarChange}
                  className="sr-only"
                  aria-hidden="true"
                  tabIndex={-1}
                />
              </div>
              <h1 className="mt-4 text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-3xl">
                {user.nombre}
              </h1>
              <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
                <Badge tone="brand">{esAdmin ? 'Administrador' : user.rol === 'cocina' ? 'Cocina' : 'Mesero'}</Badge>
              </div>
              <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
                {fechaMiembro ? <>Miembro desde {fechaMiembro}</> : 'Miembro de QRTa'}
              </p>
            </div>
          </div>
        </div>
        )}

        {/* Tabs: sidebar en desktop, scroll horizontal en mobile */}
        <div className={`mt-8 grid gap-6 ${tab === 'config' ? '' : 'lg:grid-cols-[240px_1fr]'} lg:items-start`}>
          {tab !== 'config' && (
          <nav
            aria-label="Secciones del perfil"
            className="no-scrollbar sticky top-[3.75rem] z-30 -mx-4 flex gap-2 overflow-x-auto bg-gray-50/95 px-4 py-2 backdrop-blur-md dark:bg-gray-950/95 lg:top-24 lg:mx-0 lg:flex-col lg:overflow-visible lg:bg-transparent lg:px-0 lg:py-0 lg:backdrop-blur-none"
          >
            {tabs.map((t) => {
              const activo = tab === t.id
              return (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={activo}
                  onClick={() => setTab(t.id)}
                  className={`flex min-h-11 shrink-0 items-center gap-2.5 rounded-xl px-4 text-sm font-semibold transition-colors ${
                    activo
                      ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                  }`}
                >
                  <t.icon className="h-4 w-4" />
                  {t.label}
                </button>
              )
            })}
          </nav>
          )}

          <div className="min-w-0">
            {/* --- INFORMACIÓN --- */}
            {tab === 'info' && (
              <section aria-labelledby="seccion-info" role="tabpanel">
                <Card className="p-0">
                  <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-800 sm:px-6">
                    <div>
                      <h2 id="seccion-info" className="font-semibold text-gray-900 dark:text-gray-100">
                        Información personal
                      </h2>
                      <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                        {editing ? 'Edita tus datos y guarda los cambios.' : 'Tus datos personales de cuenta.'}
                      </p>
                    </div>
                    {!editing && (
                      <Button variant="outline" size="sm" onClick={empezarEdicion} className="hidden lg:inline-flex">
                        <FiEdit2 className="h-4 w-4" />
                        Editar perfil
                      </Button>
                    )}
                  </div>

                  {editing ? (
                    <form
                      id="perfil-form"
                      className="space-y-5 px-5 py-5 sm:px-6"
                      onSubmit={(e) => {
                        e.preventDefault()
                        guardar()
                      }}
                    >
                      <Field label="Nombre completo" htmlFor="pf-nombre">
                        <input
                          id="pf-nombre"
                          type="text"
                          value={form.nombre}
                          onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
                          className={`${inputCls} ${fieldErrCls(errors.nombre)}`}
                          aria-invalid={!!errors.nombre}
                          aria-describedby={errors.nombre ? 'pf-nombre-error' : undefined}
                          required
                        />
                        {errors.nombre && (
                          <p id="pf-nombre-error" className="mt-1.5 text-sm text-error-600 dark:text-error-400">
                            {errors.nombre}
                          </p>
                        )}
                      </Field>

                      <div className="grid gap-5 sm:grid-cols-2">
                        <Field label={esAdmin ? 'Correo electrónico' : 'Correo de contacto'} htmlFor="pf-email">
                          <input
                            id="pf-email"
                            type="email"
                            value={form.email}
                            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                            className={`${inputCls} ${fieldErrCls(errors.email)}`}
                            aria-invalid={!!errors.email}
                            aria-describedby={errors.email ? 'pf-email-error' : undefined}
                          />
                          {errors.email && (
                            <p id="pf-email-error" className="mt-1.5 text-sm text-error-600 dark:text-error-400">
                              {errors.email}
                            </p>
                          )}
                        </Field>
                        <Field label="Teléfono" htmlFor="pf-telefono">
                          <input
                            id="pf-telefono"
                            type="tel"
                            value={form.telefono}
                            onChange={(e) => setForm((f) => ({ ...f, telefono: e.target.value }))}
                            className={inputCls}
                          />
                        </Field>
                      </div>

                      <Field label="Biografía" htmlFor="pf-bio">
                        <textarea
                          id="pf-bio"
                          rows={3}
                          value={form.bio}
                          onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                          placeholder="Cuéntanos sobre ti o tu restaurante..."
                          className={inputCls}
                        />
                      </Field>

                      <div className="hidden gap-3 border-t border-gray-100 pt-4 lg:flex lg:justify-end dark:border-gray-800">
                        <Button variant="outline" type="button" onClick={() => setEditing(false)}>
                          Cancelar
                        </Button>
                        <Button type="submit" disabled={saving}>
                          <FiCheck className="h-4 w-4" />
                          {saving ? 'Guardando...' : 'Guardar cambios'}
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <dl className="grid gap-x-8 gap-y-5 px-5 py-5 sm:grid-cols-2 sm:px-6">
                      <div>
                        <dt className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
                          <FiUser className="h-3.5 w-3.5" />
                          Nombre
                        </dt>
                        <dd className="mt-1 font-medium text-gray-900 dark:text-gray-100">{user.nombre}</dd>
                      </div>
                      <div>
                        <dt className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
                          <FiMail className="h-3.5 w-3.5" />
                          Correo
                        </dt>
                        <dd className="mt-1 font-medium text-gray-900 dark:text-gray-100">
                          {esAdmin ? user.email || '—' : user.contacto?.correo || '—'}
                        </dd>
                      </div>
                      <div>
                        <dt className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
                          <FiPhone className="h-3.5 w-3.5" />
                          Teléfono
                        </dt>
                        <dd className="mt-1 font-medium text-gray-900 dark:text-gray-100">
                          {esAdmin ? user.telefono || '—' : user.contacto?.celular || '—'}
                        </dd>
                      </div>
                      <div>
                        <dt className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
                          <FiUser className="h-3.5 w-3.5" />
                          Usuario
                        </dt>
                        <dd className="mt-1 font-medium text-gray-900 dark:text-gray-100">@{user.usuario}</dd>
                      </div>
                      <div className="sm:col-span-2">
                        <dt className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
                          <FiEdit2 className="h-3.5 w-3.5" />
                          Biografía
                        </dt>
                        <dd className="mt-1 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                          {user.bio || 'Sin biografía aún. Pulsa "Editar perfil" para añadir una.'}
                        </dd>
                      </div>
                    </dl>
                  )}
                </Card>
              </section>
            )}

            {/* --- MI RESTAURANTE (solo admin) --- */}
            {tab === 'restaurantes' && esAdmin && (
              <section aria-labelledby="seccion-restaurantes" role="tabpanel" className="space-y-6">
                <Card>
                  <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-800 sm:px-6">
                    <div>
                      <h2 id="seccion-restaurantes" className="font-semibold text-gray-900 dark:text-gray-100">
                        Mis restaurantes
                      </h2>
                      <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                        Administra los restaurantes de tu cuenta ({misRestaurantes.length}).
                      </p>
                    </div>
                    {misRestaurantes.length > 0 && (
                      <span className="hidden shrink-0 items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-300 sm:flex">
                        <FiHome className="h-3.5 w-3.5" />
                        Debes tener al menos 1
                      </span>
                    )}
                  </div>

                  {misRestaurantes.length === 0 ? (
                    <div className="px-5 py-10 text-center sm:px-6">
                      <FiHome className="mx-auto mb-3 h-10 w-10 text-gray-300 dark:text-gray-600" />
                      <p className="font-medium text-gray-900 dark:text-gray-100">Aún no tienes restaurantes</p>
                      <p className="mx-auto mt-1 max-w-sm text-sm text-gray-500 dark:text-gray-400">
                        Crea tu primer restaurante para empezar a gestionar mesas y platos.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                      {misRestaurantes.map((r) => {
                        const editando = restEditandoId === r._id
                        return (
                          <div key={r._id} className="px-5 py-4 sm:px-6">
                            {editando ? (
                              <div className="space-y-4">
                                <Field label="Nombre del restaurante" htmlFor={`rest-nombre-${r._id}`}>
                                  <input
                                    id={`rest-nombre-${r._id}`}
                                    type="text"
                                    value={formRest.nombre}
                                    onChange={(e) => setFormRest((f) => ({ ...f, nombre: e.target.value }))}
                                    className={inputCls}
                                    required
                                  />
                                </Field>
                                <Field label="Ubicación" htmlFor={`rest-ubic-${r._id}`}>
                                  <input
                                    id={`rest-ubic-${r._id}`}
                                    type="text"
                                    value={formRest.ubicacion}
                                    onChange={(e) => setFormRest((f) => ({ ...f, ubicacion: e.target.value }))}
                                    className={inputCls}
                                    required
                                  />
                                </Field>
                                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                                  <Button variant="outline" type="button" onClick={cancelarEdicionRest}>
                                    Cancelar
                                  </Button>
                                  <Button type="button" onClick={guardarRest} disabled={saving}>
                                    <FiCheck className="h-4 w-4" />
                                    {saving ? 'Guardando...' : 'Guardar cambios'}
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <h3 className="truncate font-semibold text-gray-900 dark:text-gray-100">{r.nombre}</h3>
                                    {misRestaurantes.length <= 1 && (
                                      <Badge tone="info">Único</Badge>
                                    )}
                                  </div>
                                  <p className="mt-0.5 flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                                    <FiMapPin className="h-3.5 w-3.5 shrink-0" />
                                    <span className="truncate">{r.ubicacion}</span>
                                  </p>
                                  <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500">
                                    {r.mesas?.length ?? 0} mesas · {r.categorias?.length ?? 0} categorías
                                  </p>
                                </div>
                                <div className="flex shrink-0 items-center gap-2">
                                  <Button variant="outline" size="sm" type="button" onClick={() => empezarEditarRest(r)}>
                                    <FiEdit2 className="h-4 w-4" />
                                    Editar
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    type="button"
                                    onClick={() => {
                                    setModalConfirm(r._id)
                                    setPassEliminar('')
                                  }}
                                  disabled={misRestaurantes.length <= 1}
                                    title={misRestaurantes.length <= 1 ? 'Debes tener al menos un restaurante' : 'Eliminar restaurante'}
                                    className="text-error-600 hover:bg-error-50 hover:text-error-700 dark:text-error-400 dark:hover:bg-error-500/10 dark:hover:text-error-400"
                                  >
                                    <FiTrash2 className="h-4 w-4" />
                                    Eliminar
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </Card>

                <Card>
                  <h2 className="mb-4 px-5 pt-5 font-semibold text-gray-900 dark:text-gray-100 sm:px-6">
                    Agregar restaurante
                  </h2>
                  <form onSubmit={crearRest} className="space-y-4 px-5 pb-5 sm:px-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Nombre del restaurante" htmlFor="rest-nuevo-nombre">
                        <input
                          id="rest-nuevo-nombre"
                          type="text"
                          value={restFormNuevo.nombre}
                          onChange={(e) => setRestFormNuevo((f) => ({ ...f, nombre: e.target.value }))}
                          className={inputCls}
                          placeholder="Ej: La Casa de la Abuela"
                          required
                        />
                      </Field>
                      <Field label="Ubicación" htmlFor="rest-nuevo-ubic">
                        <input
                          id="rest-nuevo-ubic"
                          type="text"
                          value={restFormNuevo.ubicacion}
                          onChange={(e) => setRestFormNuevo((f) => ({ ...f, ubicacion: e.target.value }))}
                          className={inputCls}
                          placeholder="Ej: Bogotá, Colombia"
                          required
                        />
                      </Field>
                    </div>
                    <div className="sm:flex sm:justify-end">
                      <Button type="submit" disabled={saving} className="w-full sm:w-auto">
                        <FiPlus className="h-4 w-4" />
                        {saving ? 'Guardando...' : 'Agregar restaurante'}
                      </Button>
                    </div>
                  </form>
                </Card>
              </section>
            )}

            {/* --- CONFIGURACIÓN --- */}
            {tab === 'config' && (
              <section aria-labelledby="seccion-config" role="tabpanel">
                <div className="space-y-6">
                  {esAdmin && (
                    <Card
                      hover
                      onClick={() => irA('/dashboard/suscripcion')}
                      role="button"
                      tabIndex={0}
                      title="Ir a Mi suscripción"
                      onKeyDown={(e) => e.key === 'Enter' && irA('/dashboard/suscripcion')}
                      className="group cursor-pointer p-0 group-hover:bg-gray-50 dark:group-hover:bg-gray-800"
                    >
                      <div className="flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-3 sm:px-5">
                        <span className="flex items-center gap-3">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-50 text-accent-600 dark:bg-accent-500/10 dark:text-accent-400">
                            <FiStar className="h-5 w-5" />
                          </span>
                          <span>
                            <span className="block text-sm font-semibold text-gray-900 dark:text-gray-100">Mi suscripción</span>
                            <span className="block text-xs text-gray-500 dark:text-gray-400">Gestiona tu plan y sus beneficios</span>
                          </span>
                        </span>
                        <FiChevronRight className="h-4 w-4 shrink-0 text-gray-400 dark:text-gray-500" />
                      </div>
                    </Card>
                  )}

                  <Card>
                    <h2 id="seccion-config" className="mb-2 font-semibold text-gray-900 dark:text-gray-100">
                      Preferencias
                    </h2>
                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                      <div className="flex items-center justify-between gap-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Tema oscuro</p>
                          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">Apariencia de la aplicación.</p>
                        </div>
                        <Toggle checked={dark} onChange={toggle} label="" />
                      </div>
                      {!sinSesion && (
                      <>
                        <Toggle
                          checked={notifPedidos}
                          onChange={(v) => {
                            setNotifPedidos(v)
                            localStorage.setItem('qrta_notif_pedidos', v ? '1' : '0')
                          }}
                          label="Nuevos pedidos"
                          hint="Recibe una notificación cuando llegue un pedido."
                        />
                        <Toggle
                          checked={notifPromos}
                          onChange={(v) => {
                            setNotifPromos(v)
                            localStorage.setItem('qrta_notif_promos', v ? '1' : '0')
                          }}
                          label="Promociones y novedades"
                          hint="Información sobre funciones nuevas del panel."
                        />
                      </>
                      )}
                    </div>
                  </Card>

                  {!sinSesion && (
                  <Card>
                    <h2 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">Seguridad</h2>
                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                      <div className="flex items-center justify-between gap-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Contraseña</p>
                          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                            Usuario <span className="font-semibold">@{user.usuario}</span>
                          </p>
                        </div>
                        <Badge tone="neutral" className="shrink-0">
                          <FiShield className="mr-1 h-3 w-3" />
                          Protegida
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between gap-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Estado de la cuenta</p>
                          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">Tu cuenta está activa.</p>
                        </div>
                        <Badge tone="success" className="shrink-0">
                          <FiCheck className="mr-1 h-3 w-3" />
                          Activa
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between gap-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Notificaciones</p>
                          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                            Configúralas en <span className="font-semibold">Preferencias</span>.
                          </p>
                        </div>
                        <FiBell className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                      </div>
                      <div className="flex items-center justify-between gap-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-error-600 dark:text-error-400">Eliminar cuenta</p>
                          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                            {esAdmin
                              ? 'Tu acceso se cerrará de inmediato; todo quedará en el historial y se purgará en 30 días.'
                              : 'Tu acceso se cerrará de inmediato; tu información quedará en el historial y se purgará en 30 días.'}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          type="button"
                          onClick={() => {
                            setModalConfirm('cuenta')
                            setPassEliminar('')
                          }}
                          className="shrink-0 border-error-200 text-error-600 hover:bg-error-50 hover:text-error-700 dark:border-error-500/30 dark:text-error-400 dark:hover:bg-error-500/10 dark:hover:text-error-400"
                        >
                          <FiTrash2 className="h-4 w-4" />
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  </Card>
                  )}
                </div>
              </section>
            )}
          </div>
        </div>
      </main>

      {/* Barra de acciones móvil: zona natural del pulgar */}
      {tab === 'info' && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-100 bg-white/90 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md dark:border-gray-800 dark:bg-gray-900/90 lg:hidden">
          {!editing ? (
            <Button className="w-full" onClick={empezarEdicion}>
              <FiEdit2 className="h-4 w-4" />
              Editar perfil
            </Button>
          ) : (
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" type="button" onClick={() => setEditing(false)}>
                Cancelar
              </Button>
              <Button
                className="flex-1"
                type="submit"
                form="perfil-form"
                onClick={guardar}
                disabled={saving}
              >
                <FiCheck className="h-4 w-4" />
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Confirmación (eliminar restaurante / cuenta) */}
      {modalConfirm && (
        <Modal
          title={modalConfirm === 'cuenta' ? 'Eliminar cuenta' : 'Eliminar restaurante'}
          onClose={() => setModalConfirm(null)}
        >
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-error-50 text-error-600 dark:bg-error-500/10 dark:text-error-400">
              <FiAlertTriangle className="h-5 w-5" />
            </span>
            <div>
              {modalConfirm === 'cuenta' ? (
                <>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    ¿Seguro que quieres eliminar tu cuenta?
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                    {esAdmin
                      ? 'Tu acceso se cerrará de inmediato y tus restaurantes, empleados y datos quedarán en el historial. Todo se eliminará definitivamente en 30 días.'
                      : 'Tu acceso se cerrará de inmediato y tu información quedará en el historial. Todo se eliminará definitivamente en 30 días.'}
                  </p>
                </>
              ) : misRestaurantes.length <= 1 ? (
                <>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    No puedes eliminar tu único restaurante
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                    Debes tener al menos un restaurante en tu cuenta.
                  </p>
                </>
              ) : (
                <>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    ¿Seguro que quieres eliminar este restaurante?
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                    Sus mesas, platos y datos quedarán en el historial y se eliminarán definitivamente en 30 días.
                  </p>
                </>
              )}
            </div>
          </div>
          {(modalConfirm === 'cuenta' || misRestaurantes.length > 1) && (
            <div className="mt-4">
              <Field label="Contraseña" htmlFor="pass-eliminar">
                <input
                  id="pass-eliminar"
                  type="password"
                  autoComplete="current-password"
                  value={passEliminar}
                  onChange={(e) => setPassEliminar(e.target.value)}
                  placeholder="Ingresa tu contraseña para confirmar"
                  className={inputCls}
                />
              </Field>
              <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                Confirmas que eres tú; la eliminación se ejecutará tras la verificación.
              </p>
            </div>
          )}
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="outline" type="button" onClick={() => setModalConfirm(null)}>
              Cancelar
            </Button>
            {(modalConfirm === 'cuenta' || misRestaurantes.length > 1) && (
<Button
              type="button"
              onClick={modalConfirm === 'cuenta' ? eliminarCuenta : eliminarRest}
              disabled={saving || !passEliminar}
              className="bg-error-600 shadow-error-600/20 hover:bg-error-700"
            >
                <FiTrash2 className="h-4 w-4" />
                {saving ? 'Eliminando...' : 'Sí, eliminar'}
              </Button>
            )}
          </div>
        </Modal>
      )}

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

export default Perfil