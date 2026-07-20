export default function CategoryTabs({ categories, activeCategory, onSelect, itemsWithoutCategoryCount }) {
  return (
    <nav className="flex gap-2.5 px-4 py-3 overflow-x-auto bg-card sticky top-[50px] z-10 border-b border-border md:hidden" style={{ scrollbarWidth: 'none' }}>
      {categories.map((cat) => (
        <button
          key={cat.id}
          className={`
            flex-shrink-0 border-2 rounded-xl px-4.5 py-2.5 text-base font-medium transition-all
            ${activeCategory === cat.id
              ? 'bg-primary border-primary text-white shadow-[0_2px_8px_rgba(217,72,15,0.3)]'
              : 'bg-bg border-border text-text hover:border-primary hover:text-primary'
            }
          `}
          onClick={() => onSelect(cat.id)}
        >
          {cat.name}
        </button>
      ))}
      {itemsWithoutCategoryCount > 0 && (
        <button
          className={`
            flex-shrink-0 border-2 rounded-xl px-4.5 py-2.5 text-base font-medium transition-all
            ${activeCategory === 'other'
              ? 'bg-primary border-primary text-white shadow-[0_2px_8px_rgba(217,72,15,0.3)]'
              : 'bg-bg border-border text-text hover:border-primary hover:text-primary'
            }
          `}
          onClick={() => onSelect('other')}
        >
          Otros
        </button>
      )}
    </nav>
  );
}