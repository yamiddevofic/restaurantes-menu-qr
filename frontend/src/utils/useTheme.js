import { useEffect, useState } from 'react'

const STORAGE_KEY = 'qrta-theme'

function getInitialTheme() {
  if (typeof window === 'undefined') return false
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'dark') return true
    if (stored === 'light') return false
  } catch {
    /* localStorage no disponible */
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
}

export function useTheme() {
  const [dark, setDark] = useState(getInitialTheme)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    try {
      localStorage.setItem(STORAGE_KEY, dark ? 'dark' : 'light')
    } catch {
      /* localStorage no disponible */
    }
  }, [dark])

  const toggle = () => setDark((d) => !d)

  return { dark, toggle }
}