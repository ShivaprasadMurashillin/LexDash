import React from 'react';
import { Pencil, Trash2, AlertTriangle, Eye, ExternalLink } from 'lucide-react';

const STATUS_BADGE = {
  Draft:           'bg-navy-600      text-lex-muted   border-navy-500',
  'Pending Review':'bg-lex-warning/10 text-lex-warning border-lex-warning/20',
  Reviewed:        'bg-lex-info/10   text-lex-info    border-lex-info/20',
  Approved:        'bg-lex-success/10 text-lex-success border-lex-success/20',
  Filed:           'bg-gold/10        text-gold         border-gold/20',
};

const TYPE_ICON = {
  Contract: '📄', Affidavit: '✍️', Motion: '⚖️',
  Brief: '📋', Evidence: '🔍', Subpoena: '📮', Order: '🔔',
};

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

const isOverdue = (d) => d && new Date(d) < new Date();

function SkeletonRow() {
  return (
    <tr className="border-b border-navy-600 animate-pulse">
      {Array.from({ length: 7 }).map((_, i) => (
        <td key={i} className="table-cell"><div className="h-4 bg-navy-700 rounded w-3/4" /></td>
      ))}
    </tr>
  );
}

function EmptyState() {
  return (
    <tr>
      <td colSpan={7} className="py-16 text-center text-lex-muted">
        <div className="flex flex-col items-center gap-2">
          <span className="text-4xl">📁</span>
          <p className="font-medium text-lex-text">No documents found</p>
          <p className="text-sm">Upload your first document to get started.</p>
        </div>
      </td>
    </tr>
  );
}

export default function DocumentTable({ documents = [], loading, onEdit, onDelete, onView }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[800px]">
        <thead>
          <tr className="border-b border-navy-600 bg-navy-700/40">
            {['Title', 'Case', 'Type', 'Status', 'Uploaded By', 'Deadline', 'Actions'].map((h) => (
              <th key={h} className="table-header text-left">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading
            ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
            : documents.length === 0
            ? <EmptyState />
            : documents.map((doc) => {
                const overdue = isOverdue(doc.deadline);
                return (
                  <tr key={doc._id} className="table-row">
                    <td className="table-cell font-medium max-w-[200px]">
                      <button
                        onClick={() => onView(doc)}
                        className="flex items-center gap-2 text-left hover:text-gold transition-colors group"
                        title="View document"
                      >
                        <span>{TYPE_ICON[doc.type] ?? '📄'}</span>
                        <span className="group-hover:underline underline-offset-2">{doc.title}</span>
                      </button>
                    </td>
                    <td className="table-cell text-lex-muted text-xs">
                      {doc.caseId ? (
                        <div>
                          <p className="font-mono text-gold">{doc.caseId.caseNumber}</p>
                          <p>{doc.caseId.title}</p>
                        </div>
                      ) : '—'}
                    </td>
                    <td className="table-cell">
                      <span className="badge bg-navy-700 text-lex-muted border border-navy-600">{doc.type}</span>
                    </td>
                    <td className="table-cell">
                      <span className={`badge border ${STATUS_BADGE[doc.status] ?? 'bg-navy-700 text-lex-muted'}`}>
                        {doc.status}
                      </span>
                    </td>
                    <td className="table-cell text-lex-muted">
                      <span>{doc.uploadedBy ?? '—'}</span>
                    </td>
                    <td className="table-cell">
                      <span className={`flex items-center gap-1 text-xs
                        ${overdue ? 'text-lex-danger font-semibold' : 'text-lex-muted'}`}>
                        {overdue && <AlertTriangle size={12} />}
                        {fmtDate(doc.deadline)}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onView(doc)}
                          className="btn-icon hover:text-gold"
                          title={doc.fileUrl ? 'Open file' : 'View details'}
                        >
                          {doc.fileUrl ? <ExternalLink size={15} /> : <Eye size={15} />}
                        </button>
                        <button onClick={() => onEdit(doc)} className="btn-icon" title="Edit">
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => onDelete(doc)}
                          className="btn-icon hover:text-lex-danger hover:bg-lex-danger/10"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
        </tbody>
      </table>
    </div>
  );
}
