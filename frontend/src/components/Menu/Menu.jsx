import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { api } from '../../api';
import CategorySidebar from './CategorySidebar';
import CategoryTabs from './CategoryTabs';
import ItemCard from './ItemCard';
import CartSheet from './CartSheet';
import SuccessView from './SuccessView';

export default function Menu() {
  const { slug, tableToken } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [restaurant, setRestaurant] = useState(null);
  const [table, setTable] = useState(null);
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [cart, setCart] = useState({});
  const [activeCategory, setActiveCategory] = useState(null);
  const [showCart, setShowCart] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [customerNote, setCustomerNote] = useState('');
  const [orderCode, setOrderCode] = useState('');
  const [orderStatus, setOrderStatus] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!slug || !tableToken) return;
    let cancelled = false;
    api.get(`/public/menu/${encodeURIComponent(slug)}/${encodeURIComponent(tableToken)}`)
      .then((data) => {
        if (cancelled) return;
        setRestaurant(data.restaurant);
        setTable(data.table);
        setCategories(data.categories);
        setItems(data.items);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message || 'No se pudo cargar el menu. Verifica tu conexion.');
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [slug, tableToken]);

  useEffect(() => {
    if (!orderCode) return;
    const newSocket = io(import.meta.env.VITE_API_BASE || 'http://localhost:3000', {
      transports: ['websocket', 'polling'],
    });
    newSocket.emit('join_table', { slug, tableToken });
    newSocket.on('order_updated', (data) => {
      if (data.code === orderCode) setOrderStatus(data.status);
    });
    socketRef.current = newSocket;
    return () => { newSocket.disconnect(); };
  }, [orderCode, slug, tableToken]);

  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev[item.id];
      return { ...prev, [item.id]: { item, qty: existing ? existing.qty + 1 : 1 } };
    });
  };

  const removeFromCart = (itemId) => {
    setCart((prev) => {
      const existing = prev[itemId];
      if (!existing) return prev;
      if (existing.qty === 1) {
        const { [itemId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [itemId]: { ...existing, qty: existing.qty - 1 } };
    });
  };

  const getItemsByCategory = (categoryId) => items.filter((item) => item.category_id === categoryId);
  const getItemsWithoutCategory = () => items.filter((item) => !item.category_id);
  const getCartTotal = () => Object.values(cart).reduce((sum, { item, qty }) => sum + item.price * qty, 0);
  const getCartCount = () => Object.values(cart).reduce((sum, { qty }) => sum + qty, 0);
  const cartCount = getCartCount();

  const formatMoney = (amount) => {
    try {
      return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: restaurant?.currency || 'COP',
        maximumFractionDigits: 0,
      }).format(amount);
    } catch {
      return `$${amount}`;
    }
  };

  const handleSubmitOrder = async () => {
    try {
      const orderItems = Object.entries(cart).map(([itemId, { qty }]) => ({
        menu_item_id: parseInt(itemId),
        qty,
      }));
      const data = await api.post('/public/orders', {
        slug, table_token: tableToken, items: orderItems, note: customerNote,
      });
      setOrderCode(data.code);
      setOrderStatus('pending');
      setCart({});
      setShowCart(false);
      setShowSuccess(true);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleNewOrder = () => {
    setShowSuccess(false);
    setOrderCode('');
    setOrderStatus('');
    setCustomerNote('');
  };

  if (!slug || !tableToken) {
    return (
      <div className="min-h-screen bg-bg text-text flex items-center justify-center">
        <p className="text-red-500 px-4">Este enlace no es valido. Escanea el codigo QR de tu mesa nuevamente.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg text-text flex items-center justify-center">
        <p className="text-muted">Cargando menu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-bg text-text flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (showSuccess) {
    return <SuccessView orderCode={orderCode} orderStatus={orderStatus} onNewOrder={handleNewOrder} />;
  }

  return (
    <div className="min-h-screen bg-bg text-text">
      <header className="sticky top-0 z-10 bg-panel/70 backdrop-blur-xl border-b border-border/20">
        <div className="px-4 py-2.5 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">{restaurant?.name}</h1>
            <p className="text-muted text-xs mt-0.5">Mesa {table?.number}</p>
          </div>
          <button
            className="md:hidden p-2 rounded-lg bg-card border border-border text-text cursor-pointer"
            onClick={() => setShowSidebar(!showSidebar)}
            aria-label="Toggle categories"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {showSidebar ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </header>

      <main className="flex flex-col min-h-screen md:flex-row">
        <CategorySidebar
          categories={categories}
          activeCategory={activeCategory}
          onSelect={setActiveCategory}
          getCount={getItemsByCategory}
          itemsWithoutCategoryCount={getItemsWithoutCategory().length}
          showSidebar={showSidebar}
          onClose={() => setShowSidebar(false)}
        />

        <CategoryTabs
          categories={categories}
          activeCategory={activeCategory}
          onSelect={setActiveCategory}
          itemsWithoutCategoryCount={getItemsWithoutCategory().length}
        />

        <div className="flex-1 flex flex-col">
          {!activeCategory ? (
            <div className="flex-1 flex items-center justify-center text-muted text-lg">
              Seleccione una categoria
            </div>
          ) : (
            <div className="flex-1 grid gap-4 px-4 pb-24 md:gap-5 md:px-6 md:py-6 grid-cols-[repeat(auto-fill,minmax(260px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(280px,1fr))]">
              {(activeCategory === 'other' ? getItemsWithoutCategory() : getItemsByCategory(activeCategory)).map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  onAdd={addToCart}
                  cartQty={cart[item.id]?.qty || 0}
                  onRemove={removeFromCart}
                  formatMoney={formatMoney}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {cartCount > 0 && (
        <button
          className="fixed bottom-4 left-4 right-4 bg-primary text-white border-none rounded-2xl py-3.5 text-base font-semibold shadow-[0_6px_18px_rgba(0,0,0,0.2)] z-20 cursor-pointer"
          onClick={() => setShowCart(true)}
        >
          Ver pedido · {cartCount} · {formatMoney(getCartTotal())}
        </button>
      )}

      {showCart && (
        <CartSheet
          cart={cart}
          onClose={() => setShowCart(false)}
          onRemove={removeFromCart}
          customerNote={customerNote}
          onNoteChange={setCustomerNote}
          onSubmit={handleSubmitOrder}
          formatMoney={formatMoney}
        />
      )}
    </div>
  );
}