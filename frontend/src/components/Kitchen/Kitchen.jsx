import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { api } from '../../api';
import Login from './Login';
import '../../kitchen.css';

export default function Kitchen() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api.get('/auth/me').then((data) => {
      if (cancelled) return;
      if (['admin', 'cocina'].includes(data.role)) {
        setUser({ ...data, restaurant_name: data.restaurant.name });
      }
    }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!user) return;

    const newSocket = io(import.meta.env.VITE_API_BASE || 'http://localhost:3000', {
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      newSocket.emit('join_kitchen');
      setConnected(true);
    });

    newSocket.on('disconnect', () => setConnected(false));

    newSocket.on('joined_kitchen', (res) => {
      if (!res.ok) setConnected(false);
    });

    newSocket.on('new_order', (order) => {
      const audio = new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=');
      audio.play().catch(() => {});
      setOrders((prev) => {
        const existing = prev.find((o) => o.id === order.id);
        if (existing) return prev;
        return [...prev, order];
      });
    });

    newSocket.on('order_updated', (order) => {
      setOrders((prev) => prev.map((o) => (o.id === order.id ? order : o)));
    });

    socketRef.current = newSocket;

    const pollTimer = setInterval(() => {
      api.get('/kitchen/orders').then(setOrders).catch((err) => console.error('Error fetching orders:', err));
    }, 20000);

    return () => {
      newSocket.disconnect();
      clearInterval(pollTimer);
    };
  }, [user]);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    await api.post('/auth/logout', {});
    if (socketRef.current) socketRef.current.disconnect();
    setUser(null);
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      await api.put(`/kitchen/orders/${orderId}`, { status });
    } catch (err) {
      console.error(err.message);
    }
  };

  if (!user) {
    return (
      <div className="kitchen-page">
        <Login onLogin={handleLogin} />
      </div>
    );
  }

  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const preparingOrders = orders.filter((o) => o.status === 'preparing');
  const readyOrders = orders.filter((o) => o.status === 'ready');

  return (
    <div className="kitchen-page">
      <div className="dashboard">
        <header className="dash-header">
          <h1>Cocina · {user.restaurant_name}</h1>
          <div className="header-right">
            <span className={`conn-status ${connected ? 'online' : 'offline'}`}>
              {connected ? '● en linea' : '● desconectado'}
            </span>
            <button className="btn-ghost" onClick={handleLogout}>
              Salir
            </button>
          </div>
        </header>

        <div className="columns">
          <section className="column">
            <h2>Pendientes <span className="count">{pendingOrders.length}</span></h2>
            <div className="cards">
              {pendingOrders.length === 0 && <p className="empty-col">No hay pedidos pendientes</p>}
              {pendingOrders.map((order) => (
                <OrderCard key={order.id} order={order} onUpdateStatus={updateOrderStatus} />
              ))}
            </div>
          </section>

          <section className="column">
            <h2>Preparando <span className="count">{preparingOrders.length}</span></h2>
            <div className="cards">
              {preparingOrders.length === 0 && <p className="empty-col">No hay pedidos en preparacion</p>}
              {preparingOrders.map((order) => (
                <OrderCard key={order.id} order={order} onUpdateStatus={updateOrderStatus} />
              ))}
            </div>
          </section>

          <section className="column">
            <h2>Listos <span className="count">{readyOrders.length}</span></h2>
            <div className="cards">
              {readyOrders.length === 0 && <p className="empty-col">No hay pedidos listos</p>}
              {readyOrders.map((order) => (
                <OrderCard key={order.id} order={order} onUpdateStatus={updateOrderStatus} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function OrderCard({ order, onUpdateStatus }) {
  return (
    <div className="order-card">
      <div className="order-header">
        <span className="order-code">{order.code}</span>
        <span className="order-table">Mesa {order.table_number}</span>
        <span className="order-time">
          {new Date(order.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      <div className="order-items">
        {order.items.map((item, idx) => (
          <div key={idx} className="order-item">
            <span className="item-qty">{item.qty}x</span>
            <span className="item-name">{item.name}</span>
          </div>
        ))}
      </div>
      {order.note && <p className="order-note">Nota: {order.note}</p>}
      <div className="order-actions">
        {order.status === 'pending' && (
          <button className="btn-primary" onClick={() => onUpdateStatus(order.id, 'preparing')}>
            Comenzar preparacion
          </button>
        )}
        {order.status === 'preparing' && (
          <button className="btn-success" onClick={() => onUpdateStatus(order.id, 'ready')}>
            Marcar como listo
          </button>
        )}
      </div>
    </div>
  );
}
