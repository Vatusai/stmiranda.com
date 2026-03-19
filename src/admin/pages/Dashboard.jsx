/**
 * Dashboard — Centro de operaciones
 * 1. Próximos eventos (públicos + privados)
 * 2. Cotizaciones pendientes
 * 3. Notificaciones a asistentes
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import {
  CalendarDays,
  ClipboardList,
  Bell,
  MapPin,
  Clock,
  Globe,
  Lock,
  Users,
  ArrowRight,
  Loader2,
  Send,
  CheckCircle,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { eventsApi, inquiriesApi } from '../../services/api.js';

// ─── helpers ────────────────────────────────────────────────────────────────

const today = () => new Date().toISOString().split('T')[0];

const fmtDate = (d) =>
  new Intl.DateTimeFormat('es-CR', { weekday: 'short', day: 'numeric', month: 'short' }).format(
    new Date(d + 'T00:00:00')
  );

const daysUntil = (d) => {
  const diff = new Date(d + 'T00:00:00') - new Date(new Date().toDateString());
  return Math.round(diff / 86400000);
};

const STATUS_LABELS = {
  nuevo: { label: 'Nuevo', variant: 'info' },
  pendiente: { label: 'Pendiente', variant: 'warning' },
  confirmado: { label: 'Confirmado', variant: 'confirmed' },
  cancelado: { label: 'Cancelado', variant: 'cancelled' },
};

// ─── sub-components ──────────────────────────────────────────────────────────

const SectionHeader = ({ icon: Icon, color, title, subtitle, action }) => (
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-2">
      <Icon size={20} className={color} />
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      {subtitle && <span className="text-sm text-gray-500 hidden sm:inline">{subtitle}</span>}
    </div>
    {action}
  </div>
);

const EmptyState = ({ icon: Icon, text }) => (
  <div className="flex flex-col items-center justify-center py-10 text-gray-500 gap-2">
    <Icon size={32} className="opacity-40" />
    <p className="text-sm">{text}</p>
  </div>
);

// ─── Section 1: Upcoming Events ──────────────────────────────────────────────

const EventsSection = ({ events, loading }) => (
  <div>
    <SectionHeader
      icon={CalendarDays}
      color="text-violet-400"
      title="Próximos Eventos"
      subtitle="públicos y privados"
      action={
        <Link to="/admin/calendar">
          <Button variant="ghost" size="sm" rightIcon={<ArrowRight size={14} />}>
            Ver calendario
          </Button>
        </Link>
      }
    />

    {loading ? (
      <div className="flex justify-center py-10">
        <Loader2 size={28} className="animate-spin text-violet-400" />
      </div>
    ) : events.length === 0 ? (
      <EmptyState icon={CalendarDays} text="No hay eventos próximos" />
    ) : (
      <div className="space-y-2">
        {events.map((ev) => {
          const days = daysUntil(ev.date);
          const isPublic = ev.visibility === 'publico';
          return (
            <div
              key={ev.id}
              className={`flex items-center gap-4 p-4 rounded-xl border transition-colors
                ${isPublic
                  ? 'bg-violet-500/5 border-violet-500/15 hover:border-violet-500/30'
                  : 'bg-amber-500/5 border-amber-500/15 hover:border-amber-500/30'}`}
            >
              {/* Date badge */}
              <div className={`flex-shrink-0 text-center w-12
                ${isPublic ? 'text-violet-400' : 'text-amber-400'}`}>
                <div className="text-xl font-bold leading-none">
                  {new Date(ev.date + 'T00:00:00').getDate()}
                </div>
                <div className="text-xs uppercase opacity-70">
                  {new Intl.DateTimeFormat('es-CR', { month: 'short' }).format(
                    new Date(ev.date + 'T00:00:00')
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-white font-medium truncate">{ev.title}</span>
                  <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border
                    ${isPublic
                      ? 'text-violet-400 border-violet-500/30 bg-violet-500/10'
                      : 'text-amber-400 border-amber-500/30 bg-amber-500/10'}`}>
                    {isPublic ? <Globe size={10} /> : <Lock size={10} />}
                    {isPublic ? 'Público' : 'Privado'}
                  </span>
                  {ev.status && (
                    <Badge variant={ev.status === 'confirmed' ? 'confirmed' : 'pending'} size="xs">
                      {ev.status === 'confirmed' ? 'Confirmado' : ev.status}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 flex-wrap">
                  {ev.time && (
                    <span className="flex items-center gap-1">
                      <Clock size={11} /> {ev.time}
                    </span>
                  )}
                  {ev.location && (
                    <span className="flex items-center gap-1">
                      <MapPin size={11} /> {ev.location}
                    </span>
                  )}
                  {isPublic && ev.attendeeCount !== undefined && (
                    <span className="flex items-center gap-1">
                      <Users size={11} /> {ev.attendeeCount} asistentes
                    </span>
                  )}
                </div>
              </div>

              {/* Days until */}
              <div className="flex-shrink-0 text-right">
                <span className={`text-xs font-medium
                  ${days === 0 ? 'text-emerald-400' : days <= 3 ? 'text-amber-400' : 'text-gray-500'}`}>
                  {days === 0 ? 'Hoy' : days === 1 ? 'Mañana' : `en ${days}d`}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    )}
  </div>
);

// ─── Section 2: Pending Inquiries ────────────────────────────────────────────

const InquiriesSection = ({ inquiries, loading }) => (
  <div>
    <SectionHeader
      icon={ClipboardList}
      color="text-blue-400"
      title="Cotizaciones Pendientes"
      subtitle="requieren atención"
      action={
        <Link to="/admin/inquiries">
          <Button variant="ghost" size="sm" rightIcon={<ArrowRight size={14} />}>
            Ver todas
          </Button>
        </Link>
      }
    />

    {loading ? (
      <div className="flex justify-center py-10">
        <Loader2 size={28} className="animate-spin text-blue-400" />
      </div>
    ) : inquiries.length === 0 ? (
      <EmptyState icon={CheckCircle} text="Sin cotizaciones pendientes" />
    ) : (
      <div className="space-y-2">
        {inquiries.map((inq) => {
          const s = STATUS_LABELS[inq.status] || STATUS_LABELS.pendiente;
          return (
            <Link key={inq.id} to="/admin/inquiries">
              <div className="flex items-center gap-4 p-4 rounded-xl border border-white/10 bg-white/3 hover:border-blue-500/30 hover:bg-blue-500/5 transition-colors cursor-pointer">
                {/* Status dot */}
                <div className={`w-2 h-2 rounded-full flex-shrink-0
                  ${inq.status === 'nuevo' ? 'bg-blue-400' : 'bg-amber-400'}`} />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-white font-medium">
                      {inq.contact_name || inq.client_name || '—'}
                    </span>
                    <Badge variant={s.variant} size="xs">{s.label}</Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 flex-wrap">
                    {inq.event_type && <span>{inq.event_type}</span>}
                    {inq.event_date && (
                      <span className="flex items-center gap-1">
                        <CalendarDays size={11} /> {fmtDate(inq.event_date)}
                      </span>
                    )}
                    {inq.budget && <span>💰 {inq.budget}</span>}
                  </div>
                </div>

                <ArrowRight size={14} className="text-gray-600 flex-shrink-0" />
              </div>
            </Link>
          );
        })}
      </div>
    )}
  </div>
);

// ─── Section 3: Notifications ────────────────────────────────────────────────

const NotificationsSection = ({ publicEvents, eventsLoading }) => {
  const [sending, setSending] = useState({});
  const [results, setResults] = useState({});

  const handleNotify = async (eventId, eventTitle) => {
    setSending((s) => ({ ...s, [eventId]: true }));
    setResults((r) => ({ ...r, [eventId]: null }));
    try {
      const data = await eventsApi.notifyAttendees(eventId);
      setResults((r) => ({
        ...r,
        [eventId]: { ok: true, text: `${data.sent} de ${data.total} emails enviados` },
      }));
    } catch (err) {
      setResults((r) => ({
        ...r,
        [eventId]: { ok: false, text: err.message || 'Error al enviar' },
      }));
    } finally {
      setSending((s) => ({ ...s, [eventId]: false }));
    }
  };

  const eventsWithAttendees = publicEvents.filter(
    (ev) => ev.attendeeCount !== undefined
  );

  return (
    <div>
      <SectionHeader
        icon={Bell}
        color="text-emerald-400"
        title="Notificaciones"
        subtitle="avisar a asistentes registrados"
      />

      {eventsLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 size={28} className="animate-spin text-emerald-400" />
        </div>
      ) : eventsWithAttendees.length === 0 ? (
        <EmptyState icon={Bell} text="No hay eventos públicos con asistentes registrados" />
      ) : (
        <div className="space-y-3">
          {eventsWithAttendees.map((ev) => {
            const res = results[ev.id];
            const isSending = sending[ev.id];
            return (
              <div
                key={ev.id}
                className="p-4 rounded-xl border border-white/10 bg-white/3"
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <p className="text-white font-medium">{ev.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {fmtDate(ev.date)}
                      {ev.time && ` · ${ev.time}`}
                      {ev.location && ` · ${ev.location}`}
                    </p>
                    <p className="text-xs text-violet-400 mt-1 flex items-center gap-1">
                      <Users size={11} />
                      {ev.attendeeCount} {ev.attendeeCount === 1 ? 'asistente registrado' : 'asistentes registrados'}
                    </p>
                  </div>

                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={isSending || ev.attendeeCount === 0}
                    leftIcon={isSending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                    onClick={() => handleNotify(ev.id, ev.title)}
                  >
                    {isSending ? 'Enviando...' : 'Notificar asistentes'}
                  </Button>
                </div>

                {res && (
                  <div className={`mt-3 flex items-center gap-2 text-xs rounded-lg px-3 py-2
                    ${res.ok
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                    {res.ok ? <CheckCircle size={13} /> : <AlertCircle size={13} />}
                    {res.text}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────

const Dashboard = () => {
  const [events, setEvents] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [inquiriesLoading, setInquiriesLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const load = useCallback(async () => {
    setLoadError(null);
    setEventsLoading(true);
    setInquiriesLoading(true);

    try {
      const [evData, inqData] = await Promise.all([
        eventsApi.getAll({ start_date: today(), limit: 20 }),
        inquiriesApi.getAll({ limit: 50 }),
      ]);

      // Attach attendee count to public events
      const eventsWithCounts = await Promise.all(
        (evData.events || []).map(async (ev) => {
          if (ev.visibility === 'publico') {
            try {
              const att = await eventsApi.getAttendees(ev.id);
              return { ...ev, attendeeCount: att.attendees?.length ?? 0 };
            } catch {
              return { ...ev, attendeeCount: 0 };
            }
          }
          return ev;
        })
      );

      setEvents(eventsWithCounts);

      // Only show nuevo + pendiente inquiries
      const pending = (inqData.inquiries || []).filter((i) =>
        ['nuevo', 'pendiente'].includes(i.status)
      );
      setInquiries(pending);
    } catch (err) {
      setLoadError(err.message);
    } finally {
      setEventsLoading(false);
      setInquiriesLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const publicUpcoming = events.filter((ev) => ev.visibility === 'publico');

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center gap-4">
        <AlertCircle size={40} className="text-red-400" />
        <p className="text-gray-400">{loadError}</p>
        <Button onClick={load} leftIcon={<RefreshCw size={16} />}>Reintentar</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 mt-1 text-sm">Centro de operaciones</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<RefreshCw size={14} />}
          onClick={load}
        >
          Actualizar
        </Button>
      </div>

      {/* Quick stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Próximos eventos', value: events.length, color: 'text-violet-400' },
          { label: 'Cotizaciones pendientes', value: inquiries.length, color: 'text-blue-400' },
          { label: 'Eventos públicos', value: publicUpcoming.length, color: 'text-emerald-400' },
        ].map((s) => (
          <Card key={s.label} variant="elevated" padding="sm">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </Card>
        ))}
      </div>

      {/* Section 1 */}
      <Card variant="elevated" padding="md">
        <EventsSection events={events} loading={eventsLoading} />
      </Card>

      {/* Section 2 + 3 side by side on large screens */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card variant="elevated" padding="md">
          <InquiriesSection inquiries={inquiries} loading={inquiriesLoading} />
        </Card>

        <Card variant="elevated" padding="md">
          <NotificationsSection
            publicEvents={publicUpcoming}
            eventsLoading={eventsLoading}
          />
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
