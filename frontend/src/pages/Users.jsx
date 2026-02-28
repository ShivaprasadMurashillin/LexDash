import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus, Pencil, Trash2, X, Eye, EyeOff,
  Shield, UserCheck, Users as UsersIcon,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getUsers, addUser, updateUser, deleteUser } from '../utils/userStore';

const ROLES = [
  'Senior Partner', 'Partner', 'Associate Attorney',
  'Junior Associate', 'Paralegal', 'Law Clerk',
];

const EMPTY_FORM = {
  name: '', email: '', password: '', role: 'Associate Attorney',
  phone: '', nationality: '', isAdmin: false,
};

function initials(name = '') {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase() || 'U';
}

/* ── User Modal ──────────────────────────────────────────────────────────── */
function UserModal({ isOpen, onClose, initialData, onSubmit, currentUserId }) {
  const [form,    setForm]    = useState(EMPTY_FORM);
  const [errors,  setErrors]  = useState({});
  const [showPwd, setShowPwd] = useState(false);
  const isEdit = !!initialData;
  const isSelf = initialData?.id === currentUserId;

  useEffect(() => {
    if (!isOpen) return;
    setForm(
      isEdit
        ? {
            name:        initialData.name        || '',
            email:       initialData.email        || '',
            password:    '',  /* never pre-fill */
            role:        initialData.role         || 'Associate Attorney',
            phone:       initialData.phone        || '',
            nationality: initialData.nationality  || '',
            isAdmin:     initialData.isAdmin      || false,
          }
        : EMPTY_FORM
    );
    setErrors({});
    setShowPwd(false);
  }, [isOpen]); // eslint-disable-line

  if (!isOpen) return null;

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())  e.name  = 'Name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email format';
    if (!isEdit) {
      if (!form.password.trim())      e.password = 'Password is required';
      else if (form.password.length < 6) e.password = 'Min. 6 characters';
    } else if (form.password && form.password.length < 6) {
      e.password = 'Min. 6 characters';
    }
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    const data = { ...form };
    if (isEdit && !data.password) delete data.password;
    onSubmit(data);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg bg-navy-800 rounded-2xl border border-navy-600 shadow-modal animate-slide-up flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-navy-600 shrink-0">
          <h2 className="font-heading text-xl font-bold text-lex-text">
            {isEdit ? 'Edit User' : 'Add New User'}
          </h2>
          <button onClick={onClose} className="btn-icon"><X size={18} /></button>
        </div>

        {/* Form body */}
        <form
          id="user-modal-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-6 space-y-4"
        >
          {/* Name */}
          <div>
            <label className="label">Full Name *</label>
            <input
              className={`input ${errors.name ? 'border-red-500' : ''}`}
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="Attorney's full name"
            />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Email */}
            <div>
              <label className="label">Email *</label>
              <input
                type="email"
                className={`input ${errors.email ? 'border-red-500' : ''} ${isEdit ? 'opacity-60 cursor-not-allowed' : ''}`}
                value={form.email}
                onChange={(e) => !isEdit && set('email', e.target.value)}
                readOnly={isEdit}
                placeholder="name@brieflytix.com"
              />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="label">
                Password{' '}
                {isEdit
                  ? <span className="text-lex-muted font-normal text-[11px]">(blank = keep)</span>
                  : '*'
                }
              </label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  className={`input pr-10 ${errors.password ? 'border-red-500' : ''}`}
                  value={form.password}
                  onChange={(e) => set('password', e.target.value)}
                  placeholder={isEdit ? 'Leave blank to keep' : 'Min. 6 characters'}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPwd((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-lex-muted hover:text-lex-text"
                >
                  {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
            </div>

            {/* Role */}
            <div>
              <label className="label">Role</label>
              <select
                className="select"
                value={form.role}
                onChange={(e) => set('role', e.target.value)}
              >
                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            {/* Phone */}
            <div>
              <label className="label">Phone</label>
              <input
                className="input"
                value={form.phone}
                onChange={(e) => set('phone', e.target.value)}
                placeholder="+1 (555) 000-0000"
              />
            </div>

            {/* Nationality */}
            <div className="col-span-2">
              <label className="label">Nationality</label>
              <input
                className="input"
                value={form.nationality}
                onChange={(e) => set('nationality', e.target.value)}
                placeholder="e.g. American, British, Indian…"
              />
            </div>
          </div>

          {/* Admin toggle */}
          <div className={`p-3 rounded-lg border transition-colors
            ${form.isAdmin ? 'border-gold/30 bg-gold/5' : 'border-navy-600 bg-navy-700/40'}`}
          >
            <label className={`flex items-center gap-3 ${isSelf ? 'opacity-50' : 'cursor-pointer'}`}>
              <div
                className={`relative w-10 h-6 rounded-full transition-colors duration-200
                  ${form.isAdmin ? 'bg-gold' : 'bg-navy-600'} ${isSelf ? '' : 'cursor-pointer'}`}
                onClick={() => !isSelf && set('isAdmin', !form.isAdmin)}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow
                  transition-transform duration-200
                  ${form.isAdmin ? 'translate-x-5' : 'translate-x-1'}`}
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-lex-text flex items-center gap-1.5">
                  <Shield size={14} className={form.isAdmin ? 'text-gold' : 'text-lex-muted'} />
                  Administrator Access
                </p>
                <p className="text-xs text-lex-muted">Can manage users and system settings</p>
              </div>
            </label>
            {isSelf && (
              <p className="text-xs text-yellow-400 mt-2">
                ⚠ You cannot change your own admin status
              </p>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-navy-600 flex justify-end gap-3 shrink-0">
          <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
          <button type="submit" form="user-modal-form" className="btn-primary">
            {isEdit ? 'Save Changes' : 'Add User'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Users Page ──────────────────────────────────────────────────────────── */
export default function Users({ currentUserId }) {
  const [users,       setUsers]       = useState([]);
  const [modalOpen,   setModalOpen]   = useState(false);
  const [editTarget,  setEditTarget]  = useState(null);
  const [deleteId,    setDeleteId]    = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const load = useCallback(() => setUsers(getUsers()), []);
  useEffect(() => { load(); }, [load]);

  const handleAdd  = ()  => { setEditTarget(null); setModalOpen(true); };
  const handleEdit = (u) => { setEditTarget(u);    setModalOpen(true); };

  const handleSubmit = (data) => {
    if (editTarget) {
      const result = updateUser(editTarget.id, data);
      if (result) {
        toast.success(`${result.name} updated`);
        load();
        setModalOpen(false);
      }
    } else {
      const result = addUser(data);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(`${result.name} added to the team!`);
        load();
        setModalOpen(false);
      }
    }
  };

  const openDelete = (id) => {
    if (id === currentUserId) {
      toast.error("You can't delete your own account");
      return;
    }
    const target     = users.find((u) => u.id === id);
    const adminCount = users.filter((u) => u.isAdmin).length;
    if (target?.isAdmin && adminCount === 1) {
      toast.error('Cannot remove the last administrator');
      return;
    }
    setDeleteId(id);
    setConfirmOpen(true);
  };

  const confirmDelete = () => {
    const target = users.find((u) => u.id === deleteId);
    deleteUser(deleteId);
    toast.success(`${target?.name ?? 'User'} removed`);
    load();
    setConfirmOpen(false);
    setDeleteId(null);
  };

  const adminCount    = users.filter((u) => u.isAdmin).length;
  const attorneyCount = users.filter((u) =>
    u.role.includes('Attorney') || u.role.includes('Partner')
  ).length;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">Manage attorney accounts and system access</p>
        </div>
        <button onClick={handleAdd} className="btn-primary gap-2">
          <Plus size={16} /> Add User
        </button>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Users', value: users.length,  Icon: UsersIcon,  color: 'text-blue-400'  },
          { label: 'Admins',      value: adminCount,     Icon: Shield,     color: 'text-gold'      },
          { label: 'Attorneys',   value: attorneyCount,  Icon: UserCheck,  color: 'text-green-400' },
        ].map(({ label, value, Icon, color }) => (
          <div key={label} className="card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-navy-700 flex items-center justify-center shrink-0">
              <Icon size={18} className={color} />
            </div>
            <div>
              <p className="text-2xl font-bold text-lex-text font-heading">{value}</p>
              <p className="text-xs text-lex-muted">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-navy-600">
                <th className="table-header">User</th>
                <th className="table-header">Email</th>
                <th className="table-header">Role</th>
                <th className="table-header">Nationality</th>
                <th className="table-header">Access</th>
                <th className="table-header">Joined</th>
                <th className="table-header text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isSelf    = u.id === currentUserId;
                const lastAdmin = u.isAdmin && adminCount === 1;
                const canDelete = !isSelf && !lastAdmin;
                return (
                  <tr key={u.id} className="table-row">
                    {/* User */}
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center
                                        text-navy-900 font-bold text-xs shrink-0">
                          {initials(u.name)}
                        </div>
                        <div>
                          <p className="font-semibold text-lex-text text-sm">{u.name}</p>
                          {isSelf && (
                            <span className="text-[10px] text-gold font-semibold">You</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="table-cell text-lex-muted text-sm">{u.email}</td>
                    <td className="table-cell">
                      <span className="badge bg-navy-700 text-lex-text border border-navy-600">
                        {u.role}
                      </span>
                    </td>
                    <td className="table-cell text-lex-muted text-sm">{u.nationality || '—'}</td>
                    <td className="table-cell">
                      {u.isAdmin ? (
                        <span className="flex items-center gap-1 text-gold text-xs font-semibold">
                          <Shield size={12} /> Admin
                        </span>
                      ) : (
                        <span className="text-lex-muted text-xs">Standard</span>
                      )}
                    </td>
                    <td className="table-cell text-lex-muted text-sm">{u.joinedDate || '—'}</td>
                    <td className="table-cell">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEdit(u)}
                          className="btn-icon"
                          title="Edit user"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => openDelete(u.id)}
                          disabled={!canDelete}
                          className={`btn-icon ${canDelete ? 'hover:text-red-400' : 'opacity-25 cursor-not-allowed'}`}
                          title={
                            isSelf    ? "Can't delete your own account" :
                            lastAdmin ? 'Cannot remove the last admin' :
                            'Remove user'
                          }
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      <UserModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialData={editTarget}
        onSubmit={handleSubmit}
        currentUserId={currentUserId}
      />

      {/* Delete confirm dialog */}
      {confirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={(e) => e.target === e.currentTarget && setConfirmOpen(false)}
        >
          <div className="w-full max-w-sm bg-navy-800 rounded-2xl border border-navy-600 shadow-modal p-6 animate-slide-up">
            <h3 className="font-heading text-lg font-bold text-lex-text mb-2">Remove User?</h3>
            <p className="text-sm text-lex-muted mb-6">
              <span className="text-lex-text font-semibold">
                {users.find((u) => u.id === deleteId)?.name}
              </span>{' '}
              will lose all access to Brieflytix. This cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setConfirmOpen(false)} className="btn-ghost">Cancel</button>
              <button onClick={confirmDelete} className="btn-danger">Remove User</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
