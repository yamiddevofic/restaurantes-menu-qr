import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { useAuth, API_URL } from '../auth'
import Modal from '../components/Modal'
import { Card } from '../components/ui/Card'
import { Spinner } from '../components/ui/Spinner'
import { Button } from '../components/ui/Button'
import { Field, inputCls } from '../components/ui/Field'
import { SideDrawer, DrawerItem } from '../components/SideDrawer'
import { formatCOP } from '../utils/format'
import {
  FiArrowLeft, FiLogOut, FiPlus, FiEdit2, FiTrash2, FiCoffee,
  FiGrid, FiPackage, FiAlertCircle, FiToggleLeft, FiToggleRight, FiHeart,
  FiSettings, FiUser
} from 'react-icons/fi'

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

function CategoriaForm({ token, restauranteId, initial, onDone, onCancel }) {
  const [nombre, setNombre] = useState(initial?.nombre || '')
  const [descripcion, setDescripcion] = useState(initial?.descripcion || '')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!nombre.trim()) {
      setError('El nombre es obligatorio')
      return
    }
    setSaving(true)
    try {
      const url = initial
        ? `/restaurantes/${restauranteId}/categorias/${initial._id}`
        : `/restaurantes/${restauranteId}/categorias`
      const res = await fetchApi(token, url, {
        method: initial ? 'PUT' : 'POST',
        body: JSON.stringify({ nombre: nombre.trim(), descripcion: descripcion.trim() }),
      })
      if (!res.ok) throw new Error('No se pudo guardar la categoría')
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
      <Field label="Nombre" htmlFor="cat-nombre">
        <input
          id="cat-nombre"
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Ej: Entradas, Platos fuertes..."
          className={inputCls}
          required
        />
      </Field>
      <Field label="Descripción (opcional)" htmlFor="cat-descripcion">
        <textarea
          id="cat-descripcion"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          rows={3}
          className={inputCls}
        />
      </Field>
      <div className="flex gap-3 pt-1">
        <Button variant="outline" type="button" onClick={onCancel} className="flex-1">
          Cancelar
        </Button>
        <Button type="submit" disabled={saving} className="flex-1">
          {saving ? 'Guardando...' : initial ? 'Guardar cambios' : 'Crear categoría'}
        </Button>
      </div>
    </form>
  )
}

