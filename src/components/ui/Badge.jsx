/**
 * Badge Component
 * Etiquetas de estado con variantes para diferentes contextos
 */
import React from 'react';

const Badge = ({ 
  children, 
  variant = 'default',
  size = 'md',
  dot = false,
  className = '',
  ...props 
}) => {
  const baseStyles = 'inline-flex items-center font-medium rounded-full transition-all duration-300';
  
  const variants = {
    // Estados de eventos
    confirmed: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    pending: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
    quoted: 'bg-violet-500/20 text-violet-400 border border-violet-500/30',
    cancelled: 'bg-red-500/20 text-red-400 border border-red-500/30',
    completed: 'bg-gray-500/20 text-gray-400 border border-gray-500/30',
    
    // Estados de leads
    new: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
    contacted: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    converted: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    
    // Estados de clientes
    active: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    inactive: 'bg-gray-500/20 text-gray-400 border border-gray-500/30',
    vip: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    
    // Variantes genéricas
    default: 'bg-white/10 text-gray-300 border border-white/10',
    primary: 'bg-violet-500/20 text-violet-400 border border-violet-500/30',
    secondary: 'bg-white/10 text-white border border-white/20',
    accent: 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
    danger: 'bg-red-500/20 text-red-400 border border-red-500/30',
    success: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    warning: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    info: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30',
  };

  const sizes = {
    xs: 'px-2 py-0.5 text-xs',
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-sm'
  };

  const dotColors = {
    confirmed: 'bg-emerald-400',
    pending: 'bg-blue-400',
    quoted: 'bg-violet-400',
    cancelled: 'bg-red-400',
    completed: 'bg-gray-400',
    new: 'bg-blue-400',
    contacted: 'bg-amber-400',
    converted: 'bg-emerald-400',
    active: 'bg-emerald-400',
    inactive: 'bg-gray-400',
    vip: 'bg-amber-400',
    default: 'bg-gray-400',
    primary: 'bg-violet-400',
    danger: 'bg-red-400',
    success: 'bg-emerald-400',
    warning: 'bg-amber-400',
    info: 'bg-cyan-400',
  };

  return (
    <span
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${dotColors[variant]}`} />
      )}
      {children}
    </span>
  );
};

export default Badge;
