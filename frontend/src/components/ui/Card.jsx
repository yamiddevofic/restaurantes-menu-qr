const elevaciones = {
  sm: 'shadow-card',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
}

export function Card({ elevation = 'sm', hover = false, as: Tag = 'div', className = '', ...rest }) {
  const cls = [
    'rounded-2xl bg-white p-5 ring-1 ring-gray-100 transition-all duration-200 dark:bg-gray-900 dark:ring-gray-800',
    elevaciones[elevation],
    hover ? 'hover:-translate-y-1 hover:shadow-card-hover hover:shadow-brand-100/50 dark:hover:ring-brand-500/25' : '',
    className,
  ].join(' ')
  return <Tag className={cls} {...rest} />
}