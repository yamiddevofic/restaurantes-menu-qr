import { useState } from 'react';

const API_URL = 'http://localhost:3000/api';

function Login() {
  const [tipo, setTipo] = useState('admin');
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [userData, setUserData] = useState(null);
  const [restaurante, setRestaurante] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!usuario.trim() || !password.trim()) {
      setError('Todos los campos son obligatorios');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, password, tipo }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Error al iniciar sesión');
      }

      setUserData({ ...data.user, tipo: data.tipo });
      setRestaurante(data.restaurante);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Ocurrió un error. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (success && userData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50 px-4">
        <div className="w-full max-w-md">
          <div className="rounded-2xl bg-white p-8 text-center shadow-xl ring-1 ring-gray-100">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="mb-2 text-2xl font-bold text-gray-900">¡Bienvenido!</h2>
            <p className="mb-6 text-gray-500">
              Has iniciado sesión como <span className="font-semibold text-orange-600">{userData.tipo === 'admin' ? 'Administrador' : 'Empleado'}</span>
            </p>
            <div className="mb-6 rounded-xl bg-orange-50 p-4 text-left">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Nombre:</span> {userData.nombre}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Usuario:</span> {userData.usuario}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Email:</span> {userData.email}
              </p>
              {userData.rol && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Rol:</span> {userData.rol}
                </p>
              )}
              {userData.plan && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Plan:</span> {userData.plan === 'pro' ? 'Pro' : 'Gratis'}
                </p>
              )}
              {restaurante && (
                <>
                  <div className="my-3 border-t border-orange-200"></div>
                  <p className="text-sm font-semibold text-orange-700 mb-2">Restaurante</p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Nombre:</span> {restaurante.nombre}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Ubicación:</span> {restaurante.ubicacion}
                  </p>
                </>
              )}
              {!restaurante && userData.tipo === 'admin' && (
                <>
                  <div className="my-3 border-t border-orange-200"></div>
                  <p className="text-sm text-gray-500 italic">No tienes restaurante registrado</p>
                </>
              )}
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
        <div className="rounded-2xl bg-white p-8 shadow-xl ring-1 ring-gray-100">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-2xl">🔐</div>
            <h1 className="text-2xl font-bold text-gray-900">Iniciar sesión</h1>
            <p className="mt-2 text-gray-500">Selecciona tu tipo de cuenta</p>
          </div>

          <div className="mb-6 flex gap-2 rounded-xl bg-gray-100 p-1">
            <button
              type="button"
              onClick={() => setTipo('admin')}
              className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all ${
                tipo === 'admin'
                  ? 'bg-white text-orange-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Administrador
            </button>
            <button
              type="button"
              onClick={() => setTipo('empleado')}
              className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all ${
                tipo === 'empleado'
                  ? 'bg-white text-orange-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Empleado
            </button>
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="usuario" className="mb-1.5 block text-sm font-medium text-gray-700">
                Usuario
              </label>
              <input
                type="text"
                id="usuario"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                placeholder="Tu nombre de usuario"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 transition-colors focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Tu contraseña"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 transition-colors focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-orange-600 px-6 py-3.5 font-semibold text-white shadow-lg shadow-orange-600/20 transition-all hover:bg-orange-700 hover:shadow-orange-600/30 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  Iniciando sesión...
                </span>
              ) : (
                'Iniciar sesión'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            ¿No tienes cuenta?{' '}
            <a href="/registro" className="font-medium text-orange-600 hover:text-orange-700">
              Regístrate aquí
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
