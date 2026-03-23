/**
 * AdminLayout
 * Layout principal del panel de administración
 */
import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  UserCircle,
  ClipboardList,
  Mail,
  Download,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  ChevronDown,
  Music,
  Home
} from 'lucide-react';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Calendario', path: '/admin/calendar', icon: CalendarDays },
    { 
      name: 'Contactos', 
      path: '/admin/contacts', 
      icon: UserCircle,
      description: 'Fans y comunidad'
    },
    { 
      name: 'Cotizaciones', 
      path: '/admin/inquiries', 
      icon: ClipboardList,
      description: 'Pipeline comercial'
    },
    // { name: 'Emails', path: '/admin/emails', icon: Mail, description: 'Marketing' },
    // { name: 'Exportar', path: '/admin/exports', icon: Download, description: 'Descargar datos' },
    // { name: 'Estadísticas', path: '/admin/stats', icon: BarChart3 },
    { name: 'Configuración', path: '/admin/settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-[#0F0F23] flex">
      {/* Sidebar Desktop */}
      <aside 
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          bg-[#1A1A2E]/95 backdrop-blur-xl border-r border-white/10
          transition-all duration-300 ease-out
          ${isSidebarOpen ? 'w-64' : 'w-20'}
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className={`h-16 flex items-center ${isSidebarOpen ? 'px-6' : 'px-4 justify-center'}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center flex-shrink-0">
              <Music size={20} className="text-white" />
            </div>
            {isSidebarOpen && (
              <div className="overflow-hidden">
                <h1 className="text-lg font-bold text-white whitespace-nowrap">Stephanie</h1>
                <p className="text-xs text-gray-400 whitespace-nowrap">Panel Admin</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-3 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300
                  ${active
                    ? 'bg-gradient-to-r from-violet-600/20 to-purple-600/20 text-violet-400 border border-violet-500/20'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }
                  ${!isSidebarOpen && 'justify-center'}
                `}
              >
                <Icon size={20} className={active ? 'text-violet-400' : ''} />
                {isSidebarOpen && <span className="font-medium whitespace-nowrap">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className={`absolute bottom-0 left-0 right-0 p-3 ${!isSidebarOpen && 'flex justify-center'}`}>
          <button
            onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }}
            className={`
              flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300
              ${!isSidebarOpen && 'justify-center'}
            `}
          >
            <LogOut size={20} />
            {isSidebarOpen && <span className="font-medium">Cerrar sesión</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-[#1A1A2E]/50 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            
            {/* Toggle sidebar */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="hidden lg:flex p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
            >
              <Menu size={20} />
            </button>

            {/* Breadcrumb */}
            <div className="hidden sm:flex items-center text-sm text-gray-400">
              <span>Admin</span>
              <span className="mx-2">/</span>
              <span className="text-white capitalize">
                {location.pathname.split('/').pop() === 'dashboard' ? 'Dashboard' : 
                 location.pathname.split('/').pop()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="hidden md:flex items-center bg-white/5 rounded-xl px-3 py-2 border border-white/10">
              <Search size={16} className="text-gray-400" />
              <input
                type="text"
                placeholder="Buscar..."
                className="bg-transparent border-none outline-none text-sm text-white placeholder-gray-500 ml-2 w-48"
              />
            </div>

            {/* Notifications */}
            <button className="relative p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-violet-500 rounded-full" />
            </button>

            {/* Go to Website */}
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Ver sitio público"
            >
              <Home size={18} />
              <span className="hidden md:block text-sm">Ver sitio</span>
            </a>

            {/* Profile */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {user?.name?.charAt(0) || 'S'}
                  </span>
                </div>
                <span className="hidden sm:block text-sm text-white">{user?.name || 'Stephanie'}</span>
                <ChevronDown size={16} className="text-gray-400" />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[#1A1A2E] border border-white/10 rounded-xl shadow-2xl py-1 animate-slideIn">
                  <Link
                    to="/admin/settings"
                    className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    Mi perfil
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10"
                  >
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminLayout;
