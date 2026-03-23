/**
 * AttendeeAccess
 * Lightweight "Confirmar asistencia" page — no password required.
 */
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User, Phone, Mail, Music, ArrowLeft, Calendar, Sparkles, CheckCircle } from 'lucide-react';

const PublicLogin = () => {
  const { isAuthenticated, isLoading: authLoading, user, checkAuth } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Resolve eventId from URL or saved pending action
  const eventIdFromUrl = searchParams.get('eventId');
  const pendingEventId = (() => {
    try {
      const raw = localStorage.getItem('pendingEventAction');
      return raw ? JSON.parse(raw)?.eventId : null;
    } catch { return null; }
  })();
  const eventId = eventIdFromUrl || pendingEventId;

  const [formData, setFormData] = useState({ name: '', phone: '', email: '' });
  const [errors, setErrors]     = useState({});
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading]     = useState(false);
  const [done, setDone] = useState(false);

  // Pre-fill form when a fan session already exists (so they just hit Confirmar)
  // Admins see a blank form — they can test the flow without being redirected away
  useEffect(() => {
    if (authLoading) return;
    if (isAuthenticated && user?.role === 'fan') {
      setFormData({
        name:  user.name  || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [authLoading, isAuthenticated, user]);

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!formData.name.trim())
      e.name = 'El nombre es requerido';
    if (!formData.email.trim())
      e.email = 'El correo es requerido';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      e.email = 'Correo electrónico inválido';
    if (formData.phone && !/^[\d\s\+\-\(\)]{6,20}$/.test(formData.phone))
      e.phone = 'Número de teléfono inválido';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setServerError('');

    try {
      const res = await fetch('/api/auth/attendee-access', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:    formData.name.trim(),
          email:   formData.email.trim().toLowerCase(),
          phone:   formData.phone.trim() || undefined,
          eventId: eventId || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setServerError(data.errors?.[0]?.msg || data.error || 'Error del servidor');
        return;
      }

      await checkAuth();
      localStorage.removeItem('pendingEventAction');
      setDone(true);

      setTimeout(() => {
        navigate(eventId ? `/?registered=${eventId}` : '/');
      }, 1800);

    } catch {
      setServerError('Error de conexión. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Field helper ──────────────────────────────────────────────────────────
  const field = (id, label, type, icon, placeholder, required = false) => (
    <div>
      <label className="block text-sm font-medium text-text_secondary mb-2">
        {label}
        {!required && <span className="ml-2 text-xs text-text_muted font-normal">(opcional)</span>}
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text_muted">{icon}</span>
        <input
          type={type}
          value={formData[id]}
          onChange={(e) => {
            setFormData({ ...formData, [id]: e.target.value });
            if (errors[id]) setErrors({ ...errors, [id]: '' });
          }}
          className={`w-full bg-white/5 border rounded-xl pl-10 pr-4 py-3 text-white placeholder-text_muted focus:outline-none transition-colors
            ${errors[id] ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-accent/50'}`}
          placeholder={placeholder}
          required={required}
          autoComplete={id === 'email' ? 'email' : id === 'name' ? 'name' : 'tel'}
        />
      </div>
      {errors[id] && <p className="mt-1 text-xs text-red-400">{errors[id]}</p>}
    </div>
  );

  // ── Success ───────────────────────────────────────────────────────────────
  if (done) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/30">
            <CheckCircle size={40} className="text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">¡Asistencia confirmada!</h2>
          <p className="text-text_secondary">Te esperamos en el evento 🎶</p>
          <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mt-2" />
        </div>
      </div>
    );
  }

  // ── Auth loading ──────────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  // ── Form ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="absolute -top-14 left-0">
          <Link to="/" className="inline-flex items-center gap-2 text-text_secondary hover:text-white transition-colors">
            <ArrowLeft size={18} />
            <span>Volver al inicio</span>
          </Link>
        </div>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-purple-600 mb-4">
            <Music size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Stephanie Miranda</h1>
          <p className="text-text_secondary mt-1">
            {eventId ? 'Confirma tu asistencia al evento' : 'Accede rápidamente'}
          </p>
        </div>

        <div className="glass-card border border-white/10 rounded-2xl p-8 shadow-2xl">
          {eventId && (
            <div className="mb-6 p-4 bg-accent/10 border border-accent/20 rounded-xl flex items-center gap-3">
              <Calendar size={20} className="text-accent shrink-0" />
              <div>
                <p className="text-xs text-text_muted">Registrándote para el evento</p>
                <p className="text-white font-medium text-sm">Tu lugar quedará reservado al enviar</p>
              </div>
            </div>
          )}

          <h2 className="text-xl font-semibold text-white mb-1">
            {eventId ? 'Confirmar asistencia' : 'Ingresa tus datos'}
          </h2>
          <p className="text-sm text-text_muted mb-6">
            {isAuthenticated && user?.role === 'fan'
              ? 'Confirma que tus datos son correctos'
              : 'Solo te pediremos esta información una vez'}
          </p>

          {serverError && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-start gap-2">
              <span>⚠️</span>
              <p>{serverError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {field('name',  'Nombre completo',    'text',  <User  size={18} />, 'Tu nombre',     true)}
            {field('phone', 'Número de teléfono', 'tel',   <Phone size={18} />, '+506 8888-0000'      )}
            {field('email', 'Correo electrónico', 'email', <Mail  size={18} />, 'tu@correo.com', true)}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-accent to-purple-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-accent/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Procesando...</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  {eventId ? 'Confirmar asistencia' : 'Continuar'}
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10 space-y-2">
            <div className="flex items-center gap-2 text-sm text-text_secondary">
              <Calendar size={14} className="text-accent shrink-0" />
              <span>Tu lugar quedará registrado automáticamente</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-text_secondary">
              <Sparkles size={14} className="text-accent shrink-0" />
              <span>La próxima vez no tendrás que llenar nada</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicLogin;
