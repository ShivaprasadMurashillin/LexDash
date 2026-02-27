import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Pencil, Trash2, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { CASE_STATUS_BADGE as STATUS_BADGE, CASE_PRIORITY_BADGE as PRIORITY_BADGE } from '../utils/badgeStyles';

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

const PRIORITY_ORDER = { High: 0, Medium: 1, Low: 2 };
const STATUS_ORDER   = { Active: 0, Pending: 1, 'On Hold': 2, Closed: 3 };

const SORTABLE = ['Title', 'Status', 'Priority', 'Court Date'];

/* ── Skeleton Loader ──────────────────────────────────────────────────────── */
function SkeletonRow() {
  return (
    <tr className="border-b border-navy-600 animate-pulse">
      {Array.from({ length: 9 }).map((_, i) => (
        <td key={i} className="table-cell">
          <div className="h-4 bg-navy-700 rounded w-3/4" />
        </td>
      ))}
    </tr>
  );
}

/* ── Empty State ──────────────────────────────────────────────────────────── */
function EmptyState() {
  return (
    <tr>
      <td colSpan={9} className="py-16 text-center text-lex-muted">
        <div className="flex flex-col items-center gap-2">
          <span className="text-4xl">⚖️</span>
          <p className="font-medium text-lex-text">No cases found</p>
          <p className="text-sm">Try adjusting your search or add a new case.</p>
        </div>
      </td>
    </tr>
  );
}

export default function CaseTable({ cases = [], loading, onEdit, onDelete, onView }) {
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');

  const handleSort = (col) => {
    if (!SORTABLE.includes(col)) return;
    if (sortKey === col) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(col); setSortDir('asc'); }
  };

  const sorted = useMemo(() => {
    if (!sortKey) return cases;
    return [...cases].sort((a, b) => {
      let av, bv;
      if (sortKey === 'Title')      { av = a.title ?? ''; bv = b.title ?? ''; }
      if (sortKey === 'Status')     { av = STATUS_ORDER[a.status] ?? 9; bv = STATUS_ORDER[b.status] ?? 9; return sortDir === 'asc' ? av - bv : bv - av; }
      if (sortKey === 'Priority')   { av = PRIORITY_ORDER[a.priority] ?? 9; bv = PRIORITY_ORDER[b.priority] ?? 9; return sortDir === 'asc' ? av - bv : bv - av; }
      if (sortKey === 'Court Date') { av = a.courtDate ? new Date(a.courtDate) : new Date(0); bv = b.courtDate ? new Date(b.courtDate) : new Date(0); return sortDir === 'asc' ? av - bv : bv - av; }
      return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    });
  }, [cases, sortKey, sortDir]);

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px]">
        <thead>
          <tr className="border-b border-navy-600 bg-navy-700/40">
            {['Case #', 'Title', 'Type', 'Client', 'Attorney', 'Status', 'Priority', 'Court Date', 'Actions'].map(
              (h) => {
                const isSortable = SORTABLE.includes(h);
                const isActive   = sortKey === h;
                const Icon = isActive ? (sortDir === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown;
                return (
                  <th
                    key={h}
                    className={`table-header text-left ${isSortable ? 'cursor-pointer select-none hover:text-lex-text' : ''}`}
                    onClick={() => handleSort(h)}
                  >
                    <span className="flex items-center gap-1">
                      {h}
                      {isSortable && (
                        <Icon size={11} className={isActive ? 'text-gold opacity-100' : 'opacity-40'} />
                      )}
                    </span>
                  </th>
                );
              }
            )}
          </tr>
        </thead>
        <tbody>
          {loading
            ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
            : cases.length === 0
            ? <EmptyState />
            : sorted.map((c) => (
                <tr key={c._id} className="table-row">
                  <td className="table-cell font-mono text-xs">
                    <Link to={`/cases/${c._id}`} className="text-gold hover:underline">{c.caseNumber}</Link>
                  </td>
                  <td className="table-cell font-medium">
                    <Link to={`/cases/${c._id}`} className="hover:text-lex-gold transition-colors" title={c.title}>{c.title}</Link>
                  </td>
                  <td className="table-cell">
                    <span className="badge bg-navy-700 text-lex-muted border border-navy-600">
                      {c.type}
                    </span>
                  </td>
                  <td className="table-cell text-lex-muted">
                    <span>{c.clientId?.name ?? '—'}</span>
                  </td>
                  <td className="table-cell text-lex-muted">
                    <span>{c.assignedAttorney ?? '—'}</span>
                  </td>
                  <td className="table-cell">
                    <span className={`badge border ${STATUS_BADGE[c.status] ?? 'bg-navy-700 text-lex-muted'}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="table-cell">
                    <span className={`badge border ${PRIORITY_BADGE[c.priority] ?? ''}`}>
                      {c.priority}
                    </span>
                  </td>
                  <td className="table-cell text-lex-muted text-xs">{fmtDate(c.courtDate)}</td>
                  <td className="table-cell">
                    <div className="flex items-center gap-1">
                      {onView && (
                        <button onClick={() => onView(c)} className="btn-icon" title="View">
                          <Eye size={15} />
                        </button>
                      )}
                      <button onClick={() => onEdit(c)} className="btn-icon" title="Edit">
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => onDelete(c)}
                        className="btn-icon hover:text-lex-danger hover:bg-lex-danger/10"
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
        </tbody>
      </table>
    </div>
  );
}
