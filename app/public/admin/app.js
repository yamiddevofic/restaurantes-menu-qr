(function () {
  const els = {
    loginScreen: document.getElementById('loginScreen'),
    loginForm: document.getElementById('loginForm'),
    username: document.getElementById('username'),
    password: document.getElementById('password'),
    loginError: document.getElementById('loginError'),
    dashboard: document.getElementById('dashboard'),
    restaurantTitle: document.getElementById('restaurantTitle'),
    logoutBtn: document.getElementById('logoutBtn'),

    categoryForm: document.getElementById('categoryForm'),
    categoryName: document.getElementById('categoryName'),
    categoriesList: document.getElementById('categoriesList'),

    itemForm: document.getElementById('itemForm'),
    itemName: document.getElementById('itemName'),
    itemCategory: document.getElementById('itemCategory'),
    itemPrice: document.getElementById('itemPrice'),
    itemImage: document.getElementById('itemImage'),
    itemDescription: document.getElementById('itemDescription'),
    itemsList: document.getElementById('itemsList'),

    tableForm: document.getElementById('tableForm'),
    tableNumber: document.getElementById('tableNumber'),
    tablesList: document.getElementById('tablesList'),
  };

  let categories = [];

  /* ---------- Login ---------- */

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
      if (data.user.role !== 'admin') throw new Error('Este usuario no tiene acceso de administrador');
      startDashboard(data.user.restaurant_name);
    } catch (err) {
      els.loginError.textContent = err.message;
      els.loginError.style.display = 'block';
    }
  });

  els.logoutBtn.addEventListener('click', async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    els.dashboard.style.display = 'none';
    els.loginScreen.style.display = 'flex';
  });

  async function checkSession() {
    try {
      const res = await fetch('/api/auth/me');
      if (!res.ok) return;
      const data = await res.json();
      if (data.role === 'admin') startDashboard(data.restaurant.name);
    } catch (e) {}
  }

  function startDashboard(restaurantName) {
    els.restaurantTitle.textContent = `Administracion · ${restaurantName}`;
    els.loginScreen.style.display = 'none';
    els.dashboard.style.display = 'block';
    loadCategories();
    loadItems();
    loadTables();
  }

  /* ---------- Tabs ---------- */
  document.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach((p) => (p.style.display = 'none'));
      btn.classList.add('active');
      document.getElementById(`tab-${btn.dataset.tab}`).style.display = 'block';
    });
  });

  /* ---------- Categorias ---------- */

  async function loadCategories() {
    const res = await fetch('/api/admin/categories');
    const data = await res.json();
    categories = data.categories || [];
    renderCategories();
    renderCategoryOptions();
  }

  function renderCategories() {
    els.categoriesList.innerHTML = '';
    categories.forEach((c) => {
      const row = document.createElement('div');
      row.className = 'list-row';
      row.innerHTML = `
        <div class="info"><strong>${escapeHtml(c.name)}</strong><span>${c.active ? 'Activa' : 'Oculta'}</span></div>
        <div class="actions">
          <button data-action="toggle">${c.active ? 'Ocultar' : 'Mostrar'}</button>
          <button data-action="delete" class="danger">Eliminar</button>
        </div>
      `;
      row.querySelector('[data-action="toggle"]').addEventListener('click', async () => {
        await fetch(`/api/admin/categories/${c.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: c.name, sort_order: c.sort_order, active: c.active ? false : true }),
        });
        loadCategories();
      });
      row.querySelector('[data-action="delete"]').addEventListener('click', async () => {
        if (!confirm(`¿Eliminar la categoria "${c.name}"? Los platos quedaran sin categoria.`)) return;
        await fetch(`/api/admin/categories/${c.id}`, { method: 'DELETE' });
        loadCategories();
        loadItems();
      });
      els.categoriesList.appendChild(row);
    });
  }

  function renderCategoryOptions() {
    els.itemCategory.innerHTML = '<option value="">Sin categoria</option>';
    categories.forEach((c) => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = c.name;
      els.itemCategory.appendChild(opt);
    });
  }

  els.categoryForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = els.categoryName.value.trim();
    if (!name) return;
    await fetch('/api/admin/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, sort_order: categories.length }),
    });
    els.categoryName.value = '';
    loadCategories();
  });

  /* ---------- Platos ---------- */

  let editingItem = null;

  async function loadItems() {
    const res = await fetch('/api/admin/menu-items');
    const data = await res.json();
    renderItems(data.items || []);
  }

  function renderItems(items) {
    els.itemsList.innerHTML = '';
    if (items.length === 0) {
      els.itemsList.innerHTML = '<p style="color:#7a7267;">Aun no has agregado platos.</p>';
      return;
    }
    items.forEach((item) => {
      const catName = categories.find((c) => c.id === item.category_id)?.name || 'Sin categoria';
      const row = document.createElement('div');
      row.className = 'list-row';
      
      const imageHtml = item.image_url 
        ? `<div class="item-image"><img src="${escapeHtml(item.image_url)}" alt="${escapeHtml(item.name)}" onerror="this.parentElement.style.display='none'"></div>` 
        : '<div class="item-image no-image"><span>Sin imagen</span></div>';
      
      row.innerHTML = `
        ${imageHtml}
        <div class="item-content">
          <div class="info">
            <strong>${escapeHtml(item.name)}</strong>
            <span class="price">$${Number(item.price).toLocaleString('es-CO')}</span>
            <span class="category">${escapeHtml(catName)}</span>
            <span class="status ${item.available ? '' : 'unavailable'}">${item.available ? 'Disponible' : 'Agotado'}</span>
          </div>
          <div class="actions">
            <button data-action="edit">Editar</button>
            <button data-action="toggle" class="${item.available ? '' : 'toggle-off'}">${item.available ? 'Marcar agotado' : 'Marcar disponible'}</button>
            <button data-action="delete" class="danger">Eliminar</button>
          </div>
        </div>
      `;
      row.querySelector('[data-action="edit"]').addEventListener('click', () => openEditForm(item));
      row.querySelector('[data-action="toggle"]').addEventListener('click', async () => {
        await fetch(`/api/admin/menu-items/${item.id}/toggle-available`, { method: 'PATCH' });
        loadItems();
      });
      row.querySelector('[data-action="delete"]').addEventListener('click', async () => {
        if (!confirm(`¿Eliminar "${item.name}" del menu?`)) return;
        await fetch(`/api/admin/menu-items/${item.id}`, { method: 'DELETE' });
        loadItems();
      });
      els.itemsList.appendChild(row);
    });
  }

  function openEditForm(item) {
    editingItem = item;
    els.itemName.value = item.name;
    els.itemCategory.value = item.category_id || '';
    els.itemPrice.value = item.price;
    els.itemImage.value = item.image_url || '';
    els.itemDescription.value = item.description || '';
    
    const submitBtn = els.itemForm.querySelector('button[type="submit"]');
    submitBtn.textContent = 'Guardar cambios';
    submitBtn.dataset.mode = 'edit';
    
    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.textContent = 'Cancelar';
    cancelBtn.id = 'cancelEdit';
    cancelBtn.addEventListener('click', closeEditForm);
    els.itemForm.appendChild(cancelBtn);
  }

  function closeEditForm() {
    editingItem = null;
    els.itemForm.reset();
    const submitBtn = els.itemForm.querySelector('button[type="submit"]');
    submitBtn.textContent = 'Agregar plato';
    submitBtn.dataset.mode = 'add';
    const cancelBtn = document.getElementById('cancelEdit');
    if (cancelBtn) cancelBtn.remove();
  }

  els.itemForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      name: els.itemName.value.trim(),
      category_id: els.itemCategory.value ? Number(els.itemCategory.value) : null,
      price: Number(els.itemPrice.value),
      image_url: els.itemImage.value.trim(),
      description: els.itemDescription.value.trim(),
    };
    
    const submitBtn = els.itemForm.querySelector('button[type="submit"]');
    const isEdit = submitBtn.dataset.mode === 'edit';
    
    const url = isEdit ? `/api/admin/menu-items/${editingItem.id}` : '/api/admin/menu-items';
    const method = isEdit ? 'PUT' : 'POST';
    
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    
    if (res.ok) {
      closeEditForm();
      loadItems();
    } else {
      const data = await res.json().catch(() => ({}));
      alert(data.error || (isEdit ? 'No se pudo actualizar el plato' : 'No se pudo agregar el plato'));
    }
  });

  /* ---------- Mesas / QR ---------- */

  async function loadTables() {
    const res = await fetch('/api/admin/tables');
    const data = await res.json();
    renderTables(data.tables || []);
  }

  function renderTables(tables) {
    els.tablesList.innerHTML = '';
    if (tables.length === 0) {
      els.tablesList.innerHTML = '<p style="color:#7a7267;">Aun no has creado mesas.</p>';
      return;
    }
    tables.forEach((t) => {
      const card = document.createElement('div');
      card.className = 'table-card';
      card.innerHTML = `
        <h3>Mesa ${escapeHtml(t.table_number)}</h3>
        <img src="/api/admin/tables/${t.id}/qr.png" alt="QR mesa ${escapeHtml(t.table_number)}">
        <div class="table-actions">
          <a href="/api/admin/tables/${t.id}/qr.png" download="mesa-${escapeAttr(t.table_number)}-qr.png">Descargar QR</a>
          <a href="${escapeAttr(t.menu_url)}" target="_blank">Ver menu ↗</a>
          <button data-action="regenerate">Regenerar QR</button>
          <button data-action="delete" class="danger">Eliminar mesa</button>
        </div>
      `;
      card.querySelector('[data-action="regenerate"]').addEventListener('click', async () => {
        if (!confirm('El codigo QR impreso actual dejara de funcionar. ¿Continuar?')) return;
        await fetch(`/api/admin/tables/${t.id}/regenerate-qr`, { method: 'POST' });
        loadTables();
      });
      card.querySelector('[data-action="delete"]').addEventListener('click', async () => {
        if (!confirm(`¿Eliminar la mesa ${t.table_number}?`)) return;
        await fetch(`/api/admin/tables/${t.id}`, { method: 'DELETE' });
        loadTables();
      });
      els.tablesList.appendChild(card);
    });
  }

  els.tableForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const table_number = els.tableNumber.value.trim();
    if (!table_number) return;
    const res = await fetch('/api/admin/tables', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ table_number }),
    });
    if (res.ok) {
      els.tableForm.reset();
      loadTables();
    } else {
      const data = await res.json().catch(() => ({}));
      alert(data.error || 'No se pudo crear la mesa');
    }
  });

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str == null ? '' : String(str);
    return div.innerHTML;
  }
  function escapeAttr(str) {
    return escapeHtml(str).replace(/"/g, '&quot;');
  }

  checkSession();
})();
