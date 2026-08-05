import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth, API_URL } from '../auth';
import { loginTexts, errors } from '../data/auth';

function Login() {
  const navigate = useNavigate();
  const { saveSession } = useAuth();
  const [tipo, setTipo] = useState('admin');
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!usuario.trim() || !password.trim()) {
      setError(errors.required);
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
        throw new Error(data.message || errors.loginFailed);
      }

      saveSession({ token: data.token, user: data.user, restaurante: data.restaurante });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || errors.networkError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <a href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-600 font-bold text-lg text-white">Q</div>
            <span className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">QRTa</span>
          </a>
          <a href="/" className="text-sm font-medium text-gray-500 transition-colors hover:text-orange-600">
            Volver al inicio
          </a>
        </div>
      </nav>

      <div className="mx-auto max-w-xl px-4 py-8 sm:py-12">
        <div className="rounded-2xl bg-white p-6 shadow-xl ring-1 ring-gray-100 sm:p-8">
          <div className="mb-6 text-center sm:mb-8">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-2xl">🔐</div>
            <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">{loginTexts.title}</h1>
            <p className="mt-2 text-sm text-gray-500 sm:text-base">{loginTexts.subtitle}</p>
          </div>

          <div className="mb-6 flex gap-2 rounded-xl bg-gray-100 p-1">
            <button
              type="button"
              onClick={() => setTipo('admin')}
              className={`min-h-[44px] flex-1 rounded-lg py-3 text-sm font-semibold transition-all sm:py-2.5 ${
                tipo === 'admin'
                  ? 'bg-white text-orange-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {loginTexts.toggleAdmin}
            </button>
            <button
              type="button"
              onClick={() => setTipo('empleado')}
              className={`min-h-[44px] flex-1 rounded-lg py-3 text-sm font-semibold transition-all sm:py-2.5 ${
                tipo === 'empleado'
                  ? 'bg-white text-orange-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {loginTexts.toggleEmpleado}
            </button>
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div>
              <label htmlFor="usuario" className="mb-1.5 block text-sm font-medium text-gray-700">
                {loginTexts.userLabel}
              </label>
              <input
                type="text"
                id="usuario"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                placeholder={loginTexts.userPlaceholder}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 transition-colors focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-gray-700">
                {loginTexts.passLabel}
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={loginTexts.passPlaceholder}
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
                  {loginTexts.loading}
                </span>
              ) : (
                loginTexts.cta
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            {loginTexts.linkText}{' '}
            <a href="/registro" className="font-medium text-orange-600 hover:text-orange-700">
              {loginTexts.linkCta}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;