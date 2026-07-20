import { useState, useEffect } from 'react';
import { api } from '../../api';
import Login from './Login';
import DishesTab from './DishesTab';
import TablesTab from './TablesTab';
import '../../admin.css';

export default function Admin() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('platos');

  useEffect(() => {
    let cancelled = false;
    api.get('/auth/me').then((data) => {
      if (cancelled) return;
      if (data.role === 'admin') {
        setUser({ ...data, restaurant_name: data.restaurant.name });
      }
    }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  if (!user) {
    return (
      <div className="admin-page">
        <Login onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="dashboard">
        <header className="dash-header">
          <div className="header-left">
            <div className="menu-group">
              <button className="hamburger" aria-label="Menu" title="Menu">
                <span></span>
                <span></span>
                <span></span>
              </button>
            </div>
            <div className="icon-container">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12l-2 0l9 -9l9 9l-2 0" />
                <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7" />
                <path d="M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v6" />
              </svg>
            </div>
          </div>
          <div className="header-right">
            <h1 className="title">Administracion · {user.restaurant_name}</h1>
          </div>
        </header>

        <nav className="tabs">
          <button className={`tab-btn ${activeTab === 'platos' ? 'active' : ''}`} onClick={() => setActiveTab('platos')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 11h16a1 1 0 0 1 1 1v.5c0 1.5 -2.517 5.573 -4 6.5v1a1 1 0 0 1 -1 1h-8a1 1 0 0 1 -1 -1v-1c-1.687 -1.054 -4 -5 -4 -6.5v-.5a1 1 0 0 1 1 -1" />
                <path d="M19 7l-14 1" />
                <path d="M19 2l-14 3" />
              </svg>
              <p>Platos</p>
            </div>
          </button>
          <button className={`tab-btn ${activeTab === 'tables' ? 'active' : ''}`} onClick={() => setActiveTab('tables')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg xmlns="http://www.w3.org/2000/svg" height="28px" viewBox="0 -960 960 960" width="28px" fill="#fff"><path d="M160-160q-33 0-56.5-23.5T80-240v-440h80v440h280v80H160Zm120-560q-33 0-56.5-23.5T200-800q0-33 23.5-56.5T280-880q33 0 56.5 23.5T360-800q0 33-23.5 56.5T280-720ZM480-80v-200H280q-33 0-56.5-23.5T200-360v-236q0-35 24-59.5t58-24.5q19 0 35.5 8t28.5 22q45 49 96.5 89.5T560-520h54q-25-17-39.5-42.5T560-620h241q0 32-14.5 57.5T747-520h133v80H720v360h-80v-360h-80q-53 0-107-23t-93-55v138h120q33 0 56.5 23.5T560-300v220h-80Z"/></svg>
              <p>Mesas y codigos QR</p>
            </div>
          </button>
        </nav>

        <div className="section-header">
          <h2 className="section-title">{activeTab === 'platos' ? 'Platos' : 'Mesas y codigos QR'}</h2>
          <p className="section-desc">
            {activeTab === 'platos' ? 'Gestiona categorias y los platos de cada una' : 'Gestiona las mesas y genera codigos QR'}
          </p>
        </div>

        {activeTab === 'platos' ? <DishesTab /> : <TablesTab />}
      </div>
    </div>
  );
}
