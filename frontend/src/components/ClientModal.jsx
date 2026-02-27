import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';

const TYPES    = ['Individual', 'Corporate'];
const STATUSES = ['Active', 'Inactive'];

const EMPTY = {
  name: '', email: '', phone: '', company: '',
  type: 'Individual', address: '', status: 'Active', joinedDate: '',
};

const toInputDate = (d) => (d ? new Date(d).toISOString().split('T')[0] : '');

export default function ClientModal({ isOpen, onClose, initialData, onSubmit, loading }) {
  const [form, setForm]     = useState(EMPTY);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setForm(initialData
      ? {
          name:       initialData.name       ?? '',
          email:      initialData.email      ?? '',
          phone:      initialData.phone      ?? '',
          company:    initialData.company    ?? '',
          type:       initialData.type       ?? 'Individual',
          address:    initialData.address    ?? '',
          status:     initialData.status     ?? 'Active',
          joinedDate: toInputDate(initialData.joinedDate),
        }
      : EMPTY
    );
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
    if (!form.name.trim())  e.name  = 'Name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email format';
    return e;
  };

  const submit = (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onSubmit(form);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-xl bg-navy-800 rounded-2xl border border-navy-600 shadow-modal animate-slide-up max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-navy-600">
          <h2 className="font-heading text-xl font-bold text-lex-text">
            {initialData ? 'Edit Client' : 'New Client'}
          </h2>
          <button onClick={onClose} className="btn-icon"><X size={18} /></button>
        </div>

        <form onSubmit={submit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Full Name <span className="text-lex-danger">*</span></label>
              <input className={`input ${errors.name ? 'border-lex-danger' : ''}`}
                value={form.name} onChange={(e) => set('name', e.target.value)}
                placeholder="e.g. Marcus Thompson" />
              {errors.name && <p className="text-xs text-lex-danger mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="label">Email <span className="text-lex-danger">*</span></label>
              <input type="email" className={`input ${errors.email ? 'border-lex-danger' : ''}`}
                value={form.email} onChange={(e) => set('email', e.target.value)}
                placeholder="name@company.com" />
              {errors.email && <p className="text-xs text-lex-danger mt-1">{errors.email}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Phone</label>
              <input className="input" value={form.phone} onChange={(e) => set('phone', e.target.value)}
                placeholder="+1 (555) 000-0000" />
            </div>
            <div>
              <label className="label">Company</label>
              <input className="input" value={form.company} onChange={(e) => set('company', e.target.value)}
                placeholder="Company name (if any)" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Client Type</label>
              <select className="select" value={form.type} onChange={(e) => set('type', e.target.value)}>
                {TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Status</label>
              <select className="select" value={form.status} onChange={(e) => set('status', e.target.value)}>
                {STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="label">Address</label>
            <input className="input" value={form.address} onChange={(e) => set('address', e.target.value)}
              placeholder="Street, City, State, ZIP" />
          </div>

          <div>
            <label className="label">Joined Date</label>
            <input type="date" className="input" value={form.joinedDate}
              onChange={(e) => set('joinedDate', e.target.value)} />
          </div>
        </form>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-navy-600">
          <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
          <button type="submit" onClick={submit} disabled={loading} className="btn-primary min-w-[130px] justify-center">
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? 'Saving…' : initialData ? 'Save Changes' : 'Create Client'}
          </button>
        </div>
      </div>
    </div>
  );
}
