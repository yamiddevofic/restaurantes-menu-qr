import { useState } from 'react';

function ImagePlaceholder() {
  return (
    <div className="w-full h-48 md:h-52 bg-gradient-to-br from-[#3a3a3a] to-[#2a2a2a] flex items-center justify-center text-muted text-sm">
      <div className="flex flex-col items-center gap-1">
        <svg className="w-10 h-10 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span>Sin imagen</span>
      </div>
    </div>
  );
}

export default function ItemCard({ item, onAdd, cartQty, onRemove, formatMoney }) {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden flex flex-col transition-all hover:shadow-[0_8px_24px_rgba(0,0,0,0.25)] hover:border-primary">
      {item.image_url && !imageError ? (
        <img
          src={item.image_url}
          alt={item.name}
          className="w-full h-48 md:h-52 object-cover transition-transform duration-300 hover:scale-105"
          onError={() => setImageError(true)}
        />
      ) : (
        <ImagePlaceholder />
      )}
      <div className="flex-1 p-3.5 md:p-4 flex flex-col gap-3.5 justify-between min-w-0">
        <div className="flex flex-col gap-1.5">
          <h3 className="m-0 text-base md:text-lg leading-tight">{item.name}</h3>
          <p className="m-0 text-primary text-xl font-bold">{formatMoney(item.price)}</p>
          {item.description && <p className="m-0 text-xs md:text-sm text-muted leading-relaxed">{item.description}</p>}
        </div>
        <div className="flex items-center gap-2 justify-center">
          {cartQty > 0 ? (
            <>
              <button className="w-9 h-9 rounded-lg bg-card text-text font-semibold text-xl leading-none border-none cursor-pointer" onClick={() => onRemove(item.id)}>-</button>
              <span className="w-6 text-center font-bold text-lg">{cartQty}</span>
              <button className="w-9 h-9 rounded-lg bg-card text-text font-semibold text-xl leading-none border-none cursor-pointer" onClick={() => onAdd(item)}>+</button>
            </>
          ) : (
            <button className="bg-primary text-white border-none rounded-xl px-5 py-2 text-sm font-semibold cursor-pointer" onClick={() => onAdd(item)}>
              Agregar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}