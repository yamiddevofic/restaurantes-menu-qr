import { createContext, useContext, useEffect, useState, useCallback } from 'react'

const API_PORT = 3000

export const API_URL = `${window.location.protocol}//${window.location.hostname}:${API_PORT}/api`

const TOKEN_KEY = 'qrta_token'
const USER_KEY = 'qrta_user'
const RESTAURANTE_KEY = 'qrta_restaurante'
const RESTAURANTES_KEY = 'qrta_restaurantes'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY))
    } catch {
      return null
    }
  })
  const [restaurantes, setRestaurantes] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(RESTAURANTES_KEY))
    } catch {
      return []
    }
  })
  const [restaurante, setRestaurante] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(RESTAURANTE_KEY))
    } catch {
      return null
    }
  })
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [loading, setLoading] = useState(true)

  const saveSession = useCallback(({ token: t, user: u, restaurante: r, restaurantes: rs }) => {
    if (t !== undefined) localStorage.setItem(TOKEN_KEY, t)
    if (u !== undefined) localStorage.setItem(USER_KEY, JSON.stringify(u))
    if (r !== undefined) localStorage.setItem(RESTAURANTE_KEY, JSON.stringify(r))
    if (rs !== undefined) localStorage.setItem(RESTAURANTES_KEY, JSON.stringify(rs))
    if (u) {
      if (u.avatar) {
        try { localStorage.setItem('qrta_avatar', u.avatar) } catch { /* sin espacio */ }
      }
    }
    if (t !== undefined) setToken(t)
    if (u !== undefined) setUser(u)
    if (r !== undefined) setRestaurante(r)
    if (rs !== undefined) setRestaurantes(rs)
    else if (r !== undefined) setRestaurantes([r])
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    localStorage.removeItem(RESTAURANTE_KEY)
    localStorage.removeItem(RESTAURANTES_KEY)
    localStorage.removeItem('qrta_avatar')
    setToken(null)
    setUser(null)
    setRestaurante(null)
    setRestaurantes([])
  }, [])

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY)

    const restore = storedToken
      ? fetch(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${storedToken}` },
        })
          .then((res) => {
            if (!res.ok) throw new Error('Sesión inválida')
            return res.json()
          })
          .then((data) => saveSession({ token: storedToken, user: data.user, restaurante: data.restaurante, restaurantes: data.restaurantes }))
          .catch(() => logout())
      : Promise.resolve()

    restore.finally(() => setLoading(false))
  }, [saveSession, logout])

  return (
    <AuthContext.Provider value={{ user, restaurante, restaurantes, token, loading, saveSession, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
