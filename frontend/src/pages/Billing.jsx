import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Plus, X, Loader2, Trash2, DollarSign, CheckCircle, Clock,
  AlertTriangle, TrendingUp, FileText, Download, Eye,
} from 'lucide-react';
import { billingAPI, casesAPI, clientsAPI } from '../api';
import { getCurrentUserName } from '../utils/userStore';
import SearchFilter  from '../components/SearchFilter';
import Pagination    from '../components/Pagination';
import exportCSV     from '../utils/exportCSV';

const STATUSES  = ['Draft', 'Sent', 'Paid', 'Overdue', 'Cancelled'];
const ATTORNEYS = ['Elena Novak', 'Marcus Garrison', 'Isabela de la Cruz', 'Chidi Okonkwo', 'Fiona Brennan'];

const EMPTY_FORM = {
  caseId: '', clientId: '', attorney: '', description: '',
  hours: '', hourlyRate: '', status: 'Draft', dueDate: '', notes: '',
};

const toInputDate = (d) => (d ? new Date(d).toISOString().split('T')[0] : '');
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
const fmtCurrency = (n) => `$${Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

const STATUS_BADGE = {
  Draft:     'bg-navy-600      text-lex-muted     border-navy-500',
  Sent:      'bg-blue-500/10   text-blue-400      border-blue-500/20',
  Paid:      'bg-lex-success/10 text-lex-success  border-lex-success/20',
  Overdue:   'bg-lex-danger/10  text-lex-danger   border-lex-danger/20',
  Cancelled: 'bg-orange-500/10 text-orange-400    border-orange-500/20',
};

const FILTERS = [
  { key: 'status', label: 'Status', options: STATUSES.map((v) => ({ value: v, label: v })) },
];

/* ── Invoice Modal ──────────────────────────────────────────────────────── */
function InvoiceModal({ isOpen, onClose, initialData, cases, clients, onSubmit, loading }) {
  const [form, setForm]     = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setForm({
        caseId:     initialData.caseId?._id  ?? initialData.caseId  ?? '',
        clientId:   initialData.clientId?._id ?? initialData.clientId ?? '',
        attorney:   initialData.attorney   ?? '',
        description: initialData.description ?? '',
        hours:      initialData.hours      ?? '',
        hourlyRate: initialData.hourlyRate  ?? '',
        status:     initialData.status     ?? 'Draft',
        dueDate:    toInputDate(initialData.dueDate),
        notes:      initialData.notes      ?? '',
      });
    } else {
      setForm({ ...EMPTY_FORM, attorney: getCurrentUserName() });
    }
    setErrors({});
  }, [initialData, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const set = (k, v) => { setForm((f) => ({ ...f, [k]: v })); setErrors((e) => ({ ...e, [k]: '' })); };
  const computed = (Number(form.hours) || 0) * (Number(form.hourlyRate) || 0);

  // Auto-fill client & attorney when case is selected
  const handleCaseChange = (caseId) => {
    const selectedCase = cases.find((c) => c._id === caseId);
    setForm((f) => ({
      ...f,
      caseId,
      clientId: selectedCase?.clientId?._id || f.clientId,
      attorney: selectedCase?.assignedAttorney || f.attorney,
    }));
    setErrors((e) => ({ ...e, caseId: '', clientId: '', attorney: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.caseId)    e.caseId    = 'Case is required';
    if (!form.clientId)  e.clientId  = 'Client is required';
    if (!form.attorney)  e.attorney  = 'Attorney is required';
    if (!form.hours || Number(form.hours) <= 0) e.hours = 'Hours must be > 0';
    if (!form.hourlyRate || Number(form.hourlyRate) <= 0) e.hourlyRate = 'Rate must be > 0';
    if (!form.dueDate)   e.dueDate   = 'Due date is required';
    return e;
  };

  const submit = (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onSubmit({
      ...form,
      hours: Number(form.hours),
      hourlyRate: Number(form.hourlyRate),
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-xl bg-navy-800 rounded-2xl border border-navy-600 shadow-modal animate-slide-up max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-navy-600">
          <h2 className="font-heading text-xl font-bold text-lex-text">
            {initialData ? 'Edit Invoice' : 'New Invoice'}
          </h2>
          <button onClick={onClose} className="btn-icon"><X size={18} /></button>
        </div>

        <form onSubmit={submit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Case + Client */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Case <span className="text-lex-danger">*</span></label>
              <select className={`select ${errors.caseId ? 'border-lex-danger' : ''}`}
                value={form.caseId} onChange={(e) => handleCaseChange(e.target.value)}>
                <option value="">Select case…</option>
                {cases.map((c) => (
                  <option key={c._id} value={c._id}>{c.caseNumber} – {c.title}</option>
                ))}
              </select>
              {errors.caseId && <p className="text-xs text-lex-danger mt-1">{errors.caseId}</p>}
            </div>
            <div>
              <label className="label">Client <span className="text-lex-danger">*</span></label>
              <select className={`select ${errors.clientId ? 'border-lex-danger' : ''}`}
                value={form.clientId} onChange={(e) => set('clientId', e.target.value)}>
                <option value="">Select client…</option>
                {clients.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
              {errors.clientId && <p className="text-xs text-lex-danger mt-1">{errors.clientId}</p>}
            </div>
          </div>

          {/* Attorney + Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Attorney <span className="text-lex-danger">*</span></label>
              <select className={`select ${errors.attorney ? 'border-lex-danger' : ''}`}
                value={form.attorney} onChange={(e) => set('attorney', e.target.value)}>
                <option value="">Select attorney…</option>
                {ATTORNEYS.map((a) => <option key={a}>{a}</option>)}
              </select>
              {errors.attorney && <p className="text-xs text-lex-danger mt-1">{errors.attorney}</p>}
            </div>
            <div>
              <label className="label">Status</label>
              <select className="select" value={form.status} onChange={(e) => set('status', e.target.value)}>
                {STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Hours + Rate + Computed Amount */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label">Hours <span className="text-lex-danger">*</span></label>
              <input type="number" step="0.5" min="0.1"
                className={`input ${errors.hours ? 'border-lex-danger' : ''}`}
                value={form.hours} onChange={(e) => set('hours', e.target.value)}
                placeholder="e.g. 24" />
              {errors.hours && <p className="text-xs text-lex-danger mt-1">{errors.hours}</p>}
            </div>
            <div>
              <label className="label">Rate ($/hr) <span className="text-lex-danger">*</span></label>
              <input type="number" step="25" min="1"
                className={`input ${errors.hourlyRate ? 'border-lex-danger' : ''}`}
                value={form.hourlyRate} onChange={(e) => set('hourlyRate', e.target.value)}
                placeholder="e.g. 450" />
              {errors.hourlyRate && <p className="text-xs text-lex-danger mt-1">{errors.hourlyRate}</p>}
            </div>
            <div>
              <label className="label">Amount</label>
              <div className="input bg-navy-700/80 cursor-not-allowed flex items-center">
                <DollarSign size={14} className="text-gold mr-1" />
                <span className="text-gold font-bold">{fmtCurrency(computed)}</span>
              </div>
            </div>
          </div>

          {/* Due date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Due Date <span className="text-lex-danger">*</span></label>
              <input type="date" className={`input ${errors.dueDate ? 'border-lex-danger' : ''}`}
                value={form.dueDate} onChange={(e) => set('dueDate', e.target.value)} />
              {errors.dueDate && <p className="text-xs text-lex-danger mt-1">{errors.dueDate}</p>}
            </div>
          </div>

          {/* Description + Notes */}
          <div>
            <label className="label">Description</label>
            <textarea className="input resize-none" rows={2} value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Services rendered…" />
          </div>
          <div>
            <label className="label">Notes</label>
            <textarea className="input resize-none" rows={2} value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
              placeholder="Internal notes…" />
          </div>
        </form>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-navy-600">
          <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
          <button type="submit" onClick={submit} disabled={loading} className="btn-primary min-w-[130px] justify-center">
            {loading && <Loader2 size={16} className="animate-spin" />}
            {initialData ? 'Save Changes' : 'Create Invoice'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Billing Page ──────────────────────────────────────────────────────── */
export default function Billing() {
  const navigate = useNavigate();

  const [invoices, setInvoices] = useState([]);
  const [summary,  setSummary]  = useState(null);
  const [pagination, setPag]    = useState({ page: 1, pages: 1, total: 0 });
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);

  const [search,   setSearch]   = useState('');
  const [filters,  setFilters]  = useState({});
  const [page,     setPage]     = useState(1);

  const [modalOpen,   setModalOpen]   = useState(false);
  const [editItem,    setEditItem]    = useState(null);
  const [deleteId,    setDeleteId]    = useState(null);
  const [deleting,    setDeleting]    = useState(false);

  const [cases,   setCases]   = useState([]);
  const [clients, setClients] = useState([]);

  // Fetch invoices
  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, limit: 10, search };
      if (filters.status) params.status = filters.status;

      const [invRes, sumRes] = await Promise.all([
        billingAPI.getAll(params),
        billingAPI.getSummary(),
      ]);

      setInvoices(invRes.data.data);
      setPag(invRes.data.pagination);
      setSummary(sumRes.data.data);
    } catch (err) {
      toast.error(err.message || 'Failed to load billing data');
    } finally {
      setLoading(false);
    }
  }, [page, search, filters]);

  useEffect(() => { fetchInvoices(); }, [fetchInvoices]);

  // Fetch cases + clients for modal dropdowns
  useEffect(() => {
    (async () => {
      try {
        const [cRes, clRes] = await Promise.all([
          casesAPI.getAll({ limit: 100 }),
          clientsAPI.getAll({ limit: 100 }),
        ]);
        setCases(cRes.data.data);
        setClients(clRes.data.data);
      } catch { /* non-critical */ }
    })();
  }, []);

  // CRUD handlers
  const handleSubmit = async (data) => {
    try {
      setSaving(true);
      if (editItem) {
        await billingAPI.update(editItem._id, data);
        toast.success('Invoice updated');
      } else {
        await billingAPI.create(data);
        toast.success('Invoice created');
      }
      setModalOpen(false);
      setEditItem(null);
      fetchInvoices();
    } catch (err) {
      toast.error(err.message || 'Failed to save invoice');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await billingAPI.remove(deleteId);
      toast.success('Invoice deleted');
      setDeleteId(null);
      fetchInvoices();
    } catch (err) {
      toast.error(err.message || 'Failed to delete invoice');
    } finally {
      setDeleting(false);
    }
  };

  const handleMarkPaid = async (id) => {
    try {
      await billingAPI.markPaid(id);
      toast.success('Invoice marked as paid');
      fetchInvoices();
    } catch (err) {
      toast.error(err.message || 'Failed to update invoice');
    }
  };

  const openCreate = () => { setEditItem(null); setModalOpen(true); };
  const openEdit   = (inv) => { setEditItem(inv); setModalOpen(true); };

  const handleExport = () => {
    const flat = invoices.map((i) => ({
      invoiceNumber: i.invoiceNumber,
      client:  i.clientId?.name ?? '—',
      case:    i.caseId?.caseNumber ?? '—',
      caseTitle: i.caseId?.title ?? '—',
      attorney: i.attorney,
      hours: i.hours,
      rate: i.hourlyRate,
      amount: i.amount,
      status: i.status,
      dueDate: fmtDate(i.dueDate),
      paidDate: fmtDate(i.paidDate),
    }));
    exportCSV(
      flat,
      ['invoiceNumber', 'client', 'case', 'caseTitle', 'attorney', 'hours', 'rate', 'amount', 'status', 'dueDate', 'paidDate'],
      { invoiceNumber: 'Invoice #', client: 'Client', case: 'Case #', caseTitle: 'Case', rate: 'Rate ($/hr)' },
      'brieflytix-invoices.csv'
    );
  };

  const ov = summary?.overview || {};

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Billing & Invoices</h1>
          <p className="page-subtitle">{pagination.total} invoice{pagination.total !== 1 ? 's' : ''} total</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleExport} className="btn-ghost text-sm gap-1.5" title="Export CSV">
            <Download size={15} /> Export
          </button>
          <button onClick={openCreate} className="btn-primary">
            <Plus size={16} /> New Invoice
          </button>
        </div>
      </div>

      {/* ── Summary Cards ──────────────────────────────────────────────── */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <SummaryCard
            title="Total Billed" value={fmtCurrency(ov.totalBilled)}
            icon={DollarSign} color="gold" sub={`${ov.invoiceCount ?? 0} invoices`}
          />
          <SummaryCard
            title="Collected" value={fmtCurrency(ov.totalPaid)}
            icon={CheckCircle} color="green" sub="Paid invoices"
          />
          <SummaryCard
            title="Outstanding" value={fmtCurrency(ov.totalOutstanding)}
            icon={Clock} color="blue" sub="Sent & awaiting"
          />
          <SummaryCard
            title="Overdue" value={fmtCurrency(ov.totalOverdue)}
            icon={AlertTriangle} color="red" sub="Past due date"
          />
        </div>
      )}

      {/* ── Search + Filter ────────────────────────────────────────────── */}
      <SearchFilter
        searchValue={search}
        onSearch={(v) => { setSearch(v); setPage(1); }}
        filters={FILTERS}
        activeFilters={filters}
        onFilter={({ key, value }) => { setFilters((f) => ({ ...f, [key]: value })); setPage(1); }}
        onClear={() => { setSearch(''); setFilters({}); setPage(1); }}
        placeholder="Search invoices…"
      />

      {/* ── Invoice Table ──────────────────────────────────────────────── */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3">
            <Loader2 size={20} className="animate-spin text-gold" />
            <span className="text-lex-muted text-sm">Loading invoices…</span>
          </div>
        ) : invoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <DollarSign size={36} className="text-lex-muted" />
            <p className="text-lex-muted text-sm">No invoices found</p>
            <button onClick={openCreate} className="btn-primary btn-sm mt-2"><Plus size={14} /> New Invoice</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-navy-600">
                  {['Invoice #', 'Client', 'Case', 'Attorney', 'Hours', 'Rate', 'Amount', 'Status', 'Due', 'Actions'].map((h) => (
                    <th key={h} className="table-header text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv._id} className="table-row hover:bg-navy-700/60 transition-colors">
                    <td className="table-cell font-mono text-xs text-gold">{inv.invoiceNumber}</td>
                    <td className="table-cell text-sm">{inv.clientId?.name ?? '—'}</td>
                    <td className="table-cell">
                      <div className="max-w-[180px]">
                        <p className="text-xs text-gold font-mono">{inv.caseId?.caseNumber ?? '—'}</p>
                        <p className="text-xs text-lex-muted truncate" title={inv.caseId?.title}>
                          {inv.caseId?.title ?? ''}
                        </p>
                      </div>
                    </td>
                    <td className="table-cell text-sm text-lex-muted">{inv.attorney}</td>
                    <td className="table-cell text-sm text-center">{inv.hours}</td>
                    <td className="table-cell text-sm text-lex-muted">${inv.hourlyRate}/hr</td>
                    <td className="table-cell text-sm font-bold text-lex-text">{fmtCurrency(inv.amount)}</td>
                    <td className="table-cell">
                      <span className={`badge border text-xs ${STATUS_BADGE[inv.status] ?? ''}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="table-cell text-xs text-lex-muted whitespace-nowrap">{fmtDate(inv.dueDate)}</td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(inv)} className="btn-icon" title="Edit">
                          <Eye size={14} />
                        </button>
                        {(inv.status === 'Sent' || inv.status === 'Overdue') && (
                          <button onClick={() => handleMarkPaid(inv._id)}
                            className="btn-icon text-lex-success hover:text-lex-success" title="Mark Paid">
                            <CheckCircle size={14} />
                          </button>
                        )}
                        <button onClick={() => setDeleteId(inv._id)}
                          className="btn-icon text-lex-muted hover:text-lex-danger" title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Pagination ─────────────────────────────────────────────────── */}
      {pagination.pages > 1 && (
        <Pagination current={page} total={pagination.pages} onChange={setPage} />
      )}

      {/* ── Invoice Modal ──────────────────────────────────────────────── */}
      <InvoiceModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditItem(null); }}
        initialData={editItem}
        cases={cases}
        clients={clients}
        onSubmit={handleSubmit}
        loading={saving}
      />

      {/* ── Delete Confirmation ────────────────────────────────────────── */}
      {deleteId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={(e) => e.target === e.currentTarget && setDeleteId(null)}
        >
          <div className="w-full max-w-sm bg-navy-800 rounded-2xl border border-navy-600 shadow-modal p-6 text-center animate-slide-up">
            <div className="w-12 h-12 rounded-full bg-lex-danger/10 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={22} className="text-lex-danger" />
            </div>
            <h3 className="font-heading text-lg font-bold text-lex-text mb-2">Delete Invoice?</h3>
            <p className="text-sm text-lex-muted mb-6">This action is permanent and cannot be undone.</p>
            <div className="flex items-center justify-center gap-3">
              <button onClick={() => setDeleteId(null)} className="btn-ghost">Cancel</button>
              <button onClick={handleDelete} disabled={deleting}
                className="btn-primary bg-lex-danger hover:bg-lex-danger/80 min-w-[100px] justify-center">
                {deleting ? <Loader2 size={16} className="animate-spin" /> : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Summary Card Component ────────────────────────────────────────────── */
function SummaryCard({ title, value, icon: Icon, color, sub }) {
  const colors = {
    gold:  'bg-gold/10 text-gold border-gold/20',
    green: 'bg-green-500/10 text-green-400 border-green-500/20',
    blue:  'bg-blue-500/10 text-blue-400 border-blue-500/20',
    red:   'bg-red-500/10 text-red-400 border-red-500/20',
  };
  const cls = colors[color] || colors.gold;
  return (
    <div className="card p-5 flex items-start gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${cls}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-xs font-semibold text-lex-muted uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-bold text-lex-text mt-0.5">{value}</p>
        {sub && <p className="text-xs text-lex-muted mt-1">{sub}</p>}
      </div>
    </div>
  );
}
