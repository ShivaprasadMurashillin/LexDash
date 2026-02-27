import React, { useState, useEffect } from 'react';
import {
  Save, Lock, User, Phone, Globe, Mail,
  Shield, Calendar, Eye, EyeOff,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getUserById, getUsers, updateUser } from '../utils/userStore';

const SHOW_INIT = { current: false, newPwd: false, confirm: false };

function initials(name = '') {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase() || 'U';
}

const Spinner = () => (
  <div className="w-4 h-4 border-2 border-navy-900 border-t-transparent rounded-full animate-spin" />
);

export default function Profile({ user, onUserUpdate }) {
  const [form,     setForm]     = useState({ name: '', phone: '', nationality: '' });
  const [fullUser, setFullUser] = useState(null);
  const [saving,   setSaving]   = useState(false);

  const [pwdForm,   setPwdForm]   = useState({ current: '', newPwd: '', confirm: '' });
  const [pwdErrors, setPwdErrors] = useState({});
  const [savingPwd, setSavingPwd] = useState(false);
  const [showPwds,  setShowPwds]  = useState(SHOW_INIT);

  const [loadError, setLoadError] = useState(false);

  /* load full user from store — id lookup, fallback to email lookup */
  useEffect(() => {
    let u = null;
    if (user?.id) {
      u = getUserById(user.id);
    }
    // Fallback: match by email (handles old sessions without id)
    if (!u && user?.email) {
      u = getUsers().find(
        (s) => s.email.toLowerCase() === user.email.toLowerCase()
      ) || null;
    }
    if (u) {
      setFullUser(u);
      setForm({ name: u.name || '', phone: u.phone || '', nationality: u.nationality || '' });
    } else {
      setLoadError(true);
    }
  }, [user?.id, user?.email]);

  if (loadError) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <p className="text-lex-muted text-sm">Could not load profile. Please sign out and sign in again.</p>
    </div>
  );

  if (!fullUser) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const setField    = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setPwdField = (k, v) => {
    setPwdForm((f) => ({ ...f, [k]: v }));
    setPwdErrors((e) => ({ ...e, [k]: '' }));
  };
  const toggleShow = (k) => setShowPwds((s) => ({ ...s, [k]: !s[k] }));

  /* ── Save profile ──────────────────────────────────────────────────── */
  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Name cannot be empty'); return; }
    setSaving(true);
    setTimeout(() => {
      const updated = updateUser(fullUser.id, {   // use fullUser.id — always reliable
        name:        form.name.trim(),
        phone:       form.phone.trim(),
        nationality: form.nationality.trim(),
      });
      setFullUser(updated);
      onUserUpdate(updated);
      toast.success('Profile updated!');
      setSaving(false);
    }, 400);
  };

  /* ── Change password ────────────────────────────────────────────────── */
  const handleChangePassword = (e) => {
    e.preventDefault();
    const errs = {};
    if (!pwdForm.current)                   errs.current = 'Enter your current password';
    if (!pwdForm.newPwd)                    errs.newPwd  = 'Enter a new password';
    else if (pwdForm.newPwd.length < 6)     errs.newPwd  = 'At least 6 characters required';
    if (pwdForm.newPwd !== pwdForm.confirm) errs.confirm = 'Passwords do not match';
    if (Object.keys(errs).length) { setPwdErrors(errs); return; }

    if (fullUser.password !== pwdForm.current) {
      setPwdErrors({ current: 'Incorrect current password' });
      return;
    }
    setSavingPwd(true);
    setTimeout(() => {
      updateUser(fullUser.id, { password: pwdForm.newPwd });
      setPwdForm({ current: '', newPwd: '', confirm: '' });
      toast.success('Password changed!');
      setSavingPwd(false);
    }, 400);
  };

  const pwdFields = [
    { key: 'current', label: 'Current Password', placeholder: 'Enter your current password' },
    { key: 'newPwd',  label: 'New Password',      placeholder: 'Min. 6 characters'           },
    { key: 'confirm', label: 'Confirm Password',  placeholder: 'Repeat new password'          },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Page header */}
      <div>
        <h1 className="page-title">My Profile</h1>
        <p className="page-subtitle">Manage your personal information and security settings</p>
      </div>

      {/* ── Personal info ──────────────────────────────────────────────── */}
      <div className="card p-6">
        {/* Avatar block */}
        <div className="flex items-center gap-5 mb-6 pb-6 border-b border-navy-600">
          <div className="w-16 h-16 rounded-2xl bg-gold flex items-center justify-center
                          text-navy-900 font-bold text-2xl shrink-0 shadow-gold">
            {initials(form.name || fullUser.name)}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-heading text-xl font-bold text-lex-text truncate">
              {form.name || fullUser.name}
            </h2>
            <p className="text-sm text-lex-muted">{fullUser.role}</p>
            <p className="text-xs text-lex-muted mt-0.5">{fullUser.email}</p>
          </div>
          {fullUser.isAdmin && (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full
                             bg-gold/10 border border-gold/20 text-gold text-xs font-semibold shrink-0">
              <Shield size={11} /> Admin
            </span>
          )}
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Name */}
            <div className="col-span-2">
              <label className="label flex items-center gap-1.5">
                <User size={12} className="text-lex-muted" /> Full Name
              </label>
              <input
                className="input"
                value={form.name}
                onChange={(e) => setField('name', e.target.value)}
                placeholder="Your full name"
              />
            </div>

            {/* Email (read-only) */}
            <div>
              <label className="label flex items-center gap-1.5">
                <Mail size={12} className="text-lex-muted" /> Email
              </label>
              <input
                className="input opacity-60 cursor-not-allowed"
                value={fullUser.email}
                readOnly
              />
            </div>

            {/* Phone */}
            <div>
              <label className="label flex items-center gap-1.5">
                <Phone size={12} className="text-lex-muted" /> Phone
              </label>
              <input
                className="input"
                value={form.phone}
                onChange={(e) => setField('phone', e.target.value)}
                placeholder="+1 (555) 000-0000"
              />
            </div>

            {/* Nationality */}
            <div>
              <label className="label flex items-center gap-1.5">
                <Globe size={12} className="text-lex-muted" /> Nationality
              </label>
              <input
                className="input"
                value={form.nationality}
                onChange={(e) => setField('nationality', e.target.value)}
                placeholder="e.g. American, British, Indian…"
              />
            </div>

            {/* Role (read-only) */}
            <div>
              <label className="label flex items-center gap-1.5">
                <Shield size={12} className="text-lex-muted" /> Role
              </label>
              <input
                className="input opacity-60 cursor-not-allowed"
                value={fullUser.role}
                readOnly
              />
            </div>

            {/* Joined date (read-only) */}
            <div className="col-span-2">
              <label className="label flex items-center gap-1.5">
                <Calendar size={12} className="text-lex-muted" /> Joined Date
              </label>
              <input
                className="input w-48 opacity-60 cursor-not-allowed"
                value={fullUser.joinedDate || '—'}
                readOnly
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button type="submit" disabled={saving} className="btn-primary gap-2">
              {saving ? <Spinner /> : <Save size={15} />}
              {saving ? 'Saving…' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>

      {/* ── Change password ────────────────────────────────────────────── */}
      <div className="card p-6">
        <h3 className="font-heading text-lg font-bold text-lex-text mb-4 flex items-center gap-2">
          <Lock size={17} className="text-gold" /> Change Password
        </h3>
        <form onSubmit={handleChangePassword} className="space-y-4">
          {pwdFields.map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="label">{label}</label>
              <div className="relative">
                <input
                  type={showPwds[key] ? 'text' : 'password'}
                  value={pwdForm[key]}
                  onChange={(e) => setPwdField(key, e.target.value)}
                  placeholder={placeholder}
                  className={`input pr-10 ${pwdErrors[key] ? 'border-red-500' : ''}`}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => toggleShow(key)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-lex-muted hover:text-lex-text transition-colors"
                >
                  {showPwds[key] ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {pwdErrors[key] && (
                <p className="text-red-400 text-xs mt-1">{pwdErrors[key]}</p>
              )}
            </div>
          ))}
          <div className="flex justify-end pt-2">
            <button type="submit" disabled={savingPwd} className="btn-primary gap-2">
              {savingPwd ? <Spinner /> : <Lock size={15} />}
              {savingPwd ? 'Updating…' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
