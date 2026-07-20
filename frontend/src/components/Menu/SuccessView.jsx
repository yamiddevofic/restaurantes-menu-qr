function getStatusLabel(status) {
  if (status === 'pending') return 'Pendiente';
  if (status === 'preparing') return 'Preparando';
  if (status === 'ready') return 'Listo';
  return status;
}

function getStatusColor(status) {
  if (status === 'pending') return 'bg-yellow-900/30 text-yellow-300';
  if (status === 'preparing') return 'bg-blue-900/30 text-blue-300';
  if (status === 'ready') return 'bg-green-900/30 text-green-300';
  if (status === 'delivered') return 'bg-gray-900/30 text-gray-400';
  if (status === 'cancelled') return 'bg-red-900/30 text-red-300';
  return 'bg-gray-900/30 text-gray-400';
}

export default function SuccessView({ orderCode, orderStatus, onNewOrder }) {
  return (
    <div className="min-h-screen bg-bg text-text">
      <div className="fixed inset-0 bg-black/45 flex items-end z-50">
        <div className="w-full bg-bg rounded-t-2xl p-6 max-h-[85vh] overflow-y-auto">
          <div className="text-center">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-semibold mb-2">Pedido enviado</h2>
            <p className="text-muted mb-4">Codigo: <strong>{orderCode}</strong></p>
            <p className="text-muted text-sm mb-4">Tu pedido llego a la cocina. Aqui puedes ver el estado:</p>
            <div className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(orderStatus)}`}>
              {getStatusLabel(orderStatus)}
            </div>
            <button
              className="w-full mt-6 bg-card border border-border rounded-xl py-3.5 text-base cursor-pointer text-text"
              onClick={onNewOrder}
            >
              Hacer otro pedido
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}