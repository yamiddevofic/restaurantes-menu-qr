import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { FiMenu, FiX } from 'react-icons/fi'

export function HeaderMenu({ children, className = '' }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
        title={open ? 'Cerrar menú' : 'Abrir menú'}
        aria-expanded={open}
        className={`flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 ${className}`}
      >
        {open ? <FiX className="h-5 w-5" /> : <FiMenu className="h-5 w-5" />}
      </button>
      {open &&
        createPortal(
          <>
            <div aria-hidden="true" className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <div
              onClickCapture={() => setOpen(false)}
              className="fixed right-3 top-16 z-50 w-64 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900 sm:top-[4.5rem]"
            >
              {children}
            </div>
          </>,
document.body,
    )}
    </>
  )
}