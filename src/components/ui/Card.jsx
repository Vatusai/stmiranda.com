/**
 * Card Component
 * Tarjeta contenedora con múltiples variantes visuales
 */
import React from 'react';

const Card = ({ 
  children, 
  variant = 'default',
  padding = 'md',
  hover = false,
  className = '',
  onClick,
  ...props 
}) => {
  const baseStyles = 'rounded-2xl transition-all duration-300';
  
  const variants = {
    default: 'bg-white/5 border border-white/10',
    glass: 'bg-white/5 backdrop-blur-xl border border-white/10 shadow-xl',
    elevated: 'bg-[#1A1A2E] border border-white/5 shadow-2xl shadow-black/20',
    flat: 'bg-[#16213E]',
    gradient: 'bg-gradient-to-br from-violet-600/20 to-purple-600/20 border border-violet-500/20',
    outlined: 'bg-transparent border-2 border-white/10',
  };

  const paddings = {
    none: '',
    xs: 'p-2',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10'
  };

  const hoverStyles = hover 
    ? 'cursor-pointer hover:border-white/20 hover:shadow-xl hover:shadow-black/10 hover:-translate-y-0.5' 
    : '';

  return (
    <div
      className={`${baseStyles} ${variants[variant]} ${paddings[padding]} ${hoverStyles} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

// Sub-componentes para estructura consistente
Card.Header = ({ children, className = '' }) => (
  <div className={`mb-4 ${className}`}>{children}</div>
);

Card.Title = ({ children, className = '' }) => (
  <h3 className={`text-lg font-semibold text-white ${className}`}>{children}</h3>
);

Card.Subtitle = ({ children, className = '' }) => (
  <p className={`text-sm text-gray-400 mt-1 ${className}`}>{children}</p>
);

Card.Content = ({ children, className = '' }) => (
  <div className={className}>{children}</div>
);

Card.Footer = ({ children, className = '' }) => (
  <div className={`mt-4 pt-4 border-t border-white/10 ${className}`}>{children}</div>
);

export default Card;
