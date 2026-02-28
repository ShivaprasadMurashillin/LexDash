import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard, Briefcase, FileText, CheckSquare,
  Users, ChevronLeft, ChevronRight, Scale, UserCircle, Settings, CalendarDays,
  BarChart3, Receipt,
} from 'lucide-react';

const MAIN_NAV = [
  { to: '/',          icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/cases',     icon: Briefcase,       label: 'Cases'     },
  { to: '/documents', icon: FileText,        label: 'Documents' },
  { to: '/tasks',     icon: CheckSquare,     label: 'Tasks'     },
  { to: '/clients',   icon: Users,           label: 'Clients'   },
  { to: '/billing',   icon: Receipt,         label: 'Billing'   },
  { to: '/calendar',  icon: CalendarDays,    label: 'Calendar'  },
  { to: '/analytics', icon: BarChart3,       label: 'Analytics' },
];

function initials(name = '') {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'U';
}

function NavItem({ to, icon: Icon, label, end, collapsed }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) => `
        relative flex items-center gap-3 mx-2 px-3 py-2.5 rounded-lg
        transition-all duration-200 group text-sm font-medium
        ${isActive
          ? 'bg-gold/10 text-gold border-l-2 border-gold pl-[10px]'
          : 'text-lex-muted hover:bg-navy-700 hover:text-lex-text border-l-2 border-transparent'
        }
      `}
    >
      <Icon size={18} className="shrink-0" />
      {!collapsed && <span className="truncate">{label}</span>}
      {collapsed && (
        <span className="
          absolute left-full ml-3 px-2.5 py-1.5 bg-navy-700 border border-navy-600
          rounded-lg text-lex-text text-xs whitespace-nowrap shadow-modal
          opacity-0 pointer-events-none group-hover:opacity-100
          transition-opacity duration-200 z-50
        ">
          {label}
        </span>
      )}
    </NavLink>
  );
}

export default function Sidebar({ collapsed, onToggle, user }) {
  const displayName  = user?.name ?? 'Elena Novak';
  const displayRole  = user?.role ?? 'Senior Partner';
  const userInitials = initials(displayName);

  return (
    <aside
      className={`
        fixed top-0 left-0 h-full z-40 flex flex-col
        bg-navy-800 border-r border-navy-600 shadow-card
        transition-all duration-300
        ${collapsed ? 'w-16' : 'w-64'}
      `}
    >
      {/* ── Logo ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-navy-600 shrink-0">
        {!collapsed && (
          <div className="flex items-center gap-2.5 animate-fade-in">
            <Scale size={22} className="text-gold shrink-0" />
            <span className="font-heading text-xl font-bold text-gold tracking-wide">
              Brieflytix
            </span>
          </div>
        )}
        {collapsed && <Scale size={22} className="text-gold mx-auto" />}

        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg text-lex-muted hover:text-gold hover:bg-navy-700 transition-colors ml-auto"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* ── Navigation ───────────────────────────────────────────────────── */}
      <nav className="flex-1 py-3 overflow-y-auto scrollbar-hide">
        {/* Main pages */}
        {MAIN_NAV.map((item) => (
          <NavItem key={item.to} {...item} collapsed={collapsed} />
        ))}

        {/* Divider */}
        <div className={`my-2 ${collapsed ? 'mx-3' : 'mx-4'} border-t border-navy-600 opacity-40`} />

        {/* Profile */}
        <NavItem to="/profile" icon={UserCircle} label="My Profile" collapsed={collapsed} />

        {/* User Management — admin only */}
        {user?.isAdmin && (
          <NavItem to="/users" icon={Settings} label="User Management" collapsed={collapsed} />
        )}
      </nav>

      {/* ── User badge → links to /profile ────────────────────────────── */}
      <Link
        to="/profile"
        className="block border-t border-navy-600 hover:bg-navy-700/50 transition-colors"
      >
        {!collapsed ? (
          <div className="p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center text-navy-900 font-bold text-xs shrink-0">
              {userInitials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-lex-text truncate">{displayName}</p>
              <p className="text-xs text-lex-muted truncate">{displayRole}</p>
            </div>
          </div>
        ) : (
          <div className="p-3 flex justify-center" title={`${displayName} · ${displayRole}`}>
            <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center text-navy-900 font-bold text-xs">
              {userInitials}
            </div>
          </div>
        )}
      </Link>
    </aside>
  );
}
