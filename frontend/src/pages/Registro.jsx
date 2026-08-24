import { useState } from 'react';
import { registroTexts, errors } from '../data/auth';
import { API_URL } from '../auth';
import { Field, Input, Select } from '../components/ui/Field';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Spinner } from '../components/ui/Spinner';
import { FiUser } from 'react-icons/fi';
import { FaStore } from 'react-icons/fa6';

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
      setError(errors.required);
      return;
    }
    setStep(2);
  };

  const handleRestaurantSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!restaurant.nombre.trim() || !restaurant.ubicacion.trim()) {
      setError(errors.required);
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
        throw new Error(errData.message || errors.adminCreateFailed);
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
        throw new Error(errData.message || errors.restaurantCreateFailed);
      }

      setSuccess(true);
    } catch (err) {
      setError(err.message || errors.networkError);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    const successSubtitle = registroTexts.successSubtitle.replace('{name}', restaurant.nombre);

    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 to-accent-50 dark:from-gray-900 dark:to-gray-950 px-4">
        <div className="w-full max-w-sm sm:max-w-md">
          <Card elevation="xl" className="p-6 text-center sm:p-8">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-success-100 dark:bg-success-500/15">
              <svg className="h-8 w-8 text-success-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="mb-2 text-xl font-bold text-gray-900 dark:text-gray-100 sm:text-2xl">{registroTexts.successTitle}</h2>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 sm:text-base">
              <span className="font-semibold text-brand-600">{restaurant.nombre}</span>{successSubtitle.replace(restaurant.nombre, '')}
            </p>
            <div className="mb-6 rounded-xl bg-brand-50 p-4 text-left dark:bg-brand-500/10">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">Administrador:</span> {admin.usuario}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">Restaurante:</span> {restaurant.nombre}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">Ubicación:</span> {restaurant.ubicacion}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">Plan:</span> {admin.plan === 'pro' ? 'Pro' : 'Gratis'}
              </p>
            </div>
            <Button
              onClick={() => window.location.href = '/'}
              title="Regresar a la página principal"
              className="w-full"
              size="lg"
            >
              {registroTexts.successCta}
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-accent-50 dark:from-gray-900 dark:to-gray-950">
      <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-md dark:border-gray-800 dark:bg-gray-900/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <a href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 font-bold text-lg text-white">Q</div>
            <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-2xl">QRTa</span>
          </a>
          <div className="flex items-center gap-3">
            <a href="/" className="text-sm font-medium text-gray-500 transition-colors hover:text-brand-600 dark:text-gray-400">
              Volver al inicio
            </a>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-xl px-4 py-8 sm:py-12">
        <div className="mb-8 sm:mb-10">
          <div className="flex items-center justify-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-colors ${step >= 1 ? 'bg-brand-600 text-white' : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}>
                {step > 1 ? (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : '1'}
              </div>
              <span className={`text-xs font-medium sm:text-sm ${step >= 1 ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'}`}>{registroTexts.stepLabel1}</span>
            </div>

            <div className={`h-0.5 w-8 sm:w-12 ${step >= 2 ? 'bg-brand-600' : 'bg-gray-200 dark:bg-gray-700'}`}></div>

            <div className="flex items-center gap-2">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-colors ${step >= 2 ? 'bg-brand-600 text-white' : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}>
                2
              </div>
              <span className={`text-xs font-medium sm:text-sm ${step >= 2 ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'}`}>{registroTexts.stepLabel2}</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-error-200 bg-error-50 p-4 text-sm text-error-700 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-400">
            {error}
          </div>
        )}

        {step === 1 && (
          <Card elevation="xl" className="p-6 sm:p-8">
            <div className="mb-6 text-center sm:mb-8">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400">
                <FiUser className="h-7 w-7" aria-hidden="true" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 sm:text-2xl">{registroTexts.step1Title}</h1>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 sm:text-base">{registroTexts.step1Subtitle}</p>
            </div>

            <form onSubmit={handleAdminSubmit} className="space-y-4 sm:space-y-5">
              <Field label={registroTexts.fields.nombre} htmlFor="adm-nombre">
                <Input
                  type="text"
                  id="adm-nombre"
                  name="nombre"
                  value={admin.nombre}
                  onChange={handleAdminChange}
                  placeholder={registroTexts.placeholders.nombre}
                  required
                />
              </Field>

              <Field label={registroTexts.fields.email} htmlFor="adm-email">
                <Input
                  type="email"
                  id="adm-email"
                  name="email"
                  value={admin.email}
                  onChange={handleAdminChange}
                  placeholder={registroTexts.placeholders.email}
                  required
                />
              </Field>

              <Field label={registroTexts.fields.usuario} htmlFor="adm-usuario">
                <Input
                  type="text"
                  id="adm-usuario"
                  name="usuario"
                  value={admin.usuario}
                  onChange={handleAdminChange}
                  placeholder={registroTexts.placeholders.usuario}
                  required
                />
              </Field>

              <Field label={registroTexts.fields.password} htmlFor="adm-password">
                <Input
                  type="password"
                  id="adm-password"
                  name="password"
                  value={admin.password}
                  onChange={handleAdminChange}
                  placeholder={registroTexts.placeholders.password}
                  required
                />
              </Field>

              <Field label={registroTexts.fields.plan} htmlFor="adm-plan">
                <Select
                  id="adm-plan"
                  name="plan"
                  value={admin.plan}
                  onChange={handleAdminChange}
                >
                  <option value="free">Gratis</option>
                  <option value="pro">Pro</option>
                </Select>
              </Field>

              <Button type="submit" className="w-full" size="lg" title="Continuar con los datos del restaurante">
                {registroTexts.ctaNext}
                <svg className="inline-block h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Button>
            </form>
          </Card>
        )}

        {step === 2 && (
          <Card elevation="xl" className="p-6 sm:p-8">
            <div className="mb-6 text-center sm:mb-8">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400">
                <FaStore className="h-7 w-7" aria-hidden="true" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 sm:text-2xl">{registroTexts.step2Title}</h1>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 sm:text-base">
                {registroTexts.step2Subtitle.replace('{user}', admin.usuario).split(admin.usuario).map((part, i) => (
                  i === 0 ? <span key={i}>{part}</span> : <span key={i}><span className="font-semibold text-brand-600">{admin.usuario}</span>{part}</span>
                ))}
              </p>
            </div>

            <form onSubmit={handleRestaurantSubmit} className="space-y-4 sm:space-y-5">
              <Field label={registroTexts.fields.restNombre} htmlFor="rest-nombre">
                <Input
                  type="text"
                  id="rest-nombre"
                  name="nombre"
                  value={restaurant.nombre}
                  onChange={handleRestaurantChange}
                  placeholder={registroTexts.placeholders.restNombre}
                  required
                />
              </Field>

              <Field label={registroTexts.fields.ubicacion} htmlFor="rest-ubicacion">
                <Input
                  type="text"
                  id="rest-ubicacion"
                  name="ubicacion"
                  value={restaurant.ubicacion}
                  onChange={handleRestaurantChange}
                  placeholder={registroTexts.placeholders.ubicacion}
                  required
                />
              </Field>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => { setStep(1); setError(''); }}
                  title="Volver a los datos de la cuenta"
                  className="flex-1"
                  size="lg"
                >
                  {registroTexts.ctaBack}
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  title="Crear la cuenta y el restaurante"
                  className="flex-1"
                  size="lg"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Spinner className="h-4 w-4" />
                      {registroTexts.loading}
                    </span>
                  ) : (
                    registroTexts.ctaSubmit
                  )}
                </Button>
              </div>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}

export default Registro;