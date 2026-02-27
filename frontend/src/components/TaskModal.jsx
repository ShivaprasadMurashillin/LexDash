import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';

const PRIORITIES  = ['High', 'Medium', 'Low'];
const STATUSES    = ['To Do', 'In Progress', 'Completed', 'Overdue'];
const ATTORNEYS   = ['Elena Novak', 'Marcus Garrison', 'Isabela de la Cruz', 'Chidi Okonkwo', 'Fiona Brennan'];

const EMPTY = {
  title: '', description: '', caseId: '', assignedTo: '',
  priority: 'Medium', status: 'To Do', dueDate: '', completionPercentage: 0,
};

const toInputDate = (d) => (d ? new Date(d).toISOString().split('T')[0] : '');

export default function TaskModal({ isOpen, onClose, initialData, cases = [], onSubmit, loading }) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setForm({
        title:                initialData.title                ?? '',
        description:          initialData.description          ?? '',
        caseId:               initialData.caseId?._id          ?? initialData.caseId ?? '',
        assignedTo:           initialData.assignedTo           ?? '',
        priority:             initialData.priority             ?? 'Medium',
        status:               initialData.status               ?? 'To Do',
        dueDate:              toInputDate(initialData.dueDate),
        completionPercentage: initialData.completionPercentage ?? 0,
      });
    } else {
      setForm(EMPTY);
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
    if (!form.title.trim()) e.title = 'Task title is required';
    const pct = Number(form.completionPercentage);
    if (isNaN(pct) || pct < 0 || pct > 100) e.completionPercentage = 'Must be 0–100';
    return e;
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    const payload = { ...form, completionPercentage: Number(form.completionPercentage) };
    if (!payload.caseId) delete payload.caseId;
    onSubmit(payload);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-xl bg-navy-800 rounded-2xl border border-navy-600 shadow-modal animate-slide-up max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-navy-600">
          <h2 className="font-heading text-xl font-bold text-lex-text">
            {initialData ? 'Edit Task' : 'New Task'}
          </h2>
          <button onClick={onClose} className="btn-icon"><X size={18} /></button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="label">Task Title <span className="text-lex-danger">*</span></label>
            <input className={`input ${errors.title ? 'border-lex-danger' : ''}`}
              value={form.title} onChange={(e) => set('title', e.target.value)}
              placeholder="e.g. File motion to suppress evidence" />
            {errors.title && <p className="text-xs text-lex-danger mt-1">{errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="label">Description</label>
            <textarea className="input resize-none" rows={2}
              value={form.description} onChange={(e) => set('description', e.target.value)}
              placeholder="Additional details…" />
          </div>

          {/* Case + Assigned To */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Related Case</label>
              <select className="select" value={form.caseId} onChange={(e) => set('caseId', e.target.value)}>
                <option value="">Select case…</option>
                {cases.map((c) => (
                  <option key={c._id} value={c._id}>{c.caseNumber} – {c.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Assigned To</label>
              <select className="select" value={form.assignedTo} onChange={(e) => set('assignedTo', e.target.value)}>
                <option value="">Select attorney…</option>
                {ATTORNEYS.map((a) => <option key={a}>{a}</option>)}
              </select>
            </div>
          </div>

          {/* Priority + Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Priority</label>
              <select className="select" value={form.priority} onChange={(e) => set('priority', e.target.value)}>
                {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Status</label>
              <select className="select" value={form.status} onChange={(e) => set('status', e.target.value)}>
                {STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Due Date + Progress */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Due Date</label>
              <input type="date" className="input"
                value={form.dueDate} onChange={(e) => set('dueDate', e.target.value)} />
            </div>
            <div>
              <label className="label">Completion %</label>
              <input
                type="number" min={0} max={100}
                className={`input ${errors.completionPercentage ? 'border-lex-danger' : ''}`}
                value={form.completionPercentage}
                onChange={(e) => {
                  const v = Math.min(100, Math.max(0, Number(e.target.value) || 0));
                  set('completionPercentage', v);
                }} />
              {errors.completionPercentage && (
                <p className="text-xs text-lex-danger mt-1">{errors.completionPercentage}</p>
              )}
            </div>
          </div>

          {/* Progress slider */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-lex-muted uppercase tracking-wider">Progress</span>
              <span className={`text-xs font-bold ${
                Number(form.completionPercentage) >= 75 ? 'text-lex-success'
                : Number(form.completionPercentage) >= 40 ? 'text-gold'
                : 'text-lex-danger'
              }`}>{Number(form.completionPercentage)}%</span>
            </div>
            <input
              type="range" min={0} max={100} step={1}
              value={form.completionPercentage}
              onChange={(e) => set('completionPercentage', Number(e.target.value))}
              className="w-full h-2 rounded-full cursor-pointer appearance-none bg-navy-600"
              style={{
                background: `linear-gradient(to right, ${
                  Number(form.completionPercentage) >= 75 ? '#22c55e'
                  : Number(form.completionPercentage) >= 40 ? '#C9A84C'
                  : '#ef4444'
                } ${form.completionPercentage}%, #2A3042 ${form.completionPercentage}%)`
              }}
            />
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
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? 'Saving…' : initialData ? 'Save Changes' : 'Create Task'}
          </button>
        </div>
      </div>
    </div>
  );
}
