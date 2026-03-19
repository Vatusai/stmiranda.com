/**
 * Google Calendar Service
 * Integración con Google Calendar API usando Service Account
 * 
 * Architecture:
 * - Uses Google Service Account JSON key for authentication
 * - Operates on a dedicated shared calendar (GOOGLE_CALENDAR_ID)
 * - No OAuth flow required - backend-only authentication
 */
import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from '../utils/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================
// SERVICE ACCOUNT AUTHENTICATION
// ============================================

let authClient = null;
let calendar = null;
let isAuthorized = false;

/**
 * Get the resolved path to the service account key file
 */
const getKeyFilePath = () => {
  const keyPath = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH;
  if (!keyPath) return null;
  
  return path.isAbsolute(keyPath) 
    ? keyPath 
    : path.join(__dirname, '..', '..', keyPath);
};

/**
 * Initialize Google Auth with Service Account
 * Uses GoogleAuth with keyFile for automatic token management
 */
const initializeAuth = async () => {
  if (authClient && isAuthorized) {
    return { auth: authClient, calendar };
  }

  const keyPath = getKeyFilePath();
  const calendarId = process.env.GOOGLE_CALENDAR_ID;

  if (!keyPath) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY_PATH not set');
  }

  if (!calendarId) {
    throw new Error('GOOGLE_CALENDAR_ID not set');
  }

  // Check if key file exists
  if (!fs.existsSync(keyPath)) {
    throw new Error(`Service Account key file not found: ${keyPath}`);
  }

  console.log('[GoogleCalendar] Initializing Service Account...');
  console.log('[GoogleCalendar] Key file:', keyPath);
  console.log('[GoogleCalendar] Calendar ID:', calendarId);

  // Use GoogleAuth with keyFile - handles token refresh automatically
  const auth = new google.auth.GoogleAuth({
    keyFile: keyPath,
    scopes: ['https://www.googleapis.com/auth/calendar'],
  });

  // Get client (this will authorize automatically)
  authClient = await auth.getClient();
  
  // Create Calendar API client
  calendar = google.calendar({ version: 'v3', auth: authClient });
  
  isAuthorized = true;
  
  console.log('[GoogleCalendar] Service Account ready');
  
  return { auth: authClient, calendar };
};

/**
 * Get Calendar API client (ensures auth is initialized)
 */
const getCalendarClient = async () => {
  const { calendar: cal } = await initializeAuth();
  return cal;
};

/**
 * Get configured calendar ID
 */
const getCalendarId = () => {
  return process.env.GOOGLE_CALENDAR_ID;
};

// ============================================
// CONNECTION STATUS
// ============================================

/**
 * Check if Service Account is properly configured and working
 */
export const checkConnection = async () => {
  try {
    const calClient = await getCalendarClient();
    const calendarId = getCalendarId();
    
    // Try to get calendar info to verify access
    const response = await calClient.calendars.get({ calendarId });
    
    return {
      connected: true,
      calendarId: calendarId,
      calendarName: response.data.summary,
      timezone: response.data.timeZone,
      mode: 'service_account',
    };
  } catch (error) {
    console.error('[GoogleCalendar] Connection check failed:', error.message);
    return {
      connected: false,
      calendarId: getCalendarId(),
      error: error.message,
      mode: 'service_account',
    };
  }
};

// ============================================
// EVENT OPERATIONS
// ============================================

/**
 * List events from the configured calendar
 */
export const listEvents = async (options = {}) => {
  const calClient = await getCalendarClient();
  const calendarId = getCalendarId();
  
  const { timeMin, timeMax, maxResults = 100 } = options;
  
  const params = {
    calendarId,
    maxResults,
    singleEvents: true,
    orderBy: 'startTime',
  };
  
  if (timeMin) params.timeMin = new Date(timeMin).toISOString();
  if (timeMax) params.timeMax = new Date(timeMax).toISOString();
  
  const response = await calClient.events.list(params);
  
  return response.data.items.map(event => ({
    googleId: event.id,
    title: event.summary,
    description: event.description,
    location: event.location,
    start: event.start?.dateTime || event.start?.date,
    end: event.end?.dateTime || event.end?.date,
    status: event.status,
    htmlLink: event.htmlLink,
    created: event.created,
    updated: event.updated,
    attendees: event.attendees?.map(a => ({
      email: a.email,
      name: a.displayName,
      response: a.responseStatus,
    })),
  }));
};

/**
 * Create an event in the configured calendar
 */
export const createEvent = async (eventData) => {
  const calClient = await getCalendarClient();
  const calendarId = getCalendarId();
  
  const event = {
    summary: eventData.title,
    description: eventData.description,
    location: eventData.location,
    start: {
      dateTime: new Date(eventData.start).toISOString(),
      timeZone: eventData.timeZone || 'America/Costa_Rica',
    },
    end: {
      dateTime: new Date(eventData.end).toISOString(),
      timeZone: eventData.timeZone || 'America/Costa_Rica',
    },
  };
  
  // Add attendees if provided
  if (eventData.attendees && eventData.attendees.length > 0) {
    event.attendees = eventData.attendees.map(email => ({ email }));
  }
  
  // Add reminders
  event.reminders = {
    useDefault: false,
    overrides: [
      { method: 'email', minutes: 24 * 60 },
      { method: 'popup', minutes: 60 },
    ],
  };
  
  const response = await calClient.events.insert({
    calendarId,
    resource: event,
  });
  
  return {
    googleId: response.data.id,
    htmlLink: response.data.htmlLink,
    created: response.data.created,
  };
};

