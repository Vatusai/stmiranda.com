/**
 * API Service
 * Cliente HTTP para comunicarse con el backend
 */

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '/api' : 'http://localhost:3001/api');

// Helper para hacer requests
const fetchWithAuth = async (endpoint, options = {}) => {
  const url = `${API_URL}${endpoint}`;
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
  };
  
  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }
  
  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: `Error HTTP ${response.status}` }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }
    
    if (response.status === 204) {
      return null;
    }
    
    return response.json();
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('No se puede conectar al servidor. ¿Está el backend ejecutándose? (npm run server)');
    }
    throw error;
  }
};

// ============================================
// AUTH API
// ============================================
export const authApi = {
  login: (email, password) => 
    fetchWithAuth('/auth/login', {
      method: 'POST',
      body: { email, password }
    }),
  
  register: (name, email, password, phone) =>
    fetchWithAuth('/auth/register', {
      method: 'POST',
      body: { name, email, password, ...(phone ? { phone } : {}) }
    }),
  
  logout: () => 
    fetchWithAuth('/auth/logout', { method: 'POST' }),
  
  getMe: () => 
    fetchWithAuth('/auth/me'),
};

// ============================================
// CONTACTS API (Community Layer)
// ============================================
export const contactsApi = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return fetchWithAuth(`/contacts?${queryString}`);
  },
  
  getById: (id) => 
    fetchWithAuth(`/contacts/${id}`),
  
  create: (data) => 
    fetchWithAuth('/contacts', {
      method: 'POST',
      body: data
    }),
  
  update: (id, data) => 
    fetchWithAuth(`/contacts/${id}`, {
      method: 'PUT',
      body: data
    }),
  
  delete: (id) => 
    fetchWithAuth(`/contacts/${id}`, { method: 'DELETE' }),
  
  convert: (id, toType) => 
    fetchWithAuth(`/contacts/${id}/convert`, {
      method: 'POST',
      body: { to_type: toType }
    }),
};

// ============================================
// INQUIRIES API (Commercial Pipeline)
// ============================================
export const inquiriesApi = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return fetchWithAuth(`/inquiries?${queryString}`);
  },
  
  getById: (id) => 
    fetchWithAuth(`/inquiries/${id}`),
  
  create: (data) => 
    fetchWithAuth('/inquiries', {
      method: 'POST',
      body: data
    }),
  
  update: (id, data) => 
    fetchWithAuth(`/inquiries/${id}`, {
      method: 'PUT',
      body: data
    }),
  
  updateStatus: (id, status, notes) => 
    fetchWithAuth(`/inquiries/${id}/status`, {
      method: 'POST',
      body: { status, notes }
    }),
  
  convertToEvent: (id, data) => 
    fetchWithAuth(`/inquiries/${id}/convert-to-event`, {
      method: 'POST',
      body: data
    }),
  
  delete: (id) => 
    fetchWithAuth(`/inquiries/${id}`, { method: 'DELETE' }),
};

// ============================================
// EVENTS API
// ============================================
export const eventsApi = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return fetchWithAuth(`/events?${queryString}`);
  },
  
  getById: (id) => 
    fetchWithAuth(`/events/${id}`),
  
  create: (data) => 
    fetchWithAuth('/events', {
      method: 'POST',
      body: data
    }),
  
  update: (id, data) => 
    fetchWithAuth(`/events/${id}`, {
      method: 'PUT',
      body: data
    }),
  
  delete: (id) => 
    fetchWithAuth(`/events/${id}`, { method: 'DELETE' }),
  
  // Public events (no auth required)
  getPublic: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return fetch(`${API_URL}/events/public?${queryString}`).then(r => r.json());
  },
  
  getPublicById: (id) => 
    fetch(`${API_URL}/events/${id}/public`).then(r => r.json()),
  
  register: (id) => 
    fetchWithAuth(`/events/${id}/register`, { method: 'POST' }),
  
  getAttendees: (id) =>
    fetchWithAuth(`/events/${id}/attendees`),

  notifyAttendees: (id, message) =>
    fetchWithAuth(`/events/${id}/notify-attendees`, {
      method: 'POST',
      body: { message: message || '' }
    }),
};

