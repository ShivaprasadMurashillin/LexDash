import React from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Cell,
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-navy-700 border border-navy-600 rounded-lg px-3 py-2 shadow-modal text-sm">
      <p className="text-lex-muted text-xs mb-1">{label}</p>
      <p className="text-gold font-bold">{payload[0].value} cases</p>
    </div>
  );
};

export default function BarChartWidget({ data = [], title = 'Cases by Type' }) {
  return (
    <div className="card p-5 h-full">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-heading text-lg font-semibold text-lex-text">{title}</h3>
        <span className="text-xs text-lex-muted bg-navy-700 px-2.5 py-1 rounded-full border border-navy-600">
          All time
        </span>
      </div>

      {data.length === 0 ? (
        <div className="flex items-center justify-center h-48 text-lex-muted text-sm">
          No data available
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2A3042" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fill: '#8892A4', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              interval={0}
              angle={-15}
              textAnchor="end"
              height={40}
            />
            <YAxis
              tick={{ fill: '#8892A4', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#2A3042' }} />
            <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={48}>
              {data.map((entry, index) => (
                <Cell
                  key={index}
                  fill={index % 2 === 0 ? '#C9A84C' : '#A8892F'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
