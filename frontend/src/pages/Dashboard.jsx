import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Briefcase, TrendingUp, CheckSquare, FileText,
  Calendar, AlertTriangle, Clock, Users, BarChart3,
  ArrowRight, DollarSign, Receipt,
} from 'lucide-react';
import { statsAPI, analyticsAPI, billingAPI } from '../api';
import StatCard      from '../components/StatCard';
import BarChartWidget  from '../components/BarChartWidget';
import PieChartWidget  from '../components/PieChartWidget';
import ProgressWidget  from '../components/ProgressWidget';
import { CASE_STATUS_BADGE as STATUS_BADGE, CASE_PRIORITY_BADGE as PRIORITY_BADGE } from '../utils/badgeStyles';

/* ── Date helpers ─────────────────────────────────────────────────────────── */
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

const daysUntil = (d) => Math.ceil((new Date(d) - new Date()) / 86400000);

/* ── Deadline urgency colour ─────────────────────────────────────────────── */
const urgencyClass = (days) => {
  if (days <= 7)  return 'text-lex-danger font-semibold';
  if (days <= 14) return 'text-lex-warning font-semibold';
  return 'text-lex-muted';
};

/* ── Skeleton ────────────────────────────────────────────────────────────── */
function Skeleton({ className }) {
  return <div className={`animate-pulse bg-navy-700 rounded ${className}`} />;
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card p-5 flex gap-4">
            <Skeleton className="w-11 h-11 rounded-xl shrink-0" />
            <div className="flex-1 space-y-2 pt-1">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-7 w-12" />
            </div>
          </div>
        ))}
      </div>
      <div className="grid xl:grid-cols-5 gap-4">
        <div className="xl:col-span-3 card p-5"><Skeleton className="h-64 w-full" /></div>
        <div className="xl:col-span-2 card p-5"><Skeleton className="h-64 w-full" /></div>
      </div>
    </div>
  );
}

