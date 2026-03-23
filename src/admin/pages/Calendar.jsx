/**
 * Calendar Page
 * Calendario con datos reales de la API - AHORA CON EDICIÓN
 */
import React, { useState, useEffect, useCallback } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  MapPin, 
  Calendar as CalendarIcon,
  Edit,
  Trash2,
  Loader2,
  X,
  Save
} from 'lucide-react';
import { eventsApi } from '../../services/api.js';
import { format } from '../../utils/formatters';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isNewEventModalOpen, setIsNewEventModalOpen] = useState(false);
  const [isEditEventModalOpen, setIsEditEventModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Formulario de nuevo evento
  const [newEvent, setNewEvent] = useState({
    title: '',
    client_name: '',
    date: '',
    time: '',
    duration: '4 horas',
    type: 'Boda',
    location: '',
    status: 'pending',
    budget: '',
    description: '',
    notes: '',
    // New public event fields
    visibility: 'privado',
    event_type: 'gratis',
    flyer_url: '',
    external_link: ''
  });

  // Formulario de edición
  const [editEvent, setEditEvent] = useState({
    id: '',
    title: '',
    client_name: '',
    date: '',
    time: '',
    duration: '4 horas',
    type: 'Boda',
    location: '',
    status: 'pending',
    budget: '',
    description: '',
    notes: '',
    // New public event fields
    visibility: 'privado',
    event_type: 'gratis',
    flyer_url: '',
    external_link: ''
  });

  // Cargar eventos
  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const endDate = `${year}-${String(month).padStart(2, '0')}-31`;
      
      const data = await eventsApi.getAll({ 
        start_date: startDate, 
        end_date: endDate,
        limit: 200 
      });
      
      setEvents(data.events);
    } catch (err) {
      console.error('Error loading events:', err);
    } finally {
      setLoading(false);
    }
  }, [currentDate]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Navegación del calendario
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Generar días del calendario
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      days.push(date);
    }
    
    return days;
  };

  // Parsear fecha como local (evita el desfase UTC)
  const parseLocalDate = (dateStr) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  // Obtener eventos de una fecha
  const getEventsForDate = (date) => {
    return events.filter(event => {
      const eventDate = parseLocalDate(event.date);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  // Crear evento
  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await eventsApi.create({
        ...newEvent,
        budget: newEvent.budget ? parseInt(newEvent.budget) : null
      });
      setIsNewEventModalOpen(false);
      setNewEvent({
        title: '', client_name: '', date: '', time: '', duration: '4 horas',
        type: 'Boda', location: '', status: 'pending', budget: '',
        description: '', notes: ''
      });
      fetchEvents();
    } catch (err) {
      console.error('Error creating event:', err);
      alert('Error al crear evento: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Abrir modal de edición
  const handleOpenEdit = (event) => {
    setEditEvent({
      id: event.id,
      title: event.title,
      client_name: event.client_name || '',
      date: event.date,
      time: event.time || '',
      duration: event.duration || '4 horas',
      type: event.type || 'Boda',
      location: event.location || '',
      status: event.status || 'pending',
      budget: event.budget || '',
      description: event.description || '',
      notes: event.notes || ''
    });
    setIsEventModalOpen(false);
    setIsEditEventModalOpen(true);
  };

  // Guardar edición
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await eventsApi.update(editEvent.id, {
        title: editEvent.title,
        client_name: editEvent.client_name,
        date: editEvent.date,
        time: editEvent.time,
        duration: editEvent.duration,
        type: editEvent.type,
        location: editEvent.location,
        status: editEvent.status,
        budget: editEvent.budget ? parseInt(editEvent.budget) : null,
        description: editEvent.description,
        notes: editEvent.notes
      });
      setIsEditEventModalOpen(false);
      fetchEvents();
      // Actualizar el evento seleccionado si el modal de detalle estaba abierto
      if (selectedEvent?.id === editEvent.id) {
        const updated = await eventsApi.getById(editEvent.id);
        setSelectedEvent(updated.event);
        setIsEventModalOpen(true);
      }
    } catch (err) {
      console.error('Error updating event:', err);
      alert('Error al actualizar evento: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Eliminar evento
  const handleDeleteEvent = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este evento?')) return;
    
    try {
      await eventsApi.delete(id);
      setIsEventModalOpen(false);
      setIsEditEventModalOpen(false);
      fetchEvents();
    } catch (err) {
      console.error('Error deleting event:', err);
      alert('Error al eliminar evento: ' + err.message);
    }
  };

  const calendarDays = generateCalendarDays();
  const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const monthEvents = events.filter(event => {
    const eventDate = parseLocalDate(event.date);
    return eventDate.getMonth() === currentDate.getMonth() &&
           eventDate.getFullYear() === currentDate.getFullYear();
  });

  if (loading && events.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 size={40} className="animate-spin text-violet-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Calendario</h1>
          <p className="text-gray-400 mt-1">Gestiona tus eventos y agenda</p>
        </div>
        <div className="flex items-center gap-3">
<Button 
            variant="primary" 
            leftIcon={<Plus size={18} />}
            onClick={() => setIsNewEventModalOpen(true)}
          >
            Agregar Evento
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-white">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <div className="flex items-center gap-1">
            <button onClick={prevMonth} className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10">
              <ChevronLeft size={20} />
            </button>
            <button onClick={goToToday} className="px-3 py-1.5 text-sm text-gray-300 bg-white/5 rounded-lg hover:bg-white/10">
              Hoy
            </button>
            <button onClick={nextMonth} className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
        
        <div className="hidden md:flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-gray-400">Confirmado</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span className="text-gray-400">Pendiente</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-violet-500" />
            <span className="text-gray-400">Cotizado</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <Card className="xl:col-span-2">
          <div className="grid grid-cols-7 gap-px bg-white/5 rounded-xl overflow-hidden">
            {weekDays.map((day) => (
              <div key={day} className="bg-[#1A1A2E] p-3 text-center">
                <span className="text-xs font-medium text-gray-400">{day}</span>
              </div>
            ))}
            
            {calendarDays.map((date, index) => {
              const isCurrentMonth = date.getMonth() === currentDate.getMonth();
              const isToday = date.toDateString() === new Date().toDateString();
              const dayEvents = getEventsForDate(date);
              
              return (
                <div 
                  key={index}
                  className={`
                    min-h-[100px] p-2 bg-[#1A1A2E] hover:bg-white/5 transition-colors
                    ${!isCurrentMonth ? 'opacity-40' : ''}
                    ${isToday ? 'bg-violet-500/10' : ''}
                  `}
                >
                  <div className={`
                    w-7 h-7 flex items-center justify-center text-sm rounded-full mb-1
                    ${isToday ? 'bg-violet-500 text-white' : 'text-gray-300'}
                  `}>
                    {date.getDate()}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 2).map((event) => (
                      <button
                        key={event.id}
                        onClick={() => {
                          setSelectedEvent(event);
                          setIsEventModalOpen(true);
                        }}
                        className={`
                          w-full text-left text-xs px-2 py-1 rounded truncate
                          ${event.status === 'confirmed' ? 'bg-emerald-500/20 text-emerald-400' : ''}
                          ${event.status === 'pending' ? 'bg-blue-500/20 text-blue-400' : ''}
                          ${event.status === 'quoted' ? 'bg-violet-500/20 text-violet-400' : ''}
                          ${event.status === 'cancelled' ? 'bg-red-500/20 text-red-400' : ''}
                        `}
                      >
                        {event.title}
                      </button>
                    ))}
                    {dayEvents.length > 2 && (
                      <p className="text-xs text-gray-500 pl-2">+{dayEvents.length - 2} más</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Events List */}
        <Card>
          <Card.Header>
            <Card.Title>Eventos de {monthNames[currentDate.getMonth()]}</Card.Title>
            <Card.Subtitle>{monthEvents.length} eventos programados</Card.Subtitle>
          </Card.Header>
          
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {monthEvents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CalendarIcon size={48} className="mx-auto mb-3 opacity-50" />
                <p>No hay eventos este mes</p>
              </div>
            ) : (
              monthEvents
                .sort((a, b) => new Date(a.date) - new Date(b.date))
                .map((event) => (
                  <div 
                    key={event.id}
                    className="p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer group"
                    onClick={() => {
                      setSelectedEvent(event);
                      setIsEventModalOpen(true);
                    }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant={event.status} dot size="sm">
                        {event.status === 'confirmed' ? 'Confirmado' : 
                         event.status === 'pending' ? 'Pendiente' :
                         event.status === 'quoted' ? 'Cotizado' : 'Cancelado'}
                      </Badge>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEdit(event);
                          }}
                          className="p-1 rounded hover:bg-violet-500/20 text-gray-400 hover:text-violet-400"
                          title="Editar"
                        >
                          <Edit size={14} />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteEvent(event.id);
                          }}
                          className="p-1 rounded hover:bg-red-500/20 text-gray-400 hover:text-red-400"
                          title="Eliminar"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <h4 className="font-medium text-white mb-1 truncate">{event.title}</h4>
                    <p className="text-sm text-gray-400 mb-2 truncate">{event.client_name || 'Sin cliente'}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <CalendarIcon size={12} />
                        {format.dateShort(event.date)}
                      </span>
                      {event.time && (
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {event.time}
                        </span>
                      )}
                    </div>
                  </div>
                ))
            )}
          </div>
        </Card>
      </div>

      {/* Event Detail Modal */}
      <Modal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        title={selectedEvent?.title}
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsEventModalOpen(false)}>
              Cerrar
            </Button>
            {selectedEvent && (
              <>
                <Button 
                  variant="primary" 
                  leftIcon={<Edit size={16} />}
                  onClick={() => selectedEvent && handleOpenEdit(selectedEvent)}
                >
                  Editar
                </Button>
                <Button 
                  variant="danger" 
                  leftIcon={<Trash2 size={16} />}
                  onClick={() => selectedEvent && handleDeleteEvent(selectedEvent.id)}
                >
                  Eliminar
                </Button>
              </>
            )}
          </>
        }
      >
        {selectedEvent && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant={selectedEvent.status} dot>
                {selectedEvent.status === 'confirmed' ? 'Confirmado' : 
                 selectedEvent.status === 'pending' ? 'Pendiente' :
                 selectedEvent.status === 'quoted' ? 'Cotizado' : 'Cancelado'}
              </Badge>
              {selectedEvent.type && (
                <>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-400">{selectedEvent.type}</span>
                </>
              )}
            </div>
            
            {selectedEvent.client_name && (
              <div className="flex items-center gap-3 text-gray-300">
                <span className="w-5 text-violet-400">👤</span>
                <span>{selectedEvent.client_name}</span>
              </div>
            )}
            
            <div className="flex items-center gap-3 text-gray-300">
              <CalendarIcon size={18} className="text-violet-400" />
              <span>{format.date(selectedEvent.date)}</span>
            </div>
            
            {(selectedEvent.time || selectedEvent.duration) && (
              <div className="flex items-center gap-3 text-gray-300">
                <Clock size={18} className="text-violet-400" />
                <span>
                  {selectedEvent.time} 
                  {selectedEvent.duration && ` (${selectedEvent.duration})`}
                </span>
              </div>
            )}
            
            {selectedEvent.location && (
              <div className="flex items-center gap-3 text-gray-300">
                <MapPin size={18} className="text-violet-400" />
                <span>{selectedEvent.location}</span>
              </div>
            )}
            
            {selectedEvent.description && (
              <div className="pt-4 border-t border-white/10">
                <h4 className="text-sm font-medium text-white mb-2">Descripción</h4>
                <p className="text-sm text-gray-400">{selectedEvent.description}</p>
              </div>
            )}
            
            {selectedEvent.notes && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <h4 className="text-sm font-medium text-amber-400 mb-1">📝 Notas</h4>
                <p className="text-sm text-gray-300">{selectedEvent.notes}</p>
              </div>
            )}
            
            {selectedEvent.budget > 0 && (
              <div className="pt-4 border-t border-white/10">
                <h4 className="text-sm font-medium text-white mb-1">Presupuesto</h4>
                <p className="text-2xl font-bold text-emerald-400">
                  ${selectedEvent.budget.toLocaleString()}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* New Event Modal */}
      <Modal
        isOpen={isNewEventModalOpen}
        onClose={() => setIsNewEventModalOpen(false)}
        title="Nuevo Evento"
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsNewEventModalOpen(false)}>
              Cancelar
            </Button>
            <Button 
              variant="primary"
              leftIcon={<Save size={18} />}
              onClick={handleCreateEvent}
              loading={isSubmitting}
            >
              Crear Evento
            </Button>
          </>
        }
      >
        <EventForm 
          event={newEvent} 
          setEvent={setNewEvent} 
          onSubmit={handleCreateEvent}
        />
      </Modal>

      {/* Edit Event Modal */}
      <Modal
        isOpen={isEditEventModalOpen}
        onClose={() => setIsEditEventModalOpen(false)}
        title="Editar Evento"
        size="lg"
        footer={
          <>
            <Button 
              variant="danger" 
              leftIcon={<Trash2 size={16} />}
              onClick={() => handleDeleteEvent(editEvent.id)}
            >
              Eliminar
            </Button>
            <Button variant="ghost" onClick={() => setIsEditEventModalOpen(false)}>
              Cancelar
            </Button>
            <Button 
              variant="primary"
              leftIcon={<Save size={18} />}
              onClick={handleSaveEdit}
              loading={isSubmitting}
            >
              Guardar Cambios
            </Button>
          </>
        }
      >
        <EventForm 
          event={editEvent} 
          setEvent={setEditEvent} 
          onSubmit={handleSaveEdit}
          isEdit
        />
      </Modal>
    </div>
  );
};

