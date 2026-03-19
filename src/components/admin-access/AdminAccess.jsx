/**
 * Admin Access Component
 * Botón discreto para acceder al panel de administración
 * Integrado en el navbar/header
 */
import React, { useState } from 'react';
import { Lock, Settings, User } from 'lucide-react';

const AdminAccess = ({ 
  variant = 'navbar', // 'navbar', 'icon', 'minimal', 'floating', 'footer', 'hidden'
  position = 'right' // 'left', 'right' (para navbar)
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    window.location.href = '/admin/login';
  };

  // Versión Navbar - Integrado en el menú de navegación
  if (variant === 'navbar') {
    return (
      <button
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="
          flex items-center gap-2 px-3 py-2 rounded-lg
          text-gray-400 hover:text-violet-400
          hover:bg-violet-500/10
          transition-all duration-300
          text-sm font-medium
        "
        title="Acceso Administrador"
        aria-label="Acceso Administrador"
      >
        <Settings 
          size={16} 
          className={`
            transition-all duration-300
            ${isHovered ? 'rotate-90 text-violet-400' : ''}
          `}
        />
        <span className="hidden md:inline">Admin</span>
      </button>
    );
  }

  // Versión Minimal Navbar - Solo icono
  if (variant === 'minimal') {
    return (
      <button
        onClick={handleClick}
        className="
          p-2 rounded-lg
          text-gray-500 hover:text-violet-400
          hover:bg-white/5
          transition-all duration-300
        "
        title="Acceso Administrador"
        aria-label="Acceso Administrador"
      >
        <Lock size={16} />
      </button>
    );
  }

  // Versión Icon - Muy discreta para header/navbar (usada en el sitio público)
  if (variant === 'icon') {
    return (
      <button
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="
          p-2 rounded-full
          text-text_secondary/40 hover:text-accent
          hover:bg-accent/10
          transition-all duration-300
        "
        title="Acceso Administrador"
        aria-label="Acceso Administrador"
      >
        <Settings 
          size={18} 
          className={`
            transition-all duration-300
            ${isHovered ? 'rotate-90' : ''}
          `}
        />
      </button>
    );
  }

  // Versión flotante discreta (icono pequeño)
  if (variant === 'floating') {
    return (
      <button
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          fixed z-40 transition-all duration-300
          ${position === 'left' ? 'left-4' : 'right-4'}
          bottom-24
          group
        `}
        title="Acceso Administrador"
        aria-label="Acceso Administrador"
      >
        <div className={`
          flex items-center gap-2 px-3 py-2 rounded-full
          bg-black/20 backdrop-blur-sm
          border border-white/5
          hover:bg-black/40 hover:border-white/20
          transition-all duration-300
        `}>
          <Settings 
            size={16} 
            className={`
              text-white/30 group-hover:text-white/60
              transition-colors duration-300
              ${isHovered ? 'rotate-45' : ''}
            `}
          />
          <span className={`
            text-xs text-white/0 group-hover:text-white/60
            transition-all duration-300 overflow-hidden whitespace-nowrap
            max-w-0 group-hover:max-w-[100px]
          `}>
            Admin
          </span>
        </div>
      </button>
    );
  }

  // Versión footer (texto muy discreto)
  if (variant === 'footer') {
    return (
      <button
        onClick={handleClick}
        className="text-[10px] text-white/10 hover:text-white/30 transition-colors ml-2"
        title="Acceso Administrador"
      >
        •
      </button>
    );
  }

  // Versión hidden (solo accesible por teclado)
  if (variant === 'hidden') {
    return (
      <a
        href="/admin/login"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-violet-600 focus:text-white focus:rounded-lg"
      >
        Acceso Administrador
      </a>
    );
  }

  return null;
};

export default AdminAccess;
