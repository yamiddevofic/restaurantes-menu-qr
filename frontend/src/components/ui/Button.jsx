const base =
  'flex min-h-11 items-center justify-center gap-2 rounded-full font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-disabled'

const variants = {
  primary:
    'bg-brand-600 text-white shadow-lg shadow-brand-600/20 hover:bg-brand-700 hover:shadow-brand-600/30',
  outline:
    'border border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800',
  success:
    'border border-success-200 bg-success-50 text-success-700 hover:bg-success-100 dark:border-success-500/30 dark:bg-success-500/10 dark:text-success-400 dark:hover:bg-success-500/20',
  ghost: 'text-gray-600 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200',
}

const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-2.5 text-sm',
  lg: 'px-6 py-3.5 text-sm sm:text-base',
}

export function Button({ variant = 'primary', size = 'md', className = '', ...props }) {
  return <button type="button" className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props} />
}

// Enlaces con apariencia de botón (WhatsApp, CTA con href)
export function ButtonLink({ variant = 'primary', size = 'md', className = '', ...rest }) {
  return <a className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...rest} />
}

const iconTones = {
  default: 'hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200',
  brand: 'hover:bg-brand-100 hover:text-brand-700 dark:hover:bg-brand-500/20 dark:hover:text-brand-400',
  danger: 'hover:bg-error-50 hover:text-error-600 dark:hover:bg-error-500/15 dark:hover:text-error-400',
}

export function IconButton({ label, title, tone = 'default', className = '', ...rest }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={title || label}
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-gray-500 transition-colors dark:text-gray-400 ${iconTones[tone]} ${className}`}
      {...rest}
    />
  )
}