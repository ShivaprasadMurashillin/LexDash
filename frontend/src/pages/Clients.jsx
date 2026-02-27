import React, { useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { clientsAPI } from '../api';
import SearchFilter from '../components/SearchFilter';
import ClientModal  from '../components/ClientModal';
import ClientCard   from '../components/ClientCard';
import Pagination   from '../components/Pagination';

const FILTERS = [
  { key: 'status', label: 'Status', options: ['Active', 'Inactive'].map((v) => ({ value: v, label: v })) },
  { key: 'type',   label: 'Type',   options: ['Individual', 'Corporate'].map((v) => ({ value: v, label: v })) },
];

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoad]    = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [page,    setPage]    = useState(1);
  const [totalPg, setTotal]   = useState(1);
  const [search,  setSearch]  = useState('');
  const [filters, setFilters] = useState({});
  const [modal,   setModal]   = useState({ open: false, data: null });
  const [confirm, setConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const debounce = useRef(null);

  const load = useCallback(async (pg = 1, q = search, f = filters) => {
    try {
      setLoad(true);
      const { data } = await clientsAPI.getAll({ page: pg, limit: 12, search: q, ...f });
      setClients(data.data);
      setTotal(data.pagination.pages || 1);
    } catch (err) { toast.error(err.message); }
    finally { setLoad(false); }
  }, [search, filters]);

  useEffect(() => { load(1); }, []);

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
        ? await clientsAPI.update(modal.data._id, payload)
        : await clientsAPI.create(payload);
      toast.success(modal.data ? 'Client updated' : 'Client created');
      setModal({ open: false, data: null });
      load(page);
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!confirm) return;
    try {
      setDeleting(true);
      await clientsAPI.remove(confirm._id);
      toast.success('Client deleted');
      setConfirm(null);
      load(page);
    } catch (err) { toast.error(err.message); }
    finally { setDeleting(false); }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="page-title">Clients</h1>
          <p className="page-subtitle">Client directory – individuals and corporations</p>
        </div>
        <button className="btn-primary shrink-0" onClick={() => setModal({ open: true, data: null })}>
          <Plus size={16} /> New Client
        </button>
      </div>

      <SearchFilter
        searchValue={search} onSearch={handleSearch}
        filters={FILTERS} activeFilters={filters}
        onFilter={handleFilter} onClear={handleClear}
        placeholder="Search by name, email, company…"
      />

      {/* Cards grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card p-5 animate-pulse space-y-3">
              <div className="flex gap-3">
                <div className="w-11 h-11 bg-navy-700 rounded-xl" />
                <div className="flex-1 space-y-2 pt-1">
                  <div className="h-4 bg-navy-700 rounded w-3/4" />
                  <div className="h-3 bg-navy-700 rounded w-1/2" />
                </div>
              </div>
              <div className="h-3 bg-navy-700 rounded" />
              <div className="h-3 bg-navy-700 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : clients.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <span className="text-5xl mb-3">👔</span>
          <p className="font-medium text-lex-text">No clients found</p>
          <p className="text-sm text-lex-muted mt-1">Add your first client to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {clients.map((c) => (
            <ClientCard
              key={c._id} client={c}
              onEdit={(x) => setModal({ open: true, data: x })}
              onDelete={(x) => setConfirm(x)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && (
        <Pagination page={page} totalPages={totalPg} onPageChange={(p) => { setPage(p); load(p); }} />
      )}

      <ClientModal
        isOpen={modal.open} onClose={() => setModal({ open: false, data: null })}
        initialData={modal.data} onSubmit={handleSubmit} loading={saving}
      />

      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-navy-800 rounded-2xl border border-navy-600 shadow-modal p-6 animate-slide-up">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-lex-danger/10 flex items-center justify-center">
                <Trash2 size={18} className="text-lex-danger" />
              </div>
              <h3 className="font-heading text-lg font-bold text-lex-text">Delete Client?</h3>
            </div>
            <p className="text-sm text-lex-muted mb-5">
              Delete <span className="text-lex-text font-medium">"{confirm.name}"</span>? This cannot be undone.
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
