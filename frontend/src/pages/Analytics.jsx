import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, RadialBarChart, RadialBar,
  LineChart, Line,
} from 'recharts';
import {
  TrendingUp, Users, Scale, FileText, AlertTriangle, DollarSign,
  Target, Zap, ArrowUpRight, ArrowDownRight, Clock,
} from 'lucide-react';
import { analyticsAPI } from '../api';

/* ── Color Palettes ────────────────────────────────────────────────────────── */
const GOLD        = '#C9A84C';
const GOLD_DIM    = '#A8892F';
const GREEN       = '#22C55E';
const BLUE        = '#3B82F6';
const PURPLE      = '#8B5CF6';
const ORANGE      = '#F59E0B';
const RED         = '#EF4444';
const CYAN        = '#06B6D4';
const PRIORITY_CLR = { High: RED, Medium: ORANGE, Low: GREEN };
const DOC_STATUS_CLR = {
  Draft: '#6B7280', 'Pending Review': ORANGE, Reviewed: BLUE,
  Approved: GREEN, Filed: GOLD,
};

/* ── Reusable Tooltip ──────────────────────────────────────────────────────── */
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-navy-700 border border-navy-600 rounded-lg px-3 py-2 shadow-modal text-sm">
      <p className="text-lex-muted text-xs mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || GOLD }} className="font-bold text-xs">
          {p.name}: {typeof p.value === 'number' && p.value > 999
            ? `$${(p.value / 1000).toFixed(0)}k`
            : p.value}
        </p>
      ))}
    </div>
  );
}

/* ── Skeleton ──────────────────────────────────────────────────────────────── */
function Skeleton({ className }) {
  return <div className={`animate-pulse bg-navy-700 rounded ${className}`} />;
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div><Skeleton className="h-8 w-48 mb-2" /><Skeleton className="h-4 w-72" /></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card p-5"><Skeleton className="h-20 w-full" /></div>
        ))}
      </div>
      <div className="grid xl:grid-cols-2 gap-4">
        <div className="card p-5"><Skeleton className="h-72 w-full" /></div>
        <div className="card p-5"><Skeleton className="h-72 w-full" /></div>
      </div>
    </div>
  );
}

