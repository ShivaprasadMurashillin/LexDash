import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { ChevronLeft, ChevronRight, CheckSquare, FileText, Briefcase, CalendarDays } from 'lucide-react';
import { calendarAPI } from '../api';

/* ── Helpers ──────────────────────────────────────────────────────────────── */
const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];
const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';

/* ── Event type config ──────────────────────────────────────────────────────── */
const KIND_CFG = {
  task:     { color: 'bg-lex-warning/20 text-lex-warning border-lex-warning/40',    dot: 'bg-lex-warning',   icon: CheckSquare, label: 'Task Due' },
  document: { color: 'bg-lex-gold/20 text-lex-gold border-lex-gold/40',             dot: 'bg-lex-gold',      icon: FileText,    label: 'Doc Deadline' },
  court:    { color: 'bg-lex-danger/20 text-lex-danger border-lex-danger/40',       dot: 'bg-lex-danger',    icon: Briefcase,   label: 'Court Date' },
  filing:   { color: 'bg-lex-success/20 text-lex-success border-lex-success/40',    dot: 'bg-lex-success',   icon: Briefcase,   label: 'Filing Date' },
};

/* ── Legend ──────────────────────────────────────────────────────────────── */
function Legend() {
  return (
    <div className="flex flex-wrap gap-3">
      {Object.entries(KIND_CFG).map(([k, cfg]) => (
        <span key={k} className="flex items-center gap-1.5 text-xs text-lex-muted">
          <span className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
          {cfg.label}
        </span>
      ))}
    </div>
  );
}

/* ── Day Cell ────────────────────────────────────────────────────────────── */
function DayCell({ day, events, isToday, isOtherMonth, onClick }) {
  const MAX_DOTS = 3;
  return (
    <button
      onClick={() => day && onClick(day, events)}
      disabled={!day}
      className={`
        relative flex flex-col min-h-[88px] p-1.5 rounded-lg border text-left
        transition-colors duration-150 w-full
        ${!day ? 'invisible' : ''}
        ${isOtherMonth ? 'opacity-30' : ''}
        ${isToday
          ? 'border-lex-gold bg-lex-gold/5'
          : 'border-navy-600 hover:border-navy-500 hover:bg-navy-700/50'
        }
        ${events.length > 0 ? 'cursor-pointer' : 'cursor-default'}
      `}
    >
      {/* Day number */}
      <span className={`text-xs font-semibold mb-1 ${
        isToday ? 'text-lex-gold' : 'text-lex-muted'
      }`}>
        {day}
      </span>

      {/* Event dots + labels (up to 3) */}
      <div className="flex flex-col gap-0.5 flex-1">
        {events.slice(0, MAX_DOTS).map((ev, i) => {
          const cfg = KIND_CFG[ev.kind] || KIND_CFG.task;
          return (
            <span key={i} className={`flex items-center gap-1 text-[10px] px-1 py-0.5 rounded border truncate ${cfg.color}`}>
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
              <span className="truncate">{ev.label}</span>
            </span>
          );
        })}
        {events.length > MAX_DOTS && (
          <span className="text-[10px] text-lex-muted px-1">
            +{events.length - MAX_DOTS} more
          </span>
        )}
      </div>
    </button>
  );
}

