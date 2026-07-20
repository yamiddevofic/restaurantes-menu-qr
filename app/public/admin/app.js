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
    tableForm: document.getElementById('tableForm'),
    tableNumber: document.getElementById('tableNumber'),
    tablesList: document.getElementById('tablesList'),

    menuToggle: document.getElementById('menuToggle'),
    menuDropdown: document.getElementById('menuDropdown'),
    menuOverlay: document.getElementById('menuOverlay'),
    closeSidebar: document.getElementById('closeSidebar'),
  };

  let categories = [];
  let categoryIcons = {};

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
    els.dashboard.classList.remove('visible');
    els.loginScreen.classList.remove('hidden');
  });

  /* ---------- Sidebar menu ---------- */
  function openSidebar() {
    els.menuToggle.classList.add('open');
    els.menuDropdown.classList.add('open');
    els.menuOverlay.classList.add('open');
    document.body.classList.add('menu-open');
  }
  function closeSidebar() {
    els.menuToggle.classList.remove('open');
    els.menuDropdown.classList.remove('open');
    els.menuOverlay.classList.remove('open');
    document.body.classList.remove('menu-open');
  }
  els.menuToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    if (els.menuDropdown.classList.contains('open')) {
      closeSidebar();
    } else {
      openSidebar();
    }
  });
  els.menuOverlay.addEventListener('click', closeSidebar);
  els.closeSidebar.addEventListener('click', closeSidebar);

  async function checkSession() {
    try {
      const res = await fetch('/api/auth/me');
      if (!res.ok) return;
      const data = await res.json();
      if (data.role === 'admin') startDashboard(data.restaurant.name);
    } catch (e) {}
  }

  async function startDashboard(restaurantName) {
    els.restaurantTitle.textContent = `Administracion · ${restaurantName}`;
    els.loginScreen.classList.add('hidden');
    els.dashboard.classList.add('visible');
    await loadCategoryIcons();
    loadPlatos();
    loadTables();
  }

  /* ---------- Tabs ---------- */
  const sectionMeta = {
    platos: { title: 'Platos', desc: 'Gestiona categorias y los platos de cada una' },
    tables: { title: 'Mesas', desc: 'Crea mesas y genera codigos QR para tus clientes' },
  };
  const sectionTitle = document.getElementById('sectionTitle');
  const sectionDesc = document.getElementById('sectionDesc');

  document.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach((p) => (p.style.display = 'none'));
      document.querySelectorAll('.tab-panel .inline-form, .tab-panel .grid-form').forEach((f) => f.style.display = 'none');
      btn.classList.add('active');
      document.getElementById(`tab-${btn.dataset.tab}`).style.display = 'block';
      const meta = sectionMeta[btn.dataset.tab];
      if (meta) {
        sectionTitle.textContent = meta.title;
        sectionDesc.textContent = meta.desc;
      }
    });
  });

  /* ---------- Add Toggle ---------- */
  document.querySelectorAll('.add-toggle').forEach((btn) => {
    btn.addEventListener('click', () => {
      const form = document.getElementById(btn.dataset.target);
      const isHidden = window.getComputedStyle(form).display === 'none';
      document.querySelectorAll('.tab-panel .inline-form, .tab-panel .grid-form').forEach((f) => f.style.display = 'none');
      if (isHidden) form.style.display = form.classList.contains('grid-form') ? 'grid' : 'flex';
    });
  });

  /* ---------- Categorias ---------- */

  async function loadCategoryIcons() {
    try {
      const module = await import('/data/category-icons.js');
      categoryIcons = module.categoryIcons || {};
    } catch (e) {
      console.error('Error cargando iconos de categorías:', e);
      categoryIcons = {};
    }
  }

  async function loadPlatos() {
    const [catRes, itemRes] = await Promise.all([
      fetch('/api/admin/categories'),
      fetch('/api/admin/menu-items'),
    ]);
    const catData = await catRes.json();
    const itemData = await itemRes.json();
    categories = catData.categories || [];
    const items = itemData.items || [];
    renderPlatos(items);
    renderCategoryOptions();
  }

  function getCategoryIcon(name) {
    return categoryIcons[name] || `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M4 4h6v6h-6l0 -6 M14 4h6v6h-6l0 -6 M4 14h6l0 6h-6l0 -6 M14 14h6l0 6h-6l0 -6" /></svg>`;
  }

  function renderPlatos(items) {
    els.categoriesList.innerHTML = '';

    if (categories.length === 0 && items.length === 0) {
      els.categoriesList.innerHTML = '<p style="color:#7a7267;">Aun no has creado categorias ni platos.</p>';
      return;
    }

    const missingIcons = categories.filter(c => !categoryIcons[c.name]);
    if (missingIcons.length > 0) {
      console.log('Categorías sin icono definido en category-icons.json:');
      missingIcons.forEach(c => console.log(`  "${c.name}": ""`));
    }

    const itemsByCat = {};
    items.forEach((i) => {
      const key = i.category_id || 'sin-categoria';
      (itemsByCat[key] = itemsByCat[key] || []).push(i);
    });

    const arrowSvg = '<svg class="chevron" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>';

    categories.forEach((c) => {
      const group = document.createElement('div');
      group.className = 'category-group';

      const card = document.createElement('div');
      card.className = 'category-card';
      const iconSvg = getCategoryIcon(c.name);
      card.innerHTML = `
        <div class="category-icon">${iconSvg}</div>
        <div class="category-info">
          <h3>${escapeHtml(c.name)}</h3>
          <span class="category-status ${c.active ? 'active' : 'inactive'}">${c.active ? 'Activa' : 'Oculta'}</span>
        </div>
        <div class="category-actions">
          <button data-action="toggle" title="${c.active ? 'Ocultar' : 'Mostrar'}">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="${c.active ? 'M10.585 10.587a2 2 0 0 0 2.829 2.828' : 'M12 6c-3.6 0 -6.6 2 -9 6c2.4 4 5.4 6 9 6c3.6 0 6.6 -2 9 -6c-2.4 -4 -5.4 -6 -9 -6'}" />
              <path d="${c.active ? 'M16.681 16.673a8.717 8.717 0 0 1 -4.681 1.327c-3.6 0 -6.6 -2 -9 -6c1.272 -2.12 2.712 -3.678 4.32 -4.674m2.86 -1.146a9.055 9.055 0 0 1 1.82 -.18c3.6 0 6.6 2 9 6c-.666 1.11 -1.379 2.067 -2.138 2.87' : 'M12 16a4 4 0 1 0 0 -8a4 4 0 0 0 0 8'}" />
              ${c.active ? '<path d="M3 3l18 18"/>' : ''}
            </svg>
            <span class="btn-label">${c.active ? 'Ocultar' : 'Mostrar'}</span>
          </button>
          <button data-action="delete" title="Eliminar">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M4 7l16 0" />
              <path d="M10 11l0 6" />
              <path d="M14 11l0 6" />
              <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
              <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
            </svg>
            <span class="btn-label">Eliminar</span>
          </button>
        </div>
        <div class="category-chevron">${arrowSvg}</div>
      `;
      card.addEventListener('click', (e) => {
        if (e.target.closest('[data-action]')) return;
        group.classList.toggle('expanded');
      });
      card.querySelector('[data-action="toggle"]').addEventListener('click', async () => {
        await fetch(`/api/admin/categories/${c.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: c.name, sort_order: c.sort_order, active: !c.active }),
        });
        loadPlatos();
      });
      card.querySelector('[data-action="delete"]').addEventListener('click', async () => {
        if (!confirm(`¿Eliminar la categoria "${c.name}"? Los platos quedaran sin categoria.`)) return;
        await fetch(`/api/admin/categories/${c.id}`, { method: 'DELETE' });
        loadPlatos();
      });
      group.appendChild(card);

      // Items carousel for this category
      const catItems = itemsByCat[c.id] || [];
      if (catItems.length > 0) {
        const carousel = document.createElement('div');
        carousel.className = 'category-items';
        catItems.forEach((item) => {
          carousel.appendChild(createItemCard(item, c));
        });
        group.appendChild(carousel);
      }

      els.categoriesList.appendChild(group);
    });

    // Uncategorized items
    const uncategorized = itemsByCat['sin-categoria'] || [];
    if (uncategorized.length > 0) {
      const group = document.createElement('div');
      group.className = 'category-group';
      const card = document.createElement('div');
      card.className = 'category-card';
      const fallbackIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M4 4h6v6h-6l0 -6 M14 4h6v6h-6l0 -6 M4 14h6l0 6h-6l0 -6 M14 14h6l0 6h-6l0 -6" /></svg>`;
      card.innerHTML = `
        <div class="category-icon">${fallbackIcon}</div>
        <div class="category-info">
          <h3>Sin categoria</h3>
          <span class="category-status active">${uncategorized.length} plato${uncategorized.length !== 1 ? 's' : ''}</span>
        </div>
      `;
      card.innerHTML += `<div class="category-chevron">${arrowSvg}</div>`;
      card.addEventListener('click', (e) => {
        if (e.target.closest('[data-action]')) return;
        group.classList.toggle('expanded');
      });
      group.appendChild(card);

      const carousel = document.createElement('div');
      carousel.className = 'category-items';
      uncategorized.forEach((item) => {
        carousel.appendChild(createItemCard(item, null));
      });
      group.appendChild(carousel);

      els.categoriesList.appendChild(group);
    }
  }

  function createItemCard(item, category) {
    const card = document.createElement('div');
    card.className = 'item-mini-card';

    const imageHtml = item.image_url
      ? `<div class="item-mini-img"><img src="${escapeAttr(item.image_url)}" alt="${escapeHtml(item.name)}" onerror="this.parentElement.style.display='none'"></div>`
      : '<div class="item-mini-img no-img"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M15 8h.01"/><path d="M12.5 21h-6.5a3 3 0 0 1 -3 -3v-12a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v5.5"/><path d="M3 16l5 -5c.928 -.893 2.072 -.893 3 0l2 2"/><path d="M14 14l1 -1c.653 -.629 1.413 -.815 2.13 -.559"/><path d="M21 15v6"/><path d="M18 18h6"/></svg></div>';

    card.innerHTML = `
      ${imageHtml}
      <div class="item-mini-body">
        <strong>${escapeHtml(item.name)}</strong>
        <span class="item-mini-price">$${Number(item.price).toLocaleString('es-CO')}</span>
        <span class="item-mini-status ${item.available ? '' : 'unavailable'}">${item.available ? 'Disponible' : 'Agotado'}</span>
      </div>
      <div class="item-mini-actions">
        <button data-action="edit" title="Editar">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4"/><path d="M13.5 6.5l4 4"/></svg>
        </button>
        <button data-action="toggle" title="${item.available ? 'Agotar' : 'Disponible'}" class="${item.available ? '' : 'toggle-off'}">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            ${item.available
              ? '<path d="M10.585 10.587a2 2 0 0 0 2.829 2.828"/><path d="M16.681 16.673a8.717 8.717 0 0 1 -4.681 1.327c-3.6 0 -6.6 -2 -9 -6c1.272 -2.12 2.712 -3.678 4.32 -4.674m2.86 -1.146a9.055 9.055 0 0 1 1.82 -.18c3.6 0 6.6 2 9 6c-.666 1.11 -1.379 2.067 -2.138 2.87"/><path d="M3 3l18 18"/>'
              : '<path d="M12 6c-3.6 0 -6.6 2 -9 6c2.4 4 5.4 6 9 6c3.6 0 6.6 -2 9 -6c-2.4 -4 -5.4 -6 -9 -6"/><path d="M12 16a4 4 0 1 0 0 -8a4 4 0 0 0 0 8"/>'}
          </svg>
        </button>
        <button data-action="delete" title="Eliminar">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7l16 0"/><path d="M10 11l0 6"/><path d="M14 11l0 6"/><path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12"/><path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3"/></svg>
        </button>
      </div>
    `;

    card.querySelector('[data-action="edit"]').addEventListener('click', () => openEditForm(item));
    card.querySelector('[data-action="toggle"]').addEventListener('click', async () => {
      await fetch(`/api/admin/menu-items/${item.id}/toggle-available`, { method: 'PATCH' });
      loadPlatos();
    });
    card.querySelector('[data-action="delete"]').addEventListener('click', async () => {
      if (!confirm(`¿Eliminar "${item.name}" del menu?`)) return;
      await fetch(`/api/admin/menu-items/${item.id}`, { method: 'DELETE' });
      loadPlatos();
    });

    return card;
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
    els.categoryForm.style.display = 'none';
    loadPlatos();
  });

  /* ---------- Platos ---------- */

  let editingItem = null;

  function openEditForm(item) {
    editingItem = item;
    els.itemForm.style.display = '';
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
    els.itemForm.style.display = 'none';
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
      els.itemForm.style.display = 'none';
      loadPlatos();
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
        <div class="qr-wrap">
          <img src="/api/admin/tables/${t.id}/qr.png" alt="QR mesa ${escapeHtml(t.table_number)}">
        </div>
        <div class="table-actions">
          <a href="/api/admin/tables/${t.id}/qr.png" download="mesa-${escapeAttr(t.table_number)}-qr.png">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2"/><path d="M7 11l5 5l5 -5"/><path d="M12 4l0 12"/></svg>
            Descargar QR
          </a>
          <a href="${escapeAttr(t.menu_url)}" target="_blank">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 6c-3.6 0 -6.6 2 -9 6c2.4 4 5.4 6 9 6c3.6 0 6.6 -2 9 -6c-2.4 -4 -5.4 -6 -9 -6"/><path d="M12 16a4 4 0 1 0 0 -8a4 4 0 0 0 0 8"/></svg>
            Ver menu
          </a>
          <button data-action="regenerate">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 11a8.1 8.1 0 0 0 -6.5 -7.5m-8.5 4.5a8.1 8.1 0 0 0 6.5 7.5"/><path d="M16 3h4v4"/><path d="M4 13v4h4"/></svg>
            Regenerar
          </button>
          <button data-action="delete">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7l16 0"/><path d="M10 11l0 6"/><path d="M14 11l0 6"/><path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12"/><path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3"/></svg>
            Eliminar
          </button>
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
      els.tableForm.style.display = 'none';
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
