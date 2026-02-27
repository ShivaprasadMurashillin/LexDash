import React, { useEffect, useRef } from 'react';
import {
  X, Bell, CheckCheck, Trash2,
  AlertTriangle, Info, CheckCircle, AlertCircle,
} from 'lucide-react';

const TYPE_CONFIG = {
  info:    { Icon: Info,          color: 'text-blue-400',   bg: 'bg-blue-400/10'  },
  success: { Icon: CheckCircle,   color: 'text-green-400',  bg: 'bg-green-400/10' },
  warning: { Icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-400/10'},
  danger:  { Icon: AlertCircle,   color: 'text-red-400',    bg: 'bg-red-400/10'   },
};

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export default function NotificationsPanel({ notifications, onClose, onMarkAllRead, onMarkRead, onClearAll }) {
  const ref    = useRef(null);
  const unread = notifications.filter((n) => !n.read).length;

  /* close on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  /* close on Escape */
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute top-full right-0 mt-2 w-80 bg-navy-800 border border-navy-600
                 rounded-xl shadow-modal z-50 animate-fade-in flex flex-col overflow-hidden"
      style={{ maxHeight: '440px' }}
    >
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-navy-600 shrink-0">
        <div className="flex items-center gap-2">
          <Bell size={14} className="text-gold" />
          <span className="font-semibold text-sm text-lex-text">Notifications</span>
          {unread > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold leading-none">
              {unread}
            </span>
          )}
        </div>
        <div className="flex items-center gap-0.5">
          {unread > 0 && (
            <button
              onClick={onMarkAllRead}
              className="btn-icon text-lex-muted hover:text-green-400"
              title="Mark all as read"
            >
              <CheckCheck size={15} />
            </button>
          )}
          <button onClick={onClose} className="btn-icon text-lex-muted">
            <X size={15} />
          </button>
        </div>
      </div>

      {/* ── List ───────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-lex-muted">
            <Bell size={28} className="mb-2 opacity-20" />
            <p className="text-sm">All caught up!</p>
          </div>
        ) : (
          notifications.map((n) => {
            const cfg = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.info;
            return (
              <div
                key={n._id}
                onClick={() => !n.read && onMarkRead?.(n._id)}
                className={`flex gap-3 px-4 py-3 border-b border-navy-700/60 last:border-0
                            ${!n.read ? 'bg-navy-700/30 cursor-pointer hover:bg-navy-700/50' : ''}`}
              >
                <div
                  className={`w-7 h-7 rounded-lg ${cfg.bg} flex items-center justify-center shrink-0 mt-0.5`}
                >
                  <cfg.Icon size={14} className={cfg.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-semibold leading-tight ${n.read ? 'text-lex-muted' : 'text-lex-text'}`}>
                    {n.title}
                  </p>
                  <p className="text-[11px] text-lex-muted mt-0.5 leading-tight line-clamp-2">{n.message}</p>
                  <p className="text-[10px] text-navy-500 mt-1">{timeAgo(n.createdAt)}</p>
                </div>
                {!n.read && (
                  <span className="w-2 h-2 rounded-full bg-gold shrink-0 mt-1.5" />
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      {notifications.length > 0 && (
        <div className="px-4 py-2.5 border-t border-navy-600 shrink-0">
          <button
            onClick={onClearAll}
            className="flex items-center gap-1.5 text-xs text-lex-muted hover:text-red-400 transition-colors"
          >
            <Trash2 size={12} /> Clear all notifications
          </button>
        </div>
      )}
    </div>
  );
}
