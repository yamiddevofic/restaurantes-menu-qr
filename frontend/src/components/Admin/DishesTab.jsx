import { useState, useEffect, useRef } from 'react';
import { api } from '../../api';
import ConfirmDialog from '../ConfirmDialog';

function PlusIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

function XIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

function ImagePlaceholder() {
  return (
    <div className="w-14 h-14 rounded-lg bg-[#2d2d2d] flex items-center justify-center flex-shrink-0">
      <svg className="w-6 h-6 text-[#808080]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    </div>
  );
}

export default function DishesTab() {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showItemForm, setShowItemForm] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [itemName, setItemName] = useState('');
  const [itemCategory, setItemCategory] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemImage, setItemImage] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [alerts, setAlerts] = useState([]);
  const [confirm, setConfirm] = useState({ open: false, title: '', message: '', onConfirm: null });
  const catInputRef = useRef(null);
  const itemInputRef = useRef(null);

  const addAlert = (msg, type = 'error') => {
    const id = Date.now();
    setAlerts((prev) => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setAlerts((prev) => prev.filter((a) => a.id !== id));
    }, 4000);
  };

  const loadData = async () => {
    try {
      const [catsRes, itemsRes] = await Promise.all([
        api.get('/admin/categories'),
        api.get('/admin/menu-items'),
      ]);
      setCategories(catsRes.categories || []);
      setItems(itemsRes.items || []);
    } catch (err) {
      addAlert(err.message || 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      api.get('/admin/categories'),
      api.get('/admin/menu-items'),
    ]).then(([catsRes, itemsRes]) => {
      if (cancelled) return;
      setCategories(catsRes.categories || []);
      setItems(itemsRes.items || []);
    }).catch((err) => {
      if (cancelled) return;
      addAlert(err.message || 'Error al cargar datos');
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (showCategoryForm && catInputRef.current) {
      catInputRef.current.focus();
    }
  }, [showCategoryForm]);

  useEffect(() => {
    if (showItemForm && itemInputRef.current) {
      itemInputRef.current.focus();
    }
  }, [showItemForm]);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/categories', { name: categoryName });
      setCategoryName('');
      setShowCategoryForm(false);
      await loadData();
      addAlert('Categoria creada exitosamente', 'success');
    } catch (err) {
      addAlert(err.message || 'Error al crear categoria');
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/menu-items', {
        name: itemName,
        category_id: itemCategory || null,
        price: parseInt(itemPrice),
        image_url: itemImage || null,
        description: itemDescription || null,
      });
      setItemName('');
      setItemCategory('');
      setItemPrice('');
      setItemImage('');
      setItemDescription('');
      setShowItemForm(false);
      await loadData();
      addAlert('Plato creado exitosamente', 'success');
    } catch (err) {
      addAlert(err.message || 'Error al crear plato');
    }
  };

  const handleDeleteCategory = (id) => {
    setConfirm({
      open: false,
      title: 'Eliminar categoria',
      message: 'Esto eliminara la categoria y sus platos dejaran de tener categoria asignada.',
      onConfirm: async () => {
        try {
          await api.delete(`/admin/categories/${id}`);
          await loadData();
          addAlert('Categoria eliminada', 'success');
        } catch (err) {
          addAlert(err.message || 'Error al eliminar categoria');
        }
        setConfirm({ open: false, title: '', message: '', onConfirm: null });
      },
    });
  };

  const handleDeleteItem = (id) => {
    setConfirm({
      open: true,
      title: 'Eliminar plato',
      message: '¿Eliminar este plato del menu permanentemente?',
      onConfirm: async () => {
        try {
          await api.delete(`/admin/menu-items/${id}`);
          await loadData();
          addAlert('Plato eliminado', 'success');
        } catch (err) {
          addAlert(err.message || 'Error al eliminar plato');
        }
        setConfirm({ open: false, title: '', message: '', onConfirm: null });
      },
    });
  };

  const getItemsByCategory = (categoryId) => {
    return items.filter((item) => item.category_id === categoryId);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <section className="px-4 w-screen bg-red-500 mx-auto max-w-full my-auto max-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">Menu</h2>
          <p className="text-sm text-muted mt-0.5">Administra las categorias y platos del menu</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setShowCategoryForm(!showCategoryForm); setShowItemForm(false); }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-dashed border-[#404040] text-[#c0c0c0] text-sm font-medium cursor-pointer transition-all hover:border-[#F5C12A] hover:text-[#F5C12A] hover:bg-[#F5C12A]/5 bg-transparent"
          >
            <PlusIcon />
            Categoria
          </button>
          <button
            onClick={() => { setShowItemForm(!showItemForm); setShowCategoryForm(false); }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-dashed border-[#404040] text-[#c0c0c0] text-sm font-medium cursor-pointer transition-all hover:border-[#F5C12A] hover:text-[#F5C12A] hover:bg-[#F5C12A]/5 bg-transparent"
          >
            <PlusIcon />
            Plato
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {showCategoryForm && (
          <form onSubmit={handleAddCategory} className="flex gap-2.5 p-4 bg-[#2d2d2d] border border-[#404040] rounded-xl">
            <input
              ref={catInputRef}
              type="text"
              placeholder="Nombre de la categoria (ej. Entradas)"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              required
              maxLength={100}
              className="flex-1 bg-[#3a3a3a] border border-[#404040] rounded-lg px-3.5 py-2.5 text-white text-sm outline-none transition-colors focus:border-[#F5C12A] focus:ring-1 focus:ring-[#F5C12A]/30 placeholder:text-[#808080]"
            />
            <button
              type="submit"
              disabled={!categoryName.trim()}
              className="px-5 py-2.5 bg-[#F5C12A] text-[#1a1a1a] font-semibold text-sm rounded-lg border-none cursor-pointer transition-all hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Agregar
            </button>
            <button
              type="button"
              onClick={() => setShowCategoryForm(false)}
              className="w-9 h-9 flex items-center justify-center bg-transparent border border-[#404040] rounded-lg text-[#c0c0c0] cursor-pointer hover:text-white transition-colors"
            >
              <XIcon />
            </button>
          </form>
        )}

        {showItemForm && (
          <form onSubmit={handleAddItem} className="grid grid-cols-1 md:grid-cols-2 gap-3 p-5 bg-[#2d2d2d] border border-[#404040] rounded-xl">
            <input
              ref={itemInputRef}
              type="text"
              placeholder="Nombre del plato"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              required
              maxLength={150}
              className="bg-[#3a3a3a] border border-[#404040] rounded-lg px-3.5 py-2.5 text-white text-sm outline-none transition-colors focus:border-[#F5C12A] focus:ring-1 focus:ring-[#F5C12A]/30 placeholder:text-[#808080]"
            />
            <select
              value={itemCategory}
              onChange={(e) => setItemCategory(e.target.value)}
              className="bg-[#3a3a3a] border border-[#404040] rounded-lg px-3.5 py-2.5 text-white text-sm outline-none transition-colors focus:border-[#F5C12A] focus:ring-1 focus:ring-[#F5C12A]/30"
            >
              <option value="">Sin categoria</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Precio"
              value={itemPrice}
              onChange={(e) => setItemPrice(e.target.value)}
              required
              min="0"
              step="1"
              className="bg-[#3a3a3a] border border-[#404040] rounded-lg px-3.5 py-2.5 text-white text-sm outline-none transition-colors focus:border-[#F5C12A] focus:ring-1 focus:ring-[#F5C12A]/30 placeholder:text-[#808080]"
            />
            <input
              type="text"
              placeholder="URL de imagen (opcional)"
              value={itemImage}
              onChange={(e) => setItemImage(e.target.value)}
              className="bg-[#3a3a3a] border border-[#404040] rounded-lg px-3.5 py-2.5 text-white text-sm outline-none transition-colors focus:border-[#F5C12A] focus:ring-1 focus:ring-[#F5C12A]/30 placeholder:text-[#808080]"
            />
            <textarea
              placeholder="Descripcion (opcional)"
              value={itemDescription}
              onChange={(e) => setItemDescription(e.target.value)}
              maxLength={500}
              className="md:col-span-2 bg-[#3a3a3a] border border-[#404040] rounded-lg px-3.5 py-2.5 text-white text-sm outline-none transition-colors focus:border-[#F5C12A] focus:ring-1 focus:ring-[#F5C12A]/30 placeholder:text-[#808080] resize-y min-h-[60px]"
            />
            <div className="md:col-span-2 flex gap-2.5">
              <button
                type="submit"
                disabled={!itemName.trim() || !itemPrice}
                className="flex-1 px-5 py-2.5 bg-[#F5C12A] text-[#1a1a1a] font-semibold text-sm rounded-lg border-none cursor-pointer transition-all hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Agregar plato
              </button>
              <button
                type="button"
                onClick={() => setShowItemForm(false)}
                className="px-4 py-2.5 bg-transparent border border-[#404040] rounded-lg text-[#c0c0c0] text-sm cursor-pointer hover:text-white transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="mt-1">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm mb-2 animate-[slideIn_0.3s_ease]"
            style={{
              backgroundColor: alert.type === 'success' ? '#1a3a1a' : '#3a1a1a',
              color: alert.type === 'success' ? '#4ade80' : '#ff6b6b',
              border: `1px solid ${alert.type === 'success' ? '#2f9e44' : '#c92a2a'}`,
            }}
          >
            {alert.type === 'success' ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4" />
                <path d="M12 16h.01" />
              </svg>
            )}
            <span className="flex-1">{alert.msg}</span>
            <button
              onClick={() => setAlerts((prev) => prev.filter((a) => a.id !== alert.id))}
              className="bg-transparent border-none cursor-pointer opacity-60 hover:opacity-100 transition-opacity"
            >
              <XIcon />
            </button>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-[#c0c0c0]">
          <svg className="w-8 h-8 animate-spin mb-3" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm">Cargando menu...</span>
        </div>
      ) : categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-[#c0c0c0]">
          <svg className="w-16 h-16 mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          <p className="text-base mb-1">No hay categorias</p>
          <p className="text-sm opacity-60">Agrega una categoria para comenzar</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4 bg-red-500">
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              items={getItemsByCategory(category.id)}
              onDeleteCategory={handleDeleteCategory}
              onDeleteItem={handleDeleteItem}
              formatPrice={formatPrice}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={confirm.open}
        title={confirm.title}
        message={confirm.message}
        onConfirm={confirm.onConfirm}
        onCancel={() => setConfirm({ open: false, title: '', message: '', onConfirm: null })}
      />

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}

function CategoryCard({ category, items, onDeleteCategory, onDeleteItem, formatPrice }) {
  const [expanded, setExpanded] = useState(true);
  const [imageErrors, setImageErrors] = useState({});

  const handleImageError = (itemId) => {
    setImageErrors((prev) => ({ ...prev, [itemId]: true }));
  };

  return (
    <div className="bg-[#2d2d2d] border border-[#404040] rounded-xl transition-all hover:border-[#F5C12A]/30 hover:shadow-[0_4px_16px_rgba(0,0,0,0.2)] group">
      <div className="flex items-center justify-between px-4 py-3.5 cursor-pointer select-none" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center gap-2.5 min-w-0">
          <button className="w-5 h-5 flex items-center justify-center bg-transparent border-none cursor-pointer text-[#808080] hover:text-white transition-colors">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
          <h3 className="m-0 text-sm font-semibold text-white truncate">{category.name}</h3>
          <span className="text-xs text-[#808080] font-medium bg-[#3a3a3a] px-2 py-0.5 rounded-full">{items.length}</span>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onDeleteCategory(category.id); }}
          className="flex items-center justify-center w-7 h-7 rounded-lg bg-transparent border border-[#404040] text-[#808080] cursor-pointer opacity-0 group-hover:opacity-100 transition-all hover:bg-[#c92a2a]/20 hover:border-[#c92a2a]/40 hover:text-[#ff6b6b]"
          title="Eliminar categoria"
        >
          <XIcon className="w-3.5 h-3.5" />
        </button>
      </div>

      {expanded && (
        <div className="px-4 pb-3 space-y-1.5">
          {items.length === 0 ? (
            <p className="text-xs text-[#808080] py-2 text-center">Sin platos</p>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 bg-[#3a3a3a] border border-[#404040] rounded-xl p-3 transition-all hover:border-[#F5C12A]/20"
              >
                {item.image_url && !imageErrors[item.id] ? (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0 bg-[#2d2d2d]"
                    onError={() => handleImageError(item.id)}
                  />
                ) : (
                  <ImagePlaceholder />
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="m-0 text-sm font-semibold text-white truncate">{item.name}</h4>
                  <p className="m-0 text-xs text-[#F5C12A] font-bold mt-0.5">{formatPrice(item.price)}</p>
                  {item.description && (
                    <p className="m-0 text-xs text-[#808080] mt-0.5 line-clamp-1">{item.description}</p>
                  )}
                </div>
                <button
                  onClick={() => onDeleteItem(item.id)}
                  className="flex items-center justify-center w-7 h-7 rounded-lg bg-transparent border border-[#404040] text-[#808080] cursor-pointer transition-all hover:bg-[#c92a2a]/20 hover:border-[#c92a2a]/40 hover:text-[#ff6b6b] flex-shrink-0"
                  title="Eliminar plato"
                >
                  <XIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
