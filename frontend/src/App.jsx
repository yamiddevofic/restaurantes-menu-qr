import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';

const Admin = lazy(() => import('./components/Admin/Admin'));
const Kitchen = lazy(() => import('./components/Kitchen/Kitchen'));
const Menu = lazy(() => import('./components/Menu/Menu'));

function Loading() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#1a1a1a', color: '#c0c0c0', fontFamily: 'system-ui, sans-serif',
    }}>
      Cargando...
    </div>
  );
}

export default function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ErrorBoundary>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/admin" element={<Admin />} />
            <Route path="/kitchen" element={<Kitchen />} />
            <Route path="/menu/:slug/:tableToken" element={<Menu />} />
            <Route path="/" element={<Navigate to="/admin" replace />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </Router>
  );
}
