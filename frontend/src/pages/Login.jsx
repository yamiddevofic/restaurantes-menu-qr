import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth, API_URL } from '../auth';
import { loginTexts, errors } from '../data/auth';
import { Field, Input } from '../components/ui/Field';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { FiLock } from 'react-icons/fi';

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

      saveSession({ token: data.token, user: data.user, restaurante: data.restaurante, restaurantes: data.restaurantes });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || errors.networkError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-brand-50 to-accent-50 dark:from-gray-900 dark:to-gray-950">
      <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-md dark:border-gray-800 dark:bg-gray-900/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <a href="/" className="flex items-center gap-2" title="Ir al inicio de QRTa">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 font-bold text-lg text-white">Q</div>
            <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-2xl">QRTa</span>
          </a>
          <div className="flex items-center gap-3">
            <a href="/" className="text-sm font-medium text-gray-500 transition-colors hover:text-brand-600 dark:text-gray-400" title="Volver a la página principal">
              Volver al inicio
            </a>
          </div>
        </div>
      </nav>

      <div className="flex flex-1 items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800 sm:p-8">
          <div className="mb-6 text-center sm:mb-8">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400">
              <FiLock className="h-7 w-7" aria-hidden="true" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 sm:text-2xl">{loginTexts.title}</h1>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 sm:text-base">{loginTexts.subtitle}</p>
          </div>

          <div className="mb-6 flex gap-2 rounded-xl bg-gray-100 p-1 dark:bg-gray-800">
            <button
              type="button"
              onClick={() => setTipo('admin')}
              title="Iniciar sesión como administrador"
              className={`min-h-11 flex-1 rounded-lg py-3 text-sm font-semibold transition-all sm:py-2.5 ${
                tipo === 'admin'
                  ? 'bg-white text-brand-600 shadow-sm dark:bg-gray-700 dark:text-brand-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              {loginTexts.toggleAdmin}
            </button>
            <button
              type="button"
              onClick={() => setTipo('empleado')}
              title="Iniciar sesión como empleado"
              className={`min-h-11 flex-1 rounded-lg py-3 text-sm font-semibold transition-all sm:py-2.5 ${
                tipo === 'empleado'
                  ? 'bg-white text-brand-600 shadow-sm dark:bg-gray-700 dark:text-brand-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              {loginTexts.toggleEmpleado}
            </button>
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-error-200 bg-error-50 p-4 text-sm text-error-700 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <Field label={loginTexts.userLabel} htmlFor="usuario">
              <Input
                type="text"
                id="usuario"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                placeholder={loginTexts.userPlaceholder}
                required
              />
            </Field>

            <Field label={loginTexts.passLabel} htmlFor="password">
              <Input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={loginTexts.passPlaceholder}
                required
              />
            </Field>

            <Button type="submit" disabled={loading} className="w-full" size="lg" title="Entra con tus credenciales">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Spinner className="h-4 w-4" />
                  {loginTexts.loading}
                </span>
              ) : (
                loginTexts.cta
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            {loginTexts.linkText}{' '}
            <a href="/registro" className="font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300" title="Crear una cuenta nueva">
              {loginTexts.linkCta}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;