function PlatoForm({ token, restauranteId, categoriaId, initial, onDone, onCancel }) {
  const [form, setForm] = useState({
    nombre: initial?.nombre || '',
    descripcion: initial?.descripcion || '',
    precio: initial?.precio ?? '',
    estado: initial?.estado || 'DISPONIBLE',
    ingredientes: initial?.ingredientes?.length
      ? initial.ingredientes.map((i) => ({ ...i }))
      : [{ nombre: '', cantidad: '', medida: '' }],
  })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const setField = (field, value) => setForm((f) => ({ ...f, [field]: value }))

  const setIngrediente = (idx, field, value) =>
    setForm((f) => ({
      ...f,
      ingredientes: f.ingredientes.map((ing, i) => (i === idx ? { ...ing, [field]: value } : ing)),
    }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.nombre.trim()) {
      setError('El nombre es obligatorio')
      return
    }
    const precio = Number(form.precio)
    if (!precio || precio <= 0) {
      setError('El precio debe ser mayor que cero')
      return
    }
    const ingredientes = form.ingredientes
      .filter((ing) => ing.nombre?.trim())
      .map((ing) => ({
        nombre: ing.nombre.trim(),
        cantidad: Number(ing.cantidad) || 0,
        medida: ing.medida?.trim() || 'u',
      }))

    setSaving(true)
    try {
      const url = initial ? `/platos/${initial._id}` : '/platos'
      const res = await fetchApi(token, url, {
        method: initial ? 'PUT' : 'POST',
        body: JSON.stringify({
          nombre: form.nombre.trim(),
          descripcion: form.descripcion.trim(),
          precio,
          estado: form.estado,
          ingredientes,
          restaurante_id: restauranteId,
          categoria_id: categoriaId,
        }),
      })
      if (!res.ok) throw new Error('No se pudo guardar el plato')
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
      <Field label="Nombre" htmlFor="pl-nombre">
        <input
          id="pl-nombre"
          type="text"
          value={form.nombre}
          onChange={(e) => setField('nombre', e.target.value)}
          placeholder="Ej: Bandeja paisa"
          className={inputCls}
          required
        />
      </Field>
      <Field label="Descripción" htmlFor="pl-descripcion">
        <textarea
          id="pl-descripcion"
          value={form.descripcion}
          onChange={(e) => setField('descripcion', e.target.value)}
          rows={2}
          className={inputCls}
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Precio (COP)" htmlFor="pl-precio">
          <input
            id="pl-precio"
            type="number"
            min="0"
            value={form.precio}
            onChange={(e) => setField('precio', e.target.value)}
            placeholder="25000"
            className={inputCls}
            required
          />
        </Field>
        <Field label="Estado" htmlFor="pl-estado">
          <select
            id="pl-estado"
            value={form.estado}
            onChange={(e) => setField('estado', e.target.value)}
            className={inputCls}
          >
            <option value="DISPONIBLE">Disponible</option>
            <option value="AGOTADO">Agotado</option>
          </select>
        </Field>
      </div>
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Ingredientes</label>
          <button
            type="button"
            onClick={() =>
              setForm((f) => ({ ...f, ingredientes: [...f.ingredientes, { nombre: '', cantidad: '', medida: '' }] }))
            }
            className="flex min-h-[44px] items-center gap-1 rounded-lg px-2 text-sm font-semibold text-brand-600 hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-500/10"
          >
            <FiPlus className="h-4 w-4" /> Agregar
          </button>
        </div>
        <div className="space-y-2">
          {form.ingredientes.map((ing, i) => (
            <div key={i} className="space-y-2 rounded-xl border border-gray-200 bg-gray-50/50 p-3 dark:border-gray-700 dark:bg-gray-800/50">
              <div className="flex items-center justify-between gap-2">
                <input
                  type="text"
                  value={ing.nombre}
                  onChange={(e) => setIngrediente(i, 'nombre', e.target.value)}
                  placeholder="Nombre del ingrediente"
                  className={inputCls}
                  aria-label={`Ingrediente ${i + 1}`}
                />
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, ingredientes: f.ingredientes.filter((_, j) => j !== i) }))}
                  disabled={form.ingredientes.length === 1}
                  aria-label={`Quitar ingrediente ${i + 1}`}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-error-50 hover:text-error-600 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:bg-error-500/10"
                >
                  <FiTrash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Cantidad" htmlFor={`ing-cant-${i}`}>
                  <input
                    id={`ing-cant-${i}`}
                    type="number"
                    min="0"
                    value={ing.cantidad}
                    onChange={(e) => setIngrediente(i, 'cantidad', e.target.value)}
                    placeholder="250"
                    className={inputCls}
                  />
                </Field>
                <Field label="Medida" htmlFor={`ing-med-${i}`}>
                  <input
                    id={`ing-med-${i}`}
                    type="text"
                    value={ing.medida}
                    onChange={(e) => setIngrediente(i, 'medida', e.target.value)}
                    placeholder="g, un, ml..."
                    className={inputCls}
                  />
                </Field>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex gap-3 pt-1">
        <Button variant="outline" type="button" onClick={onCancel} className="flex-1">
          Cancelar
        </Button>
        <Button type="submit" disabled={saving} className="flex-1">
          {saving ? 'Guardando...' : initial ? 'Guardar cambios' : 'Crear plato'}
        </Button>
      </div>
    </form>
  )
}

