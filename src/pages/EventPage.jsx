/**
 * EventPage
 * Public shareable event detail page with inline attendance registration.
 * Route: /eventos/:slug
 */
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ShareModal from '../components/ShareModal';
import {
  Calendar, MapPin, Clock, Users, ExternalLink, ArrowLeft,
  Sparkles, CheckCircle, User, Phone, Mail, Music, Share2, Ticket,
} from 'lucide-react';

// ─── Helpers ────────────────────────────────────────────────────────────────

const parseLocal = (dateStr) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
};

const formatFullDate = (dateStr) =>
  new Intl.DateTimeFormat('es-ES', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  }).format(parseLocal(dateStr));

// ─── Sub-components ─────────────────────────────────────────────────────────

const Skeleton = () => (
  <div className="min-h-screen bg-[#0F0F23] flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-violet-600/30 border-t-violet-500 rounded-full animate-spin" />
  </div>
);

const NotFoundEvent = () => (
  <div className="min-h-screen bg-[#0F0F23] flex items-center justify-center p-4">
    <div className="text-center">
      <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
        <Music size={32} className="text-gray-500" />
      </div>
      <h1 className="text-2xl font-bold text-white mb-2">Evento no encontrado</h1>
      <p className="text-gray-400 mb-8">Este evento no existe o ya no está disponible.</p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600/20 hover:bg-violet-600/30 text-violet-400 rounded-xl transition-colors border border-violet-500/20"
      >
        <ArrowLeft size={18} />
        Volver al inicio
      </Link>
    </div>
  </div>
);