/* ── Day Panel (right side) ──────────────────────────────────────────────── */
function DayPanel({ day, events, year, month }) {
  if (!day) return (
    <div className="flex flex-col items-center justify-center h-full gap-3 text-lex-muted">
      <CalendarDays size={32} className="opacity-30" />
      <p className="text-sm">Click a date to see events</p>
    </div>
  );

  const dateLabel = new Date(year, month - 1, day)
    .toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="flex flex-col gap-3">
      <div>
        <h3 className="font-heading font-semibold text-lex-text">{dateLabel}</h3>
        <p className="text-xs text-lex-muted mt-0.5">
          {events.length === 0 ? 'No events' : `${events.length} event${events.length > 1 ? 's' : ''}`}
        </p>
      </div>

      {events.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 gap-2 text-lex-muted">
          <CalendarDays size={28} className="opacity-30" />
          <p className="text-xs">All clear for this day</p>
        </div>
      ) : (
        <div className="space-y-2">
          {events.map((ev, i) => {
            const cfg = KIND_CFG[ev.kind] || KIND_CFG.task;
            const Icon = cfg.icon;
            return (
              <div key={i} className={`p-3 rounded-lg border ${cfg.color}`}>
                <div className="flex items-start gap-2">
                  <Icon size={14} className="mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium leading-tight truncate">{ev.label}</p>
                    <p className="text-xs opacity-70 mt-0.5">{cfg.label}</p>
                    {ev.sub && <p className="text-xs opacity-60 truncate">{ev.sub}</p>}
                    {ev.status && (
                      <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded bg-navy-800/40">
                        {ev.status}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Calendar Page ─────────────────────────────────────────────────────────── */
export default function CalendarPage() {
  const today = new Date();
  const [year,       setYear]      = useState(today.getFullYear());
  const [month,      setMonth]     = useState(today.getMonth() + 1); // 1-based
  const [events,     setEvents]    = useState([]);
  const [loading,    setLoading]   = useState(true);
  const [selected,   setSelected]  = useState(null);  // { day, events }

  /* ── Fetch events for current month ──────────────────────────────── */
  const fetch = useCallback(async (y, m) => {
    try {
      setLoading(true);
      const { data } = await calendarAPI.getEvents(y, m);
      setEvents(data.data || []);
      setSelected(null);
    } catch (err) {
      toast.error('Failed to load calendar events');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(year, month); }, [year, month]);

  /* ── Navigation ───────────────────────────────────────────────────── */
  const prev = () => {
    if (month === 1) { setYear(y => y - 1); setMonth(12); }
    else              setMonth(m => m - 1);
  };
  const next = () => {
    if (month === 12) { setYear(y => y + 1); setMonth(1); }
    else               setMonth(m => m + 1);
  };
  const goToday = () => { setYear(today.getFullYear()); setMonth(today.getMonth() + 1); };

  /* ── Build calendar grid ──────────────────────────────────────────── */
  const firstDow    = new Date(year, month - 1, 1).getDay();   // 0=Sun
  const daysInMonth = new Date(year, month, 0).getDate();

  // Map day → events
  const eventsByDay = {};
  events.forEach((ev) => {
    const d = new Date(ev.date).getDate();
    if (!eventsByDay[d]) eventsByDay[d] = [];
    eventsByDay[d].push(ev);
  });

  // Build 6-week grid (42 cells)
  const cells = Array.from({ length: 42 }, (_, i) => {
    const day = i - firstDow + 1;
    if (day < 1 || day > daysInMonth) return null;
    return day;
  });

  const isToday = (d) =>
    d === today.getDate() &&
    month === today.getMonth() + 1 &&
    year  === today.getFullYear();

  const handleDayClick = (day, evts) => {
    setSelected({ day, events: evts });
  };

  /* ── Summary counts ──────────────────────────────────────────────── */
  const counts = events.reduce((acc, ev) => {
    acc[ev.kind] = (acc[ev.kind] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold text-lex-text">Calendar</h1>
          <p className="text-sm text-lex-muted mt-0.5">Deadlines, court dates &amp; task due dates</p>
        </div>
        <Legend />
      </div>

      {/* Summary chips */}
      {!loading && events.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(counts).map(([k, n]) => {
            const cfg = KIND_CFG[k];
            if (!cfg) return null;
            return (
              <span key={k} className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border font-medium ${cfg.color}`}>
                <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                {n} {cfg.label}{n > 1 ? 's' : ''}
              </span>
            );
          })}
        </div>
      )}

      <div className="flex flex-col xl:flex-row gap-5">
        {/* ── Calendar grid ── */}
        <div className="flex-1 card p-5">
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={prev} className="btn-icon"><ChevronLeft size={18} /></button>
            <div className="flex items-center gap-3">
              <h2 className="font-heading text-lg font-semibold text-lex-text">
                {MONTH_NAMES[month - 1]} {year}
              </h2>
              <button
                onClick={goToday}
                className="text-xs px-2.5 py-1 rounded-lg border border-navy-500 text-lex-muted hover:text-lex-text hover:border-navy-400 transition-colors"
              >
                Today
              </button>
            </div>
            <button onClick={next} className="btn-icon"><ChevronRight size={18} /></button>
          </div>

          {/* Day-of-week headers */}
          <div className="grid grid-cols-7 mb-1.5">
            {DAY_NAMES.map((d) => (
              <div key={d} className="text-center text-[11px] font-semibold text-lex-muted py-1">{d}</div>
            ))}
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-7 gap-1.5">
              {Array.from({ length: 35 }).map((_, i) => (
                <div key={i} className="min-h-[88px] rounded-lg bg-navy-700 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-1.5">
              {cells.map((day, i) => (
                <DayCell
                  key={i}
                  day={day}
                  events={day ? (eventsByDay[day] || []) : []}
                  isToday={isToday(day)}
                  isOtherMonth={!day}
                  onClick={handleDayClick}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Day detail panel ── */}
        <div className="xl:w-72 card p-5">
          <DayPanel
            day={selected?.day}
            events={selected?.events || []}
            year={year}
            month={month}
          />
        </div>
      </div>
    </div>
  );
}
