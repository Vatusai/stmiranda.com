/**
 * Select Component
 * Selector desplegable estilizado
 */
import React, { useState, useRef, useEffect } from 'react';

const Select = ({
  label,
  value,
  onChange,
  options = [],
  placeholder = 'Seleccionar...',
  error,
  helper,
  disabled = false,
  fullWidth = false,
  className = '',
  containerClassName = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className={`${fullWidth ? 'w-full' : ''} ${containerClassName}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-1.5">
          {label}
        </label>
      )}
      <div ref={containerRef} className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`
            w-full flex items-center justify-between
            bg-white/5 border rounded-xl px-4 py-3 text-left
            transition-all duration-300
            focus:outline-none focus:ring-2 focus:ring-violet-500/20
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error 
              ? 'border-red-500/50 focus:border-red-500' 
              : 'border-white/10 focus:border-violet-500/50 hover:border-white/20'
            }
            ${className}
          `}
        >
          <span className={selectedOption ? 'text-white' : 'text-gray-400'}>
            {selectedOption?.label || placeholder}
          </span>
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-2 bg-[#1A1A2E] border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-slideIn">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`
                  w-full px-4 py-2.5 text-left transition-colors
                  hover:bg-violet-500/20
                  ${value === option.value ? 'bg-violet-500/20 text-violet-400' : 'text-gray-300'}
                `}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
      {error && <p className="mt-1.5 text-sm text-red-400">{error}</p>}
      {helper && !error && <p className="mt-1.5 text-sm text-gray-500">{helper}</p>}
    </div>
  );
};

export default Select;
