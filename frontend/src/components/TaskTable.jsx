import React from 'react';
import { Pencil, Trash2, AlertCircle } from 'lucide-react';

const STATUS_BADGE = {
  'To Do':      'bg-navy-600       text-lex-muted    border-navy-500',
  'In Progress':'bg-lex-info/10    text-lex-info     border-lex-info/20',
  Completed:    'bg-lex-success/10 text-lex-success  border-lex-success/20',
  Overdue:      'bg-lex-danger/10  text-lex-danger   border-lex-danger/20',
};

const PRIORITY_BADGE = {
  High:   'bg-lex-danger/10  text-lex-danger  border-lex-danger/20',
  Medium: 'bg-lex-warning/10 text-lex-warning border-lex-warning/20',
  Low:    'bg-lex-success/10 text-lex-success border-lex-success/20',
};

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

const isOverdue = (d) => d && new Date(d) < new Date();

function SkeletonRow() {
  return (
    <tr className="border-b border-navy-600 animate-pulse">
      {Array.from({ length: 8 }).map((_, i) => (
        <td key={i} className="table-cell"><div className="h-4 bg-navy-700 rounded w-3/4" /></td>
      ))}
    </tr>
  );
}

function EmptyState() {
  return (
    <tr>
      <td colSpan={8} className="py-16 text-center text-lex-muted">
        <div className="flex flex-col items-center gap-2">
          <span className="text-4xl">✅</span>
          <p className="font-medium text-lex-text">No tasks found</p>
          <p className="text-sm">Create your first task to start tracking work.</p>
        </div>
      </td>
    </tr>
  );
}

export default function TaskTable({ tasks = [], loading, onEdit, onDelete }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[860px]">
        <thead>
          <tr className="border-b border-navy-600 bg-navy-700/40">
            {['Title', 'Case', 'Assigned To', 'Priority', 'Status', 'Progress', 'Due Date', 'Actions'].map((h) => (
              <th key={h} className="table-header text-left">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading
            ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
            : tasks.length === 0
            ? <EmptyState />
            : tasks.map((task) => {
                const pct = task.completionPercentage ?? 0;
                const overdue = isOverdue(task.dueDate) && task.status !== 'Completed';
                return (
                  <tr key={task._id} className="table-row">
                    <td className="table-cell font-medium">
                      <p title={task.title}>{task.title}</p>
                    </td>
                    <td className="table-cell text-lex-muted text-xs">
                      {task.caseId ? (
                        <div>
                          <p className="font-mono text-gold">{task.caseId.caseNumber}</p>
                        </div>
                      ) : '—'}
                    </td>
                    <td className="table-cell text-lex-muted">
                      <span>{task.assignedTo ?? '—'}</span>
                    </td>
                    <td className="table-cell">
                      <span className={`badge border ${PRIORITY_BADGE[task.priority] ?? ''}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className={`badge border ${STATUS_BADGE[task.status] ?? 'bg-navy-700 text-lex-muted'}`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="table-cell min-w-[120px]">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-navy-600 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              pct >= 75 ? 'bg-lex-success' : pct >= 40 ? 'bg-gold' : 'bg-lex-danger'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs text-lex-muted w-8 text-right">{pct}%</span>
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className={`flex items-center gap-1 text-xs ${overdue ? 'text-lex-danger' : 'text-lex-muted'}`}>
                        {overdue && <AlertCircle size={12} />}
                        {fmtDate(task.dueDate)}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1">
                        <button onClick={() => onEdit(task)} className="btn-icon" title="Edit">
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => onDelete(task)}
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
