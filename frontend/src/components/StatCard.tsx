import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor?: 'sage' | 'charcoal' | 'amber' | 'emerald' | 'blue';
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  sublabel,
  icon: Icon,
  accentColor = 'sage',
}) => {
  const colorMap = {
    sage: {
      bg: 'bg-sage-50 text-sage-700 border-sage-200/60',
      badge: 'text-sage-700',
    },
    charcoal: {
      bg: 'bg-slate-100 text-charcoal-800 border-slate-200',
      badge: 'text-charcoal-700',
    },
    amber: {
      bg: 'bg-amber-50 text-amber-700 border-amber-200/60',
      badge: 'text-amber-700',
    },
    emerald: {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
      badge: 'text-emerald-700',
    },
    blue: {
      bg: 'bg-sky-50 text-sky-700 border-sky-200/60',
      badge: 'text-sky-700',
    },
  };

  const style = colorMap[accentColor] || colorMap.sage;

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-5 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all duration-200 relative overflow-hidden group">
      <div className="flex items-start justify-between gap-2 sm:gap-3">
        <div className="min-w-0">
          <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">{label}</p>
          <h4 className="text-lg sm:text-2xl lg:text-[26px] font-extrabold text-charcoal-900 mt-0.5 sm:mt-1 tracking-tight truncate">{value}</h4>
          {sublabel && (
            <p className="text-[10px] sm:text-[12px] text-slate-500 mt-1 sm:mt-1.5 font-medium flex items-center gap-1 truncate">
              {sublabel}
            </p>
          )}
        </div>
        <div className={`p-1.5 sm:p-2.5 rounded-xl border ${style.bg} shrink-0 transition-transform duration-200 group-hover:scale-105`}>
          <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
      </div>
    </div>
  );
};
