(function () {
  const pathParts = window.location.pathname.split('/').filter(Boolean); // ["menu", slug, tableToken]
  const slug = pathParts[1];
  const tableToken = pathParts[2];

  if (!slug || !tableToken) {
    showError('Este enlace no es valido. Escanea el codigo QR de tu mesa nuevamente.');
    return;
  }

  const API_BASE = `/api/public`;
  let currency = 'COP';
  let cart = {}; // menu_item_id -> { item, qty }
  let itemsById = {};

  const els = {
    loading: document.getElementById('loading'),
    errorBox: document.getElementById('errorBox'),
    menuContent: document.getElementById('menuContent'),
    restaurantName: document.getElementById('restaurantName'),
    tableLabel: document.getElementById('tableLabel'),
    categoryTabs: document.getElementById('categoryTabs'),
    itemsList: document.getElementById('itemsList'),
    cartButton: document.getElementById('cartButton'),
    cartCount: document.getElementById('cartCount'),
    cartTotal: document.getElementById('cartTotal'),
    cartOverlay: document.getElementById('cartOverlay'),
    closeCart: document.getElementById('closeCart'),
    cartItems: document.getElementById('cartItems'),
    cartFooterTotal: document.getElementById('cartFooterTotal'),
    submitOrder: document.getElementById('submitOrder'),
    submitError: document.getElementById('submitError'),
    customerNote: document.getElementById('customerNote'),
    successOverlay: document.getElementById('successOverlay'),
    orderCode: document.getElementById('orderCode'),
    orderStatus: document.getElementById('orderStatus'),
    newOrderBtn: document.getElementById('newOrderBtn'),
  };

  function money(n) {
    try {
      return new Intl.NumberFormat('es-CO', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n);
    } catch (e) {
      return `$${n}`;
    }
  }

  function showError(msg) {
    els.loading.style.display = 'none';
    els.errorBox.style.display = 'block';
    els.errorBox.textContent = msg;
  }

  async function loadMenu() {
    try {
      const res = await fetch(`${API_BASE}/menu/${encodeURIComponent(slug)}/${encodeURIComponent(tableToken)}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'No se pudo cargar el menu');
      }
      const data = await res.json();
      currency = data.restaurant.currency || 'COP';
      els.restaurantName.textContent = data.restaurant.name;
      els.tableLabel.textContent = `Mesa ${data.table.number}`;
      renderMenu(data.categories, data.items);
      els.loading.style.display = 'none';
      els.menuContent.style.display = 'block';
    } catch (err) {
      showError(err.message || 'No se pudo cargar el menu. Verifica tu conexion.');
    }
  }

  function renderMenu(categories, items) {
    itemsById = {};
    items.forEach((i) => (itemsById[i.id] = i));

    const itemsByCategory = {};
    items.forEach((i) => {
      const key = i.category_id || 'sin-categoria';
      (itemsByCategory[key] = itemsByCategory[key] || []).push(i);
    });

    const visibleCategories = categories.filter((c) => itemsByCategory[c.id] && itemsByCategory[c.id].length);
    if (itemsByCategory['sin-categoria']) {
      visibleCategories.push({ id: 'sin-categoria', name: 'Otros' });
    }

    els.categoryTabs.innerHTML = '';
    els.itemsList.innerHTML = '';

    if (visibleCategories.length === 0) {
      els.itemsList.innerHTML = '<p class="state-msg">Este restaurante aun no tiene platos disponibles.</p>';
      return;
    }

    visibleCategories.forEach((cat, idx) => {
      const tab = document.createElement('button');
      tab.textContent = cat.name;
      tab.className = idx === 0 ? 'active' : '';
      tab.addEventListener('click', () => {
        document.getElementById(`cat-${cat.id}`).scrollIntoView({ behavior: 'smooth', block: 'start' });
        [...els.categoryTabs.children].forEach((b) => b.classList.remove('active'));
        tab.classList.add('active');
      });
      els.categoryTabs.appendChild(tab);

      const section = document.createElement('section');
      section.id = `cat-${cat.id}`;
      const heading = document.createElement('h2');
      heading.className = 'category-title';
      heading.textContent = cat.name;
      section.appendChild(heading);

      itemsByCategory[cat.id].forEach((item) => {
        section.appendChild(renderItemCard(item));
      });

      els.itemsList.appendChild(section);
    });
  }

  function renderItemCard(item) {
    const card = document.createElement('div');
    card.className = 'item-card';
    
    const imageHtml = item.image_url 
      ? `<div class="item-image"><img src="${escapeAttr(item.image_url)}" alt="${escapeHtml(item.name)}" onerror="this.parentElement.style.display='none'"></div>` 
      : '<div class="item-image no-image"><span>Sin imagen</span></div>';
    
    card.innerHTML = `
      ${imageHtml}
      <div class="item-content">
        <div class="item-info">
          <h3>${escapeHtml(item.name)}</h3>
          ${item.description ? `<p>${escapeHtml(item.description)}</p>` : ''}
          <div class="item-price">${money(item.price)}</div>
        </div>
        <div class="item-controls">
          <button class="qty-btn minus">−</button>
          <span class="qty-value">0</span>
          <button class="qty-btn add">+</button>
        </div>
      </div>
    `;
    const qtyEl = card.querySelector('.qty-value');
    const minusBtn = card.querySelector('.minus');
    const addBtn = card.querySelector('.add');

    function refresh() {
      const qty = cart[item.id] ? cart[item.id].qty : 0;
      qtyEl.textContent = qty;
    }
    refresh();

    addBtn.addEventListener('click', () => {
      cart[item.id] = cart[item.id] || { item, qty: 0 };
      cart[item.id].qty += 1;
      refresh();
      updateCartUI();
    });
    minusBtn.addEventListener('click', () => {
      if (!cart[item.id]) return;
      cart[item.id].qty -= 1;
      if (cart[item.id].qty <= 0) delete cart[item.id];
      refresh();
      updateCartUI();
    });

    return card;
  }

  function cartCount() {
    return Object.values(cart).reduce((sum, c) => sum + c.qty, 0);
  }
  function cartTotal() {
    return Object.values(cart).reduce((sum, c) => sum + c.qty * c.item.price, 0);
  }

  function updateCartUI() {
    const count = cartCount();
    const total = cartTotal();
    els.cartButton.style.display = count > 0 ? 'block' : 'none';
    els.cartCount.textContent = count;
    els.cartTotal.textContent = money(total);
    els.cartFooterTotal.textContent = money(total);

    els.cartItems.innerHTML = '';
    Object.values(cart).forEach(({ item, qty }) => {
      const row = document.createElement('div');
      row.className = 'cart-item-row';
      row.innerHTML = `
        <span>${qty}x ${escapeHtml(item.name)}</span>
        <span>${money(qty * item.price)}</span>
      `;
      els.cartItems.appendChild(row);
    });
  }

  els.cartButton.addEventListener('click', () => {
    els.cartOverlay.style.display = 'flex';
  });
  els.closeCart.addEventListener('click', () => {
    els.cartOverlay.style.display = 'none';
  });

  els.submitOrder.addEventListener('click', async () => {
    if (cartCount() === 0) return;
    els.submitOrder.disabled = true;
    els.submitError.style.display = 'none';

    const payload = {
      items: Object.entries(cart).map(([id, c]) => ({
        menu_item_id: Number(id),
        quantity: c.qty,
      })),
      customer_note: els.customerNote.value || '',
    };

    try {
      const res = await fetch(`${API_BASE}/orders/${encodeURIComponent(slug)}/${encodeURIComponent(tableToken)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo enviar el pedido');

      els.cartOverlay.style.display = 'none';
      els.orderCode.textContent = data.order.code;
      els.successOverlay.style.display = 'flex';
      trackOrder(data.order.id);

      cart = {};
      updateCartUI();
    } catch (err) {
      els.submitError.textContent = err.message;
      els.submitError.style.display = 'block';
    } finally {
      els.submitOrder.disabled = false;
    }
  });

  els.newOrderBtn.addEventListener('click', () => {
    els.successOverlay.style.display = 'none';
  });

  function trackOrder(orderId) {
    setStatusBadge('pending');
    try {
      const socket = io({ transports: ['websocket', 'polling'] });
      socket.on('connect', () => socket.emit('join_order', orderId));
      socket.on('order_updated', (order) => {
        if (order.id === orderId) setStatusBadge(order.status);
      });
    } catch (e) {
      // Si falla el socket, no bloquea la experiencia; el usuario ya ve el codigo de pedido.
    }
  }

  const STATUS_LABELS = {
    pending: 'Pendiente',
    preparing: 'Preparando',
    ready: 'Listo',
    delivered: 'Entregado',
    cancelled: 'Cancelado',
  };

  function setStatusBadge(status) {
    els.orderStatus.textContent = STATUS_LABELS[status] || status;
    els.orderStatus.className = `status-badge ${status}`;
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str == null ? '' : String(str);
    return div.innerHTML;
  }
  function escapeAttr(str) {
    return escapeHtml(str).replace(/"/g, '&quot;');
  }

  loadMenu();
})();
