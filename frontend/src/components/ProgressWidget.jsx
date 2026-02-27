import React from 'react';
import { Clock, AlertCircle } from 'lucide-react';

const PRIORITY_COLOR = {
  High:   'bg-lex-danger/10 text-lex-danger',
  Medium: 'bg-lex-warning/10 text-lex-warning',
  Low:    'bg-lex-success/10 text-lex-success',
};

const PROGRESS_COLOR = (pct) => {
  if (pct >= 75) return 'bg-lex-success';
  if (pct >= 40) return 'bg-gold';
  return 'bg-lex-danger';
};

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—';

const isOverdue = (d) => d && new Date(d) < new Date();

export default function ProgressWidget({ tasks = [] }) {
  return (
    <div className="card p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading text-lg font-semibold text-lex-text">Task Progress</h3>
        <span className="text-xs text-lex-muted bg-navy-700 px-2.5 py-1 rounded-full border border-navy-600">
          {tasks.length} active
        </span>
      </div>

      {tasks.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-lex-muted text-sm">No pending tasks</p>
        </div>
      ) : (
        <ul className="space-y-4 flex-1 overflow-y-auto scrollbar-hide">
          {tasks.map((task) => {
            const pct = task.completionPercentage ?? 0;
            const overdue = isOverdue(task.dueDate);
            return (
              <li key={task._id} className="group">
                {/* Title row */}
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-lex-text truncate">{task.title}</p>
                    {task.caseId && (
                      <p className="text-xs text-lex-muted truncate">
                        {task.caseId.caseNumber} · {task.caseId.title}
                      </p>
                    )}
                  </div>
                  <span className={`badge shrink-0 ${PRIORITY_COLOR[task.priority]}`}>
                    {task.priority}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="h-1.5 bg-navy-600 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${PROGRESS_COLOR(pct)}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                {/* Meta row */}
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-lex-muted">{pct}% complete</span>
                  <span className={`flex items-center gap-1 text-xs
                    ${overdue ? 'text-lex-danger' : 'text-lex-muted'}`}>
                    {overdue ? <AlertCircle size={11} /> : <Clock size={11} />}
                    {fmtDate(task.dueDate)}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
