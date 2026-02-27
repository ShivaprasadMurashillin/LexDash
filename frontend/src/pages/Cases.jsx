import React, { useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import { Plus, Trash2, Loader2, Download } from 'lucide-react';
import { casesAPI, clientsAPI } from '../api';
import CaseTable    from '../components/CaseTable';
import CaseModal    from '../components/CaseModal';
import SearchFilter from '../components/SearchFilter';
import Pagination   from '../components/Pagination';
import exportCSV    from '../utils/exportCSV';

const STATUS_OPTS   = ['Active', 'Pending', 'Closed', 'On Hold'];
const TYPE_OPTS     = ['Criminal', 'Civil', 'Family', 'Corporate', 'Immigration', 'Intellectual Property'];
const PRIORITY_OPTS = ['High', 'Medium', 'Low'];

const FILTERS = [
  { key: 'status',   label: 'Status',   options: STATUS_OPTS.map((v) => ({ value: v, label: v })) },
  { key: 'type',     label: 'Type',     options: TYPE_OPTS.map((v) => ({ value: v, label: v })) },
  { key: 'priority', label: 'Priority', options: PRIORITY_OPTS.map((v) => ({ value: v, label: v })) },
];

export default function Cases() {
  const [cases,    setCases]   = useState([]);
  const [clients,  setClients] = useState([]);
  const [loading,  setLoad]    = useState(true);
  const [saving,   setSaving]  = useState(false);
  const [page,     setPage]    = useState(1);
  const [totalPg,  setTotalPg] = useState(1);
  const [search,   setSearch]  = useState('');
  const [filters,  setFilters] = useState({});
  const [modal,    setModal]   = useState({ open: false, data: null });
  const [confirm,  setConfirm] = useState(null);   // case to delete
  const [deleting,  setDeleting] = useState(false);

  const searchTimer = useRef(null);

  /* ── Load cases ──────────────────────────────────────────────────────── */
  const load = useCallback(async (pg = 1, q = search, f = filters) => {
    try {
      setLoad(true);
      const { data } = await casesAPI.getAll({ page: pg, limit: 10, search: q, ...f });
      setCases(data.data);
      setTotalPg(data.pagination.pages || 1);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoad(false);
    }
  }, [search, filters]);

  useEffect(() => { load(1); }, []);

  /* ── Load clients for modal dropdown ────────────────────────────────── */
  useEffect(() => {
    clientsAPI.getAll({ limit: 100 }).then(({ data }) => setClients(data.data)).catch(() => {});
  }, []);

  /* ── Debounced search ────────────────────────────────────────────────── */
  const handleSearch = (val) => {
    setSearch(val);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => { setPage(1); load(1, val, filters); }, 300);
  };

  const handleFilter = ({ key, value }) => {
    const next = { ...filters, [key]: value };
    if (!value) delete next[key];
    setFilters(next);
    setPage(1);
    load(1, search, next);
  };

  const handleClear = () => {
    setSearch('');
    setFilters({});
    setPage(1);
    load(1, '', {});
  };

  const handlePage = (p) => { setPage(p); load(p); };

  /* ── CRUD ────────────────────────────────────────────────────────────── */
  const handleSubmit = async (payload) => {
    try {
      setSaving(true);
      if (modal.data) {
        await casesAPI.update(modal.data._id, payload);
        toast.success('Case updated successfully');
      } else {
        await casesAPI.create(payload);
        toast.success('Case created successfully');
      }
      setModal({ open: false, data: null });
      load(page);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm) return;
    try {
      setDeleting(true);
      await casesAPI.remove(confirm._id);
      toast.success('Case deleted');
      setConfirm(null);
      load(page);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="page-title">Cases</h1>
          <p className="page-subtitle">Manage all active and historical legal cases</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="btn-ghost text-xs flex items-center gap-1.5"
            onClick={() => exportCSV(
              cases.map((c) => ({
                caseNumber: c.caseNumber, title: c.title, status: c.status, priority: c.priority,
                type: c.type, client: c.clientId?.name ?? '', attorney: c.assignedAttorney ?? '',
                courtDate: c.courtDate ? new Date(c.courtDate).toLocaleDateString() : '',
              })),
              ['caseNumber', 'title', 'status', 'priority', 'type', 'client', 'attorney', 'courtDate'],
              { caseNumber: 'Case #', title: 'Title', courtDate: 'Court Date' },
              'cases.csv'
            )}
            disabled={!cases.length}
            title="Export current page as CSV"
          >
            <Download size={14} /> Export
          </button>
          <button className="btn-primary shrink-0" onClick={() => setModal({ open: true, data: null })}>
            <Plus size={16} /> New Case
          </button>
        </div>
      </div>

      {/* Search + Filters */}
      <SearchFilter
        searchValue={search}
        onSearch={handleSearch}
        filters={FILTERS}
        activeFilters={filters}
        onFilter={handleFilter}
        onClear={handleClear}
        placeholder="Search by title, case #, attorney…"
      />

      {/* Table card */}
      <div className="card overflow-hidden">
        <CaseTable
          cases={cases}
          loading={loading}
          onEdit={(c) => setModal({ open: true, data: c })}
          onDelete={(c) => setConfirm(c)}
        />

        {/* Pagination */}
        {!loading && (
          <Pagination page={page} totalPages={totalPg} onPageChange={handlePage} />
        )}
      </div>

      {/* Case Modal */}
      <CaseModal
        isOpen={modal.open}
        onClose={() => setModal({ open: false, data: null })}
        initialData={modal.data}
        clients={clients}
        onSubmit={handleSubmit}
        loading={saving}
      />

      {/* Delete Confirmation Dialog */}
      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-navy-800 rounded-2xl border border-navy-600 shadow-modal p-6 animate-slide-up">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-lex-danger/10 flex items-center justify-center">
                <Trash2 size={18} className="text-lex-danger" />
              </div>
              <h3 className="font-heading text-lg font-bold text-lex-text">Delete Case?</h3>
            </div>
            <p className="text-sm text-lex-muted mb-5">
              Are you sure you want to delete <span className="text-lex-text font-medium">"{confirm.title}"</span>?
              This action cannot be undone.
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
