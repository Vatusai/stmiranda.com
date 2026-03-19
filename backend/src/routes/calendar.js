/**
 * Google Calendar Routes
 * Endpoints para integración con Google Calendar (Service Account)
 */
import express from 'express';
import { requireAdmin } from '../middleware/auth.js';
import * as googleCalendarService from '../services/googleCalendarService.js';

const router = express.Router();

// All routes require authentication
router.use(requireAdmin);

// ============================================
// CONNECTION STATUS
// ============================================

/**
 * GET /api/calendar/status
 * Check Service Account connection status
 */
router.get('/status', async (req, res) => {
  try {
    const status = await googleCalendarService.checkConnection();
    res.json(status);
  } catch (error) {
    console.error('Error checking calendar status:', error);
    res.status(500).json({ 
      connected: false,
      error: error.message,
      mode: 'service_account',
    });
  }
});

// ============================================
// EVENT OPERATIONS
// ============================================

/**
 * GET /api/calendar/events
 * List events from the configured calendar
 */
router.get('/events', async (req, res) => {
  const { timeMin, timeMax, maxResults } = req.query;
  
  try {
    const events = await googleCalendarService.listEvents({
      timeMin,
      timeMax,
      maxResults: maxResults ? parseInt(maxResults) : 100,
    });
    res.json({ events });
  } catch (error) {
    console.error('Error listing events:', error);
    res.status(500).json({ error: error.message || 'Error listing events' });
  }
});

/**
 * POST /api/calendar/events
 * Create an event in the configured calendar
 */
router.post('/events', async (req, res) => {
  const { title, description, location, start, end, attendees } = req.body;
  
  if (!title || !start || !end) {
    return res.status(400).json({ error: 'Title, start, and end are required' });
  }
  
  try {
    const result = await googleCalendarService.createEvent({
      title,
      description,
      location,
      start,
      end,
      attendees,
    });
    
    res.json({ success: true, event: result });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: error.message || 'Error creating event' });
  }
});

/**
 * PUT /api/calendar/events/:id
 * Update an event in the configured calendar
 */
router.put('/events/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description, location, start, end, attendees } = req.body;
  
  try {
    const result = await googleCalendarService.updateEvent(id, {
      title,
      description,
      location,
      start,
      end,
      attendees,
    });
    
    res.json({ success: true, event: result });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: error.message || 'Error updating event' });
  }
});

/**
 * DELETE /api/calendar/events/:id
 * Delete an event from the configured calendar
 */
router.delete('/events/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    await googleCalendarService.deleteEvent(id);
    res.json({ success: true, message: 'Event deleted' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: error.message || 'Error deleting event' });
  }
});

// ============================================
// SYNC OPERATIONS
// ============================================

/**
 * POST /api/calendar/sync/:eventId
 * Sync a local event to Google Calendar
 */
router.post('/sync/:eventId', async (req, res) => {
  const { eventId } = req.params;
  
  try {
    // Get the local event
    const db = (await import('../utils/database.js')).default;
    const event = db.prepare('SELECT * FROM events WHERE id = ?').get(eventId);
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    const result = await googleCalendarService.syncEventToGoogle(event);
    
    res.json({ 
      success: true, 
      message: 'Event synchronized',
      googleCalendarId: result.googleId,
      link: result.htmlLink,
    });
  } catch (error) {
    console.error('Error syncing event:', error);
    res.status(500).json({ error: error.message || 'Error syncing event' });
  }
});

/**
 * POST /api/calendar/import
 * Import events from Google Calendar
 */
router.post('/import', async (req, res) => {
  const { timeMin, timeMax } = req.body;
  
  try {
    const result = await googleCalendarService.importGoogleEvents({ timeMin, timeMax });
    
    res.json({ 
      success: true, 
      message: `${result.imported} events imported of ${result.total}`,
      ...result,
    });
  } catch (error) {
    console.error('Error importing events:', error);
    res.status(500).json({ error: error.message || 'Error importing events' });
  }
});

// ============================================
// LEGACY ENDPOINTS (for compatibility)
// ============================================

/**
 * GET /api/calendar/auth/url
 * @deprecated Service Account does not use OAuth
 */
router.get('/auth/url', (req, res) => {
  res.status(400).json({ 
    error: 'OAuth not supported',
    message: 'This integration uses Service Account authentication. No OAuth flow required.',
    mode: 'service_account',
  });
});

/**
 * GET /api/calendar/auth/callback
 * @deprecated Service Account does not use OAuth
 */
router.get('/auth/callback', (req, res) => {
  res.status(400).json({ 
    error: 'OAuth not supported',
    message: 'This integration uses Service Account authentication.',
    mode: 'service_account',
  });
});

/**
 * POST /api/calendar/auth/exchange
 * @deprecated Service Account does not use OAuth
 */
router.post('/auth/exchange', (req, res) => {
  res.status(400).json({ 
    error: 'OAuth not supported',
    message: 'This integration uses Service Account authentication.',
    mode: 'service_account',
  });
});

/**
 * POST /api/calendar/disconnect
 * @deprecated Service Account cannot be disconnected
 */
router.post('/disconnect', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Service Account connection cannot be disconnected via API. Remove key file to disable.',
    mode: 'service_account',
  });
});

/**
 * GET /api/calendar/list
 * @deprecated Returns only the configured calendar
 */
router.get('/list', async (req, res) => {
  try {
    const calendars = await googleCalendarService.listCalendars();
    res.json({ 
      calendars,
      selectedCalendarId: calendars[0]?.id,
      mode: 'service_account',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/calendar/select
 * @deprecated Calendar is configured via environment variable
 */
router.post('/select', (req, res) => {
  res.status(400).json({ 
    error: 'Calendar selection not supported',
    message: 'Calendar is configured via GOOGLE_CALENDAR_ID environment variable.',
    mode: 'service_account',
  });
});

export default router;
