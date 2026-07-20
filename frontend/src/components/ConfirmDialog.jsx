import { useEffect, useRef } from 'react';

export default function ConfirmDialog({ open, title, message, onConfirm, onCancel }) {
  const confirmRef = useRef(null);

  useEffect(() => {
    if (open && confirmRef.current) {
      confirmRef.current.focus();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onClick={onCancel}>
      <div style={{
        background: '#2d2d2d', borderRadius: 14, padding: 24, width: 320,
        border: '1px solid #404040',
        display: 'flex', flexDirection: 'column', gap: 16,
      }} onClick={(e) => e.stopPropagation()}>
        {title && <h3 style={{ margin: 0, color: 'white', fontSize: '1.1rem' }}>{title}</h3>}
        <p style={{ margin: 0, color: '#c0c0c0', fontSize: '0.9rem' }}>{message}</p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onCancel}
            style={{
              padding: '8px 16px', border: '1px solid #404040', borderRadius: 8,
              background: 'transparent', color: 'white', cursor: 'pointer',
            }}>
            Cancelar
          </button>
          <button ref={confirmRef} onClick={onConfirm}
            style={{
              padding: '8px 16px', border: 'none', borderRadius: 8,
              background: '#c92a2a', color: 'white', cursor: 'pointer', fontWeight: 600,
            }}>
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
