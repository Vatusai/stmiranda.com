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
  Eye,
  Pencil,
  X,
  Save,
  DollarSign,
  FileText,
  StickyNote,
  Calendar,
} from 'lucide-react';
import { eventsApi, inquiriesApi } from '../../services/api.js';

// ─── helpers ────────────────────────────────────────────────────────────────

const today = () => new Date().toISOString().split('T')[0];

const fmtDate = (d) =>
  new Intl.DateTimeFormat('es-CR', { weekday: 'short', day: 'numeric', month: 'short' }).format(
    new Date(d + 'T00:00:00')
  );

const fmtDateLong = (d) =>
  new Intl.DateTimeFormat('es-CR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(
    new Date(d + 'T00:00:00')
  );

const fmtDateTime = (iso) => {
  if (!iso) return '—';
  return new Intl.DateTimeFormat('es-CR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(iso));
};

const daysUntil = (d) => {
  const diff = new Date(d + 'T00:00:00') - new Date(new Date().toDateString());
  return Math.round(diff / 86400000);
};

const STATUS_MAP = {
  confirmed: { label: 'Confirmado', variant: 'confirmed' },
  pending:   { label: 'Pendiente',  variant: 'pending'   },
  quoted:    { label: 'Cotizado',   variant: 'quoted'     },
  cancelled: { label: 'Cancelado',  variant: 'cancelled'  },
  completed: { label: 'Completado', variant: 'completed'  },
};

const STATUS_LABELS = {
  nuevo:     { label: 'Nuevo',     variant: 'info'    },
  pendiente: { label: 'Pendiente', variant: 'warning' },
  confirmado:{ label: 'Confirmado',variant: 'confirmed'},
  cancelado: { label: 'Cancelado', variant: 'cancelled'},
};

// ─── Modal shell ─────────────────────────────────────────────────────────────

const Modal = ({ open, onClose, title, children, maxWidth = 'max-w-lg' }) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Panel */}
      <div className={`relative w-full ${maxWidth} bg-[#1A1A2E] border border-white/10 rounded-2xl shadow-2xl shadow-black/50 flex flex-col max-h-[90vh]`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 flex-shrink-0">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
          >
            <X size={20} />
          </button>
        </div>
        {/* Body — scrollable */}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          {children}
        </div>
      </div>
    </div>
  );
};

// ─── View Modal ──────────────────────────────────────────────────────────────

const Row = ({ icon: Icon, label, value, accent }) => {
  if (!value && value !== 0) return null;
  return (
    <div className="flex items-start gap-3 py-3 border-b border-white/5 last:border-0">
      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
        <Icon size={15} className={accent || 'text-gray-400'} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 mb-0.5">{label}</p>
        <div className="text-sm text-white">{value}</div>
      </div>
    </div>
  );
};

