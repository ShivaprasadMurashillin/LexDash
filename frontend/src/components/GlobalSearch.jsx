import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Briefcase, FileText, CheckSquare, Users, ArrowRight, Loader2 } from 'lucide-react';
import { searchAPI } from '../api';

/* ── Kind config ─────────────────────────────────────────────────────────── */
const KIND = {
  case:     { icon: Briefcase,    label: 'Cases',      route: (id) => `/cases/${id}`,     color: 'text-blue-400' },
  client:   { icon: Users,        label: 'Clients',    route: () => '/clients',            color: 'text-lex-gold' },
  document: { icon: FileText,     label: 'Documents',  route: () => '/documents',          color: 'text-lex-warning' },
  task:     { icon: CheckSquare,  label: 'Tasks',      route: () => '/tasks',              color: 'text-lex-success' },
};

/* ── Group results by kind ────────────────────────────────────────────────── */
function groupBy(arr, key) {
  return arr.reduce((acc, item) => {
    (acc[item[key]] = acc[item[key]] || []).push(item);
    return acc;
  }, {});
}

/* ── Result Item ─────────────────────────────────────────────────────────── */
function ResultItem({ item, isActive, onClick }) {
  const cfg  = KIND[item.kind];
  if (!cfg) return null;
  const Icon = cfg.icon;
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors
        ${isActive ? 'bg-navy-600' : 'hover:bg-navy-700/70'}`}
    >
      <Icon size={15} className={`shrink-0 ${cfg.color}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-lex-text truncate">{item.label}</p>
        {item.sub && <p className="text-xs text-lex-muted truncate">{item.sub}</p>}
      </div>
      <ArrowRight size={13} className="text-lex-muted shrink-0 opacity-0 group-hover:opacity-100" />
    </button>
  );
}

/* ── GlobalSearch Component ───────────────────────────────────────────────── */
export default function GlobalSearch({ isOpen, onClose }) {
  const navigate   = useNavigate();
  const inputRef   = useRef(null);
  const listRef    = useRef(null);
  const debounce   = useRef(null);

  const [query,   setQuery]   = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [active,  setActive]  = useState(-1);

  // Flat list for keyboard nav
  const flatResults = results;

  /* ── Focus input on open ─────────────────────────────────────────────── */
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setResults([]);
      setActive(-1);
    }
  }, [isOpen]);

  /* ── Fetch on query change ───────────────────────────────────────────── */
  const doSearch = useCallback(async (q) => {
    if (!q.trim()) { setResults([]); setLoading(false); return; }
    setLoading(true);
    try {
      const { data } = await searchAPI.search(q);
      setResults(data.data || []);
      setActive(-1);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => doSearch(val), 250);
  };

  /* ── Navigate to result ──────────────────────────────────────────────── */
  const handleSelect = (item) => {
    const cfg = KIND[item.kind];
    if (!cfg) return;
    navigate(cfg.route(item.id));
    onClose();
  };

  /* ── Keyboard navigation ─────────────────────────────────────────────── */
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') { onClose(); return; }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, flatResults.length - 1));
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    }
    if (e.key === 'Enter' && active >= 0 && flatResults[active]) {
      handleSelect(flatResults[active]);
    }
  };

  if (!isOpen) return null;

  const grouped = groupBy(results, 'kind');

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center pt-24 px-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-navy-900/70 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-xl bg-navy-800 border border-navy-600 rounded-2xl shadow-modal overflow-hidden animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-navy-600">
          {loading
            ? <Loader2 size={18} className="text-lex-muted animate-spin shrink-0" />
            : <Search size={18} className="text-lex-muted shrink-0" />
          }
          <input
            ref={inputRef}
            value={query}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Search cases, clients, documents, tasks…"
            className="flex-1 bg-transparent text-sm text-lex-text placeholder-lex-muted/60 outline-none"
          />
          {query && (
            <button onClick={() => { setQuery(''); setResults([]); inputRef.current?.focus(); }}
              className="text-lex-muted hover:text-lex-text transition-colors">
              <X size={16} />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded border border-navy-500 text-[10px] text-lex-muted font-mono">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[420px] overflow-y-auto">
          {!query && (
            <div className="px-4 py-8 text-center text-sm text-lex-muted">
              Start typing to search across all records
            </div>
          )}

          {query && !loading && results.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-lex-muted">
              No results for <span className="text-lex-text">"{query}"</span>
            </div>
          )}

          {Object.entries(grouped).map(([kind, items]) => {
            const cfg = KIND[kind];
            if (!cfg) return null;
            const Icon = cfg.icon;
            return (
              <div key={kind}>
                {/* Group header */}
                <div className="flex items-center gap-2 px-4 pt-3 pb-1.5">
                  <Icon size={12} className={cfg.color} />
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-lex-muted">
                    {cfg.label}
                  </span>
                </div>
                {items.map((item) => {
                  const globalIdx = flatResults.indexOf(item);
                  return (
                    <ResultItem
                      key={item.id}
                      item={item}
                      isActive={active === globalIdx}
                      onClick={() => handleSelect(item)}
                    />
                  );
                })}
              </div>
            );
          })}

          {results.length > 0 && (
            <div className="px-4 py-2.5 border-t border-navy-700 flex items-center justify-between text-[10px] text-lex-muted">
              <span>{results.length} result{results.length > 1 ? 's' : ''}</span>
              <span className="flex items-center gap-1.5">
                <kbd className="px-1 py-0.5 rounded border border-navy-500 font-mono">↑↓</kbd> navigate
                <kbd className="px-1 py-0.5 rounded border border-navy-500 font-mono ml-1">↵</kbd> open
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
