/**
 * PublicEventsSection
 * Elegant event showcase for the landing page
 * Placed between Hero and Skills sections
 */
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import { translations } from "../translations/translations";
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  ExternalLink, 
  ChevronUp, 
  ChevronDown,
  Ticket,
  Sparkles,
  CheckCircle
} from 'lucide-react';

const PublicEventsSection = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { isAuthenticated, isLoading: isAuthLoading, user } = useAuth();
  const t = translations[language];
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isRegistering, setIsRegistering] = useState(false);
  const [userRegistrations, setUserRegistrations] = useState(new Set());
  const [registrationSuccess, setRegistrationSuccess] = useState(null);
  const carouselRef = useRef(null);

  useEffect(() => {
    fetchEvents();
    
    // Check for registration success from URL params
    const params = new URLSearchParams(window.location.search);
    const registeredEventId = params.get('registered');
    if (registeredEventId) {
      setRegistrationSuccess(registeredEventId);
      // Clear the param
      window.history.replaceState({}, '', window.location.pathname);
      // Clear after 5 seconds
      setTimeout(() => setRegistrationSuccess(null), 5000);
    }
  }, []);
  
  // Fetch user's registrations when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchUserRegistrations();
    }
  }, [isAuthenticated, user]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/events/public?limit=5');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setEvents(data.events || []);
    } catch (err) {
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchUserRegistrations = async () => {
    try {
      const response = await fetch('/api/events/my-registrations', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setUserRegistrations(new Set(data.registrations?.map(r => r.event_id) || []));
      }
    } catch (err) {
      console.error('Error fetching registrations:', err);
    }
  };

  const handleRegister = async (eventId) => {
    // Wait for auth check to complete
    if (isAuthLoading) {
      return;
    }
    
    // If not authenticated, save pending action and redirect to login
    if (!isAuthenticated) {
      localStorage.setItem('pendingEventAction', JSON.stringify({
        eventId,
        action: 'attend',
        timestamp: Date.now()
      }));
      navigate(`/login?eventId=${eventId}`);
      return;
    }
    
    // User is authenticated, proceed with registration
    setIsRegistering(true);
    try {
      const response = await fetch(`/api/events/${eventId}/register`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (response.ok) {
        setUserRegistrations(prev => new Set([...prev, eventId]));
        setRegistrationSuccess(eventId);
        fetchEvents();
        // Clear success message after 5 seconds
        setTimeout(() => setRegistrationSuccess(null), 5000);
      } else if (data.requiresAuth || response.status === 401) {
        // Session expired or not authenticated - redirect to login
        localStorage.setItem('pendingEventAction', JSON.stringify({
          eventId,
          action: 'attend',
          timestamp: Date.now()
        }));
        navigate(`/login?eventId=${eventId}`);
      } else {
        alert(data.error || 'Error');
      }
    } catch (err) {
      console.error(err);
      alert('Error de conexión. Intenta de nuevo.');
    } finally {
      setIsRegistering(false);
    }
  };

  // Parse YYYY-MM-DD strings in local time (not UTC) to prevent day shift
  const parseLocal = (dateStr) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d);
  };

  const formatDate = (dateStr) => {
    return new Intl.DateTimeFormat(language === 'es' ? 'es-ES' : 'en-US', {
      day: 'numeric',
      month: 'short',
    }).format(parseLocal(dateStr));
  };

  const formatFullDate = (dateStr) => {
    return new Intl.DateTimeFormat(language === 'es' ? 'es-ES' : 'en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(parseLocal(dateStr));
  };

  const getDayNumber = (dateStr) => {
    return parseLocal(dateStr).getDate();
  };

  const getMonthShort = (dateStr) => {
    return new Intl.DateTimeFormat(language === 'es' ? 'es-ES' : 'en-US', {
      month: 'short',
    }).format(parseLocal(dateStr)).toUpperCase();
  };

  const scrollToEvent = (index) => {
    if (carouselRef.current) {
      const cardHeight = carouselRef.current.children[0]?.offsetHeight || 400;
      carouselRef.current.scrollTo({
        top: index * cardHeight,
        behavior: 'smooth',
      });
      setActiveIndex(index);
    }
  };

  const handlePrev = () => {
    const newIndex = activeIndex > 0 ? activeIndex - 1 : events.length - 1;
    scrollToEvent(newIndex);
  };

  const handleNext = () => {
    const newIndex = activeIndex < events.length - 1 ? activeIndex + 1 : 0;
    scrollToEvent(newIndex);
  };

  // Auto-advance carousel
  useEffect(() => {
    if (events.length <= 1) return;
    const interval = setInterval(() => {
      handleNext();
    }, 6000);
    return () => clearInterval(interval);
  }, [activeIndex, events.length]);

  if (loading) {
    return (
      <section className="py-16 relative overflow-hidden">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-pulse h-64 bg-white/5 rounded-3xl"></div>
        </div>
      </section>
    );
  }

  if (!events.length) return null;

  const activeEvent = events[activeIndex];
  const isFree = activeEvent?.event_type === 'gratis';

  return (
    <section id="events" className="py-16 lg:py-24 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-background/95 pointer-events-none" />
      
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12" data-aos="fade-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-4">
            <Sparkles size={16} className="text-accent" />
            <span className="text-sm font-medium text-accent uppercase tracking-wider">
              {language === 'es' ? 'Próximas Presentaciones' : 'Upcoming Performances'}
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            {language === 'es' ? 'No Te Lo Pierdas' : 'Don\'t Miss Out'}
          </h2>
          <p className="text-text_secondary max-w-2xl mx-auto text-lg">
            {language === 'es' 
              ? 'Conciertos, eventos privados y experiencias musicales únicas'
              : 'Concerts, private events, and unique musical experiences'}
          </p>
        </div>

        {/* Compact Calendar Bar */}
        <div className="mb-8" data-aos="fade-up" data-aos-delay="100">
          <div className="flex items-center justify-center gap-2 sm:gap-4 flex-wrap">
            {events.map((event, index) => (
              <button
                key={event.id}
                onClick={() => scrollToEvent(index)}
                className={`group relative flex flex-col items-center p-3 sm:p-4 rounded-2xl transition-all duration-300 ${
                  index === activeIndex
                    ? 'bg-accent/20 border-2 border-accent scale-110'
                    : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                <span className={`text-xs font-bold uppercase tracking-wider mb-1 ${
                  index === activeIndex ? 'text-accent' : 'text-text_muted'
                }`}>
                  {getMonthShort(event.date)}
                </span>
                <span className={`text-2xl sm:text-3xl font-bold ${
                  index === activeIndex ? 'text-white' : 'text-text_secondary'
                }`}>
                  {getDayNumber(event.date)}
                </span>
                {index === activeIndex && (
                  <span className="absolute -bottom-1 w-2 h-2 bg-accent rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content: Calendar + Flyer Carousel */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start max-w-6xl mx-auto">
          
          {/* Left: Event Details */}
          <div className="order-2 lg:order-1" data-aos="fade-right" data-aos-delay="200">
            <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10">
              {/* Event Type Badge */}
              <div className="flex items-center gap-3 mb-6">
                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
                  isFree 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}>
                  <Ticket size={16} />
                  {isFree 
                    ? (language === 'es' ? 'Entrada Gratuita' : 'Free Entry')
                    : (language === 'es' ? 'Evento Pagado' : 'Paid Event')
                  }
                </span>
                {activeEvent.attendeeCount > 0 && (
                  <span className="flex items-center gap-1 text-text_muted text-sm">
                    <Users size={14} />
                    {activeEvent.attendeeCount} {language === 'es' ? 'asistentes' : 'attendees'}
                  </span>
                )}
              </div>

              {/* Event Title */}
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4 leading-tight">
                {activeEvent.title}
              </h3>

              {/* Event Meta */}
              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 text-text_secondary">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                    <Calendar size={18} className="text-accent" />
                  </div>
                  <div>
                    <p className="text-white font-medium capitalize">
                      {formatFullDate(activeEvent.date)}
                    </p>
                    {activeEvent.time && (
                      <p className="text-sm flex items-center gap-1">
                        <Clock size={12} />
                        {activeEvent.time}
                      </p>
                    )}
                  </div>
                </div>

                {activeEvent.location && (
                  <div className="flex items-center gap-3 text-text_secondary">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                      <MapPin size={18} className="text-accent" />
                    </div>
                    <p className="text-white">{activeEvent.location}</p>
                  </div>
                )}
              </div>

              {/* Description */}
              {activeEvent.description && (
                <p className="text-text_secondary mb-8 leading-relaxed">
                  {activeEvent.description}
                </p>
              )}

              {/* Success Message */}
              {registrationSuccess === activeEvent.id && (
                <div className="mb-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <div className="flex items-center gap-3">
                    <CheckCircle size={20} className="text-emerald-400" />
                    <p className="text-emerald-400 font-medium">
                      {language === 'es' 
                        ? '¡Registro exitoso! Te esperamos en el evento.' 
                        : 'Successfully registered! See you at the event.'}
                    </p>
                  </div>
                </div>
              )}

              {/* CTA Button */}
              <div className="flex gap-4">
                {!isFree && activeEvent.external_link ? (
                  <a 
                    href={activeEvent.external_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1"
                  >
                    <button className="w-full py-4 px-8 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-2xl hover:shadow-lg hover:shadow-amber-500/25 transition-all duration-300 flex items-center justify-center gap-2">
                      {language === 'es' ? 'Reservar' : 'Book Now'}
                      <ExternalLink size={18} />
                    </button>
                  </a>
                ) : userRegistrations.has(activeEvent.id) ? (
                  // Already registered state
                  <button
                    disabled
                    className="flex-1 py-4 px-8 bg-emerald-500/20 text-emerald-400 font-bold rounded-2xl border border-emerald-500/30 flex items-center justify-center gap-2 cursor-default"
                  >
                    <CheckCircle size={18} />
                    {language === 'es' ? 'Asistencia confirmada' : 'Attendance confirmed'}
                  </button>
                ) : (
                  <button
                    onClick={() => handleRegister(activeEvent.id)}
                    disabled={isRegistering || isAuthLoading}
                    className="flex-1 py-4 px-8 bg-gradient-to-r from-accent to-purple-600 text-white font-bold rounded-2xl hover:shadow-lg hover:shadow-accent/25 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isAuthLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span className="text-sm">Cargando...</span>
                      </>
                    ) : isRegistering ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        {language === 'es' ? 'Registrando...' : 'Registering...'}
                      </>
                    ) : (
                      <>
                        {isFree 
                          ? (language === 'es' ? 'Asistir' : 'Attend')
                          : (language === 'es' ? 'Reservar' : 'Book')
                        }
                        <Sparkles size={18} />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right: Vertical Flyer Carousel */}
          <div className="order-1 lg:order-2 relative" data-aos="fade-left" data-aos-delay="300">
            {/* Carousel Container */}
            <div className="relative h-[500px] sm:h-[600px] overflow-hidden rounded-3xl">
              {/* Gradient overlays for smooth fade */}
              <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-background to-transparent z-10 pointer-events-none" />
              <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none" />

              {/* Scrollable Cards */}
              <div 
                ref={carouselRef}
                className="h-full overflow-y-auto scrollbar-hide snap-y snap-mandatory"
                style={{ scrollSnapType: 'y mandatory' }}
              >
                {events.map((event, index) => (
                  <div
                    key={event.id}
                    className={`h-full snap-center flex items-center justify-center p-4 transition-all duration-500 ${
                      index === activeIndex ? 'opacity-100 scale-100' : 'opacity-40 scale-90'
                    }`}
                    onClick={() => scrollToEvent(index)}
                  >
                    <div className="relative w-full max-w-sm aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl shadow-accent/10 group cursor-pointer">
                      {/* Flyer Image */}
                      {event.flyer_url ? (
                        <img
                          src={event.flyer_url}
                          alt={event.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-accent/20 to-purple-600/20 flex items-center justify-center">
                          <div className="text-center p-8">
                            <Sparkles size={48} className="text-accent mx-auto mb-4" />
                            <p className="text-white font-bold text-xl">{event.title}</p>
                            <p className="text-text_muted mt-2">{formatDate(event.date)}</p>
                          </div>
                        </div>
                      )}

                      {/* Overlay gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                      {/* Bottom info */}
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-2 ${
                          event.event_type === 'gratis'
                            ? 'bg-emerald-500 text-white'
                            : 'bg-amber-500 text-white'
                        }`}>
                          {event.event_type === 'gratis' 
                            ? (language === 'es' ? 'GRATIS' : 'FREE')
                            : (language === 'es' ? 'PAGADO' : 'PAID')
                          }
                        </span>
                        <h4 className="text-white font-bold text-lg line-clamp-2">{event.title}</h4>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Navigation Arrows */}
              <button
                onClick={handlePrev}
                className="absolute top-4 left-1/2 -translate-x-1/2 z-20 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all"
              >
                <ChevronUp size={24} />
              </button>
              <button
                onClick={handleNext}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all"
              >
                <ChevronDown size={24} />
              </button>
            </div>

            {/* Carousel indicators */}
            <div className="flex justify-center gap-2 mt-6">
              {events.map((_, index) => (
                <button
                  key={index}
                  onClick={() => scrollToEvent(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === activeIndex 
                      ? 'w-8 bg-accent' 
                      : 'w-2 bg-white/20 hover:bg-white/40'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CSS for hiding scrollbar */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
};

export default PublicEventsSection;
