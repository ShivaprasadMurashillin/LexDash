import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Pagination – reusable sliding-window pagination control.
 * Shows up to `windowSize` page buttons centered around the current page.
 */
export default function Pagination({ page, totalPages, onPageChange, windowSize = 5 }) {
  if (totalPages <= 1) return null;

  // Build sliding page window centered on current page
  const half  = Math.floor(windowSize / 2);
  let start   = Math.max(1, page - half);
  let end     = Math.min(totalPages, start + windowSize - 1);
  // Adjust start if we're near the end
  if (end - start + 1 < windowSize) {
    start = Math.max(1, end - windowSize + 1);
  }

  const pages = [];
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-navy-600">
      <p className="text-xs text-lex-muted">
        Page {page} of {totalPages}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="btn-icon disabled:opacity-30"
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
        </button>

        {/* First page + ellipsis */}
        {start > 1 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              className="w-8 h-8 rounded-lg text-xs font-semibold text-lex-muted hover:bg-navy-700 transition-colors"
            >
              1
            </button>
            {start > 2 && (
              <span className="w-6 text-center text-xs text-lex-muted">…</span>
            )}
          </>
        )}

        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
              p === page
                ? 'bg-gold text-navy-900'
                : 'text-lex-muted hover:bg-navy-700'
            }`}
          >
            {p}
          </button>
        ))}

        {/* Last page + ellipsis */}
        {end < totalPages && (
          <>
            {end < totalPages - 1 && (
              <span className="w-6 text-center text-xs text-lex-muted">…</span>
            )}
            <button
              onClick={() => onPageChange(totalPages)}
              className="w-8 h-8 rounded-lg text-xs font-semibold text-lex-muted hover:bg-navy-700 transition-colors"
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="btn-icon disabled:opacity-30"
          aria-label="Next page"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}