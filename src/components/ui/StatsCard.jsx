/**
 * StatsCard Component
 * Tarjeta de estadísticas con icono, valor y tendencia
 */
import React from 'react';

const StatsCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  variant = 'default',
  className = ''
}) => {
  const variants = {
    default: 'bg-white/5 border-white/10',
    gradient: 'bg-gradient-to-br from-violet-600/20 to-purple-600/20 border-violet-500/20',
    success: 'bg-emerald-500/10 border-emerald-500/20',
    warning: 'bg-amber-500/10 border-amber-500/20',
    danger: 'bg-red-500/10 border-red-500/20',
    info: 'bg-cyan-500/10 border-cyan-500/20'
  };

  const trendColors = {
    up: 'text-emerald-400',
    down: 'text-red-400',
    neutral: 'text-gray-400'
  };

  const trendIcons = {
    up: '↑',
    down: '↓',
    neutral: '→'
  };

  return (
    <div className={`rounded-2xl border p-6 transition-all duration-300 hover:border-white/20 ${variants[variant]} ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-400">{title}</p>
          <p className="mt-2 text-3xl font-bold text-white">{value}</p>
          {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
          
          {trend && (
            <div className={`mt-3 flex items-center gap-1 text-sm ${trendColors[trend]}`}>
              <span>{trendIcons[trend]}</span>
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        
        {Icon && (
          <div className="p-3 bg-white/5 rounded-xl">
            <Icon size={24} className="text-violet-400" />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard;
