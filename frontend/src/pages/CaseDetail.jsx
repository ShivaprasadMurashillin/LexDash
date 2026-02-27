import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Briefcase, FileText, CheckSquare,
  User, Calendar, AlertTriangle, Clock, ExternalLink,
  Loader2, Circle,
} from 'lucide-react';
import { casesAPI, documentsAPI, tasksAPI } from '../api';

/* ── Helpers ────────────────────────────────────────────────────────────── */
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

const daysUntil = (d) => Math.ceil((new Date(d) - new Date()) / 86400000);

const STATUS_DOT = {
  Active:  'bg-lex-success',
  Pending: 'bg-lex-warning',
  Closed:  'bg-lex-muted',
  'On Hold':'bg-lex-danger',
};

const PRIORITY_COLOR = {
  High:   'text-lex-danger bg-lex-danger/10 border-lex-danger/30',
  Medium: 'text-lex-warning bg-lex-warning/10 border-lex-warning/30',
  Low:    'text-lex-success bg-lex-success/10 border-lex-success/30',
};

const TASK_STATUS_COLOR = {
  'To Do':      'text-lex-muted   bg-navy-700',
  'In Progress':'text-lex-warning bg-lex-warning/10',
  'Completed':  'text-lex-success bg-lex-success/10',
  'Overdue':    'text-lex-danger  bg-lex-danger/10',
};

const DOC_STATUS_COLOR = {
  Draft:           'text-lex-muted',
  'Pending Review':'text-lex-warning',
  Reviewed:        'text-blue-400',
  Approved:        'text-lex-success',
  Filed:           'text-lex-gold',
};

/* ── Info Row ────────────────────────────────────────────────────────────── */
function InfoRow({ label, value, accent }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] text-lex-muted uppercase tracking-wider">{label}</span>
      <span className={`text-sm font-medium ${accent || 'text-lex-text'}`}>{value || '—'}</span>
    </div>
  );
}

/* ── Tab Button ────────────────────────────────────────────────────────────── */
function Tab({ label, icon: Icon, count, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors
        ${active
          ? 'border-lex-gold text-lex-gold'
          : 'border-transparent text-lex-muted hover:text-lex-text'
        }`}
    >
      <Icon size={15} />
      {label}
      {count !== undefined && (
        <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold
          ${active ? 'bg-lex-gold/20 text-lex-gold' : 'bg-navy-600 text-lex-muted'}`}>
          {count}
        </span>
      )}
    </button>
  );
}