function Platos() {
  const { user, restaurante, loading, logout, token } = useAuth()
  const navigate = useNavigate()
  const [categorias, setCategorias] = useState([])
  const [platos, setPlatos] = useState([])
  const [selected, setSelected] = useState(null)
  const [modals, setModals] = useState({ categoria: null, plato: null })
  const [error, setError] = useState('')

  const restauranteId = restaurante?._id

  const loadCategorias = async () => {
    if (!restauranteId) return
    try {
      const res = await fetchApi(token, `/restaurantes/${restauranteId}/categorias`)
      if (!res.ok) throw new Error('No se pudieron cargar las categorías')
      const data = await res.json()
      setCategorias(data)
      setSelected((prev) => (prev && data.some((c) => c._id === prev._id) ? prev : data[0] || null))
    } catch (err) {
      setError(err.message)
    }
  }

  const loadPlatos = async () => {
    if (!restauranteId) return
    try {
      const res = await fetchApi(token, `/platos?restaurante_id=${restauranteId}`)
      if (!res.ok) throw new Error('No se pudieron cargar los platos')
      setPlatos(await res.json())
    } catch (err) {
      setError(err.message)
    }
  }

  useEffect(() => {
    if (loading || !restauranteId || !token) return
    let active = true
    fetchApi(token, `/restaurantes/${restauranteId}/categorias`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('No se pudieron cargar las categorías'))))
      .then((data) => {
        if (!active) return
        setCategorias(data)
        setSelected((prev) => (prev && data.some((c) => c._id === prev._id) ? prev : data[0] || null))
      })
      .catch((err) => {
        if (active) setError(err.message)
      })
    fetchApi(token, `/platos?restaurante_id=${restauranteId}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('No se pudieron cargar los platos'))))
      .then((data) => {
        if (active) setPlatos(data)
      })
      .catch((err) => {
        if (active) setError(err.message)
      })
    return () => {
      active = false
    }
  }, [loading, restauranteId, token])

  const seleccionar = (cat) => {
    setModals((m) => ({ ...m, plato: null }))
    setSelected(cat)
  }

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

  const closeCategoriaModal = () => setModals((m) => ({ ...m, categoria: null }))
  const closePlatoModal = () => setModals((m) => ({ ...m, plato: null }))

  const platosDeCategoria = (catId) => platos.filter((p) => String(p.categoria_id) === String(catId))
  const platosSeleccionados = selected ? platosDeCategoria(selected._id) : []

  const borrarCategoria = async (cat) => {
    if (!window.confirm(`¿Eliminar la categoría "${cat.nombre}"? Los platos no se eliminan, quedan sin categoría.`)) return
    try {
      const res = await fetchApi(token, `/restaurantes/${restauranteId}/categorias/${cat._id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('No se pudo eliminar la categoría')
      setSelected(null)
      loadCategorias()
    } catch (err) {
      setError(err.message)
    }
  }

  const borrarPlato = async (plato) => {
    if (!window.confirm(`¿Eliminar "${plato.nombre}"?`)) return
    try {
      const res = await fetchApi(token, `/platos/${plato._id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('No se pudo eliminar el plato')
      loadPlatos()
    } catch (err) {
      setError(err.message)
    }
  }

  const toggleEstadoPlato = async (plato) => {
    const nuevo = plato.estado === 'DISPONIBLE' ? 'AGOTADO' : 'DISPONIBLE'
    try {
      const res = await fetchApi(token, `/platos/${plato._id}/estado`, {
        method: 'PATCH',
        body: JSON.stringify({ estado: nuevo }),
      })
      if (!res.ok) throw new Error('No se pudo cambiar el estado')
      loadPlatos()
    } catch (err) {
      setError(err.message)
    }
  }

  const irA = (to) => {
    navigate(to)
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16 dark:bg-gray-950">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 border-b border-gray-100 bg-white/80 backdrop-blur-md dark:border-gray-800 dark:bg-gray-900/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <button
            onClick={() => irA('/dashboard')}
            title="Volver al panel de administración"
            className="hidden min-h-11 items-center gap-2 rounded-full px-3 text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 xl:flex"
          >
            <FiArrowLeft className="h-4 w-4" />
            Panel
          </button>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 font-bold text-lg text-white">Q</span>
            <span className="text-lg font-bold tracking-tight text-gray-900 dark:text-gray-100">Platos</span>
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
                <DrawerItem
                  icon={FiGrid}
                  label="Panel"
                  onClick={() => {
                    irA('/dashboard')
                  }}
                />
                <DrawerItem
                  icon={FiUser}
                  label="Perfil"
                  onClick={() => {
                    irA('/dashboard/perfil')
                  }}
                />
                <DrawerItem
                  icon={FiSettings}
                  label="Configuración"
                  onClick={() => {
                    irA('/dashboard/perfil?tab=config')
                  }}
                />
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

        <div className="grid gap-6 lg:grid-cols-[320px_1fr] lg:items-start">
          {/* Categorías */}
          <aside className="lg:sticky lg:top-20 lg:self-start">
            <Card className="p-4 sm:p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-gray-100">
                  <FiGrid className="h-4 w-4 text-brand-600 dark:text-brand-400" />
                  Categorías
                </h2>
                <button
                  onClick={() => setModals((m) => ({ ...m, categoria: { initial: null } }))}
                  className="flex min-h-11 items-center gap-1 rounded-full bg-brand-600 px-4 text-sm font-semibold text-white shadow-md shadow-brand-600/20 transition-all hover:bg-brand-700"
                >
                  <FiPlus className="h-4 w-4" />
                  Nueva
                </button>
              </div>

              <ul className="space-y-2">
                {categorias.length === 0 && (
                  <li className="rounded-xl bg-brand-50 p-4 text-sm text-brand-700 dark:bg-brand-500/10 dark:text-brand-400">
                    Aún no tienes categorías. Crea la primera con el botón "Nueva".
                  </li>
                )}
                {categorias.map((cat) => {
                  const activa = selected?._id === cat._id
                  return (
                    <li key={cat._id}>
                      <div
                        className={`flex cursor-pointer items-center justify-between gap-2 rounded-xl border px-3 py-2.5 transition-all hover:-translate-y-0.5 ${
                          activa
                            ? 'border-brand-200 bg-brand-50 shadow-sm dark:border-brand-500/30 dark:bg-brand-500/10'
                            : 'border-transparent hover:border-gray-200 hover:bg-gray-50 dark:hover:border-gray-700 dark:hover:bg-gray-800'
                        }`}
                        onClick={() => seleccionar(cat)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && seleccionar(cat)}
                        aria-pressed={activa}
                      >
                        <div className="min-w-0">
                          <p className={`truncate text-sm font-semibold ${activa ? 'text-brand-700 dark:text-brand-400' : 'text-gray-800 dark:text-gray-200'}`}>
                            {cat.nombre}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">
                            {platosDeCategoria(cat._id).length} plato(s)
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setModals((m) => ({ ...m, categoria: { initial: cat } }))
                            }}
                            aria-label={`Editar ${cat.nombre}`}
                            className="flex h-11 w-11 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-brand-100 hover:text-brand-700 dark:text-gray-400 dark:hover:bg-brand-500/20 dark:hover:text-brand-400"
                          >
                            <FiEdit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              borrarCategoria(cat)
                            }}
                            aria-label={`Eliminar ${cat.nombre}`}
                            className="flex h-11 w-11 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-error-50 hover:text-error-600 dark:text-gray-400 dark:hover:bg-error-500/10 dark:hover:text-error-400"
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </Card>
          </aside>

          {/* Platos */}
          <section>
            {!selected ? (
              <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800">
                <FiPackage className="mb-3 h-10 w-10 text-gray-300 dark:text-gray-600" />
                <p className="font-semibold text-gray-700 dark:text-gray-200">Selecciona una categoría</p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Elige una categoría de la lista para ver sus platos.</p>
              </div>
            ) : (
              <>
                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">{selected.nombre}</h1>
                    {selected.descripcion && <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{selected.descripcion}</p>}
                  </div>
                  <button
                    onClick={() => setModals((m) => ({ ...m, plato: { initial: null } }))}
                    className="flex min-h-11 items-center justify-center gap-1 rounded-full bg-brand-600 px-5 text-sm font-semibold text-white shadow-lg shadow-brand-600/20 transition-all hover:bg-brand-700"
                  >
                    <FiPlus className="h-4 w-4" />
                    Nuevo plato
                  </button>
                </div>

                {platosSeleccionados.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800">
                    <FiCoffee className="mb-3 h-10 w-10 text-gray-300 dark:text-gray-600" />
                    <p className="font-semibold text-gray-700 dark:text-gray-200">Sin platos todavía</p>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Crea el primer plato de esta categoría.</p>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {platosSeleccionados.map((plato) => (
                      <article
                        key={plato._id}
                        className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-brand-100/50 dark:bg-gray-900 dark:ring-gray-800 dark:hover:shadow-brand-500/10"
                      >
                        <div className="mb-3 flex items-start justify-between gap-2">
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100">{plato.nombre}</h3>
                          <span
                            className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                              plato.estado === 'DISPONIBLE'
                                ? 'bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-400'
                                : 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400'
                            }`}
                          >
                            {plato.estado === 'DISPONIBLE' ? 'Disponible' : 'Agotado'}
                          </span>
                        </div>
                        {plato.descripcion && (
                          <p className="mb-3 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">{plato.descripcion}</p>
                        )}
                        <p className="mb-3 text-lg font-bold text-brand-600 dark:text-brand-400">{formatCOP(plato.precio)}</p>
                        {plato.ingredientes?.length > 0 && (
                          <p className="mb-4 line-clamp-1 text-xs text-gray-400 dark:text-gray-500">
                            {plato.ingredientes.map((i) => i.nombre).join(', ')}
                          </p>
                        )}
                        <div className="flex items-center justify-between gap-2 border-t border-gray-100 pt-3 dark:border-gray-800">
                          <button
                            onClick={() => toggleEstadoPlato(plato)}
                            className="flex min-h-11 items-center gap-1.5 rounded-lg px-2 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                          >
                            {plato.estado === 'DISPONIBLE' ? (
                              <FiToggleRight className="h-5 w-5 text-success-600" />
                            ) : (
                              <FiToggleLeft className="h-5 w-5 text-amber-500" />
                            )}
                            {plato.estado === 'DISPONIBLE' ? 'Agotar' : 'Disponible'}
                          </button>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setModals((m) => ({ ...m, plato: { initial: plato } }))}
                              aria-label={`Editar ${plato.nombre}`}
                              className="flex h-11 w-11 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-brand-100 hover:text-brand-700 dark:text-gray-400 dark:hover:bg-brand-500/20 dark:hover:text-brand-400"
                            >
                              <FiEdit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => borrarPlato(plato)}
                              aria-label={`Eliminar ${plato.nombre}`}
                              className="flex h-11 w-11 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-error-50 hover:text-error-600 dark:text-gray-400 dark:hover:bg-error-500/10 dark:hover:text-error-400"
                            >
                              <FiTrash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </main>

      {/* Modales */}
      {modals.categoria && (
        <Modal title={modals.categoria.initial ? 'Editar categoría' : 'Nueva categoría'} onClose={closeCategoriaModal}>
          <CategoriaForm
            token={token}
            restauranteId={restauranteId}
            initial={modals.categoria.initial}
            onCancel={closeCategoriaModal}
            onDone={() => {
              closeCategoriaModal()
              loadCategorias()
            }}
          />
        </Modal>
      )}
      {modals.plato && selected && (
        <Modal title={modals.plato.initial ? 'Editar plato' : `Nuevo plato en "${selected.nombre}"`} onClose={closePlatoModal}>
          <PlatoForm
            token={token}
            restauranteId={restauranteId}
            categoriaId={selected._id}
            initial={modals.plato.initial}
            onCancel={closePlatoModal}
            onDone={() => {
              closePlatoModal()
              loadPlatos()
            }}
          />
        </Modal>
      )}
    </div>
  )
}

export default Platos