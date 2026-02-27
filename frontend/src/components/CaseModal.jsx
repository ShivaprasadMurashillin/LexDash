import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { getCurrentUserName } from '../utils/userStore';

const CASE_TYPES  = ['Criminal', 'Civil', 'Family', 'Corporate', 'Immigration', 'Intellectual Property'];
const STATUSES    = ['Active', 'Pending', 'Closed', 'On Hold'];
const PRIORITIES  = ['High', 'Medium', 'Low'];
const ATTORNEYS   = ['Elena Novak', 'Marcus Garrison', 'Isabela de la Cruz', 'Chidi Okonkwo', 'Fiona Brennan'];

const EMPTY = {
  title: '', type: '', status: 'Pending', priority: 'Medium',
  clientId: '', assignedAttorney: '', courtDate: '', filingDate: '', description: '',
};

const toInputDate = (d) => (d ? new Date(d).toISOString().split('T')[0] : '');

export default function CaseModal({ isOpen, onClose, initialData, clients = [], onSubmit, loading }) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});

  /* Populate form when editing */
  useEffect(() => {
    if (initialData) {
      setForm({
        title:            initialData.title            ?? '',
        type:             initialData.type             ?? '',
        status:           initialData.status           ?? 'Pending',
        priority:         initialData.priority         ?? 'Medium',
        clientId:         initialData.clientId?._id    ?? initialData.clientId ?? '',
        assignedAttorney: initialData.assignedAttorney ?? '',
        courtDate:        toInputDate(initialData.courtDate),
        filingDate:       toInputDate(initialData.filingDate),
        description:      initialData.description      ?? '',
      });
    } else {
      setForm({ ...EMPTY, assignedAttorney: getCurrentUserName() });
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

  const set = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((e) => ({ ...e, [key]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim())  e.title = 'Title is required';
    if (!form.type)          e.type  = 'Case type is required';
    return e;
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    const payload = { ...form };
    if (!payload.clientId) delete payload.clientId;
    onSubmit(payload);
  };

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-2xl bg-navy-800 rounded-2xl border border-navy-600 shadow-modal animate-slide-up max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-navy-600">
          <h2 className="font-heading text-xl font-bold text-lex-text">
            {initialData ? 'Edit Case' : 'New Case'}
          </h2>
          <button onClick={onClose} className="btn-icon"><X size={18} /></button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="label">Case Title <span className="text-lex-danger">*</span></label>
            <input className={`input ${errors.title ? 'border-lex-danger' : ''}`}
              value={form.title} onChange={(e) => set('title', e.target.value)}
              placeholder="e.g. Smith v. City of Boston" />
            {errors.title && <p className="text-xs text-lex-danger mt-1">{errors.title}</p>}
          </div>

          {/* Type + Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Type <span className="text-lex-danger">*</span></label>
              <select className={`select ${errors.type ? 'border-lex-danger' : ''}`}
                value={form.type} onChange={(e) => set('type', e.target.value)}>
                <option value="">Select type…</option>
                {CASE_TYPES.map((t) => <option key={t}>{t}</option>)}
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

          {/* Priority + Client */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Priority</label>
              <select className="select" value={form.priority} onChange={(e) => set('priority', e.target.value)}>
                {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Client</label>
              <select className="select" value={form.clientId} onChange={(e) => set('clientId', e.target.value)}>
                <option value="">Select client…</option>
                {clients.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          {/* Attorney */}
          <div>
            <label className="label">Assigned Attorney</label>
            <select className="select" value={form.assignedAttorney} onChange={(e) => set('assignedAttorney', e.target.value)}>
              <option value="">Select attorney…</option>
              {ATTORNEYS.map((a) => <option key={a}>{a}</option>)}
            </select>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Court Date</label>
              <input type="date" className="input"
                value={form.courtDate} onChange={(e) => set('courtDate', e.target.value)} />
            </div>
            <div>
              <label className="label">Filing Date</label>
              <input type="date" className="input"
                value={form.filingDate} onChange={(e) => set('filingDate', e.target.value)} />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="label">Description</label>
            <textarea className="input resize-none" rows={3}
              value={form.description} onChange={(e) => set('description', e.target.value)}
              placeholder="Brief summary of the case…" />
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-navy-600">
          <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className="btn-primary min-w-[120px] justify-center"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
            {loading ? 'Saving…' : initialData ? 'Save Changes' : 'Create Case'}
          </button>
        </div>
      </div>
    </div>
  );
}