const EventViewModal = ({ event, open, onClose, onEdit }) => {
  if (!event) return null;
  const isPublic = event.visibility === 'publico';
  const status   = STATUS_MAP[event.status] || { label: event.status, variant: 'default' };

  return (
    <Modal open={open} onClose={onClose} title="Detalles del evento" maxWidth="max-w-lg">
      {/* Title + badges */}
      <div className="mb-5">
        <h2 className="text-xl font-bold text-white mb-3 leading-tight">{event.title}</h2>
        <div className="flex flex-wrap gap-2">
          <Badge variant={status.variant} dot>{status.label}</Badge>
          <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-medium
            ${isPublic
              ? 'text-violet-400 border-violet-500/30 bg-violet-500/10'
              : 'text-amber-400  border-amber-500/30  bg-amber-500/10'}`}>
            {isPublic ? <Globe size={11} /> : <Lock size={11} />}
            {isPublic ? 'Público' : 'Privado'}
          </span>
          {event.event_type && (
            <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border font-medium
              ${event.event_type === 'gratis'
                ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                : 'text-amber-400  border-amber-500/30  bg-amber-500/10'}`}>
              {event.event_type === 'gratis' ? 'Entrada gratuita' : 'Evento pagado'}
            </span>
          )}
        </div>
      </div>

      {/* Details rows */}
      <div className="rounded-xl bg-white/3 border border-white/5 px-4 mb-5">
        <Row icon={Calendar}  label="Fecha"      value={fmtDateLong(event.date)}    accent="text-violet-400" />
        <Row icon={Clock}     label="Hora"       value={event.time}                 accent="text-blue-400"   />
        <Row icon={MapPin}    label="Lugar"       value={event.location}             accent="text-emerald-400"/>
        {isPublic && event.attendeeCount !== undefined && (
          <Row icon={Users}   label="Asistentes" value={`${event.attendeeCount} registrados`} accent="text-pink-400" />
        )}
        <Row icon={DollarSign} label="Presupuesto" value={event.budget ? `$${event.budget}` : null} accent="text-amber-400" />
        <Row icon={FileText}  label="Descripción" value={event.description}          accent="text-gray-400"   />
        <Row icon={StickyNote} label="Notas"      value={event.notes}                accent="text-gray-400"   />
        {event.client_name && (
          <Row icon={Users}   label="Cliente"    value={event.client_name}           accent="text-blue-400"   />
        )}
      </div>

      {/* Timestamps */}
      <div className="flex gap-4 text-xs text-gray-600 mb-5">
        {event.created_at && <span>Creado: {fmtDateTime(event.created_at)}</span>}
        {event.updated_at && <span>Actualizado: {fmtDateTime(event.updated_at)}</span>}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button variant="ghost" size="sm" onClick={onClose} className="flex-1">
          Cerrar
        </Button>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Pencil size={14} />}
          onClick={() => { onClose(); onEdit(event); }}
          className="flex-1"
        >
          Editar evento
        </Button>
      </div>
    </Modal>
  );
};

// ─── Edit Modal ──────────────────────────────────────────────────────────────

const FIELD = ({ label, children }) => (
  <div>
    <label className="block text-xs font-medium text-gray-400 mb-1.5">{label}</label>
    {children}
  </div>
);

const inputCls = 'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-violet-500/50 transition-colors';
const selectCls = inputCls + ' cursor-pointer';

