import React, { useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import { Plus, X, Loader2, Trash2, FileText, ExternalLink, Calendar, User, Briefcase, AlertTriangle, Paperclip, UploadCloud, XCircle, Download } from 'lucide-react';
import { documentsAPI, casesAPI, uploadAPI } from '../api';
import DocumentTable from '../components/DocumentTable';
import { getCurrentUserName } from '../utils/userStore';
import SearchFilter  from '../components/SearchFilter';
import Pagination    from '../components/Pagination';
import exportCSV     from '../utils/exportCSV';

const DOC_TYPES  = ['Contract', 'Affidavit', 'Motion', 'Brief', 'Evidence', 'Subpoena', 'Order'];
const STATUSES   = ['Draft', 'Pending Review', 'Reviewed', 'Approved', 'Filed'];
const ATTORNEYS  = ['Elena Novak', 'Marcus Garrison', 'Isabela de la Cruz', 'Chidi Okonkwo', 'Fiona Brennan'];

const EMPTY_FORM = {
  title: '', caseId: '', type: '', status: 'Draft',
  uploadedBy: '', fileUrl: '', notes: '', deadline: '',
};

const toInputDate = (d) => (d ? new Date(d).toISOString().split('T')[0] : '');

const FILTERS = [
  { key: 'status', label: 'Status', options: STATUSES.map((v) => ({ value: v, label: v })) },
  { key: 'type',   label: 'Type',   options: DOC_TYPES.map((v) => ({ value: v, label: v })) },
];

/* ── File Uploader ───────────────────────────────────────────────────────── */
function FileUploader({ value, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [fileName,  setFileName]  = useState('');
  const [dragOver,  setDragOver]  = useState(false);
  const fileRef = useRef(null);

  // Sync filename display when editing an existing doc
  useEffect(() => {
    if (value && !fileName) {
      const parts = value.split('/');
      const raw = parts[parts.length - 1] || '';
      // strip leading timestamp prefix (digits + underscore)
      setFileName(raw.replace(/^\d+_/, ''));
    }
    if (!value) setFileName('');
  }, [value]);

  const doUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const { data } = await uploadAPI.upload(file);
      onChange(data.fileUrl);
      setFileName(file.name);
      toast.success('File uploaded successfully!');
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) doUpload(file);
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) doUpload(file);
  };

  const handleRemove = () => {
    onChange('');
    setFileName('');
  };

  if (value && fileName) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-navy-700 border border-navy-500">
        <Paperclip size={14} className="text-lex-gold shrink-0" />
        <span className="text-xs text-lex-text truncate flex-1" title={fileName}>{fileName}</span>
        <a href={value} target="_blank" rel="noreferrer"
           className="text-xs text-lex-gold hover:underline shrink-0">View</a>
        <button type="button" onClick={handleRemove}
                className="ml-1 text-lex-muted hover:text-lex-danger shrink-0">
          <XCircle size={14} />
        </button>
      </div>
    );
  }

  return (
    <div>
      <div
        onClick={() => !uploading && fileRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center gap-1.5 px-4 py-4 rounded-lg border-2 border-dashed cursor-pointer transition-colors
          ${ dragOver ? 'border-lex-gold bg-lex-gold/5' : 'border-navy-500 hover:border-lex-gold/60 bg-navy-700/50' }
          ${ uploading ? 'opacity-60 pointer-events-none' : '' }`}
      >
        {uploading
          ? <Loader2 size={18} className="animate-spin text-lex-gold" />
          : <UploadCloud size={18} className="text-lex-muted" />}
        <span className="text-xs text-lex-muted">
          {uploading ? 'Uploading…' : 'Click or drag & drop a file'}
        </span>
        <span className="text-[10px] text-lex-muted/60">PDF, Word, Excel, images · max 20 MB</span>
      </div>
      <input ref={fileRef} type="file" className="hidden"
        accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.png,.jpg,.jpeg,.gif,.webp"
        onChange={handleInputChange} />
    </div>
  );
}

/* ── Inline Document Modal ────────────────────────────────────────────────── */
function DocModal({ isOpen, onClose, initialData, cases, onSubmit, loading }) {
  const [form, setForm]     = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setForm({
        title:      initialData.title      ?? '',
        caseId:     initialData.caseId?._id ?? initialData.caseId ?? '',
        type:       initialData.type       ?? '',
        status:     initialData.status     ?? 'Draft',
        uploadedBy: initialData.uploadedBy ?? '',
        fileUrl:    initialData.fileUrl    ?? '',
        notes:      initialData.notes      ?? '',
        deadline:   toInputDate(initialData.deadline),
      });
    } else {
      setForm({ ...EMPTY_FORM, uploadedBy: getCurrentUserName() });
    }
    setErrors({});
  }, [initialData, isOpen]);

  /* Close on Escape key */
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const set = (k, v) => { setForm((f) => ({ ...f, [k]: v })); setErrors((e) => ({ ...e, [k]: '' })); };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.type)         e.type  = 'Document type is required';
    return e;
  };

  const submit = (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    const payload = { ...form };
    if (!payload.caseId) delete payload.caseId;
    onSubmit(payload);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-xl bg-navy-800 rounded-2xl border border-navy-600 shadow-modal animate-slide-up max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-navy-600">
          <h2 className="font-heading text-xl font-bold text-lex-text">{initialData ? 'Edit Document' : 'New Document'}</h2>
          <button onClick={onClose} className="btn-icon"><X size={18} /></button>
        </div>

        <form onSubmit={submit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <label className="label">Title <span className="text-lex-danger">*</span></label>
            <input className={`input ${errors.title ? 'border-lex-danger' : ''}`}
              value={form.title} onChange={(e) => set('title', e.target.value)}
              placeholder="e.g. Motion to Suppress Evidence" />
            {errors.title && <p className="text-xs text-lex-danger mt-1">{errors.title}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Type <span className="text-lex-danger">*</span></label>
              <select className={`select ${errors.type ? 'border-lex-danger' : ''}`}
                value={form.type} onChange={(e) => set('type', e.target.value)}>
                <option value="">Select type…</option>
                {DOC_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
              {errors.type && <p className="text-xs text-lex-danger mt-1">{errors.type}</p>}
            </div>
            <div>
              <label className="label">Status</label>
              <select className="select" value={form.status} onChange={(e) => set('status', e.target.value)}>
                {STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Related Case</label>
              <select className="select" value={form.caseId} onChange={(e) => set('caseId', e.target.value)}>
                <option value="">Select case…</option>
                {cases.map((c) => <option key={c._id} value={c._id}>{c.caseNumber} – {c.title}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Uploaded By</label>
              <select className="select" value={form.uploadedBy} onChange={(e) => set('uploadedBy', e.target.value)}>
                <option value="">Select attorney…</option>
                {ATTORNEYS.map((a) => <option key={a}>{a}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Deadline</label>
              <input type="date" className="input" value={form.deadline} onChange={(e) => set('deadline', e.target.value)} />
            </div>
            <div>
              <label className="label flex items-center gap-1.5">
                <Paperclip size={12} className="text-lex-muted" /> File Attachment
              </label>
              <FileUploader
                value={form.fileUrl}
                onChange={(url) => set('fileUrl', url)}
              />
            </div>
          </div>

          <div>
            <label className="label">Notes</label>
            <textarea className="input resize-none" rows={3} value={form.notes}
              onChange={(e) => set('notes', e.target.value)} placeholder="Internal notes…" />
          </div>
        </form>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-navy-600">
          <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
          <button type="submit" onClick={submit} disabled={loading} className="btn-primary min-w-[130px] justify-center">
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? 'Saving…' : initialData ? 'Save Changes' : 'Create Document'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Document Viewer ─────────────────────────────────────────────────────── */
const STATUS_COLOR = {
  Draft:           'text-lex-muted',
  'Pending Review':'text-lex-warning',
  Reviewed:        'text-lex-info',
  Approved:        'text-lex-success',
  Filed:           'text-gold',
};
const TYPE_ICON_BIG = {
  Contract: '📄', Affidavit: '✍️', Motion: '⚖️',
  Brief: '📋', Evidence: '🔍', Subpoena: '📮', Order: '🔔',
};
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—';

function DocumentViewer({ doc, onClose, onEdit }) {
  const overdue  = doc.deadline && new Date(doc.deadline) < new Date();
  const caseInfo = doc.caseId;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg bg-navy-800 rounded-2xl border border-navy-600 shadow-modal animate-slide-up flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-navy-600 shrink-0">
          <div className="flex items-start gap-3">
            <span className="text-3xl mt-0.5">{TYPE_ICON_BIG[doc.type] ?? '📄'}</span>
            <div className="min-w-0">
              <h2 className="font-heading text-lg font-bold text-lex-text leading-snug">{doc.title}</h2>
              <p className={`text-xs font-semibold mt-0.5 ${STATUS_COLOR[doc.status] ?? 'text-lex-muted'}`}>
                {doc.type} · {doc.status}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon shrink-0 ml-2"><X size={18} /></button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Case info */}
          {caseInfo && (
            <div className="p-3 rounded-lg bg-navy-700/60 border border-navy-600 flex items-center gap-3">
              <Briefcase size={15} className="text-gold shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-lex-muted">Linked Case</p>
                <p className="text-sm font-semibold text-lex-text truncate">{caseInfo.title}</p>
                <p className="text-xs font-mono text-gold">{caseInfo.caseNumber}</p>
              </div>
            </div>
          )}

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3">
            <InfoCell label="Uploaded By" icon={<User size={13} />} value={doc.uploadedBy || '—'} />
            <InfoCell
              label="Deadline"
              icon={<Calendar size={13} />}
              value={fmtDate(doc.deadline)}
              highlight={overdue ? 'text-lex-danger' : null}
              extra={overdue && (
                <span className="flex items-center gap-1 text-[10px] text-lex-danger font-semibold mt-0.5">
                  <AlertTriangle size={11} /> Overdue
                </span>
              )}
            />
          </div>

          {/* Notes / description */}
          {doc.notes ? (
            <div>
              <p className="label mb-1 flex items-center gap-1.5"><FileText size={12} className="text-lex-muted" /> Notes</p>
              <div className="p-3 rounded-lg bg-navy-700/60 border border-navy-600 text-sm text-lex-text leading-relaxed whitespace-pre-wrap">
                {doc.notes}
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-lg bg-navy-700/40 border border-dashed border-navy-600 text-center">
              <p className="text-xs text-lex-muted">No notes or description added to this document.</p>
            </div>
          )}

          {/* File link */}
          {doc.fileUrl && (
            <a
              href={doc.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-3 rounded-lg bg-gold/5 border border-gold/20
                         text-gold text-sm font-semibold hover:bg-gold/10 transition-colors"
            >
              <ExternalLink size={15} /> Open File / Document Link
            </a>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-navy-600 flex justify-between items-center shrink-0">
          <p className="text-xs text-lex-muted">
            {doc.fileUrl ? 'File URL attached' : 'No file attached — add a URL when editing'}
          </p>
          <div className="flex gap-2">
            <button onClick={onClose} className="btn-ghost">Close</button>
            <button onClick={onEdit} className="btn-primary gap-2">
              <FileText size={14} /> Edit Document
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoCell({ label, icon, value, highlight, extra }) {
  return (
    <div className="p-3 rounded-lg bg-navy-700/60 border border-navy-600">
      <p className="text-xs text-lex-muted flex items-center gap-1 mb-1">{icon} {label}</p>
      <p className={`text-sm font-semibold ${highlight ?? 'text-lex-text'}`}>{value}</p>
      {extra}
    </div>
  );
}

/* ── Documents Page ──────────────────────────────────────────────────────── */
export default function Documents() {
  const [docs,    setDocs]   = useState([]);
  const [cases,   setCases]  = useState([]);
  const [loading, setLoad]   = useState(true);
  const [saving,  setSaving] = useState(false);
  const [page,    setPage]   = useState(1);
  const [totalPg, setTotal]  = useState(1);
  const [search,  setSearch] = useState('');
  const [filters, setFilters]= useState({});
  const [modal,   setModal]  = useState({ open: false, data: null });
  const [confirm, setConfirm]= useState(null);
  const [viewer,  setViewer]  = useState(null); // document to view
  const debounce = useRef(null);

  const load = useCallback(async (pg = 1, q = search, f = filters) => {
    try {
      setLoad(true);
      const { data } = await documentsAPI.getAll({ page: pg, limit: 10, search: q, ...f });
      setDocs(data.data);
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
        ? await documentsAPI.update(modal.data._id, payload)
        : await documentsAPI.create(payload);
      toast.success(modal.data ? 'Document updated' : 'Document created');
      setModal({ open: false, data: null });
      load(page);
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!confirm) return;
    try {
      await documentsAPI.remove(confirm._id);
      toast.success('Document deleted');
      setConfirm(null);
      load(page);
    } catch (err) { toast.error(err.message); }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="page-title">Documents</h1>
          <p className="page-subtitle">Legal documents, filings, and evidence</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="btn-ghost text-xs flex items-center gap-1.5"
            onClick={() => exportCSV(
              docs.map((d) => ({
                title: d.title, type: d.type, status: d.status,
                case: d.caseId?.caseNumber ?? '', uploadedBy: d.uploadedBy ?? '',
                deadline: d.deadline ? new Date(d.deadline).toLocaleDateString() : '',
              })),
              ['title', 'type', 'status', 'case', 'uploadedBy', 'deadline'],
              { case: 'Case #', uploadedBy: 'Uploaded By' },
              'documents.csv'
            )}
            disabled={!docs.length}
            title="Export current page as CSV"
          >
            <Download size={14} /> Export
          </button>
          <button className="btn-primary shrink-0" onClick={() => setModal({ open: true, data: null })}>
            <Plus size={16} /> New Document
          </button>
        </div>
      </div>

      <SearchFilter
        searchValue={search} onSearch={handleSearch}
        filters={FILTERS} activeFilters={filters}
        onFilter={handleFilter} onClear={handleClear}
        placeholder="Search by title, uploader…"
      />

      <div className="card overflow-hidden">
        <DocumentTable
          documents={docs} loading={loading}
          onEdit={(d) => setModal({ open: true, data: d })}
          onDelete={(d) => setConfirm(d)}
          onView={(d) => {
            if (d.fileUrl) {
              window.open(d.fileUrl, '_blank', 'noopener,noreferrer');
            } else {
              setViewer(d);
            }
          }}
        />
        {!loading && (
          <Pagination page={page} totalPages={totalPg} onPageChange={(p) => { setPage(p); load(p); }} />
        )}
      </div>

      <DocModal
        isOpen={modal.open} onClose={() => setModal({ open: false, data: null })}
        initialData={modal.data} cases={cases}
        onSubmit={handleSubmit} loading={saving}
      />

      {/* ── Document Viewer Modal ─────────────────────────────────────── */}
      {viewer && <DocumentViewer doc={viewer} onClose={() => setViewer(null)} onEdit={() => { setModal({ open: true, data: viewer }); setViewer(null); }} />}

      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-navy-800 rounded-2xl border border-navy-600 shadow-modal p-6 animate-slide-up">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-lex-danger/10 flex items-center justify-center">
                <Trash2 size={18} className="text-lex-danger" />
              </div>
              <h3 className="font-heading text-lg font-bold text-lex-text">Delete Document?</h3>
            </div>
            <p className="text-sm text-lex-muted mb-5">
              Delete <span className="text-lex-text font-medium">"{confirm.title}"</span>? This cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setConfirm(null)} className="btn-ghost">Cancel</button>
              <button onClick={handleDelete} className="btn-danger font-semibold px-4">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
