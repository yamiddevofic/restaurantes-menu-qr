import { useEffect, useState } from 'react'
import { FiUser } from 'react-icons/fi'
import { API_URL } from '../auth'

const AVATAR_KEY = 'qrta_avatar'
const AVATAR_EVENT = 'qrta-avatar-changed'

const API_ORIGIN = API_URL.replace(/\/api$/, '')

export function normalizeAvatar(src) {
  if (!src) return null
  if (src.startsWith('data:') || src.startsWith('http')) return src
  return `${API_ORIGIN}${src}`
}

export function getAvatarSrc() {
  try {
    return localStorage.getItem(AVATAR_KEY)
  } catch {
    return null
  }
}

export function notifyAvatarChanged() {
  window.dispatchEvent(new Event(AVATAR_EVENT))
}

export function Avatar({ user, size = 'h-10 w-10', className = '', textClass = '' }) {
  const [stored, setStored] = useState(getAvatarSrc)

  useEffect(() => {
    const sync = () => setStored(getAvatarSrc())
    window.addEventListener(AVATAR_EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(AVATAR_EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  const src = normalizeAvatar(user?.avatar) || normalizeAvatar(stored)

  return (
    <div
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-100 font-bold text-brand-700 dark:bg-brand-500/20 dark:text-brand-400 ${size} ${className}`}
    >
      {src ? (
        <img src={src} alt="" className="h-full w-full object-cover" />
      ) : user?.nombre ? (
        <span className={textClass}>
          {user.nombre.charAt(0).toUpperCase()}
        </span>
      ) : (
        <FiUser className="h-1/2 w-1/2" />
      )}
    </div>
  )
}