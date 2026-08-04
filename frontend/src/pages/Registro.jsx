import { useState } from 'react';

const API_URL = 'http://localhost:3000/api';

function Registro() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [admin, setAdmin] = useState({
    nombre: '',
    email: '',
    usuario: '',
    password: '',
    plan: 'free',
  });

  const [restaurant, setRestaurant] = useState({
    nombre: '',
    ubicacion: '',
  });

  const handleAdminChange = (e) => {
    setAdmin({ ...admin, [e.target.name]: e.target.value });
  };

  const handleRestaurantChange = (e) => {
    setRestaurant({ ...restaurant, [e.target.name]: e.target.value });
  };

  const handleAdminSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!admin.nombre.trim() || !admin.email.trim() || !admin.usuario.trim() || !admin.password.trim()) {
      setError('Todos los campos son obligatorios');
      return;
    }
    setStep(2);
  };

  const handleRestaurantSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!restaurant.nombre.trim() || !restaurant.ubicacion.trim()) {
      setError('Todos los campos son obligatorios');
      setLoading(false);
      return;
    }

    try {
      const adminRes = await fetch(`${API_URL}/administradores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(admin),
      });

      if (!adminRes.ok) {
        const errData = await adminRes.json();
        throw new Error(errData.message || 'Error al crear administrador');
      }

      const adminData = await adminRes.json();
      const adminId = adminData._id;

      const restRes = await fetch(`${API_URL}/restaurantes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: restaurant.nombre,
          ubicacion: restaurant.ubicacion,
          adm_id: adminId,
        }),
      });

      if (!restRes.ok) {
        const errData = await restRes.json();
        throw new Error(errData.message || 'Error al crear restaurante');
      }

      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Ocurrió un error. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50 px-4">
        <div className="w-full max-w-md">
          <div className="rounded-2xl bg-white p-8 text-center shadow-xl ring-1 ring-gray-100">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="mb-2 text-2xl font-bold text-gray-900">¡Registro exitoso!</h2>
            <p className="mb-6 text-gray-500">
              Tu cuenta de administrador y restaurante <span className="font-semibold text-orange-600">{restaurant.nombre}</span> han sido creados correctamente.
            </p>
            <div className="mb-6 rounded-xl bg-orange-50 p-4">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Administrador:</span> {admin.usuario}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Restaurante:</span> {restaurant.nombre}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Ubicación:</span> {restaurant.ubicacion}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Plan:</span> {admin.plan === 'pro' ? 'Pro' : 'Gratis'}
              </p>
            </div>
            <button
              onClick={() => window.location.href = '/'}
              className="w-full rounded-full bg-orange-600 px-6 py-3 font-semibold text-white shadow-lg shadow-orange-600/20 transition-all hover:bg-orange-700 hover:shadow-orange-600/30"
            >
              Ir al inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <a href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-600 font-bold text-lg text-white">Q</div>
            <span className="text-2xl font-bold tracking-tight text-gray-900">QRTa</span>
          </a>
          <a href="/" className="text-sm font-medium text-gray-500 transition-colors hover:text-orange-600">
            Volver al inicio
          </a>
        </div>
      </nav>

      <div className="mx-auto max-w-xl px-4 py-12">
        <div className="mb-10">
          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-colors ${step >= 1 ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                {step > 1 ? (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : '1'}
              </div>
              <span className={`text-sm font-medium ${step >= 1 ? 'text-gray-900' : 'text-gray-400'}`}>Administrador</span>
            </div>

            <div className={`h-0.5 w-12 ${step >= 2 ? 'bg-orange-600' : 'bg-gray-200'}`}></div>

            <div className="flex items-center gap-2">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-colors ${step >= 2 ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                2
              </div>
              <span className={`text-sm font-medium ${step >= 2 ? 'text-gray-900' : 'text-gray-400'}`}>Restaurante</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {step === 1 && (
          <div className="rounded-2xl bg-white p-8 shadow-xl ring-1 ring-gray-100">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-2xl">👤</div>
              <h1 className="text-2xl font-bold text-gray-900">Crea tu cuenta</h1>
              <p className="mt-2 text-gray-500">Configura tu cuenta de administrador</p>
            </div>

            <form onSubmit={handleAdminSubmit} className="space-y-5">
              <div>
                <label htmlFor="adm-nombre" className="mb-1.5 block text-sm font-medium text-gray-700">
                  Nombre completo
                </label>
                <input
                  type="text"
                  id="adm-nombre"
                  name="nombre"
                  value={admin.nombre}
                  onChange={handleAdminChange}
                  placeholder="Ej: Juan Pérez"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 transition-colors focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  required
                />
              </div>

              <div>
                <label htmlFor="adm-email" className="mb-1.5 block text-sm font-medium text-gray-700">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  id="adm-email"
                  name="email"
                  value={admin.email}
                  onChange={handleAdminChange}
                  placeholder="Ej: juan@ejemplo.com"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 transition-colors focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  required
                />
              </div>

              <div>
                <label htmlFor="adm-usuario" className="mb-1.5 block text-sm font-medium text-gray-700">
                  Nombre de usuario
                </label>
                <input
                  type="text"
                  id="adm-usuario"
                  name="usuario"
                  value={admin.usuario}
                  onChange={handleAdminChange}
                  placeholder="Ej: juanperez"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 transition-colors focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  required
                />
              </div>

              <div>
                <label htmlFor="adm-password" className="mb-1.5 block text-sm font-medium text-gray-700">
                  Contraseña
                </label>
                <input
                  type="password"
                  id="adm-password"
                  name="password"
                  value={admin.password}
                  onChange={handleAdminChange}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 transition-colors focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  required
                />
              </div>

              <div>
                <label htmlFor="adm-plan" className="mb-1.5 block text-sm font-medium text-gray-700">
                  Plan
                </label>
                <select
                  id="adm-plan"
                  name="plan"
                  value={admin.plan}
                  onChange={handleAdminChange}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 transition-colors focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                >
                  <option value="free">Gratis</option>
                  <option value="pro">Pro</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full rounded-full bg-orange-600 px-6 py-3.5 font-semibold text-white shadow-lg shadow-orange-600/20 transition-all hover:bg-orange-700 hover:shadow-orange-600/30 hover:-translate-y-0.5"
              >
                Continuar
                <svg className="ml-2 inline-block h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </form>
          </div>
        )}

        {step === 2 && (
          <div className="rounded-2xl bg-white p-8 shadow-xl ring-1 ring-gray-100">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-2xl">🏪</div>
              <h1 className="text-2xl font-bold text-gray-900">Crea tu restaurante</h1>
              <p className="mt-2 text-gray-500">Configura el restaurante de <span className="font-semibold text-orange-600">{admin.usuario}</span></p>
            </div>

            <form onSubmit={handleRestaurantSubmit} className="space-y-5">
              <div>
                <label htmlFor="rest-nombre" className="mb-1.5 block text-sm font-medium text-gray-700">
                  Nombre del restaurante
                </label>
                <input
                  type="text"
                  id="rest-nombre"
                  name="nombre"
                  value={restaurant.nombre}
                  onChange={handleRestaurantChange}
                  placeholder="Ej: Restaurante La Cocina"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 transition-colors focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  required
                />
              </div>

              <div>
                <label htmlFor="rest-ubicacion" className="mb-1.5 block text-sm font-medium text-gray-700">
                  Ubicación
                </label>
                <input
                  type="text"
                  id="rest-ubicacion"
                  name="ubicacion"
                  value={restaurant.ubicacion}
                  onChange={handleRestaurantChange}
                  placeholder="Ej: Calle 123 #45-67"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 transition-colors focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setStep(1); setError(''); }}
                  className="flex-1 rounded-full border border-gray-200 px-6 py-3.5 font-semibold text-gray-700 transition-all hover:bg-gray-50"
                >
                  Atrás
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-full bg-orange-600 px-6 py-3.5 font-semibold text-white shadow-lg shadow-orange-600/20 transition-all hover:bg-orange-700 hover:shadow-orange-600/30 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                      </svg>
                      Creando...
                    </span>
                  ) : (
                    'Crear restaurante'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default Registro;
