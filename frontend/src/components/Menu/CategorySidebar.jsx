export default function CategorySidebar({ categories, activeCategory, onSelect, getCount, itemsWithoutCategoryCount, showSidebar, onClose }) {
  return (
    <>
      {showSidebar && (
        <div
          className="md:hidden fixed inset-0 z-30 bg-black/50"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-40 w-72 bg-card border-r border-border
        transform transition-transform duration-200 ease-in-out
        ${showSidebar ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0 md:z-0 md:flex md:flex-col md:flex-shrink-0
        overflow-y-auto
      `}>
        <div className="p-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted pb-4 opacity-60">
            Categorias
          </div>

          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`
                w-full flex items-center justify-between px-5 py-3.5 text-left text-base font-medium transition-colors
                border-l-3 border-l-transparent border-b border-border/20 last:border-b-0
                ${activeCategory === cat.id
                  ? 'bg-primary/10 text-primary border-l-primary font-semibold'
                  : 'text-text hover:bg-white/5 hover:text-primary'
                }
              `}
              onClick={() => {
                onSelect(cat.id);
                onClose();
              }}
            >
              <span>{cat.name}</span>
              <span className={`text-xs font-normal ${activeCategory === cat.id ? 'text-primary/70' : 'text-muted/50'}`}>
                {getCount(cat.id)}
              </span>
            </button>
          ))}

          {itemsWithoutCategoryCount > 0 && (
            <button
              className={`
                w-full flex items-center justify-between px-5 py-3.5 text-left text-base font-medium transition-colors
                border-l-3 border-l-transparent
                ${activeCategory === 'other'
                  ? 'bg-primary/10 text-primary border-l-primary font-semibold'
                  : 'text-text hover:bg-white/5 hover:text-primary'
                }
              `}
              onClick={() => {
                onSelect('other');
                onClose();
              }}
            >
              <span>Otros</span>
              <span className={`text-xs font-normal ${activeCategory === 'other' ? 'text-primary/70' : 'text-muted/50'}`}>
                {itemsWithoutCategoryCount}
              </span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
}