/**
 * Update an event in the configured calendar
 */
export const updateEvent = async (googleEventId, eventData) => {
  const calClient = await getCalendarClient();
  const calendarId = getCalendarId();
  
  const event = {
    summary: eventData.title,
    description: eventData.description,
    location: eventData.location,
    start: {
      dateTime: new Date(eventData.start).toISOString(),
      timeZone: eventData.timeZone || 'America/Costa_Rica',
    },
    end: {
      dateTime: new Date(eventData.end).toISOString(),
      timeZone: eventData.timeZone || 'America/Costa_Rica',
    },
  };
  
  if (eventData.attendees) {
    event.attendees = eventData.attendees.map(email => ({ email }));
  }
  
  const response = await calClient.events.patch({
    calendarId,
    eventId: googleEventId,
    resource: event,
  });
  
  return {
    googleId: response.data.id,
    updated: response.data.updated,
  };
};

/**
 * Delete an event from the configured calendar
 */
export const deleteEvent = async (googleEventId) => {
  const calClient = await getCalendarClient();
  const calendarId = getCalendarId();
  
  await calClient.events.delete({
    calendarId,
    eventId: googleEventId,
  });
  
  return true;
};

// ============================================
// SYNC OPERATIONS
// ============================================

/**
 * Sync a local event to Google Calendar
 */
export const syncEventToGoogle = async (localEvent) => {
  const startDateTime = new Date(localEvent.date);
  if (localEvent.time) {
    const [hours, minutes] = localEvent.time.split(':').map(Number);
    startDateTime.setHours(hours, minutes);
  }
  
  const endDateTime = new Date(startDateTime);
  const durationHours = parseInt(localEvent.duration) || 2;
  endDateTime.setHours(endDateTime.getHours() + durationHours);
  
  const eventData = {
    title: localEvent.title,
    description: localEvent.description || localEvent.notes,
    location: localEvent.location,
    start: startDateTime.toISOString(),
    end: endDateTime.toISOString(),
    attendees: localEvent.client_email ? [localEvent.client_email] : [],
  };
  
  let result;
  if (localEvent.google_calendar_id) {
    result = await updateEvent(localEvent.google_calendar_id, eventData);
  } else {
    result = await createEvent(eventData);
    
    const stmt = db.prepare(`
      UPDATE events 
      SET google_calendar_id = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run(result.googleId, localEvent.id);
  }
  
  return result;
};

/**
 * Import events from Google Calendar to local system
 */
export const importGoogleEvents = async (options = {}) => {
  const googleEvents = await listEvents(options);
  const imported = [];
  
  for (const gEvent of googleEvents) {
    const existing = db.prepare('SELECT id FROM events WHERE google_calendar_id = ?').get(gEvent.googleId);
    
    if (existing) {
      const stmt = db.prepare(`
        UPDATE events SET
          title = ?,
          date = ?,
          time = ?,
          location = ?,
          description = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE google_calendar_id = ?
      `);
      
      const startDate = new Date(gEvent.start);
      stmt.run(
        gEvent.title,
        startDate.toISOString().split('T')[0],
        startDate.toTimeString().slice(0, 5),
        gEvent.location,
        gEvent.description,
        gEvent.googleId
      );
    } else {
      const stmt = db.prepare(`
        INSERT INTO events (id, title, date, time, location, description, google_calendar_id, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'confirmed', CURRENT_TIMESTAMP)
      `);
      
      const { v4: uuidv4 } = await import('uuid');
      const id = uuidv4();
      const startDate = new Date(gEvent.start);
      stmt.run(
        id,
        gEvent.title,
        startDate.toISOString().split('T')[0],
        startDate.toTimeString().slice(0, 5),
        gEvent.location,
        gEvent.description,
        gEvent.googleId
      );
      
      imported.push({ id, title: gEvent.title });
    }
  }
  
  return { imported: imported.length, total: googleEvents.length };
};

// ============================================
// LEGACY EXPORTS
// ============================================

export const getAuthUrl = () => {
  throw new Error('OAuth not supported. Use Service Account.');
};

export const exchangeCode = async () => {
  throw new Error('OAuth not supported. Use Service Account.');
};

export const saveTokens = () => true;
export const getTokens = () => null;
export const getSelectedCalendar = () => getCalendarId();
export const setSelectedCalendar = () => true;
export const getCalendarIdToUse = () => getCalendarId();
export const removeTokens = () => true;

export const isConnected = async () => {
  const status = await checkConnection();
  return {
    connected: status.connected,
    selectedCalendarId: status.calendarId,
  };
};

export const listCalendars = async () => {
  const status = await checkConnection();
  return [{
    id: status.calendarId,
    name: status.calendarName,
    primary: false,
  }];
};

export const getPrimaryCalendar = async () => {
  const status = await checkConnection();
  return {
    id: status.calendarId,
    name: status.calendarName,
  };
};

export default {
  checkConnection,
  listEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  syncEventToGoogle,
  importGoogleEvents,
  getAuthUrl,
  exchangeCode,
  isConnected,
  listCalendars,
};
