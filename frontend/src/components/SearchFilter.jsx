import React from 'react';
import { Search, Filter, X } from 'lucide-react';

/**
 * SearchFilter – reusable search + multi-dropdown filter bar
 *
 * Props:
 *   searchValue    – controlled search string
 *   onSearch       – (value: string) => void
 *   filters        – [{ key, label, options: [{ value, label }] }]
 *   activeFilters  – { [key]: value }
 *   onFilter       – ({ key, value }) => void
 *   onClear        – () => void
 */
export default function SearchFilter({
  searchValue = '',
  onSearch,
  filters = [],
  activeFilters = {},
  onFilter,
  onClear,
  placeholder = 'Search…',
}) {
  const hasActive =
    searchValue.length > 0 || Object.values(activeFilters).some(Boolean);

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search input */}
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-lex-muted pointer-events-none"
        />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearch(e.target.value)}
          placeholder={placeholder}
          className="input pl-9 pr-3"
        />
      </div>

      {/* Dropdown filters */}
      {filters.map(({ key, label, options }) => (
        <div key={key} className="relative">
          <Filter
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-lex-muted pointer-events-none"
          />
          <select
            value={activeFilters[key] || ''}
            onChange={(e) => onFilter({ key, value: e.target.value })}
            className="select pl-8 pr-8 text-sm min-w-[140px]"
          >
            <option value="">All {label}s</option>
            {options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      ))}

      {/* Clear */}
      {hasActive && onClear && (
        <button
          onClick={onClear}
          className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg
                     text-xs text-lex-muted hover:text-lex-danger hover:bg-lex-danger/10
                     border border-navy-600 transition-colors duration-200"
        >
          <X size={13} />
          Clear
        </button>
      )}
    </div>
  );
}