/* ── Documents Tab ─────────────────────────────────────────────────────────── */
function DocumentsTab({ docs }) {
  if (docs.length === 0) {
    return (
      <div className="flex flex-col items-center py-16 gap-3 text-lex-muted">
        <FileText size={32} className="opacity-30" />
        <p className="text-sm">No documents linked to this case</p>
        <Link to="/documents" className="text-xs text-lex-gold hover:underline">Go to Documents →</Link>
      </div>
    );
  }
  return (
    <div className="space-y-2">
      {docs.map((d) => {
        const overdue = d.deadline && daysUntil(d.deadline) < 0;
        const soon    = d.deadline && daysUntil(d.deadline) >= 0 && daysUntil(d.deadline) <= 7;
        return (
          <div key={d._id} className="flex items-center gap-4 px-4 py-3 rounded-lg bg-navy-700/50 border border-navy-600 hover:border-navy-500 transition-colors">
            <FileText size={16} className="text-lex-gold shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-lex-text truncate">{d.title}</p>
              <p className="text-xs text-lex-muted">{d.type} · <span className={DOC_STATUS_COLOR[d.status]}>{d.status}</span></p>
            </div>
            {d.deadline && (
              <div className={`flex items-center gap-1 text-xs shrink-0 ${overdue ? 'text-lex-danger' : soon ? 'text-lex-warning' : 'text-lex-muted'}`}>
                {(overdue || soon) && <AlertTriangle size={12} />}
                {fmtDate(d.deadline)}
              </div>
            )}
            {d.fileUrl && (
              <a href={d.fileUrl} target="_blank" rel="noreferrer"
                 className="p-1.5 rounded-lg text-lex-muted hover:text-lex-gold hover:bg-navy-600 transition-colors shrink-0">
                <ExternalLink size={14} />
              </a>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Tasks Tab ─────────────────────────────────────────────────────────────── */
function TasksTab({ tasks }) {
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center py-16 gap-3 text-lex-muted">
        <CheckSquare size={32} className="opacity-30" />
        <p className="text-sm">No tasks linked to this case</p>
        <Link to="/tasks" className="text-xs text-lex-gold hover:underline">Go to Tasks →</Link>
      </div>
    );
  }
  return (
    <div className="space-y-2">
      {tasks.map((t) => {
        const overdue = t.dueDate && daysUntil(t.dueDate) < 0 && t.status !== 'Completed';
        const days    = t.dueDate ? daysUntil(t.dueDate) : null;
        return (
          <div key={t._id} className="flex items-center gap-4 px-4 py-3 rounded-lg bg-navy-700/50 border border-navy-600 hover:border-navy-500 transition-colors">
            {/* Progress ring-ish */}
            <div className="relative w-9 h-9 shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15" fill="none" stroke="#1e3a5f" strokeWidth="3" />
                <circle cx="18" cy="18" r="15" fill="none"
                  stroke={t.status === 'Completed' ? '#22c55e' : '#f59e0b'}
                  strokeWidth="3"
                  strokeDasharray={`${(t.completionPercentage || 0) * 94.2 / 100} 94.2`} />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-lex-text">
                {t.completionPercentage || 0}%
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-lex-text truncate">{t.title}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${TASK_STATUS_COLOR[t.status]}`}>{t.status}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded border ${PRIORITY_COLOR[t.priority]}`}>{t.priority}</span>
                {t.assignedTo && <span className="text-xs text-lex-muted truncate">· {t.assignedTo}</span>}
              </div>
            </div>

            {t.dueDate && (
              <div className={`flex items-center gap-1 text-xs shrink-0
                ${overdue ? 'text-lex-danger' : days <= 7 ? 'text-lex-warning' : 'text-lex-muted'}`}>
                {overdue ? <AlertTriangle size={12} /> : <Clock size={12} />}
                {fmtDate(t.dueDate)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Case Detail Page ─────────────────────────────────────────────────────── */
export default function CaseDetail() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const [caseData, setCase]  = useState(null);
  const [docs,     setDocs]  = useState([]);
  const [tasks,    setTasks] = useState([]);
  const [loading,  setLoad]  = useState(true);
  const [tab,      setTab]   = useState('overview');

  useEffect(() => {
    const load = async () => {
      try {
        setLoad(true);
        const [caseRes, docsRes, tasksRes] = await Promise.all([
          casesAPI.getById(id),
          documentsAPI.getAll({ caseId: id, limit: 100 }),
          tasksAPI.getAll({ caseId: id, limit: 100 }),
        ]);
        setCase(caseRes.data.data);
        setDocs(docsRes.data.data || []);
        setTasks(tasksRes.data.data || []);
      } catch (err) {
        toast.error('Failed to load case');
        navigate('/cases');
      } finally {
        setLoad(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 gap-3 text-lex-muted">
        <Loader2 size={22} className="animate-spin text-lex-gold" />
        <span className="text-sm">Loading case…</span>
      </div>
    );
  }

  if (!caseData) return null;

  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const taskProgress   = tasks.length ? Math.round((completedTasks / tasks.length) * 100) : 0;
  const overdueDocs    = docs.filter(d => d.deadline && daysUntil(d.deadline) < 0).length;
  const overdueTasks   = tasks.filter(t => t.dueDate && daysUntil(t.dueDate) < 0 && t.status !== 'Completed').length;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Back button + title */}
      <div className="flex items-start gap-4">
        <button onClick={() => navigate('/cases')}
          className="btn-icon mt-0.5 shrink-0">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-xs font-mono text-lex-gold bg-lex-gold/10 px-2 py-0.5 rounded">
              {caseData.caseNumber}
            </span>
            {caseData.status && (
              <span className={`flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full bg-navy-700`}>
                <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[caseData.status]}`} />
                <span className="text-lex-text">{caseData.status}</span>
              </span>
            )}
            {caseData.priority && (
              <span className={`text-xs px-2 py-0.5 rounded border font-medium ${PRIORITY_COLOR[caseData.priority]}`}>
                {caseData.priority}
              </span>
            )}
          </div>
          <h1 className="font-heading text-xl font-bold text-lex-text mt-1 leading-tight">{caseData.title}</h1>
        </div>
      </div>

      {/* Summary stat strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Documents',    value: docs.length,    icon: FileText,    accent: 'text-lex-gold' },
          { label: 'Tasks',        value: tasks.length,   icon: CheckSquare, accent: 'text-lex-warning' },
          { label: 'Task Progress',value: `${taskProgress}%`, icon: Circle,  accent: 'text-lex-success' },
          { label: 'Overdue Items',value: overdueDocs + overdueTasks, icon: AlertTriangle, accent: overdueDocs + overdueTasks > 0 ? 'text-lex-danger' : 'text-lex-muted' },
        ].map(({ label, value, icon: Icon, accent }) => (
          <div key={label} className="card px-4 py-3 flex items-center gap-3">
            <Icon size={18} className={`shrink-0 ${accent}`} />
            <div>
              <p className="text-xs text-lex-muted">{label}</p>
              <p className={`text-lg font-bold ${accent}`}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="card overflow-hidden">
        <div className="flex border-b border-navy-600 px-2 gap-1">
          <Tab label="Overview"  icon={Briefcase}    active={tab === 'overview'}  onClick={() => setTab('overview')} />
          <Tab label="Documents" icon={FileText}      count={docs.length}  active={tab === 'docs'}    onClick={() => setTab('docs')} />
          <Tab label="Tasks"     icon={CheckSquare}   count={tasks.length} active={tab === 'tasks'}   onClick={() => setTab('tasks')} />
        </div>

        <div className="p-5">
          {/* Overview */}
          {tab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4">
                <InfoRow label="Case Type"         value={caseData.type} />
                <InfoRow label="Assigned Attorney" value={caseData.assignedAttorney} />
                <InfoRow label="Client"            value={caseData.clientId?.name} />
                <InfoRow label="Court Date"
                  value={caseData.courtDate ? fmtDate(caseData.courtDate) : null}
                  accent={caseData.courtDate && daysUntil(caseData.courtDate) <= 14 ? 'text-lex-danger' : undefined} />
                <InfoRow label="Filing Date"       value={fmtDate(caseData.filingDate)} />
                <InfoRow label="Opened"            value={fmtDate(caseData.createdAt)} />
              </div>

              {caseData.description && (
                <div>
                  <p className="text-[11px] text-lex-muted uppercase tracking-wider mb-1.5">Description</p>
                  <p className="text-sm text-lex-text leading-relaxed bg-navy-700/50 rounded-lg p-3 border border-navy-600">
                    {caseData.description}
                  </p>
                </div>
              )}

              {/* Task progress bar */}
              {tasks.length > 0 && (
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-lex-muted">Task Completion</span>
                    <span className="text-lex-text font-semibold">{completedTasks}/{tasks.length}</span>
                  </div>
                  <div className="h-2 bg-navy-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-lex-success rounded-full transition-all duration-500"
                      style={{ width: `${taskProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === 'docs'  && <DocumentsTab docs={docs} />}
          {tab === 'tasks' && <TasksTab tasks={tasks} />}
        </div>
      </div>
    </div>
  );
}
