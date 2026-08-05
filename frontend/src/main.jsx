/* eslint-disable react-refresh/only-export-components */
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Registro from './pages/Registro.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Platos from './pages/Platos.jsx'
import { AuthProvider } from './auth.jsx'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router'

function ProtectedRoute() {
  return <Dashboard />
}

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthProvider>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<ProtectedRoute />} />
        <Route path="/dashboard/platos" element={<Platos />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  </BrowserRouter>
)