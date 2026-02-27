import React from 'react';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
} from 'recharts';

const STATUS_COLORS = {
  Active:   '#22C55E',
  Pending:  '#F59E0B',
  Closed:   '#6B7280',
  'On Hold':'#F97316',
};

const DEFAULT_COLORS = ['#C9A84C', '#22C55E', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  return (
    <div className="bg-navy-700 border border-navy-600 rounded-lg px-3 py-2 shadow-modal text-sm">
      <p className="text-lex-text font-semibold">{name}</p>
      <p className="text-gold font-bold">{value} cases</p>
    </div>
  );
};

const CustomLegend = ({ payload }) => (
  <ul className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-3">
    {payload.map((entry, i) => (
      <li key={i} className="flex items-center gap-1.5 text-xs text-lex-muted">
        <span
          className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
          style={{ backgroundColor: entry.color }}
        />
        {entry.value}
      </li>
    ))}
  </ul>
);

export default function PieChartWidget({ data = [], title = 'Case Status Distribution' }) {
  const colored = data.map((d, i) => ({
    ...d,
    color: STATUS_COLORS[d.name] || DEFAULT_COLORS[i % DEFAULT_COLORS.length],
  }));

  return (
    <div className="card p-5 h-full">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-heading text-lg font-semibold text-lex-text">{title}</h3>
      </div>

      {data.length === 0 ? (
        <div className="flex items-center justify-center h-48 text-lex-muted text-sm">
          No data available
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={colored}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              innerRadius={44}
              paddingAngle={3}
              strokeWidth={0}
            >
              {colored.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
