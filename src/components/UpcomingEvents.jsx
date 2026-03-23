/**
 * UpcomingEvents Component
 * Displays upcoming public events for the frontend
 */
import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, Users, ExternalLink, ChevronRight } from 'lucide-react';
import Button from './ui/Button';

const UpcomingEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/events/public?limit=6');
      if (!response.ok) throw new Error('Failed to fetch events');
      const data = await response.json();
      setEvents(data.events || []);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('No se pudieron cargar los eventos');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (eventId) => {
    // Check if user is logged in (token exists)
    const token = localStorage.getItem('token');
    
    if (!token) {
      // Redirect to login or show login modal
      window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
      return;
    }

    try {
      const response = await fetch(`/api/events/${eventId}/register`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        alert('¡Registro exitoso! Te enviaremos recordatorios del evento.');
        fetchEvents(); // Refresh to update attendee count
      } else if (data.requiresAuth) {
        window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
      } else {
        alert(data.error || 'Error al registrarse');
      }
    } catch (err) {
      console.error('Registration error:', err);
      alert('Error al registrarse. Intenta de nuevo.');
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }).format(date);
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    return `${hours}:${minutes}`;
  };

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-red-600">{error}</p>
        </div>
      </section>
    );
  }

  if (events.length === 0) {
    return null; // Don't show section if no events
  }

  return (
    <section className="py-16 sm:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Próximos Eventos
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            No te pierdas nuestras presentaciones y eventos especiales. 
            Reserva tu lugar y vive una experiencia musical única.
          </p>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event) => (
            <EventCard 
              key={event.id} 
              event={event} 
              onRegister={() => handleRegister(event.id)}
              formatDate={formatDate}
              formatTime={formatTime}
            />
          ))}
        </div>

        {/* View All Link */}
        <div className="text-center mt-12">
          <a 
            href="/eventos" 
            className="inline-flex items-center gap-2 text-violet-600 font-semibold hover:text-violet-700 transition-colors"
          >
            Ver todos los eventos
            <ChevronRight size={20} />
          </a>
        </div>
      </div>
    </section>
  );
};

// Individual Event Card Component
const EventCard = ({ event, onRegister, formatDate, formatTime }) => {
  const isFree = event.event_type === 'gratis';
  const ctaText = isFree ? 'Asistir' : 'Reservar';
  
  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300">
      {/* Flyer Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-200">
        {event.flyer_url ? (
          <img 
            src={event.flyer_url} 
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <Calendar size={48} className="text-white/50" />
          </div>
        )}
        
        {/* Event Type Badge */}
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
            isFree 
              ? 'bg-emerald-500 text-white' 
              : 'bg-amber-500 text-white'
          }`}>
            {isFree ? 'Gratuito' : 'Pagado'}
          </span>
        </div>

        {/* Attendees Count */}
        {event.attendeeCount > 0 && (
          <div className="absolute top-4 right-4">
            <div className="flex items-center gap-1 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm">
              <Users size={14} />
              <span>{event.attendeeCount}</span>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Date */}
        <div className="flex items-center gap-2 text-violet-600 font-medium mb-2">
          <Calendar size={16} />
          <span className="capitalize">{formatDate(event.date)}</span>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
          {event.title}
        </h3>

        {/* Details */}
        <div className="space-y-2 mb-6">
          {event.time && (
            <div className="flex items-center gap-2 text-gray-600 text-sm">
              <Clock size={16} />
              <span>{formatTime(event.time)}</span>
            </div>
          )}
          {event.location && (
            <div className="flex items-center gap-2 text-gray-600 text-sm">
              <MapPin size={16} />
              <span className="line-clamp-1">{event.location}</span>
            </div>
          )}
        </div>

        {/* CTA Button */}
        <div className="flex gap-3">
          {!isFree && event.external_link ? (
            <a 
              href={event.external_link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1"
            >
              <Button 
                variant="accent" 
                fullWidth
                rightIcon={<ExternalLink size={16} />}
              >
                {ctaText}
              </Button>
            </a>
          ) : (
            <Button 
              variant={isFree ? 'primary' : 'accent'}
              fullWidth
              onClick={onRegister}
            >
              {ctaText}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpcomingEvents;