const Field = ({ id, label, type, icon, placeholder, required, value, error, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-gray-300 mb-1.5">
      {label}
      {!required && <span className="ml-2 text-xs text-gray-500 font-normal">(opcional)</span>}
    </label>
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">{icon}</span>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        autoComplete={id === 'email' ? 'email' : id === 'name' ? 'name' : 'tel'}
        className={`w-full bg-white/5 border rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-600
          focus:outline-none transition-colors text-sm
          ${error ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-violet-500/50'}`}
      />
    </div>
    {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
  </div>
);

// ─── Main Component ──────────────────────────────────────────────────────────

const EventPage = () => {
  const { slug } = useParams();
  const { isAuthenticated, user, checkAuth } = useAuth();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [showShare, setShowShare] = useState(false);

  // Attendance form state
  const [form, setForm] = useState({ name: '', phone: '', email: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Data fetching ──────────────────────────────────────────────────────────

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/events/by-slug/${slug}`);
        if (res.status === 404) { setNotFound(true); return; }
        if (!res.ok) throw new Error('fetch error');
        const data = await res.json();
        setEvent(data.event);
        document.title = `${data.event.title} — Stephanie Miranda`;
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
    return () => { document.title = 'Stephanie Miranda'; };
  }, [slug]);

  // Pre-fill form when fan is already logged in
  useEffect(() => {
    if (isAuthenticated && user?.role === 'fan') {
      setForm({ name: user.name || '', email: user.email || '', phone: user.phone || '' });
    }
  }, [isAuthenticated, user]);

  // Check if this fan is already registered
  useEffect(() => {
    if (!isAuthenticated || !event) return;
    fetch('/api/events/my-registrations', { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        const ids = new Set((data.registrations || []).map(r => r.event_id));
        if (ids.has(event.id)) setIsRegistered(true);
      })
      .catch(() => {});
  }, [isAuthenticated, event]);

  // ── Form handlers ──────────────────────────────────────────────────────────

  const setField = (id, value) => {
    setForm(prev => ({ ...prev, [id]: value }));
    if (errors[id]) setErrors(prev => ({ ...prev, [id]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'El nombre es requerido';
    if (!form.email.trim()) e.email = 'El correo es requerido';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Correo electrónico inválido';
    if (form.phone && !/^[\d\s+\-()]{6,20}$/.test(form.phone)) e.phone = 'Número de teléfono inválido';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    setServerError('');
    try {
      const res = await fetch('/api/auth/attendee-access', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          phone: form.phone.trim() || undefined,
          eventId: event.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setServerError(data.errors?.[0]?.msg || data.error || 'Error del servidor');
        return;
      }
      await checkAuth();
      localStorage.removeItem('pendingEventAction');
      setIsRegistered(true);
      // Refresh attendee count
      fetch(`/api/events/by-slug/${slug}`)
        .then(r => r.json())
        .then(d => setEvent(d.event))
        .catch(() => {});
    } catch {
      setServerError('Error de conexión. Intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loading) return <Skeleton />;
  if (notFound) return <NotFoundEvent />;

  const isFree = event.event_type === 'gratis';
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <div className="min-h-screen bg-[#0F0F23] text-white">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/8 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/8 rounded-full blur-3xl" />
      </div>

      {/* Back nav */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 pt-6 pb-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
        >
          <ArrowLeft size={16} />
          Volver al inicio
        </Link>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 pb-20">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">

          {/* ── Left: Event Flyer ── */}
          <div className="order-1">
            {event.flyer_url ? (
              <div className="w-full rounded-3xl overflow-hidden shadow-2xl shadow-violet-900/20">
                <img
                  src={event.flyer_url}
                  alt={event.title}
                  className="w-full aspect-[3/4] object-cover"
                />
              </div>
            ) : (
              <div className="w-full aspect-[3/4] bg-gradient-to-br from-violet-900/30 to-purple-900/20
                rounded-3xl border border-white/10 flex flex-col items-center justify-center shadow-2xl">
                <div className="w-20 h-20 rounded-2xl bg-violet-600/20 border border-violet-500/20
                  flex items-center justify-center mb-6">
                  <Music size={36} className="text-violet-400" />
                </div>
                <p className="text-white font-bold text-2xl text-center px-8 leading-tight">{event.title}</p>
                {event.date && (
                  <p className="text-gray-400 mt-3 capitalize">{formatFullDate(event.date)}</p>
                )}
              </div>
            )}
          </div>

          {/* ── Right: Details + Form ── */}
          <div className="order-2 space-y-6">

            {/* Event header */}
            <div>
              {/* Badges row */}
              <div className="flex items-center gap-3 flex-wrap mb-4">
                <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold
                  ${isFree
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                    : 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                  }`}>
                  <Ticket size={13} />
                  {isFree ? 'Entrada Gratuita' : 'Evento Pagado'}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-5">
                {event.title}
              </h1>

              {/* Meta */}
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/15
                    flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Calendar size={16} className="text-violet-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium capitalize">{formatFullDate(event.date)}</p>
                    {event.time && (
                      <p className="text-sm text-gray-400 flex items-center gap-1 mt-0.5">
                        <Clock size={12} />
                        {event.time}
                      </p>
                    )}
                  </div>
                </div>

                {event.location && (
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/15
                      flex items-center justify-center flex-shrink-0">
                      <MapPin size={16} className="text-violet-400" />
                    </div>
                    <p className="text-white">{event.location}</p>
                  </div>
                )}
              </div>

              {/* Description */}
              {event.description && (
                <p className="text-gray-400 mt-5 leading-relaxed text-sm">{event.description}</p>
              )}
            </div>

            {/* Share button */}
            <button
              onClick={() => setShowShare(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10
                border border-white/10 text-gray-300 hover:text-white transition-colors text-sm"
            >
              <Share2 size={16} />
              Compartir evento
            </button>

            {/* ── Registration card ── */}
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 shadow-xl">

              {isRegistered ? (
                /* Success state */
                <div className="text-center py-4 space-y-3">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/20
                    flex items-center justify-center mx-auto">
                    <CheckCircle size={32} className="text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white">¡Asistencia confirmada!</h3>
                  <p className="text-gray-400 text-sm capitalize">
                    Te esperamos el {formatFullDate(event.date)}
                    {event.location && ` en ${event.location}`}.
                  </p>
                  <Link
                    to="/"
                    className="inline-flex items-center gap-2 mt-2 text-sm text-violet-400 hover:text-violet-300 transition-colors"
                  >
                    <ArrowLeft size={14} />
                    Volver al inicio
                  </Link>
                </div>

              ) : !isFree && event.external_link ? (
                /* Paid event — external link */
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-white">Evento de pago</h3>
                    <p className="text-sm text-gray-400 mt-1">Adquiere tu entrada en el siguiente enlace.</p>
                  </div>
                  <a
                    href={event.external_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3.5 px-6
                      bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold
                      rounded-xl hover:shadow-lg hover:shadow-amber-500/20 transition-all duration-300"
                  >
                    Reservar lugar
                    <ExternalLink size={17} />
                  </a>
                </div>

              ) : (
                /* Free event — attendance form */
                <div>
                  <h3 className="text-base font-bold text-white mb-1">Confirma tu asistencia</h3>
                  <p className="text-xs text-gray-500 mb-5">
                    {isAuthenticated && user?.role === 'fan'
                      ? 'Confirma que tus datos son correctos.'
                      : 'Solo te pedimos esta información una vez.'}
                  </p>

                  {serverError && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl
                      text-red-400 text-sm flex items-start gap-2">
                      <span>⚠️</span>
                      <p>{serverError}</p>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                    <Field
                      id="name" label="Nombre completo" type="text"
                      icon={<User size={16} />} placeholder="Tu nombre"
                      required value={form.name} error={errors.name}
                      onChange={e => setField('name', e.target.value)}
                    />
                    <Field
                      id="phone" label="Número de teléfono" type="tel"
                      icon={<Phone size={16} />} placeholder="+506 8888-0000"
                      value={form.phone} error={errors.phone}
                      onChange={e => setField('phone', e.target.value)}
                    />
                    <Field
                      id="email" label="Correo electrónico" type="email"
                      icon={<Mail size={16} />} placeholder="tu@correo.com"
                      required value={form.email} error={errors.email}
                      onChange={e => setField('email', e.target.value)}
                    />

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 px-6 bg-gradient-to-r from-violet-600 to-purple-600
                        text-white font-bold rounded-xl hover:shadow-lg hover:shadow-violet-500/25
                        transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
                        flex items-center justify-center gap-2 mt-1"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Procesando...
                        </>
                      ) : (
                        <>
                          <Sparkles size={17} />
                          Confirmar asistencia
                        </>
                      )}
                    </button>
                  </form>

                  <div className="mt-5 pt-4 border-t border-white/5 space-y-2">
                    <p className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar size={12} className="text-violet-400 flex-shrink-0" />
                      Tu lugar quedará registrado automáticamente
                    </p>
                    <p className="flex items-center gap-2 text-xs text-gray-500">
                      <Sparkles size={12} className="text-violet-400 flex-shrink-0" />
                      La próxima vez no tendrás que llenar nada
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Share modal */}
      {showShare && (
        <ShareModal event={event} url={shareUrl} onClose={() => setShowShare(false)} />
      )}
    </div>
  );
};

export default EventPage;