// ============================================
// STATS API
// ============================================
export const statsApi = {
  getOverview: () => 
    fetchWithAuth('/stats/overview'),
  
  getDashboard: () =>
    fetchWithAuth('/stats-v2/dashboard'),
  
  getCommunity: () =>
    fetchWithAuth('/stats-v2/community'),
  
  getPipeline: () =>
    fetchWithAuth('/stats-v2/pipeline'),
  
  getRevenue: () =>
    fetchWithAuth('/stats-v2/revenue'),
  
  getEventsByType: () => 
    fetchWithAuth('/stats/events-by-type'),
  
  getLeadsByStatus: () => 
    fetchWithAuth('/stats/leads-by-status'),
  
  getRevenueByMonth: () => 
    fetchWithAuth('/stats/revenue-by-month'),
  
  getUpcomingEvents: (limit = 5) => 
    fetchWithAuth(`/stats/upcoming-events?limit=${limit}`),
  
  getRecentLeads: (limit = 5) => 
    fetchWithAuth(`/stats/recent-leads?limit=${limit}`),
};

// ============================================
// EMAILS API
// ============================================
export const emailsApi = {
  verify: () =>
    fetchWithAuth('/emails/verify'),
  
  getStats: () =>
    fetchWithAuth('/emails/stats'),
  
  sendNewsletter: (data) =>
    fetchWithAuth('/emails/newsletter', {
      method: 'POST',
      body: data
    }),
  
  sendInquiryFollowUp: (id, message) =>
    fetchWithAuth(`/emails/inquiry-followup/${id}`, {
      method: 'POST',
      body: { customMessage: message }
    }),
  
  sendEventConfirmation: (id) =>
    fetchWithAuth(`/emails/event-confirmation/${id}`, {
      method: 'POST'
    }),
  
  getCampaigns: () =>
    fetchWithAuth('/emails/campaigns'),
  
  getLogs: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return fetchWithAuth(`/emails/logs?${queryString}`);
  }
};

// ============================================
// EXPORTS API
// ============================================
export const exportsApi = {
  getFans: () =>
    fetchWithAuth('/exports/fans'),
  
  getLeads: (status) =>
    fetchWithAuth(`/exports/leads${status ? `?status=${status}` : ''}`),
  
  getClients: () =>
    fetchWithAuth('/exports/clients'),
  
  getSegment: (filters) =>
    fetchWithAuth('/exports/segment', {
      method: 'POST',
      body: filters
    })
};

// ============================================
// GOOGLE CALENDAR API
// ============================================
export const calendarApi = {
  // Auth
  getAuthUrl: () => 
    fetchWithAuth('/calendar/auth/url'),
  
  exchangeCode: (code) => 
    fetchWithAuth('/calendar/auth/exchange', {
      method: 'POST',
      body: { code }
    }),
  
  getStatus: () => 
    fetchWithAuth('/calendar/status'),
  
  disconnect: () => 
    fetchWithAuth('/calendar/disconnect', { method: 'POST' }),
  
  // Calendars
  listCalendars: () => 
    fetchWithAuth('/calendar/list'),
  
  selectCalendar: (calendarId) => 
    fetchWithAuth('/calendar/select', {
      method: 'POST',
      body: { calendarId }
    }),
  
  // Events
  listEvents: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return fetchWithAuth(`/calendar/events?${queryString}`);
  },
  
  createEvent: (data) => 
    fetchWithAuth('/calendar/events', {
      method: 'POST',
      body: data
    }),
  
  updateEvent: (id, data) => 
    fetchWithAuth(`/calendar/events/${id}`, {
      method: 'PUT',
      body: data
    }),
  
  deleteEvent: (id, calendarId) => 
    fetchWithAuth(`/calendar/events/${id}?calendarId=${calendarId || ''}`, { 
      method: 'DELETE' 
    }),
  
  // Sync
  syncEvent: (eventId) => 
    fetchWithAuth(`/calendar/sync/${eventId}`, { method: 'POST' }),
  
  importEvents: (filters) => 
    fetchWithAuth('/calendar/import', {
      method: 'POST',
      body: filters
    }),
};

// ============================================
// LEGACY API (for backwards compatibility)
// ============================================
export const clientsApi = contactsApi;  // Alias
export const leadsApi = inquiriesApi;   // Alias

export default {
  auth: authApi,
  contacts: contactsApi,
  inquiries: inquiriesApi,
  events: eventsApi,
  stats: statsApi,
  emails: emailsApi,
  exports: exportsApi,
  calendar: calendarApi,
  // Legacy aliases
  clients: contactsApi,
  leads: inquiriesApi,
};
