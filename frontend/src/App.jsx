import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Sidebar   from './components/Sidebar';
import Navbar    from './components/Navbar';
import Login     from './pages/Login';
import Dashboard from './pages/Dashboard';
import Cases     from './pages/Cases';
import Documents from './pages/Documents';
import Tasks     from './pages/Tasks';
import Clients   from './pages/Clients';
import Profile   from './pages/Profile';
import Users     from './pages/Users';
import Calendar  from './pages/Calendar';
import CaseDetail from './pages/CaseDetail';
import Analytics  from './pages/Analytics';
import Billing    from './pages/Billing';
import { getUsers } from './utils/userStore';
import { setApiUser } from './api';

/* ── Auth helpers ─────────────────────────────────────────────────────── */
const AUTH_KEY = 'lexdash_auth';

function loadUser() {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);

    // Always refresh session fields from the latest user store
    // (handles name changes, role updates, and old sessions without `id`)
    const users = getUsers();
    const match = parsed.id
      ? users.find((u) => u.id === parsed.id)
      : parsed.email
        ? users.find((u) => u.email.toLowerCase() === parsed.email.toLowerCase())
        : null;

    if (match) {
      const refreshed = { id: match.id, name: match.name, role: match.role, email: match.email, isAdmin: match.isAdmin ?? false };
      localStorage.setItem(AUTH_KEY, JSON.stringify(refreshed));
      return refreshed;
    }

    // No match found — force re-login
    localStorage.removeItem(AUTH_KEY);
    return null;
  } catch {
    return null;
  }
}

/* ── App ──────────────────────────────────────────────────────────────── */
export default function App() {
  const [collapsed, setCollapsed] = useState(false);
  const [user,      setUser]      = useState(() => {
    const u = loadUser();
    if (u) setApiUser({ name: u.name, email: u.email }); // restore headers on refresh
    return u;
  });

  const handleLogin = (userData) => {
    // userData from userStore.findUser() — only persist session fields (no password)
    const session = {
      id:      userData.id,
      name:    userData.name,
      role:    userData.role,
      email:   userData.email,
      isAdmin: userData.isAdmin ?? false,
    };
    localStorage.setItem(AUTH_KEY, JSON.stringify(session));
    setApiUser({ name: session.name, email: session.email });
    setUser(session);
  };

  const handleLogout = () => {
    localStorage.removeItem(AUTH_KEY);
    setApiUser({ name: '', email: '' });
    setUser(null);
  };

  const handleUserUpdate = (updatedUser) => {
    const session = {
      id:      updatedUser.id,
      name:    updatedUser.name,
      role:    updatedUser.role,
      email:   updatedUser.email,
      isAdmin: updatedUser.isAdmin ?? false,
    };
    localStorage.setItem(AUTH_KEY, JSON.stringify(session));
    setApiUser({ name: session.name, email: session.email });
    setUser(session);
  };

  return (
    <Router>
      {user ? (
        /* ─── Authenticated layout ─────────────────────────────────────── */
        <div className="flex h-screen bg-navy-900 text-lex-text font-body overflow-hidden">
          {/* Sidebar */}
          <Sidebar
            collapsed={collapsed}
            onToggle={() => setCollapsed(!collapsed)}
            user={user}
          />

          {/* Main content area */}
          <div
            className="flex-1 min-w-0 flex flex-col transition-all duration-300"
            style={{ marginLeft: collapsed ? '4rem' : '16rem' }}
          >
            <Navbar
              onMenuClick={() => setCollapsed(!collapsed)}
              user={user}
              onLogout={handleLogout}
            />

            <main className="flex-1 overflow-y-auto p-6">
              <Routes>
                <Route path="/"          element={<Dashboard user={user} />} />
                <Route path="/cases"     element={<Cases />} />
                <Route path="/cases/:id" element={<CaseDetail />} />
                <Route path="/calendar"   element={<Calendar />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/billing"   element={<Billing />} />
                <Route path="/documents" element={<Documents />} />
                <Route path="/tasks"     element={<Tasks />} />
                <Route path="/clients"   element={<Clients />} />
                <Route path="/profile"   element={<Profile user={user} onUserUpdate={handleUserUpdate} />} />
                <Route path="/users"     element={
                  user.isAdmin
                    ? <Users currentUserId={user.id} />
                    : <Navigate to="/" replace />
                } />
                <Route path="*"          element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </div>
      ) : (
        /* ─── Unauthenticated layout ───────────────────────────────────── */
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="*"      element={<Navigate to="/login" replace />} />
        </Routes>
      )}

      {/* ── Toast notifications ─────────────────────────────────────────── */}
      <Toaster
        position="top-right"
        gutter={8}
        toastOptions={{
          duration: 3500,
          style: {
            background: '#1A1F2E',
            color: '#E8EAF0',
            border: '1px solid #2A3042',
            borderRadius: '10px',
            fontSize: '14px',
            fontFamily: '"DM Sans", sans-serif',
          },
          success: { iconTheme: { primary: '#22C55E', secondary: '#1A1F2E' } },
          error:   { iconTheme: { primary: '#EF4444', secondary: '#1A1F2E' } },
        }}
      />
    </Router>
  );
}
