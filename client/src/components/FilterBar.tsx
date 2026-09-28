import React from 'react';
import { Search, SlidersHorizontal, X, Heart } from 'lucide-react';

export type PriceFilter = 'all' | 'under-50' | '50-150' | '150-300' | 'over-300';
export type SortOption = 'recent' | 'price-asc' | 'price-desc' | 'priority';

interface FilterBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  selectedCategory: string;
  onCategoryChange: (val: string) => void;
  categories: string[];
  selectedPrice: PriceFilter;
  onPriceChange: (val: PriceFilter) => void;
  onlyFavorites: boolean;
  onToggleFavorites: () => void;
  sortOption: SortOption;
  onSortChange: (val: SortOption) => void;
  totalFiltered: number;
  onReset: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  search,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories,
  selectedPrice,
  onPriceChange,
  onlyFavorites,
  onToggleFavorites,
  sortOption,
  onSortChange,
  totalFiltered,
  onReset,
}) => {
  const hasActiveFilters =
    search.trim() !== '' ||
    selectedCategory !== 'all' ||
    selectedPrice !== 'all' ||
    onlyFavorites ||
    sortOption !== 'recent';

  const priceOptions: { label: string; value: PriceFilter }[] = [
    { label: 'Todos os preços', value: 'all' },
    { label: 'Até R$ 50', value: 'under-50' },
    { label: 'R$ 50 a R$ 150', value: '50-150' },
    { label: 'R$ 150 a R$ 300', value: '150-300' },
    { label: 'Acima de R$ 300', value: 'over-300' },
  ];

  return (
    <section className="bg-surface rounded-2xl p-4 sm:p-6 border border-border shadow-paper space-y-4 sm:space-y-5 transition-colors duration-200">
      {/* Search Input, Counter & Sorting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5 sm:gap-4 pb-3.5 sm:pb-4 border-b border-border">
        {/* Search */}
        <div className="relative flex-1 w-full md:max-w-md">
          <Search className="w-4 h-4 text-on-surface-variant absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por nome ou detalhe..."
            className="w-full h-11 pl-10 pr-4 bg-surface-low border border-border rounded-xl text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Counter & Sort */}
        <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto">
          <div className="text-xs sm:text-sm text-on-surface font-medium flex items-center gap-1.5 shrink-0">
            <span className="w-2 h-2 rounded-full bg-primary inline-block" />
            <span>{totalFiltered} {totalFiltered === 1 ? 'item' : 'itens'}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-on-surface-variant hidden sm:inline" />
            <select
              value={sortOption}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="h-9 px-2.5 sm:px-3 bg-surface-low border border-border rounded-xl text-xs sm:text-sm text-on-surface focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value="recent">Mais recentes</option>
              <option value="priority">Favoritos primeiro</option>
              <option value="price-asc">Menor preço</option>
              <option value="price-desc">Maior preço</option>
            </select>
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="space-y-2">
        <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Categorias</span>
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1 sm:flex-wrap">
          <button
            onClick={() => onCategoryChange('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium shrink-0 whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-primary text-white shadow-sm'
                : 'bg-surface-low text-on-surface-variant hover:text-on-surface hover:bg-surface-container border border-border'
            }`}
          >
            Todas as categorias
          </button>

          {/* Quick Filter: Favoritos */}
          <button
            onClick={onToggleFavorites}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium shrink-0 whitespace-nowrap transition-all flex items-center gap-1.5 ${
              onlyFavorites
                ? 'bg-favorite text-white shadow-sm ring-2 ring-favorite/40'
                : 'bg-favorite-subtle text-favorite hover:bg-favorite/15 border border-favorite-border dark:bg-favorite-subtle dark:text-favorite dark:border-favorite/30'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-white text-white' : 'fill-favorite text-favorite'}`} />
            <span>Favoritos</span>
          </button>

          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium shrink-0 whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-surface-low text-on-surface-variant hover:text-on-surface hover:bg-surface-container border border-border'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Price Filter */}
      <div className="space-y-2 pt-2 border-t border-border/60">
        <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Faixa de Preço</span>
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1 sm:flex-wrap">
          {priceOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onPriceChange(opt.value)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium shrink-0 whitespace-nowrap transition-all ${
                selectedPrice === opt.value
                  ? 'bg-emerald-100/90 text-emerald-950 border border-emerald-300 font-semibold dark:bg-primary/20 dark:text-primary dark:border-primary/40'
                  : 'bg-surface-low text-on-surface-variant hover:bg-surface-container border border-border'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Reset Filters Option if any filter is active */}
      {hasActiveFilters && (
        <div className="pt-2 flex justify-end">
          <button
            onClick={onReset}
            className="text-xs text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1"
          >
            <X className="w-3.5 h-3.5" />
            <span>Limpar filtros</span>
          </button>
        </div>
      )}
    </section>
  );
};
