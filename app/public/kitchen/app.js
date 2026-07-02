(function () {
  const els = {
    loginScreen: document.getElementById('loginScreen'),
    loginForm: document.getElementById('loginForm'),
    username: document.getElementById('username'),
    password: document.getElementById('password'),
    loginError: document.getElementById('loginError'),
    dashboard: document.getElementById('dashboard'),
    restaurantTitle: document.getElementById('restaurantTitle'),
    connStatus: document.getElementById('connStatus'),
    logoutBtn: document.getElementById('logoutBtn'),
    colPending: document.getElementById('colPending'),
    colPreparing: document.getElementById('colPreparing'),
    colReady: document.getElementById('colReady'),
    countPending: document.getElementById('countPending'),
    countPreparing: document.getElementById('countPreparing'),
    countReady: document.getElementById('countReady'),
    notifSound: document.getElementById('notifSound'),
  };

  let orders = [];
  let socket = null;
  let pollTimer = null;

  els.loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    els.loginError.style.display = 'none';
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: els.username.value, password: els.password.value }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo iniciar sesion');
      if (!['admin', 'cocina'].includes(data.user.role)) throw new Error('Este usuario no tiene acceso a cocina');

      els.restaurantTitle.textContent = `Cocina · ${data.user.restaurant_name}`;
      startDashboard();
    } catch (err) {
      els.loginError.textContent = err.message;
      els.loginError.style.display = 'block';
    }
  });

  els.logoutBtn.addEventListener('click', async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    if (socket) socket.disconnect();
    if (pollTimer) clearInterval(pollTimer);
    els.dashboard.style.display = 'none';
    els.loginScreen.style.display = 'flex';
  });

  async function checkSession() {
    try {
      const res = await fetch('/api/auth/me');
      if (!res.ok) return;
      const data = await res.json();
      if (['admin', 'cocina'].includes(data.role)) {
        els.restaurantTitle.textContent = `Cocina · ${data.restaurant.name}`;
        startDashboard();
      }
    } catch (e) { /* no session, show login */ }
  }

  function startDashboard() {
    els.loginScreen.style.display = 'none';
    els.dashboard.style.display = 'block';
    fetchOrders();
    connectSocket();
    // Respaldo por si el socket se cae: refresca cada 20s
    pollTimer = setInterval(fetchOrders, 20000);
  }

  function connectSocket() {
    socket = io({ transports: ['websocket', 'polling'] });
    socket.on('connect', () => {
      socket.emit('join_kitchen');
      setConn(true);
    });
    socket.on('disconnect', () => setConn(false));
    socket.on('joined_kitchen', (res) => {
      if (!res.ok) setConn(false);
    });
    socket.on('new_order', (order) => {
      playSound();
      upsertOrder(order);
      render();
    });
    socket.on('order_updated', (order) => {
      upsertOrder(order);
      render();
    });
  }

  function setConn(online) {
    els.connStatus.textContent = online ? '● en linea' : '● desconectado';
    els.connStatus.className = `conn-status ${online ? 'online' : 'offline'}`;
  }

  function upsertOrder(order) {
    const idx = orders.findIndex((o) => o.id === order.id);
    if (idx >= 0) orders[idx] = order;
    else orders.unshift(order);
  }

  async function fetchOrders() {
    try {
      const res = await fetch('/api/kitchen/orders?status=pending,preparing,ready');
      if (res.status === 401) {
        els.dashboard.style.display = 'none';
        els.loginScreen.style.display = 'flex';
        return;
      }
      const data = await res.json();
      orders = data.orders || [];
      render();
    } catch (e) { /* red intermitente: se reintenta en el proximo poll */ }
  }

  function playSound() {
    try { els.notifSound.play().catch(() => {}); } catch (e) {}
  }

  function timeAgo(dateStr) {
    const diffMs = Date.now() - new Date(dateStr.replace(' ', 'T') + 'Z').getTime();
    const mins = Math.max(0, Math.round(diffMs / 60000));
    if (mins < 1) return 'ahora';
    if (mins === 1) return 'hace 1 min';
    return `hace ${mins} min`;
  }

  function render() {
    const pending = orders.filter((o) => o.status === 'pending');
    const preparing = orders.filter((o) => o.status === 'preparing');
    const ready = orders.filter((o) => o.status === 'ready');

    els.countPending.textContent = pending.length;
    els.countPreparing.textContent = preparing.length;
    els.countReady.textContent = ready.length;

    renderColumn(els.colPending, pending, 'pending');
    renderColumn(els.colPreparing, preparing, 'preparing');
    renderColumn(els.colReady, ready, 'ready');
  }

  function renderColumn(container, list, status) {
    container.innerHTML = '';
    if (list.length === 0) {
      container.innerHTML = '<div class="empty-col">Sin pedidos</div>';
      return;
    }
    list.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    list.forEach((order) => container.appendChild(renderCard(order)));
  }

  function renderCard(order) {
    const card = document.createElement('div');
    card.className = `order-card ${order.status}`;

    const itemsHtml = order.items.map((it) => `
      <li><span class="qty">${it.quantity}x</span>${escapeHtml(it.name)}${it.item_note ? ` <em>(${escapeHtml(it.item_note)})</em>` : ''}</li>
    `).join('');

    card.innerHTML = `
      <div class="order-card-header">
        <span class="order-table">Mesa ${escapeHtml(order.table_number)}</span>
        <span class="order-time">${timeAgo(order.created_at)}</span>
      </div>
      <div class="order-code">#${escapeHtml(order.order_code)}</div>
      <ul class="order-items">${itemsHtml}</ul>
      ${order.customer_note ? `<div class="order-note">Nota: ${escapeHtml(order.customer_note)}</div>` : ''}
      <div class="order-actions"></div>
    `;

    const actions = card.querySelector('.order-actions');
    if (order.status === 'pending') {
      actions.appendChild(makeBtn('Empezar', 'btn-advance', () => updateStatus(order.id, 'preparing')));
      actions.appendChild(makeBtn('Cancelar', 'btn-cancel', () => updateStatus(order.id, 'cancelled')));
    } else if (order.status === 'preparing') {
      actions.appendChild(makeBtn('Listo', 'btn-advance to-ready', () => updateStatus(order.id, 'ready')));
      actions.appendChild(makeBtn('Cancelar', 'btn-cancel', () => updateStatus(order.id, 'cancelled')));
    } else if (order.status === 'ready') {
      actions.appendChild(makeBtn('Entregado', 'btn-advance to-delivered', () => updateStatus(order.id, 'delivered')));
    }

    return card;
  }

  function makeBtn(label, cls, onClick) {
    const btn = document.createElement('button');
    btn.textContent = label;
    btn.className = cls;
    btn.addEventListener('click', onClick);
    return btn;
  }

  async function updateStatus(orderId, status) {
    try {
      const res = await fetch(`/api/kitchen/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo actualizar');
      upsertOrder(data.order);
      // El pedido ya no aparece en pending/preparing/ready si fue entregado o cancelado
      if (['delivered', 'cancelled'].includes(status)) {
        orders = orders.filter((o) => o.id !== orderId);
      }
      render();
    } catch (err) {
      alert(err.message);
    }
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str == null ? '' : String(str);
    return div.innerHTML;
  }

  checkSession();
})();
