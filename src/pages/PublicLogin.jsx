/**
 * PublicLogin
 * Login/Register page for fans to attend events
 */
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, User, Phone, Music, ArrowLeft, Calendar, Sparkles } from 'lucide-react';

const PublicLogin = ({ mode: initialMode = 'login' }) => {
  const { login, register, isAuthenticated, user, isLoading: authIsLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const eventId = searchParams.get('eventId');
  
  // Prevent double execution from React StrictMode and effect re-runs
  const pendingActionHandledRef = useRef(false);

  const [mode, setMode] = useState(initialMode);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Check for pending event action on mount
  useEffect(() => {
    const pendingAction = localStorage.getItem('pendingEventAction');
    if (pendingAction && !eventId) {
      const parsed = JSON.parse(pendingAction);
      if (parsed?.eventId) {
        // Update URL with eventId without navigating
        const newUrl = `${window.location.pathname}?eventId=${parsed.eventId}`;
        window.history.replaceState({}, '', newUrl);
      }
    }
  }, [eventId]);

  // Handle authenticated user (triggered after login or registration completes)
  useEffect(() => {
    // Wait for auth initialization to complete before acting
    if (authIsLoading) return;

    if (isAuthenticated && user) {
      // Guard against React StrictMode double-invocation and effect re-runs.
      if (pendingActionHandledRef.current) return;
      pendingActionHandledRef.current = true;

      // Check if there's a pending event registration
      const pendingAction = localStorage.getItem('pendingEventAction');

      if (pendingAction) {
        try {
          const parsed = JSON.parse(pendingAction);
          if (parsed?.action === 'attend' && parsed?.eventId) {
            localStorage.removeItem('pendingEventAction');
            completeEventRegistration(parsed.eventId);
            return;
          }
        } catch {
          localStorage.removeItem('pendingEventAction');
        }
      }

      // No pending action — redirect after a short delay so any success
      // message set by handleSubmit is visible before leaving the page
      setTimeout(() => navigate(redirect), 1800);
    }
  }, [isAuthenticated, user, authIsLoading, navigate, redirect]);

  const completeEventRegistration = async (eventId) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/events/${eventId}/register`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage('¡Asistencia confirmada! Te esperamos en el evento. 🎶');
        setTimeout(() => {
          navigate(`/?registered=${eventId}`);
        }, 2000);
      } else {
        setError(data.error || 'Error al registrarse en el evento');
      }
    } catch (err) {
      setError('Error de conexión. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      if (mode === 'register') {
        if (formData.password !== formData.confirmPassword) {
          setError('Las contraseñas no coinciden');
          setIsLoading(false);
          return;
        }

        const result = await register(formData.name, formData.email, formData.password, formData.phone || undefined);
        if (!result.success) {
          setError(result.error);
        } else {
          const hasPendingEvent = !!localStorage.getItem('pendingEventAction');
          setSuccessMessage(
            hasPendingEvent
              ? '¡Cuenta creada! Registrándote al evento...'
              : '¡Cuenta creada exitosamente! Bienvenida 🎉'
          );
        }
      } else {
        const result = await login(formData.email, formData.password);
        if (!result.success) {
          setError(result.error);
        }
      }
    } catch (err) {
      setError('Error de conexión. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError('');
    setSuccessMessage('');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Back button */}
        <div className="absolute -top-16 left-0">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-text_secondary hover:text-white transition-colors"
          >
            <ArrowLeft size={18} />
            <span>Volver al inicio</span>
          </Link>
        </div>

        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-purple-600 mb-4">
            <Music size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Stephanie Miranda</h1>
          <p className="text-text_secondary mt-1">
            {eventId ? 'Regístrate para asistir al evento' : 'Accede a tu cuenta'}
          </p>
        </div>

        {/* Login/Register Card */}
        <div className="glass-card border border-white/10 rounded-2xl p-8 shadow-2xl">
          {/* Event indicator */}
          {eventId && (
            <div className="mb-6 p-4 bg-accent/10 border border-accent/20 rounded-xl">
              <div className="flex items-center gap-3">
                <Calendar size={20} className="text-accent" />
                <div>
                  <p className="text-sm text-text_muted">Evento seleccionado</p>
                  <p className="text-white font-medium">Asistencia confirmada próximamente</p>
                </div>
              </div>
            </div>
          )}

          <h2 className="text-xl font-semibold text-white text-center mb-6">
            {mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-lg">⚠️</span>
                <p>{error}</p>
              </div>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm">
              <div className="flex items-center gap-2">
                <Sparkles size={16} />
                <p>{successMessage}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-text_secondary mb-2">
                  Nombre completo
                </label>
                <div className="relative">
                  <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text_muted" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-text_muted focus:outline-none focus:border-accent/50 transition-colors"
                    placeholder="Tu nombre"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-text_secondary mb-2">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text_muted" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-text_muted focus:outline-none focus:border-accent/50 transition-colors"
                  placeholder="tu@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text_secondary mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text_muted" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-text_muted focus:outline-none focus:border-accent/50 transition-colors"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-text_secondary mb-2">
                  Confirmar contraseña
                </label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text_muted" />
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-text_muted focus:outline-none focus:border-accent/50 transition-colors"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
            )}

            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-text_secondary mb-2">
                  Número de teléfono
                  <span className="ml-2 text-xs text-text_muted font-normal">(opcional)</span>
                </label>
                <div className="relative">
                  <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text_muted" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-text_muted focus:outline-none focus:border-accent/50 transition-colors"
                    placeholder="+506 8888-0000"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-accent to-purple-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-accent/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Procesando...</span>
                </>
              ) : (
                <>
                  {mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
                </>
              )}
            </button>
          </form>

          {/* Toggle mode */}
          <div className="mt-6 text-center">
            <p className="text-text_secondary text-sm">
              {mode === 'login' ? (
                <>
                  ¿No tienes cuenta?{' '}
                  <button
                    onClick={toggleMode}
                    className="text-accent hover:text-accent/80 font-medium transition-colors"
                  >
                    Regístrate aquí
                  </button>
                </>
              ) : (
                <>
                  ¿Ya tienes cuenta?{' '}
                  <button
                    onClick={toggleMode}
                    className="text-accent hover:text-accent/80 font-medium transition-colors"
                  >
                    Inicia sesión
                  </button>
                </>
              )}
            </p>
          </div>

          {/* Benefits for registering */}
          {mode === 'register' && (
            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-xs text-text_muted text-center">
                Al registrarte podrás:
              </p>
              <ul className="mt-3 space-y-2">
                <li className="flex items-center gap-2 text-sm text-text_secondary">
                  <Calendar size={14} className="text-accent" />
                  <span>Registrarte en eventos públicos</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-text_secondary">
                  <Sparkles size={14} className="text-accent" />
                  <span>Recibir recordatorios por email</span>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicLogin;
