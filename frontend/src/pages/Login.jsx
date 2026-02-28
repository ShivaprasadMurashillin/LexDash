import React, { useState } from 'react';
import { Scale, Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
import { findUser } from '../utils/userStore';

/**
 * Brieflytix Login Page
 * Credentials are managed in localStorage via userStore.
 * Default admin: admin@brieflytix.com / Brieflytix2026
 */

export default function Login({ onLogin }) {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPwd,  setShowPwd]  = useState(false);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);

    // Simulate a brief loading delay for realism
    setTimeout(() => {
      const user = findUser(email, password);

      if (user) {
        onLogin(user);
      } else {
        setError('Invalid email or password. Please try again.');
        setLoading(false);
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center p-4">

      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-gold/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-gold/5 blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gold/10 border border-gold/20 mb-4 shadow-gold">
            <Scale size={32} className="text-gold" />
          </div>
          <h1 className="font-heading text-4xl font-bold text-gold tracking-wide">Brieflytix</h1>
          <p className="text-lex-muted text-sm mt-1">Attorney Case Management System</p>
        </div>

        {/* Card */}
        <div className="card p-8 shadow-modal border-navy-600">
          <div className="mb-6">
            <h2 className="font-heading text-xl font-bold text-lex-text">Sign In</h2>
            <p className="text-sm text-lex-muted mt-1">Enter your credentials to access the dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error banner */}
            {error && (
              <div className="flex items-center gap-2.5 px-4 py-3 rounded-lg bg-lex-danger/10 border border-lex-danger/20 text-lex-danger text-sm animate-fade-in">
                <AlertCircle size={16} className="shrink-0" />
                {error}
              </div>
            )}

            {/* Email */}
            <div>
              <label className="label">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                placeholder="yourname@brieflytix.com"
                className="input"
                autoComplete="email"
                autoFocus
              />
            </div>

            {/* Password */}
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder="••••••••••"
                  className="input pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-lex-muted hover:text-lex-text transition-colors"
                  tabIndex={-1}
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3 mt-2 text-base"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
              ) : (
                <LogIn size={18} />
              )}
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          {/* Demo credentials hint */}
          <div className="mt-6 p-4 rounded-lg bg-navy-700 border border-navy-600">
            <p className="text-xs font-semibold text-lex-muted uppercase tracking-wider mb-2">Demo Credentials</p>
            <div className="space-y-1 text-xs text-lex-muted font-mono">
              <p><span className="text-gold">Email:</span>    admin@brieflytix.com</p>
              <p><span className="text-gold">Password:</span> Brieflytix2026</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-lex-muted mt-6">
          ⚖️ Brieflytix © 2026 · Confidential Legal Platform
        </p>
      </div>
    </div>
  );
}
