export default function CartSheet({ cart, onClose, onRemove, customerNote, onNoteChange, onSubmit, formatMoney }) {
  const cartTotal = Object.values(cart).reduce((sum, { item, qty }) => sum + item.price * qty, 0);

  return (
    <div className="fixed inset-0 bg-black/45 flex items-end z-50">
      <div className="bg-bg w-full max-h-[85vh] rounded-t-2xl p-5 overflow-y-auto">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-semibold">Tu pedido</h2>
          <button className="text-2xl bg-transparent border-none cursor-pointer" onClick={onClose}>✕</button>
        </div>

        <div className="flex flex-col gap-2.5">
          {Object.entries(cart).map(([itemId, { item, qty }]) => (
            <div key={itemId} className="flex justify-between items-center bg-card border border-border rounded-xl p-3">
              <div className="flex items-center gap-2">
                <span className="font-bold text-primary">{qty}x</span>
                <span className="text-sm">{item.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-primary">{formatMoney(item.price * qty)}</span>
                <button className="w-9 h-9 rounded-lg bg-card text-text font-semibold text-xl leading-none border-none cursor-pointer" onClick={() => onRemove(itemId)}>-</button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <label htmlFor="customerNote" className="text-xs text-muted block mb-1">Nota para la cocina (opcional)</label>
          <textarea
            id="customerNote"
            value={customerNote}
            onChange={(e) => onNoteChange(e.target.value)}
            maxLength={300}
            placeholder="Ej: sin cebolla, para llevar..."
            className="w-full border border-border rounded-xl p-2.5 bg-bg text-text font-inherit resize-y min-h-[50px]"
          />
        </div>

        <div className="mt-4.5">
          <div className="flex justify-between text-lg mb-3">
            <span>Total</span>
            <strong>{formatMoney(cartTotal)}</strong>
          </div>
          <button className="w-full bg-primary text-white border-none rounded-2xl py-3.5 text-base font-semibold cursor-pointer" onClick={onSubmit}>
            Enviar pedido a cocina
          </button>
        </div>
      </div>
    </div>
  );
}