import React, { useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import { Plus, Trash2, Loader2, Download } from 'lucide-react';
import { tasksAPI, casesAPI } from '../api';
import TaskTable    from '../components/TaskTable';
import TaskModal    from '../components/TaskModal';
import SearchFilter from '../components/SearchFilter';
import Pagination   from '../components/Pagination';
import exportCSV    from '../utils/exportCSV';

const STATUS_OPTS   = ['To Do', 'In Progress', 'Completed', 'Overdue'];
const PRIORITY_OPTS = ['High', 'Medium', 'Low'];

const FILTERS = [
  { key: 'status',   label: 'Status',   options: STATUS_OPTS.map((v)   => ({ value: v, label: v })) },
  { key: 'priority', label: 'Priority', options: PRIORITY_OPTS.map((v) => ({ value: v, label: v })) },
];

export default function Tasks() {
  const [tasks,   setTasks]  = useState([]);
  const [cases,   setCases]  = useState([]);
  const [loading, setLoad]   = useState(true);
  const [saving,  setSaving] = useState(false);
  const [page,    setPage]   = useState(1);
  const [totalPg, setTotal]  = useState(1);
  const [search,  setSearch] = useState('');
  const [filters, setFilters]= useState({});
  const [modal,   setModal]  = useState({ open: false, data: null });
  const [confirm, setConfirm]= useState(null);
  const [deleting, setDeleting] = useState(false);

  const debounce = useRef(null);

  const load = useCallback(async (pg = 1, q = search, f = filters) => {
    try {
      setLoad(true);
      const { data } = await tasksAPI.getAll({ page: pg, limit: 10, search: q, ...f });
      setTasks(data.data);
      setTotal(data.pagination.pages || 1);
    } catch (err) { toast.error(err.message); }
    finally { setLoad(false); }
  }, [search, filters]);

  useEffect(() => { load(1); }, []);

  useEffect(() => {
    casesAPI.getAll({ limit: 100 }).then(({ data }) => setCases(data.data)).catch(() => {});
  }, []);

  const handleSearch = (val) => {
    setSearch(val);
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => { setPage(1); load(1, val, filters); }, 300);
  };

  const handleFilter = ({ key, value }) => {
    const next = { ...filters, [key]: value };
    if (!value) delete next[key];
    setFilters(next);
    setPage(1);
    load(1, search, next);
  };

  const handleClear = () => { setSearch(''); setFilters({}); setPage(1); load(1, '', {}); };

  const handleSubmit = async (payload) => {
    try {
      setSaving(true);
      modal.data
        ? await tasksAPI.update(modal.data._id, payload)
        : await tasksAPI.create(payload);
      toast.success(modal.data ? 'Task updated' : 'Task created');
      setModal({ open: false, data: null });
      load(page);
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!confirm) return;
    try {
      setDeleting(true);
      await tasksAPI.remove(confirm._id);
      toast.success('Task deleted');
      setConfirm(null);
      load(page);
    } catch (err) { toast.error(err.message); }
    finally { setDeleting(false); }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="page-title">Tasks</h1>
          <p className="page-subtitle">Action items and deadlines across all cases</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="btn-ghost text-xs flex items-center gap-1.5"
            onClick={() => exportCSV(
              tasks.map((t) => ({
                title: t.title, status: t.status, priority: t.priority,
                assignedTo: t.assignedTo ?? '', progress: `${t.completionPercentage ?? 0}%`,
                dueDate: t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '',
                case: t.caseId?.caseNumber ?? '',
              })),
              ['title', 'status', 'priority', 'assignedTo', 'progress', 'dueDate', 'case'],
              { assignedTo: 'Assigned To', dueDate: 'Due Date', case: 'Case #' },
              'tasks.csv'
            )}
            disabled={!tasks.length}
            title="Export current page as CSV"
          >
            <Download size={14} /> Export
          </button>
          <button className="btn-primary shrink-0" onClick={() => setModal({ open: true, data: null })}>
            <Plus size={16} /> New Task
          </button>
        </div>
      </div>

      <SearchFilter
        searchValue={search} onSearch={handleSearch}
        filters={FILTERS} activeFilters={filters}
        onFilter={handleFilter} onClear={handleClear}
        placeholder="Search by title, assignee…"
      />

      <div className="card overflow-hidden">
        <TaskTable
          tasks={tasks} loading={loading}
          onEdit={(t) => setModal({ open: true, data: t })}
          onDelete={(t) => setConfirm(t)}
        />
        {!loading && (
          <Pagination page={page} totalPages={totalPg} onPageChange={(p) => { setPage(p); load(p); }} />
        )}
      </div>

      <TaskModal
        isOpen={modal.open} onClose={() => setModal({ open: false, data: null })}
        initialData={modal.data} cases={cases}
        onSubmit={handleSubmit} loading={saving}
      />

      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-navy-800 rounded-2xl border border-navy-600 shadow-modal p-6 animate-slide-up">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-lex-danger/10 flex items-center justify-center">
                <Trash2 size={18} className="text-lex-danger" />
              </div>
              <h3 className="font-heading text-lg font-bold text-lex-text">Delete Task?</h3>
            </div>
            <p className="text-sm text-lex-muted mb-5">
              Delete <span className="text-lex-text font-medium">"{confirm.title}"</span>? This cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setConfirm(null)} disabled={deleting} className="btn-ghost">Cancel</button>
              <button onClick={handleDelete} disabled={deleting} className="btn-danger font-semibold px-4 min-w-[90px] justify-center flex items-center gap-2">
                {deleting ? <><Loader2 size={14} className="animate-spin" /> Deleting…</> : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
