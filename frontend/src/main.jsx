/* eslint-disable react-refresh/only-export-components */
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Registro from './pages/Registro.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Mesas from './pages/Mesas.jsx'
import Platos from './pages/Platos.jsx'
import Perfil from './pages/Perfil.jsx'
import Suscripcion from './pages/Suscripcion.jsx'
import Modulo from './pages/Modulo.jsx'
import Privacidad from './pages/Privacidad.jsx'
import Terminos from './pages/Terminos.jsx'
import { AuthProvider } from './auth.jsx'
import ScrollToTop from './components/ScrollToTop.jsx'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router'

function ProtectedRoute() {
  return <Dashboard />
}

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <ScrollToTop />
    <AuthProvider>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<ProtectedRoute />} />
        <Route path="/dashboard/mesas" element={<Mesas />} />
        <Route path="/dashboard/platos" element={<Platos />} />
        <Route path="/dashboard/perfil" element={<Perfil />} />
        <Route path="/dashboard/suscripcion" element={<Suscripcion />} />
        <Route path="/dashboard/:modulo" element={<Modulo />} />
        <Route path="/privacidad" element={<Privacidad />} />
        <Route path="/terminos" element={<Terminos />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  </BrowserRouter>
)