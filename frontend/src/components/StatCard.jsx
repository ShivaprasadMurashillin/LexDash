import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const COLOR_MAP = {
  gold:   { icon: 'bg-gold/10 text-gold',      ring: 'border-gold/20'  },
  green:  { icon: 'bg-lex-success/10 text-lex-success', ring: 'border-lex-success/20' },
  yellow: { icon: 'bg-lex-warning/10 text-lex-warning', ring: 'border-lex-warning/20' },
  blue:   { icon: 'bg-lex-info/10 text-lex-info',       ring: 'border-lex-info/20'   },
  red:    { icon: 'bg-lex-danger/10 text-lex-danger',   ring: 'border-lex-danger/20' },
};

export default function StatCard({ title, value, icon: Icon, color = 'gold', trend, trendLabel }) {
  const { icon: iconCls, ring } = COLOR_MAP[color] || COLOR_MAP.gold;

  const TrendIcon =
    typeof trend === 'string'
      ? trend.startsWith('+') ? TrendingUp : trend.startsWith('-') ? TrendingDown : Minus
      : Minus;

  const trendPositive = typeof trend === 'string' && trend.startsWith('+');
  const trendNegative = typeof trend === 'string' && trend.startsWith('-');

  return (
    <div className={`card p-5 flex items-start gap-4 hover:shadow-gold transition-shadow duration-300 border ${ring}`}>
      {/* Icon */}
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${iconCls}`}>
        <Icon size={20} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-lex-muted uppercase tracking-wider">{title}</p>
        <p className="font-heading text-3xl font-bold text-lex-text mt-1 leading-none">
          {value ?? '—'}
        </p>

        {/* Trend */}
        {trend && (
          <div className={`flex items-center gap-1 mt-2 text-xs font-semibold
            ${trendPositive ? 'text-lex-success' : trendNegative ? 'text-lex-danger' : 'text-lex-muted'}`}>
            <TrendIcon size={12} />
            <span>{trend}</span>
            {trendLabel && <span className="text-lex-muted font-normal ml-1">{trendLabel}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
