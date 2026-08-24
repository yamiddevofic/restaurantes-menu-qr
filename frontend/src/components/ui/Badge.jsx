const tones = {
  brand: 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-400',
  success: 'bg-success-100 text-success-700 dark:bg-success-500/15 dark:text-success-400',
  warning: 'bg-warning-100 text-warning-700 dark:bg-warning-500/15 dark:text-warning-400',
  info: 'bg-info-50 text-info-600 dark:bg-info-500/15 dark:text-info-400',
  neutral: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
}

export function Badge({ tone = 'neutral', className = '', children }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  )
}