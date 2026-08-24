import { FiHome as FiHomeIcon, FiMapPin, FiUser, FiStar, FiCircle } from 'react-icons/fi'

export function ProfileInfoCard({ user, restaurante }) {
  return (
    <div className="divide-y divide-gray-100 dark:divide-gray-800">
      <section className="flex items-start gap-3 px-4 py-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
          <FiHomeIcon className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Restaurante</h3>
          {restaurante ? (
            <>
              <p className="truncate text-sm text-gray-600 dark:text-gray-300">{restaurante.nombre}</p>
              <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <FiMapPin className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{restaurante.ubicacion}</span>
              </p>
            </>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">No tienes restaurante registrado.</p>
          )}
        </div>
      </section>

      <section className="flex items-start gap-3 px-4 py-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-info-50 text-info-600 dark:bg-info-500/10 dark:text-info-400">
          <FiUser className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Cuenta</h3>
          <p className="truncate text-sm text-gray-600 dark:text-gray-300">{user.email}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">@{user.usuario}</p>
        </div>
      </section>

      <section className="flex items-start gap-3 px-4 py-3">
        <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${user.plan === 'pro' ? 'bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400' : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500'}`}>
          {user.plan === 'pro' ? <FiStar className="h-4 w-4" /> : <FiCircle className="h-4 w-4" />}
        </span>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Plan</h3>
          <p className="text-sm font-medium text-success-600 dark:text-success-400">
            {user.plan === 'pro' ? 'Plan Pro' : 'Plan Gratis'}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {user.plan === 'pro' ? 'Todas las funciones desbloqueadas.' : 'Mejora para acceder a más funciones.'}
          </p>
        </div>
      </section>
    </div>
  )
}