/* ── Mini KPI Card ─────────────────────────────────────────────────────────── */
function KPI({ title, value, subtitle, icon: Icon, color = 'gold', trend }) {
  const colors = {
    gold:   'bg-gold/10 text-gold border-gold/20',
    green:  'bg-green-500/10 text-green-400 border-green-500/20',
    blue:   'bg-blue-500/10 text-blue-400 border-blue-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    red:    'bg-red-500/10 text-red-400 border-red-500/20',
    orange: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  };
  const cls = colors[color] || colors.gold;

  return (
    <div className="card p-5 flex items-start gap-4 hover:border-navy-500 transition-colors group">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${cls}`}>
        <Icon size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-lex-muted uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-bold text-lex-text mt-0.5">{value}</p>
        <div className="flex items-center gap-1.5 mt-1">
          {trend && (
            <span className={`flex items-center gap-0.5 text-xs font-semibold ${
              trend > 0 ? 'text-green-400' : trend < 0 ? 'text-red-400' : 'text-lex-muted'
            }`}>
              {trend > 0 ? <ArrowUpRight size={12} /> : trend < 0 ? <ArrowDownRight size={12} /> : null}
              {trend > 0 ? '+' : ''}{trend}%
            </span>
          )}
          {subtitle && <span className="text-xs text-lex-muted">{subtitle}</span>}
        </div>
      </div>
    </div>
  );
}

/* ── Analytics Page ────────────────────────────────────────────────────────── */
export default function Analytics() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data: res } = await analyticsAPI.getAnalytics();
        setData(res.data);
      } catch (err) {
        toast.error('Failed to load analytics');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <AnalyticsSkeleton />;
  if (!data) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
      <AlertTriangle size={40} className="text-lex-danger" />
      <p className="font-heading text-lg text-lex-text">No analytics data available</p>
      <p className="text-sm text-lex-muted">Seed the database first to see analytics.</p>
    </div>
  );

  const {
    monthlyIntake, attorneyWorkload, caseOutcomes, taskVelocity,
    docPipeline, clientGrowth, priorityBreakdown, overdueAnalysis,
    revenueByType, billingOverview, monthlyRevenue, recentActivity,
  } = data;

  const totalRevenue = billingOverview?.totalBilled ?? revenueByType.reduce((s, r) => s + r.estimatedRevenue, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div>
        <h1 className="page-title">Analytics & Insights</h1>
        <p className="page-subtitle">
          Comprehensive firm performance metrics and trend analysis
        </p>
      </div>

      {/* ── Row 1: KPI Cards ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KPI
          title="Case Closure Rate" value={`${caseOutcomes.closureRate}%`}
          subtitle={`${caseOutcomes.closed} of ${caseOutcomes.total} closed`}
          icon={Target} color="green" trend={caseOutcomes.closureRate > 20 ? 8 : -3}
        />
        <KPI
          title="Active Caseload" value={caseOutcomes.active}
          subtitle={`${caseOutcomes.pending} pending`}
          icon={Scale} color="gold"
        />
        <KPI
          title="Task Health" value={`${100 - overdueAnalysis.overdueRate}%`}
          subtitle={`${overdueAnalysis.overdue} overdue of ${overdueAnalysis.totalActive}`}
          icon={Zap} color={overdueAnalysis.overdueRate > 30 ? 'red' : 'blue'}
          trend={overdueAnalysis.overdueRate > 30 ? -12 : 5}
        />
        <KPI
          title="Total Revenue" value={`$${(totalRevenue / 1000).toFixed(0)}k`}
          subtitle={`${billingOverview?.paidCount ?? 0} paid invoices`}
          icon={DollarSign} color="purple" trend={14}
        />
      </div>

      {/* ── Row 2: Monthly Trends + Client Growth ───────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Monthly Case Intake Trend (Area Chart) */}
        <div className="xl:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-lg font-semibold text-lex-text flex items-center gap-2">
              <TrendingUp size={18} className="text-gold" />
              Monthly Case Intake
            </h3>
            <span className="text-xs text-lex-muted bg-navy-700 px-2.5 py-1 rounded-full border border-navy-600">
              Last 12 months
            </span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={monthlyIntake}>
              <defs>
                <linearGradient id="intakeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={GOLD} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={GOLD} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A3042" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#8892A4', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#8892A4', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="cases" stroke={GOLD} fill="url(#intakeGrad)"
                    strokeWidth={2.5} dot={{ r: 4, fill: GOLD, stroke: '#0F1219' }} name="Cases" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Client Growth (Line Chart) */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-lg font-semibold text-lex-text flex items-center gap-2">
              <Users size={18} className="text-blue-400" />
              Client Growth
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={clientGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A3042" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#8892A4', fontSize: 9 }} axisLine={false} tickLine={false} angle={-30} textAnchor="end" height={50} />
              <YAxis tick={{ fill: '#8892A4', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<ChartTooltip />} />
              <Line type="monotone" dataKey="clients" stroke={BLUE} strokeWidth={2.5}
                    dot={{ r: 3, fill: BLUE, stroke: '#0F1219' }} name="Total Clients" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Row 3: Attorney Workload + Priority Breakdown ───────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Attorney Workload (Horizontal Bar) */}
        <div className="card p-5">
          <h3 className="font-heading text-lg font-semibold text-lex-text mb-4 flex items-center gap-2">
            <Scale size={18} className="text-gold" />
            Attorney Caseload
          </h3>
          {attorneyWorkload.length === 0 ? (
            <p className="text-lex-muted text-sm text-center py-12">No data</p>
          ) : (
            <div className="space-y-3">
              {attorneyWorkload.map((a, i) => {
                const maxCases = Math.max(...attorneyWorkload.map((x) => x.cases));
                const pct = maxCases > 0 ? (a.cases / maxCases) * 100 : 0;
                const barColors = [GOLD, GREEN, BLUE, PURPLE, ORANGE, CYAN];
                return (
                  <div key={a.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-lex-text">{a.name}</span>
                      <span className="text-xs font-bold text-lex-muted">{a.cases} cases</span>
                    </div>
                    <div className="h-2.5 bg-navy-600 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, backgroundColor: barColors[i % barColors.length] }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Priority Breakdown per Attorney (Stacked Bar) */}
        <div className="card p-5">
          <h3 className="font-heading text-lg font-semibold text-lex-text mb-4 flex items-center gap-2">
            <AlertTriangle size={18} className="text-orange-400" />
            Priority Distribution by Attorney
          </h3>
          {priorityBreakdown.length === 0 ? (
            <p className="text-lex-muted text-sm text-center py-12">No data</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={priorityBreakdown} layout="vertical" margin={{ left: 10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A3042" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#8892A4', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <YAxis dataKey="name" type="category" tick={{ fill: '#8892A4', fontSize: 10 }} axisLine={false} tickLine={false} width={90} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="High" stackId="a" fill={RED} radius={[0, 0, 0, 0]} name="High" />
                <Bar dataKey="Medium" stackId="a" fill={ORANGE} name="Medium" />
                <Bar dataKey="Low" stackId="a" fill={GREEN} radius={[0, 4, 4, 0]} name="Low" />
                <Legend wrapperStyle={{ fontSize: 11, color: '#8892A4' }} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Row 4: Task Velocity + Monthly Revenue + Document Pipeline + Revenue ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Task Velocity */}
        <div className="card p-5">
          <h3 className="font-heading text-lg font-semibold text-lex-text mb-4 flex items-center gap-2">
            <Zap size={18} className="text-green-400" />
            Task Completion Rate
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={taskVelocity}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A3042" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#8892A4', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#8892A4', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="completed" fill={GREEN} radius={[4, 4, 0, 0]} maxBarSize={36} name="Completed" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Revenue Trend */}
        <div className="card p-5">
          <h3 className="font-heading text-lg font-semibold text-lex-text mb-4 flex items-center gap-2">
            <DollarSign size={18} className="text-gold" />
            Monthly Revenue
          </h3>
          {monthlyRevenue && monthlyRevenue.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={monthlyRevenue}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={PURPLE} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={PURPLE} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A3042" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: '#8892A4', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#8892A4', fontSize: 11 }} axisLine={false} tickLine={false}
                       tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="revenue" stroke={PURPLE} fill="url(#revenueGrad)"
                      strokeWidth={2.5} dot={{ r: 4, fill: PURPLE, stroke: '#0F1219' }} name="Revenue" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-lex-muted text-sm text-center py-12">No paid invoices yet</p>
          )}
        </div>
      </div>

      {/* ── Row 4b: Document Pipeline + Revenue by Practice Area ────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Document Pipeline */}
        <div className="card p-5">
          <h3 className="font-heading text-lg font-semibold text-lex-text mb-4 flex items-center gap-2">
            <FileText size={18} className="text-blue-400" />
            Document Pipeline
          </h3>
          {docPipeline.length === 0 ? (
            <p className="text-lex-muted text-sm text-center py-12">No data</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={docPipeline} dataKey="value" nameKey="name" cx="50%" cy="50%"
                     innerRadius={50} outerRadius={75} paddingAngle={3} strokeWidth={0}>
                  {docPipeline.map((d, i) => (
                    <Cell key={i} fill={DOC_STATUS_CLR[d.name] || GOLD} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 10, color: '#8892A4' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Revenue by Case Type */}
        <div className="card p-5">
          <h3 className="font-heading text-lg font-semibold text-lex-text mb-4 flex items-center gap-2">
            <DollarSign size={18} className="text-purple-400" />
            Revenue by Practice Area
          </h3>
          {revenueByType.length === 0 ? (
            <p className="text-lex-muted text-sm text-center py-12">No data</p>
          ) : (
            <div className="space-y-2.5">
              {revenueByType.sort((a, b) => b.estimatedRevenue - a.estimatedRevenue).map((r, i) => {
                const maxRev = Math.max(...revenueByType.map((x) => x.estimatedRevenue));
                const pct = maxRev > 0 ? (r.estimatedRevenue / maxRev) * 100 : 0;
                const bgColors = [GOLD, PURPLE, BLUE, GREEN, ORANGE, CYAN];
                return (
                  <div key={r.type}>
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-medium text-lex-text">{r.type}</span>
                      <span className="text-xs font-bold text-lex-muted">
                        ${(r.estimatedRevenue / 1000).toFixed(0)}k
                        <span className="text-[10px] font-normal ml-1">({r.cases} cases)</span>
                      </span>
                    </div>
                    <div className="h-2 bg-navy-600 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, backgroundColor: bgColors[i % bgColors.length] }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Row 5: Activity Feed ───────────────────────────────────────── */}
      <div className="card p-5">
        <h3 className="font-heading text-lg font-semibold text-lex-text mb-4 flex items-center gap-2">
          <Clock size={18} className="text-gold" />
          Recent Activity
        </h3>
        {recentActivity.length === 0 ? (
          <p className="text-lex-muted text-sm text-center py-8">No recent activity.</p>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-3.5 top-2 bottom-2 w-px bg-navy-600" />

            <div className="space-y-0">
              {recentActivity.map((a, i) => {
                const actionColors = {
                  created: 'bg-green-500', updated: 'bg-blue-500', deleted: 'bg-red-500',
                };
                const timeAgo = formatTimeAgo(a.createdAt);
                return (
                  <div key={a._id} className="relative flex items-start gap-4 py-2.5 pl-8">
                    {/* Dot */}
                    <div className={`absolute left-2 top-3.5 w-3 h-3 rounded-full border-2 border-navy-800
                                    ${actionColors[a.action] || 'bg-gold'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-lex-text">
                        <span className="font-semibold">{a.createdBy}</span>{' '}
                        <span className="text-lex-muted">{a.action}</span>{' '}
                        <span className="font-medium">{a.entity?.toLowerCase()}</span>
                      </p>
                      <p className="text-xs text-lex-muted mt-0.5">{a.title}</p>
                    </div>
                    <span className="text-[10px] text-navy-500 whitespace-nowrap shrink-0 pt-0.5">
                      {timeAgo}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Time formatting helper ────────────────────────────────────────────────── */
function formatTimeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
