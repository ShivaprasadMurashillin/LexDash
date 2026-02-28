import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, Menu, LogOut, Search } from 'lucide-react';
import { seedAPI, notificationsAPI } from '../api';
import toast from 'react-hot-toast';
import NotificationsPanel from './NotificationsPanel';
import GlobalSearch from './GlobalSearch';

const POLL_INTERVAL = 30_000; // 30 seconds

const PAGE_TITLES = {
  '/':          { title: 'Dashboard',       sub: 'Overview of all case activity'        },
  '/cases':     { title: 'Cases',           sub: 'Manage and track all active cases'    },
  '/documents': { title: 'Documents',       sub: 'Legal documents and filings'          },
  '/tasks':     { title: 'Tasks',           sub: 'Action items and deadlines'           },
  '/clients':   { title: 'Clients',         sub: 'Client directory and profiles'        },
  '/profile':   { title: 'My Profile',      sub: 'Manage your account settings'         },
  '/users':     { title: 'User Management', sub: 'Manage attorney accounts and access'  },
  '/calendar':  { title: 'Calendar',        sub: 'Deadlines, court dates & task due dates' },
  '/analytics': { title: 'Analytics',       sub: 'In-depth performance metrics & insights' },
  '/billing':   { title: 'Billing',         sub: 'Invoices, payments & revenue tracking'   },
};

/** Returns the user's initials (up to 2 letters) */
function initials(name = '') {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'U';
}

export default function Navbar({ onMenuClick, user, onLogout }) {
  const { pathname } = useLocation();
  const navigate     = useNavigate();
  const { title, sub } = PAGE_TITLES[pathname] ?? { title: 'Brieflytix', sub: '' };

  const [notifOpen,     setNotifOpen]     = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const [searchOpen,    setSearchOpen]    = useState(false);
  const pollRef = useRef(null);

  // Ctrl+K / Cmd+K shortcut
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const { data } = await notificationsAPI.getAll();
      if (data.success) {
        setNotifications(data.data);
        setUnreadCount(data.unreadCount ?? 0);
      }
    } catch {
      // silently fail — don't spam the user with errors on background poll
    }
  }, []);

  // Initial fetch + polling every 30s
  useEffect(() => {
    if (!user) return;
    fetchNotifications();
    pollRef.current = setInterval(fetchNotifications, POLL_INTERVAL);
    return () => clearInterval(pollRef.current);
  }, [user, fetchNotifications]);

  // Re-fetch immediately when panel is opened
  const handleBellClick = () => {
    setNotifOpen((o) => !o);
    fetchNotifications();
  };

  const handleMarkAllRead = async () => {
    await notificationsAPI.markAllRead();
    fetchNotifications();
  };

  const handleMarkRead = async (id) => {
    await notificationsAPI.markRead(id);
    fetchNotifications();
  };

  const handleClearAll = async () => {
    await notificationsAPI.clearAll();
    setNotifications([]);
    setUnreadCount(0);
  };

  const handleSeed = async () => {
    const tid = toast.loading('Seeding demo data…');
    try {
      const { data } = await seedAPI.seed();
      toast.success(data.message || 'Database seeded!', { id: tid });
      setTimeout(() => window.location.reload(), 800);
    } catch (err) {
      toast.error(err.message, { id: tid });
    }
  };

  const handleLogout = () => {
    toast.success(`Goodbye, ${user?.name?.split(' ')[0] ?? 'User'}!`);
    setTimeout(() => onLogout?.(), 600);
  };

  return (
    <React.Fragment>
    <header className="h-16 shrink-0 flex items-center justify-between px-6
                       bg-navy-800 border-b border-navy-600 z-30">
      {/* Left: hamburger + page title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="btn-icon md:hidden"
          aria-label="Toggle sidebar"
        >
          <Menu size={20} />
        </button>
        <div>
          <h2 className="font-heading text-lg font-semibold text-lex-text leading-tight">{title}</h2>
          <p className="text-xs text-lex-muted hidden sm:block">{sub}</p>
        </div>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2">
        {/* Global search trigger */}
        <button
          onClick={() => setSearchOpen(true)}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg
                     text-xs text-lex-muted border border-navy-600
                     hover:border-navy-500 hover:text-lex-text transition-colors duration-200"
          title="Search (Ctrl+K)"
        >
          <Search size={13} />
          <span>Search…</span>
          <kbd className="ml-1 px-1 py-0.5 rounded border border-navy-500 text-[10px] font-mono">⌃K</kbd>
        </button>

        {/* Seed button */}
        <button
          onClick={handleSeed}
          className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-lg
                     text-xs font-semibold border border-gold/30 text-gold
                     hover:bg-gold/10 transition-colors duration-200"
          title="Populate demo data"
        >
          🌱 Seed Data
        </button>

        {/* Notification bell */}
        <div className="relative">
          <button
            onClick={handleBellClick}
            className="btn-icon relative"
            aria-label="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500
                               text-white text-[9px] font-bold flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          {notifOpen && (
            <NotificationsPanel
              notifications={notifications}
              onClose={() => setNotifOpen(false)}
              onMarkAllRead={handleMarkAllRead}
              onMarkRead={handleMarkRead}
              onClearAll={handleClearAll}
            />
          )}
        </div>

        {/* User info + Logout */}
        {user && (
          <div className="flex items-center gap-2 pl-2 border-l border-navy-600">
            {/* Avatar — click to open profile */}
            <div
              className="w-8 h-8 rounded-full bg-gold flex items-center justify-center
                         text-navy-900 font-bold text-xs select-none cursor-pointer
                         hover:ring-2 hover:ring-gold/50 transition-all"
              title={`${user.name} · ${user.role} — View Profile`}
              onClick={() => navigate('/profile')}
            >
              {initials(user.name)}
            </div>

            {/* Name + role — click to open profile */}
            <div
              className="hidden md:block text-right leading-tight cursor-pointer"
              onClick={() => navigate('/profile')}
            >
              <p className="text-xs font-semibold text-lex-text">{user.name}</p>
              <p className="text-[10px] text-lex-muted">{user.role}</p>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="btn-icon text-lex-muted hover:text-lex-danger"
              title="Sign out"
              aria-label="Sign out"
            >
              <LogOut size={17} />
            </button>
          </div>
        )}
      </div>
    </header>

    {/* Global Search Modal */}
    <GlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </React.Fragment>
  );
}