const EventEditModal = ({ event, open, onClose, onSaved }) => {
  const [form, setForm]       = useState({});
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');

  // Sync form when event changes
  useEffect(() => {
    if (event) {
      setForm({
        title:       event.title       || '',
        date:        event.date        || '',
        time:        event.time        || '',
        location:    event.location    || '',
        status:      event.status      || 'pending',
        visibility:  event.visibility  || 'privado',
        event_type:  event.event_type  || '',
        budget:      event.budget      || '',
        description: event.description || '',
        notes:       event.notes       || '',
      });
      setError('');
    }
  }, [event]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSave = async () => {
    if (!form.title.trim()) { setError('El nombre del evento es requerido'); return; }
    if (!form.date)          { setError('La fecha es requerida');            return; }
    setSaving(true);
    setError('');
    try {
      const updated = await eventsApi.update(event.id, {
        ...form,
        budget: form.budget ? Number(form.budget) : null,
      });
      onSaved({ ...event, ...form, ...updated });
      onClose();
    } catch (err) {
      setError(err.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  if (!event) return null;

  return (
    <Modal open={open} onClose={onClose} title="Editar evento" maxWidth="max-w-xl">
      <div className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
            <AlertCircle size={15} className="shrink-0" />
            {error}
          </div>
        )}

        {/* Name */}
        <FIELD label="Nombre del evento *">
          <input className={inputCls} value={form.title} onChange={set('title')} placeholder="Nombre del evento" />
        </FIELD>

        {/* Date + Time */}
        <div className="grid grid-cols-2 gap-3">
          <FIELD label="Fecha *">
            <input type="date" className={inputCls} value={form.date} onChange={set('date')} />
          </FIELD>
          <FIELD label="Hora">
            <input type="time" className={inputCls} value={form.time} onChange={set('time')} />
          </FIELD>
        </div>

        {/* Location */}
        <FIELD label="Lugar">
          <input className={inputCls} value={form.location} onChange={set('location')} placeholder="Nombre del lugar" />
        </FIELD>

        {/* Status + Visibility */}
        <div className="grid grid-cols-2 gap-3">
          <FIELD label="Estado">
            <select className={selectCls} value={form.status} onChange={set('status')}>
              <option value="pending">Pendiente</option>
              <option value="quoted">Cotizado</option>
              <option value="confirmed">Confirmado</option>
              <option value="completed">Completado</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </FIELD>
          <FIELD label="Visibilidad">
            <select className={selectCls} value={form.visibility} onChange={set('visibility')}>
              <option value="privado">Privado</option>
              <option value="publico">Público</option>
            </select>
          </FIELD>
        </div>

        {/* Event type + Budget */}
        <div className="grid grid-cols-2 gap-3">
          <FIELD label="Tipo de evento">
            <select className={selectCls} value={form.event_type} onChange={set('event_type')}>
              <option value="">Sin especificar</option>
              <option value="gratis">Gratuito</option>
              <option value="pagado">Pagado</option>
            </select>
          </FIELD>
          <FIELD label="Presupuesto ($)">
            <input type="number" className={inputCls} value={form.budget} onChange={set('budget')} placeholder="0" min="0" />
          </FIELD>
        </div>

        {/* Description */}
        <FIELD label="Descripción">
          <textarea
            className={inputCls + ' min-h-[80px] resize-y'}
            value={form.description}
            onChange={set('description')}
            placeholder="Descripción del evento..."
          />
        </FIELD>

        {/* Notes */}
        <FIELD label="Notas internas">
          <textarea
            className={inputCls + ' min-h-[72px] resize-y'}
            value={form.notes}
            onChange={set('notes')}
            placeholder="Notas privadas..."
          />
        </FIELD>
      </div>

      {/* Footer actions */}
      <div className="flex gap-3 mt-6 pt-4 border-t border-white/10">
        <Button variant="ghost" size="sm" onClick={onClose} disabled={saving} className="flex-1">
          Cancelar
        </Button>
        <Button
          variant="primary"
          size="sm"
          leftIcon={saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          onClick={handleSave}
          disabled={saving}
          className="flex-1"
        >
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </div>
    </Modal>
  );
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

const EventsSection = ({ events, loading, onView, onEdit }) => (
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
          const status = STATUS_MAP[ev.status] || { label: ev.status, variant: 'default' };
          return (
            <div
              key={ev.id}
              onClick={() => onView(ev)}
              className={`flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer group
                ${isPublic
                  ? 'bg-violet-500/5 border-violet-500/15 hover:border-violet-500/40 hover:bg-violet-500/8'
                  : 'bg-amber-500/5  border-amber-500/15  hover:border-amber-500/40  hover:bg-amber-500/8'}`}
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
                      : 'text-amber-400  border-amber-500/30  bg-amber-500/10'}`}>
                    {isPublic ? <Globe size={10} /> : <Lock size={10} />}
                    {isPublic ? 'Público' : 'Privado'}
                  </span>
                  {ev.status && (
                    <Badge variant={status.variant} size="xs">{status.label}</Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 flex-wrap">
                  {ev.time && (
                    <span className="flex items-center gap-1"><Clock size={11} /> {ev.time}</span>
                  )}
                  {ev.location && (
                    <span className="flex items-center gap-1"><MapPin size={11} /> {ev.location}</span>
                  )}
                  {isPublic && ev.attendeeCount !== undefined && (
                    <span className="flex items-center gap-1"><Users size={11} /> {ev.attendeeCount} asistentes</span>
                  )}
                </div>
              </div>

              {/* Days until + action buttons */}
              <div className="flex-shrink-0 flex items-center gap-2">
                <span className={`text-xs font-medium hidden sm:block
                  ${days === 0 ? 'text-emerald-400' : days <= 3 ? 'text-amber-400' : 'text-gray-500'}`}>
                  {days === 0 ? 'Hoy' : days === 1 ? 'Mañana' : `en ${days}d`}
                </span>

                {/* Action buttons — visible on hover */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => { e.stopPropagation(); onView(ev); }}
                    title="Ver detalles"
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <Eye size={15} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onEdit(ev); }}
                    title="Editar evento"
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <Pencil size={15} />
                  </button>
                </div>
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
                <div className={`w-2 h-2 rounded-full flex-shrink-0
                  ${inq.status === 'nuevo' ? 'bg-blue-400' : 'bg-amber-400'}`} />
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

  const handleNotify = async (eventId) => {
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

  const eventsWithAttendees = publicEvents.filter((ev) => ev.attendeeCount !== undefined);

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
              <div key={ev.id} className="p-4 rounded-xl border border-white/10 bg-white/3">
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
                    onClick={() => handleNotify(ev.id)}
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
  const [events,          setEvents         ] = useState([]);
  const [inquiries,       setInquiries      ] = useState([]);
  const [eventsLoading,   setEventsLoading  ] = useState(true);
  const [inquiriesLoading,setInquiriesLoading] = useState(true);
  const [loadError,       setLoadError      ] = useState(null);

  // Modal state lives here so onSaved can update the events list in place
  const [viewEvent, setViewEvent] = useState(null);
  const [editEvent, setEditEvent] = useState(null);

  const load = useCallback(async () => {
    setLoadError(null);
    setEventsLoading(true);
    setInquiriesLoading(true);

    try {
      const [evData, inqData] = await Promise.all([
        eventsApi.getAll({ start_date: today(), limit: 20 }),
        inquiriesApi.getAll({ limit: 50 }),
      ]);

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

  useEffect(() => { load(); }, [load]);

  // Update the event in place after a successful edit — no full reload needed
  const handleEventSaved = (updated) => {
    setEvents((prev) => prev.map((ev) => ev.id === updated.id ? { ...ev, ...updated } : ev));
  };

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
    <>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <p className="text-gray-400 mt-1 text-sm">Centro de operaciones</p>
          </div>
          <Button variant="ghost" size="sm" leftIcon={<RefreshCw size={14} />} onClick={load}>
            Actualizar
          </Button>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Próximos eventos',       value: events.length,        color: 'text-violet-400'  },
            { label: 'Cotizaciones pendientes', value: inquiries.length,     color: 'text-blue-400'    },
            { label: 'Eventos públicos',        value: publicUpcoming.length, color: 'text-emerald-400' },
          ].map((s) => (
            <Card key={s.label} variant="elevated" padding="sm">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </Card>
          ))}
        </div>

        {/* Section 1 — events with onView / onEdit */}
        <Card variant="elevated" padding="md">
          <EventsSection
            events={events}
            loading={eventsLoading}
            onView={setViewEvent}
            onEdit={setEditEvent}
          />
        </Card>

        {/* Section 2 + 3 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card variant="elevated" padding="md">
            <InquiriesSection inquiries={inquiries} loading={inquiriesLoading} />
          </Card>
          <Card variant="elevated" padding="md">
            <NotificationsSection publicEvents={publicUpcoming} eventsLoading={eventsLoading} />
          </Card>
        </div>
      </div>

      {/* Modals — rendered outside the layout flow */}
      <EventViewModal
        event={viewEvent}
        open={!!viewEvent}
        onClose={() => setViewEvent(null)}
        onEdit={(ev) => setEditEvent(ev)}
      />
      <EventEditModal
        event={editEvent}
        open={!!editEvent}
        onClose={() => setEditEvent(null)}
        onSaved={handleEventSaved}
      />
    </>
  );
};

export default Dashboard;