// Componente de formulario reutilizable
const EventForm = ({ event, setEvent, onSubmit, isEdit }) => {
  const isPublic = event.visibility === 'publico';
  
  const handleFlyerUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.match(/image\/(jpeg|jpg|png)/)) {
      alert('Solo se permiten imágenes JPG o PNG');
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('El archivo es muy grande. Máximo 5MB');
      return;
    }
    
    // Create FormData for upload
    const formData = new FormData();
    formData.append('flyer', file);
    
    try {
      // Upload to server (you'll need to implement this endpoint)
      const response = await fetch('/api/upload/flyer', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) throw new Error('Upload failed');
      
      const data = await response.json();
      setEvent({...event, flyer_url: data.url});
    } catch (err) {
      console.error('Upload error:', err);
      // For now, use a placeholder or data URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setEvent({...event, flyer_url: e.target.result});
      };
      reader.readAsDataURL(file);
    }
  };
  
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Visibility Toggle */}
      <div className="p-4 bg-violet-500/10 border border-violet-500/20 rounded-xl">
        <label className="block text-sm font-medium text-violet-400 mb-2">Visibilidad del Evento</label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="radio"
              name="visibility"
              value="privado"
              checked={event.visibility === 'privado'}
              onChange={(e) => setEvent({...event, visibility: e.target.value})}
              className="text-violet-500"
            />
            <span className="text-sm text-gray-300">Privado (Solo admin)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="radio"
              name="visibility"
              value="publico"
              checked={event.visibility === 'publico'}
              onChange={(e) => setEvent({...event, visibility: e.target.value, status: 'confirmed'})}
              className="text-violet-500"
            />
            <span className="text-sm text-gray-300">Público (Mostrar en web)</span>
          </label>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input 
          label="Título del evento *"
          value={event.title}
          onChange={(e) => setEvent({...event, title: e.target.value})}
          required
        />
        <Input 
          label="Nombre del cliente / Organizador"
          value={event.client_name}
          onChange={(e) => setEvent({...event, client_name: e.target.value})}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Fecha *</label>
          <input 
            type="date"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
            value={event.date}
            onChange={(e) => setEvent({...event, date: e.target.value})}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Hora</label>
          <input 
            type="time"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
            value={event.time}
            onChange={(e) => setEvent({...event, time: e.target.value})}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Tipo de Evento</label>
          <select 
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
            value={event.type}
            onChange={(e) => setEvent({...event, type: e.target.value})}
          >
            <option value="Boda">Boda</option>
            <option value="Corporativo">Corporativo</option>
            <option value="Cumpleaños">Cumpleaños</option>
            <option value="Graduación">Graduación</option>
            <option value="Hotel">Hotel</option>
            <option value="Concierto">Concierto</option>
            <option value="Privado">Privado</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Estado</label>
          <select 
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
            value={event.status}
            onChange={(e) => setEvent({...event, status: e.target.value})}
          >
            <option value="pending">Pendiente</option>
            <option value="quoted">Cotizado</option>
            <option value="confirmed">Confirmado</option>
            <option value="cancelled">Cancelado</option>
          </select>
        </div>
      </div>
      
      {/* Public Event Fields - Only show if visibility is publico */}
      {isPublic && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-4">
          <h4 className="text-sm font-medium text-emerald-400 flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/></svg>
            Configuración de Evento Público
          </h4>
          
          {/* Event Type: Free or Paid */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Tipo de Acceso</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio"
                  name="event_type"
                  value="gratis"
                  checked={event.event_type === 'gratis'}
                  onChange={(e) => setEvent({...event, event_type: e.target.value})}
                  className="text-emerald-500"
                />
                <span className="text-sm text-gray-300">Gratuito</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio"
                  name="event_type"
                  value="pagado"
                  checked={event.event_type === 'pagado'}
                  onChange={(e) => setEvent({...event, event_type: e.target.value})}
                  className="text-emerald-500"
                />
                <span className="text-sm text-gray-300">Pagado</span>
              </label>
            </div>
          </div>
          
          {/* Flyer Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Flyer del Evento</label>
            <div className="flex items-center gap-4">
              <label className="flex-1">
                <input 
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={handleFlyerUpload}
                  className="hidden"
                />
                <div className="flex items-center gap-2 px-4 py-3 bg-white/5 border border-white/10 border-dashed rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm text-gray-400">
                    {event.flyer_url ? 'Cambiar imagen' : 'Subir flyer (JPG/PNG, max 5MB)'}
                  </span>
                </div>
              </label>
            </div>
            {event.flyer_url && (
              <div className="mt-2 relative">
                <img 
                  src={event.flyer_url} 
                  alt="Flyer preview" 
                  className="w-full h-32 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => setEvent({...event, flyer_url: ''})}
                  className="absolute top-2 right-2 p-1 bg-red-500/80 rounded-full hover:bg-red-500"
                >
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>
          
          {/* External Link for Paid Events */}
          {event.event_type === 'pagado' && (
            <Input 
              label="Link de compra de boletos"
              placeholder="https://..."
              value={event.external_link}
              onChange={(e) => setEvent({...event, external_link: e.target.value})}
            />
          )}
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-4">
        <Input 
          label="Duración"
          value={event.duration}
          onChange={(e) => setEvent({...event, duration: e.target.value})}
          placeholder="Ej: 4 horas"
        />
        <Input 
          label="Presupuesto ($)"
          type="number"
          value={event.budget}
          onChange={(e) => setEvent({...event, budget: e.target.value})}
        />
      </div>
      
      <Input 
        label="Ubicación"
        value={event.location}
        onChange={(e) => setEvent({...event, location: e.target.value})}
      />
      
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Descripción</label>
        <textarea 
          rows={2}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
          value={event.description}
          onChange={(e) => setEvent({...event, description: e.target.value})}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Notas internas</label>
        <textarea 
          rows={2}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
          placeholder="Notas privadas..."
          value={event.notes}
          onChange={(e) => setEvent({...event, notes: e.target.value})}
        />
      </div>
    </form>
  );
};

export default Calendar;
