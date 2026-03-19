/**
 * Login Page
 * Pantalla de acceso exclusivo premium
 */
import React, { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Mail, Lock, Music, ShieldOff, LogOut, Home } from 'lucide-react';

// ── Shown when a normal (non-admin) user lands on the admin login page ──
const NonAdminBlock = ({ user, logout }) => (
  <div className="min-h-screen bg-[#0F0F23] flex items-center justify-center p-4">
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
    </div>

    <div className="relative w-full max-w-md text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-600 mb-6">
        <Music size={32} className="text-white" />
      </div>

      <div className="bg-[#1A1A2E]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <ShieldOff size={28} className="text-amber-400" />
          </div>
        </div>

        <h2 className="text-xl font-semibold text-white mb-2">Acceso restringido</h2>
        <p className="text-gray-400 text-sm mb-1">
          Estás conectado como <span className="text-white font-medium">{user?.name || user?.email}</span>.
        </p>
        <p className="text-gray-500 text-sm mb-8">
          Esta área es exclusiva para administradores.
        </p>

        <div className="flex flex-col gap-3">
          <Button
            variant="secondary"
            fullWidth
            leftIcon={<LogOut size={16} />}
            onClick={logout}
          >
            Cerrar sesión e iniciar como admin
          </Button>
          <Link to="/">
            <Button variant="ghost" fullWidth leftIcon={<Home size={16} />}>
              Volver al sitio
            </Button>
          </Link>
        </div>
      </div>
    </div>
  </div>
);

// ── Main admin login form ──
const Login = () => {
  const { login, logout, isAuthenticated, isLoading, user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  // Wait for auth check
  if (isLoading) return null;

  // Already authenticated as admin → go straight to dashboard
  if (isAuthenticated && user?.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // Authenticated but NOT admin → show clear blocked state, no redirect loop
  if (isAuthenticated && user?.role !== 'admin') {
    return <NonAdminBlock user={user} logout={logout} />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const result = await login(formData.email, formData.password);
    if (result.success) {
      if (result.user?.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        // Logged in but not admin — stay on this page, show block screen
        setError('');
      }
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0F23] flex items-center justify-center p-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-600 mb-4">
            <Music size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Stephanie Miranda</h1>
          <p className="text-gray-400 mt-1">Zona Privada</p>
        </div>

        <div className="bg-[#1A1A2E]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-xl font-semibold text-white text-center mb-6">
            Acceder al Panel
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-lg">⚠️</span>
                <div>
                  <p className="font-medium">{error}</p>
                  {error.includes('servidor') && (
                    <p className="text-xs mt-1 text-red-300">
                      Ejecuta en terminal: <code className="bg-red-500/20 px-1 rounded">npm run server</code>
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="text"
              placeholder="Usuario o correo electrónico"
              icon={Mail}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              fullWidth
            />
            <Input
              type="password"
              placeholder="Contraseña"
              icon={Lock}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              fullWidth
            />
            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={isLoading}
              className="mt-2"
            >
              Acceder al Panel
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              🔐 Acceso exclusivo para administradores
            </p>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link to="/" className="text-sm text-gray-400 hover:text-white transition-colors">
            ← Volver al sitio público
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
