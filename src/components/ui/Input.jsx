/**
 * Input Component
 * Input de formulario premium con estados y validación visual
 */
import React, { forwardRef } from 'react';

const Input = forwardRef(({ 
  label,
  error,
  helper,
  icon: Icon,
  rightElement,
  className = '',
  containerClassName = '',
  labelClassName = '',
  fullWidth = false,
  variant = 'default',
  ...props 
}, ref) => {
  const containerStyles = `relative ${fullWidth ? 'w-full' : ''} ${containerClassName}`;
  
  const inputStyles = `
    w-full bg-white/5 border rounded-xl px-4 py-3 text-white placeholder-gray-400
    transition-all duration-300 ease-out
    focus:outline-none focus:ring-2
    disabled:opacity-50 disabled:cursor-not-allowed
    ${Icon ? 'pl-11' : ''}
    ${rightElement ? 'pr-24' : ''}
    ${error 
      ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' 
      : 'border-white/10 focus:border-violet-500/50 focus:ring-violet-500/20 hover:border-white/20'
    }
    ${variant === 'glass' ? 'bg-white/5 backdrop-blur-sm' : ''}
    ${className}
  `;

  const labelStyles = `block text-sm font-medium text-gray-300 mb-1.5 ${labelClassName}`;

  return (
    <div className={containerStyles}>
      {label && <label className={labelStyles}>{label}</label>}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
            <Icon size={18} />
          </div>
        )}
        <input
          ref={ref}
          className={inputStyles}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightElement}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-red-400 flex items-center gap-1">
          <span>⚠️</span> {error}
        </p>
      )}
      {helper && !error && (
        <p className="mt-1.5 text-sm text-gray-500">{helper}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
