import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { useAuth, API_URL } from '../auth'
import Modal from '../components/Modal'
import {
  FiArrowLeft, FiLogOut, FiPlus, FiEdit2, FiTrash2, FiCoffee,
  FiGrid, FiPackage, FiAlertCircle, FiToggleLeft, FiToggleRight
} from 'react-icons/fi'

const formatCOP = (n) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)

const inputCls =
  'w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 transition-colors focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20'
const btnPrimary =
  'flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full bg-orange-600 px-6 py-2.5 font-semibold text-white shadow-lg shadow-orange-600/20 transition-all hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50'
const btnGhost =
  'flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full border border-gray-200 px-6 py-2.5 font-semibold text-gray-700 transition-all hover:bg-gray-50'

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
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}
      <div>
        <label htmlFor="cat-nombre" className="mb-1.5 block text-sm font-medium text-gray-700">
          Nombre
        </label>
        <input
          id="cat-nombre"
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Ej: Entradas, Platos fuertes..."
          className={inputCls}
          required
        />
      </div>
      <div>
        <label htmlFor="cat-descripcion" className="mb-1.5 block text-sm font-medium text-gray-700">
          Descripción (opcional)
        </label>
        <textarea
          id="cat-descripcion"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          rows={3}
          className={inputCls}
        />
      </div>
      <div className="flex gap-3 pt-1">
        <button type="button" onClick={onCancel} className={btnGhost}>
          Cancelar
        </button>
        <button type="submit" disabled={saving} className={btnPrimary}>
          {saving ? 'Guardando...' : initial ? 'Guardar cambios' : 'Crear categoría'}
        </button>
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
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}
      <div>
        <label htmlFor="pl-nombre" className="mb-1.5 block text-sm font-medium text-gray-700">
          Nombre
        </label>
        <input
          id="pl-nombre"
          type="text"
          value={form.nombre}
          onChange={(e) => setField('nombre', e.target.value)}
          placeholder="Ej: Bandeja paisa"
          className={inputCls}
          required
        />
      </div>
      <div>
        <label htmlFor="pl-descripcion" className="mb-1.5 block text-sm font-medium text-gray-700">
          Descripción
        </label>
        <textarea
          id="pl-descripcion"
          value={form.descripcion}
          onChange={(e) => setField('descripcion', e.target.value)}
          rows={2}
          className={inputCls}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="pl-precio" className="mb-1.5 block text-sm font-medium text-gray-700">
            Precio (COP)
          </label>
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
        </div>
        <div>
          <label htmlFor="pl-estado" className="mb-1.5 block text-sm font-medium text-gray-700">
            Estado
          </label>
          <select
            id="pl-estado"
            value={form.estado}
            onChange={(e) => setField('estado', e.target.value)}
            className={inputCls}
          >
            <option value="DISPONIBLE">Disponible</option>
            <option value="AGOTADO">Agotado</option>
          </select>
        </div>
      </div>
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">Ingredientes</label>
          <button
            type="button"
            onClick={() =>
              setForm((f) => ({ ...f, ingredientes: [...f.ingredientes, { nombre: '', cantidad: '', medida: '' }] }))
            }
            className="flex min-h-[44px] items-center gap-1 rounded-lg px-2 text-sm font-semibold text-orange-600 hover:bg-orange-50"
          >
            <FiPlus className="h-4 w-4" /> Agregar
          </button>
        </div>
        <div className="space-y-2">
          {form.ingredientes.map((ing, i) => (
            <div key={i} className="space-y-2 rounded-xl border border-gray-200 bg-gray-50/50 p-3">
              <div className="flex items-center justify-between gap-2">
                <input
                  type="text"
                  value={ing.nombre}
                  onChange={(e) => setIngrediente(i, 'nombre', e.target.value)}
                  placeholder="Nombre del ingrediente"
                  className={`${inputCls} w-full`}
                  aria-label={`Ingrediente ${i + 1}`}
                />
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, ingredientes: f.ingredientes.filter((_, j) => j !== i) }))}
                  disabled={form.ingredientes.length === 1}
                  aria-label={`Quitar ingrediente ${i + 1}`}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <FiTrash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor={`ing-cant-${i}`} className="mb-1 block text-xs font-medium text-gray-500">
                    Cantidad
                  </label>
                  <input
                    id={`ing-cant-${i}`}
                    type="number"
                    min="0"
                    value={ing.cantidad}
                    onChange={(e) => setIngrediente(i, 'cantidad', e.target.value)}
                    placeholder="250"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label htmlFor={`ing-med-${i}`} className="mb-1 block text-xs font-medium text-gray-500">
                    Medida
                  </label>
                  <input
                    id={`ing-med-${i}`}
                    type="text"
                    value={ing.medida}
                    onChange={(e) => setIngrediente(i, 'medida', e.target.value)}
                    placeholder="g, un, ml..."
                    className={inputCls}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex gap-3 pt-1">
        <button type="button" onClick={onCancel} className={btnGhost}>
          Cancelar
        </button>
        <button type="submit" disabled={saving} className={btnPrimary}>
          {saving ? 'Guardando...' : initial ? 'Guardar cambios' : 'Crear plato'}
        </button>
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
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex items-center gap-3 text-gray-500">
          <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
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

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex min-h-[44px] items-center gap-2 rounded-full px-3 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100"
          >
            <FiArrowLeft className="h-4 w-4" />
            Panel
          </button>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-600 font-bold text-lg text-white">Q</span>
            <span className="text-lg font-bold tracking-tight text-gray-900">Platos</span>
          </div>
          <button
            onClick={handleLogout}
            aria-label="Cerrar sesión"
            className="flex min-h-[44px] items-center justify-center rounded-full px-3 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
          >
            <FiLogOut className="h-5 w-5" />
          </button>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {error && (
          <div className="mb-6 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <FiAlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          {/* Categorías */}
          <aside className="lg:sticky lg:top-20 lg:self-start">
            <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100 sm:p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 font-semibold text-gray-900">
                  <FiGrid className="h-4 w-4 text-orange-600" />
                  Categorías
                </h2>
                <button
                  onClick={() => setModals({ ...modals, categoria: { initial: null } })}
                  className="flex min-h-[44px] items-center gap-1 rounded-full bg-orange-600 px-4 text-sm font-semibold text-white shadow-md shadow-orange-600/20 transition-all hover:bg-orange-700"
                >
                  <FiPlus className="h-4 w-4" />
                  Nueva
                </button>
              </div>

              <ul className="space-y-2">
                {categorias.length === 0 && (
                  <li className="rounded-xl bg-orange-50 p-4 text-sm text-orange-700">
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
                            ? 'border-orange-200 bg-orange-50 shadow-sm'
                            : 'border-transparent hover:border-gray-200 hover:bg-gray-50'
                        }`}
                        onClick={() => seleccionar(cat)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && seleccionar(cat)}
                        aria-pressed={activa}
                      >
                        <div className="min-w-0">
                          <p className={`truncate text-sm font-semibold ${activa ? 'text-orange-700' : 'text-gray-800'}`}>
                            {cat.nombre}
                          </p>
                          <p className="text-xs text-gray-400">
                            {platosDeCategoria(cat._id).length} plato(s)
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setModals({ ...modals, categoria: { initial: cat } })
                            }}
                            aria-label={`Editar ${cat.nombre}`}
                            className="flex h-11 w-11 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-orange-100 hover:text-orange-700"
                          >
                            <FiEdit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              borrarCategoria(cat)
                            }}
                            aria-label={`Eliminar ${cat.nombre}`}
                            className="flex h-11 w-11 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600"
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>
          </aside>

          {/* Platos */}
          <section>
            {!selected ? (
              <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-gray-100">
                <FiPackage className="mb-3 h-10 w-10 text-gray-300" />
                <p className="font-semibold text-gray-700">Selecciona una categoría</p>
                <p className="mt-1 text-sm text-gray-500">Elige una categoría de la lista para ver sus platos.</p>
              </div>
            ) : (
              <>
                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">{selected.nombre}</h1>
                    {selected.descripcion && <p className="mt-0.5 text-sm text-gray-500">{selected.descripcion}</p>}
                  </div>
                  <button
                    onClick={() => setModals({ ...modals, plato: { initial: null } })}
                    className="flex min-h-[44px] items-center justify-center gap-1 rounded-full bg-orange-600 px-5 text-sm font-semibold text-white shadow-lg shadow-orange-600/20 transition-all hover:bg-orange-700"
                  >
                    <FiPlus className="h-4 w-4" />
                    Nuevo plato
                  </button>
                </div>

                {platosSeleccionados.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-gray-100">
                    <FiCoffee className="mb-3 h-10 w-10 text-gray-300" />
                    <p className="font-semibold text-gray-700">Sin platos todavía</p>
                    <p className="mt-1 text-sm text-gray-500">Crea el primer plato de esta categoría.</p>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {platosSeleccionados.map((plato) => (
                      <article
                        key={plato._id}
                        className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-orange-100/50"
                      >
                        <div className="mb-3 flex items-start justify-between gap-2">
                          <h3 className="font-semibold text-gray-900">{plato.nombre}</h3>
                          <span
                            className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                              plato.estado === 'DISPONIBLE' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {plato.estado === 'DISPONIBLE' ? 'Disponible' : 'Agotado'}
                          </span>
                        </div>
                        {plato.descripcion && (
                          <p className="mb-3 line-clamp-2 text-sm text-gray-500">{plato.descripcion}</p>
                        )}
                        <p className="mb-3 text-lg font-bold text-orange-600">{formatCOP(plato.precio)}</p>
                        {plato.ingredientes?.length > 0 && (
                          <p className="mb-4 line-clamp-1 text-xs text-gray-400">
                            {plato.ingredientes.map((i) => i.nombre).join(', ')}
                          </p>
                        )}
                        <div className="flex items-center justify-between gap-2 border-t border-gray-100 pt-3">
                          <button
                            onClick={() => toggleEstadoPlato(plato)}
                            className="flex min-h-[44px] items-center gap-1.5 rounded-lg px-2 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-50"
                          >
                            {plato.estado === 'DISPONIBLE' ? (
                              <FiToggleRight className="h-5 w-5 text-green-600" />
                            ) : (
                              <FiToggleLeft className="h-5 w-5 text-amber-500" />
                            )}
                            {plato.estado === 'DISPONIBLE' ? 'Agotar' : 'Disponible'}
                          </button>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setModals({ ...modals, plato: { initial: plato } })}
                              aria-label={`Editar ${plato.nombre}`}
                              className="flex h-11 w-11 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-orange-100 hover:text-orange-700"
                            >
                              <FiEdit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => borrarPlato(plato)}
                              aria-label={`Eliminar ${plato.nombre}`}
                              className="flex h-11 w-11 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600"
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
