import { FiX } from 'react-icons/fi'
import { IconButton } from './ui/Button'

function Modal({ title, onClose, children }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white p-6 shadow-2xl dark:bg-gray-900 sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">{title}</h2>
          <IconButton label="Cerrar" title="Cerrar ventana sin guardar" onClick={onClose}>
            <FiX className="h-5 w-5" />
          </IconButton>
        </div>
        {children}
      </div>
    </div>
  )
}

export default Modal