import { createContext, useContext, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { FiMenu, FiX } from 'react-icons/fi'
import { Avatar } from './Avatar'

const DrawerContext = createContext(null)

export function SideDrawer({ children, user }) {
  const [open, setOpen] = useState(false)

  const close = () => setOpen(false)

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Abrir menú"
        title="Abrir menú"
        className="flex min-h-11 min-w-11 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
      >
        <FiMenu className="h-5 w-5" />
      </button>

      {createPortal(
        <>
          {open && (
            <div
              aria-hidden="true"
              onClick={close}
              className="fixed inset-0 z-50 bg-gray-950/50"
            />
          )}
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Menú"
            className={`fixed inset-y-0 right-0 z-50 flex w-72 max-w-[85vw] flex-col bg-white shadow-2xl transition-transform duration-300 ease-out dark:bg-gray-900 ${
              open ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-2 py-2 dark:border-gray-800">
              {user ? (
                <div
                  title="Ver mi perfil"
                  className="flex min-w-0 flex-1 items-center gap-3 rounded-lg px-2 py-1.5 text-left"
                >
                  <Avatar user={user} size="h-10 w-10" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">{user.nombre}</p>
                    <p className="truncate text-xs text-gray-500 dark:text-gray-400">@{user.usuario}</p>
                  </div>
                </div>
              ) : (
                <span className="px-2 text-sm font-semibold text-gray-900 dark:text-gray-100">Menú</span>
              )}
<button
            type="button"
            onClick={close}
            aria-label="Cerrar menú"
            title="Cerrar menú"
            className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            <FiX className="h-5 w-5" />
          </button>
          </div>
            <DrawerContext.Provider value={close}>{children}</DrawerContext.Provider>
          </div>
        </>,
        document.body,
      )}
    </>
  )
}

export function DrawerItem({ icon: Icon, label, onClick }) {
  const close = useContext(DrawerContext)

  return (
    <button
      type="button"
      onClick={() => {
        close?.()
        onClick?.()
      }}
      className="flex min-h-12 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800"
    >
      <Icon className="h-5 w-5" />
      {label}
    </button>
  )
}