/* ── Dashboard Page ──────────────────────────────────────────────────────── */
export default function Dashboard({ user }) {
  const [stats, setStats]           = useState(null);
  const [analytics, setAnalytics]   = useState(null);
  const [billingSummary, setBilling] = useState(null);
  const [loading, setLoad]          = useState(true);
  const [error, setError]           = useState(null);
  const navigate = useNavigate();

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try {
      setLoad(true);
      setError(null);
      const [statsRes, analyticsRes, billingRes] = await Promise.allSettled([
        statsAPI.getDashboard(),
        analyticsAPI.getAnalytics(),
        billingAPI.getSummary(),
      ]);
      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data.data);
      else throw new Error(statsRes.reason?.message || 'Failed');
      if (analyticsRes.status === 'fulfilled') setAnalytics(analyticsRes.value.data.data);
      if (billingRes.status === 'fulfilled') setBilling(billingRes.value.data.data);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoad(false);
    }
  };

  if (loading) return <DashboardSkeleton />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
        <AlertTriangle size={40} className="text-lex-danger" />
        <div>
          <p className="font-heading text-lg text-lex-text">Unable to load dashboard</p>
          <p className="text-sm text-lex-muted mt-1">{error}</p>
        </div>
        <button onClick={fetchStats} className="btn-primary">Retry</button>
      </div>
    );
  }

  const { overview, casesByStatus, casesByType, recentCases, upcomingDeadlines, recentTasks } = stats;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div>
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">
          Welcome back, {user?.name?.split(' ')[0] ?? 'Counselor'}. Here's what's happening today.
        </p>
      </div>

      {/* ── Row 1: Stat Cards ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Cases"    value={overview.totalCases}
          icon={Briefcase}       color="gold"
          trend="+12%"           trendLabel="this year"
        />
        <StatCard
          title="Active Cases"   value={overview.activeCases}
          icon={TrendingUp}      color="green"
          trend={`+${overview.activeCases}`} trendLabel="open"
        />
        <StatCard
          title="Pending Tasks"  value={overview.pendingTasks}
          icon={CheckSquare}     color="yellow"
          trend={overview.pendingTasks > 5 ? `${overview.pendingTasks} open` : '✓ On track'}
        />
        <StatCard
          title="Documents Filed" value={overview.documentsFiled}
          icon={FileText}         color="blue"
          trend={`${overview.documentsFiled} / ${overview.totalDocuments}`} trendLabel="total"
        />
      </div>

      {/* ── Row 1b: Quick Insights from Analytics ─────────────────────── */}
      {analytics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="card p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-green-500/10 flex items-center justify-center">
              <TrendingUp size={16} className="text-green-400" />
            </div>
            <div>
              <p className="text-xs text-lex-muted font-semibold">Closure Rate</p>
              <p className="text-lg font-bold text-lex-text">{analytics.caseOutcomes?.closureRate ?? 0}%</p>
            </div>
          </div>
          <div className="card p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Users size={16} className="text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-lex-muted font-semibold">Total Clients</p>
              <p className="text-lg font-bold text-lex-text">
                {analytics.clientGrowth?.length ? analytics.clientGrowth[analytics.clientGrowth.length - 1].clients : 0}
              </p>
            </div>
          </div>
          <div className="card p-4 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
              analytics.overdueAnalysis?.overdueRate > 20 ? 'bg-red-500/10' : 'bg-gold/10'
            }`}>
              <AlertTriangle size={16} className={
                analytics.overdueAnalysis?.overdueRate > 20 ? 'text-red-400' : 'text-gold'
              } />
            </div>
            <div>
              <p className="text-xs text-lex-muted font-semibold">Overdue Tasks</p>
              <p className="text-lg font-bold text-lex-text">{analytics.overdueAnalysis?.overdue ?? 0}</p>
            </div>
          </div>
          {billingSummary ? (
            <Link to="/billing"
                  className="card p-4 flex items-center gap-3 hover:border-gold/40 transition-colors group cursor-pointer">
              <div className="w-9 h-9 rounded-lg bg-green-500/10 flex items-center justify-center">
                <DollarSign size={16} className="text-green-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-lex-muted font-semibold">Revenue Collected</p>
                <p className="text-lg font-bold text-lex-text">
                  ${((billingSummary.overview?.totalPaid ?? 0) / 1000).toFixed(0)}k
                </p>
              </div>
            </Link>
          ) : (
            <Link to="/analytics"
                  className="card p-4 flex items-center gap-3 hover:border-gold/40 transition-colors group cursor-pointer">
              <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <BarChart3 size={16} className="text-purple-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-lex-muted font-semibold">Analytics</p>
                <p className="text-sm font-medium text-gold flex items-center gap-1 group-hover:gap-2 transition-all">
                  View insights <ArrowRight size={14} />
                </p>
              </div>
            </Link>
          )}
        </div>
      )}

      {/* ── Row 1c: Billing Highlights ─────────────────────────────────── */}
      {billingSummary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link to="/billing" className="card p-4 flex items-center gap-3 hover:border-gold/40 transition-colors">
            <div className="w-9 h-9 rounded-lg bg-gold/10 flex items-center justify-center">
              <Receipt size={16} className="text-gold" />
            </div>
            <div>
              <p className="text-xs text-lex-muted font-semibold">Total Billed</p>
              <p className="text-lg font-bold text-lex-text">
                ${((billingSummary.overview?.totalBilled ?? 0) / 1000).toFixed(0)}k
              </p>
            </div>
          </Link>
          <div className="card p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <Clock size={16} className="text-orange-400" />
            </div>
            <div>
              <p className="text-xs text-lex-muted font-semibold">Outstanding</p>
              <p className="text-lg font-bold text-lex-text">
                ${((billingSummary.overview?.totalOutstanding ?? 0) / 1000).toFixed(0)}k
              </p>
            </div>
          </div>
          <div className="card p-4 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
              (billingSummary.overview?.totalOverdue ?? 0) > 0 ? 'bg-red-500/10' : 'bg-green-500/10'
            }`}>
              <AlertTriangle size={16} className={
                (billingSummary.overview?.totalOverdue ?? 0) > 0 ? 'text-red-400' : 'text-green-400'
              } />
            </div>
            <div>
              <p className="text-xs text-lex-muted font-semibold">Overdue Invoices</p>
              <p className="text-lg font-bold text-lex-text">
                ${((billingSummary.overview?.totalOverdue ?? 0) / 1000).toFixed(0)}k
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Row 2: Charts ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        <div className="xl:col-span-3">
          <BarChartWidget data={casesByType}   title="Cases by Type" />
        </div>
        <div className="xl:col-span-2">
          <PieChartWidget data={casesByStatus} title="Case Status Distribution" />
        </div>
      </div>

      {/* ── Row 3: Recent Cases + Task Progress ──────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        {/* Recent Cases */}
        <div className="xl:col-span-3 card p-5">
          <h3 className="font-heading text-lg font-semibold text-lex-text mb-4">Recent Cases</h3>
          {recentCases.length === 0 ? (
            <p className="text-lex-muted text-sm py-8 text-center">No cases yet — seed the database to populate demo data.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-navy-600">
                    {['Case #', 'Title', 'Client', 'Status', 'Priority'].map((h) => (
                      <th key={h} className="table-header text-left">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentCases.map((c) => (
                    <tr key={c._id} className="table-row hover:bg-navy-700/60 cursor-pointer transition-colors"
                        onClick={() => navigate(`/cases/${c._id}`)}>
                      <td className="table-cell font-mono text-xs text-gold">{c.caseNumber}</td>
                      <td className="table-cell">
                        <Link to={`/cases/${c._id}`} className="text-sm font-medium hover:text-gold transition-colors"
                              onClick={(e) => e.stopPropagation()}>
                          {c.title}
                        </Link>
                      </td>
                      <td className="table-cell text-lex-muted text-xs">
                        <span>{c.clientId?.name ?? '—'}</span>
                      </td>
                      <td className="table-cell">
                        <span className={`badge border text-xs ${STATUS_BADGE[c.status] ?? ''}`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="table-cell">
                        <span className={`badge border text-xs ${PRIORITY_BADGE[c.priority] ?? ''}`}>
                          {c.priority}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Task Progress */}
        <div className="xl:col-span-2">
          <ProgressWidget tasks={recentTasks} />
        </div>
      </div>

      {/* ── Row 4: Upcoming Deadlines ─────────────────────────────────────── */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Calendar size={18} className="text-gold" />
          <h3 className="font-heading text-lg font-semibold text-lex-text">Upcoming Court Dates</h3>
          <span className="text-xs text-lex-muted bg-navy-700 px-2 py-0.5 rounded-full border border-navy-600 ml-auto">
            Next 30 days
          </span>
        </div>

        {upcomingDeadlines.length === 0 ? (
          <p className="text-lex-muted text-sm py-6 text-center">No upcoming court dates in the next 30 days.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-navy-600">
                  {['Case #', 'Title', 'Client', 'Attorney', 'Court Date', 'Days Until'].map((h) => (
                    <th key={h} className="table-header text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {upcomingDeadlines.map((c) => {
                  const days = daysUntil(c.courtDate);
                  return (
                    <tr key={c._id} className="table-row">
                      <td className="table-cell font-mono text-xs text-gold">{c.caseNumber}</td>
                      <td className="table-cell">
                        <p className="text-sm font-medium">{c.title}</p>
                      </td>
                      <td className="table-cell text-lex-muted text-xs">
                        <span>{c.clientId?.name ?? '—'}</span>
                      </td>
                      <td className="table-cell text-lex-muted text-xs">
                        <span>{c.assignedAttorney ?? '—'}</span>
                      </td>
                      <td className="table-cell text-xs text-lex-muted">
                        <span className="flex items-center gap-1">
                          <Clock size={11} />
                          {fmtDate(c.courtDate)}
                        </span>
                      </td>
                      <td className="table-cell">
                        <span className={`text-sm ${urgencyClass(days)}`}>
                          {days <= 0 ? 'Today' : `${days}d`}
                          {days <= 7 && days > 0 && (
                            <AlertTriangle size={12} className="inline ml-1" />
                          )}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
