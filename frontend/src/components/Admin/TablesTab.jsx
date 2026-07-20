import { useState, useEffect } from 'react';
import { api } from '../../api';
import ConfirmDialog from '../ConfirmDialog';

export default function TablesTab() {
  const [tables, setTables] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [tableNumber, setTableNumber] = useState('');
  const [alertMsg, setAlertMsg] = useState('');
  const [confirm, setConfirm] = useState({ open: false, title: '', message: '', onConfirm: null });

  const loadTables = async () => {
    try {
      const data = await api.get('/admin/tables');
      setTables(data.tables || []);
    } catch (err) {
      setAlertMsg(err.message);
    }
  };

  useEffect(() => {
    let cancelled = false;
    api.get('/admin/tables').then((data) => {
      if (cancelled) return;
      setTables(data.tables || []);
    }).catch((err) => {
      if (cancelled) return;
      setAlertMsg(err.message);
    });
    return () => { cancelled = true; };
  }, []);

  const handleAddTable = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/tables', { table_number: tableNumber });
      setTableNumber('');
      setShowForm(false);
      loadTables();
    } catch (err) {
      setAlertMsg(err.message);
    }
  };

  const handleDeleteTable = (id) => {
    setConfirm({
      open: true,
      title: 'Eliminar mesa',
      message: '¿Eliminar esta mesa?',
      onConfirm: async () => {
        try {
          await api.delete(`/admin/tables/${id}`);
          loadTables();
        } catch (err) {
          setAlertMsg(err.message);
        }
        setConfirm({ open: false, title: '', message: '', onConfirm: null });
      },
    });
  };

  const handleRegenerateQR = (id) => {
    setConfirm({
      open: true,
      title: 'Regenerar codigo QR',
      message: '¿Regenerar codigo QR de esta mesa?',
      onConfirm: async () => {
        try {
          await api.post(`/admin/tables/${id}/regenerate-qr`);
          loadTables();
        } catch (err) {
          setAlertMsg(err.message);
        }
        setConfirm({ open: false, title: '', message: '', onConfirm: null });
      },
    });
  };

  return (
    <section className="tab-panel">
      <div className="add-toggle" onClick={() => setShowForm(!showForm)}>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5l0 14" />
          <path d="M5 12l14 0" />
        </svg>
        Agregar mesa
      </div>

      {showForm && (
        <form className="inline-form" onSubmit={handleAddTable}>
          <input
            type="text"
            placeholder="Numero o nombre de mesa (ej. 5)"
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
            required
            maxLength={20}
          />
          <button type="submit">Crear mesa</button>
        </form>
      )}

      {alertMsg && (
        <div className="error" style={{ textAlign: 'center', marginBottom: 12 }}>
          {alertMsg}
          <button onClick={() => setAlertMsg('')} style={{ marginLeft: 8, background: 'none', border: 'none', color: '#c92a2a', cursor: 'pointer' }}>✕</button>
        </div>
      )}

      <div className="tables-grid">
        {tables.map((table) => (
          <div key={table.id} className="table-card">
            <div className="table-header">
              <h3>Mesa {table.table_number}</h3>
              <div className="table-actions">
                <button className="btn-secondary" onClick={() => handleRegenerateQR(table.id)}>
                  Regenerar QR
                </button>
                <button className="btn-delete" onClick={() => handleDeleteTable(table.id)}>
                  ✕
                </button>
              </div>
            </div>
            <div className="qr-section">
              <p className="qr-url">{table.menu_url}</p>
            </div>
          </div>
        ))}

        {tables.length === 0 && (
          <p className="state-msg">No hay mesas. Agrega una para comenzar.</p>
        )}
      </div>

      <ConfirmDialog
        open={confirm.open}
        title={confirm.title}
        message={confirm.message}
        onConfirm={confirm.onConfirm}
        onCancel={() => setConfirm({ open: false, title: '', message: '', onConfirm: null })}
      />
    </section>
  );
}
