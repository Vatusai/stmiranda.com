/**
 * Events Routes
 * CRUD completo de eventos - Updated for Schema V2 + Public Events
 */
import express from 'express';
import { body, validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import db from '../utils/database.js';
import { requireAuth, requireAdmin, optionalAuth } from '../middleware/auth.js';
import * as googleCalendarService from '../services/googleCalendarService.js';
import { sendEmail } from '../services/emailService.js';

const router = express.Router();

// ============================================
// PUBLIC ENDPOINTS (no auth required)
// ============================================

// GET /api/events/public - Get public upcoming events
router.get('/public', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    // Get upcoming public events
    const events = db.prepare(`
      SELECT * FROM events 
      WHERE visibility = 'publico'
      AND date >= date('now')
      AND status != 'cancelled'
      ORDER BY date ASC 
      LIMIT ?
    `).all(parseInt(limit));
    
    // Get attendee counts for each event
    const eventsWithCounts = events.map(event => {
      const attendeeCount = db.prepare(
        'SELECT COUNT(*) as count FROM event_attendees WHERE event_id = ?'
      ).get(event.id);
      
      return {
        ...event,
        services: event.services ? JSON.parse(event.services) : [],
        attendeeCount: attendeeCount.count,
      };
    });
    
    res.json({ events: eventsWithCounts });
  } catch (error) {
    console.error('Get public events error:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// GET /api/events/:id/public - Get public event details
router.get('/:id/public', (req, res) => {
  try {
    const { id } = req.params;
    
    const event = db.prepare(
      'SELECT * FROM events WHERE id = ? AND visibility = ?'
    ).get(id, 'publico');
    
    if (!event) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }
    
    // Get attendee count
    const attendeeCount = db.prepare(
      'SELECT COUNT(*) as count FROM event_attendees WHERE event_id = ?'
    ).get(id);
    
    res.json({
      event: {
        ...event,
        services: event.services ? JSON.parse(event.services) : [],
        attendeeCount: attendeeCount.count,
      }
    });
  } catch (error) {
    console.error('Get public event error:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// POST /api/events/:id/register - Register for event (public)
router.post('/:id/register', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    // Check if event exists and is public
    const event = db.prepare(
      'SELECT * FROM events WHERE id = ? AND visibility = ? AND status = ?'
    ).get(id, 'publico', 'confirmed');
    
    if (!event) {
      return res.status(404).json({ error: 'Evento no encontrado o no disponible' });
    }
    
    // If user is not logged in, return info needed for registration
    if (!userId) {
      return res.status(401).json({ 
        error: 'Se requiere iniciar sesión para registrarse',
        requiresAuth: true,
      });
    }
    
    // Check if already registered
    const existing = db.prepare(
      'SELECT * FROM event_attendees WHERE event_id = ? AND user_id = ?'
    ).get(id, userId);
    
    if (existing) {
      return res.status(400).json({ error: 'Ya estás registrado para este evento' });
    }
    
    // Register attendee
    const attendeeId = uuidv4();
    db.prepare(`
      INSERT INTO event_attendees (id, user_id, event_id, status, registered_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).run(attendeeId, userId, id, 'attending');
    
    // Schedule notifications
    scheduleEventNotifications(attendeeId, id, event.date);
    
    res.json({ 
      success: true, 
      message: 'Registro exitoso',
      attendeeId,
    });
  } catch (error) {
    console.error('Register for event error:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// ============================================
// PROTECTED ENDPOINTS (auth required)
// ============================================

// /my-registrations is accessible to any authenticated user (fans included)
router.get('/my-registrations', requireAuth, (req, res) => {
  try {
    const userId = req.user.userId;
    
    const registrations = db.prepare(`
      SELECT ea.*, e.title as event_title, e.date as event_date, 
             e.time as event_time, e.location as event_location
      FROM event_attendees ea
      JOIN events e ON ea.event_id = e.id
      WHERE ea.user_id = ?
      ORDER BY e.date ASC
    `).all(userId);
    
    res.json({ registrations });
  } catch (error) {
    console.error('Get user registrations error:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// All remaining event routes require admin
router.use(requireAdmin);

// GET /api/events - Listar eventos
router.get('/', (req, res) => {
  try {
    const { 
      status, 
      contact_id, 
      inquiry_id,
      visibility,
      start_date, 
      end_date,
      limit = 100, 
      offset = 0 
    } = req.query;
    
    let query = 'SELECT * FROM events WHERE 1=1';
    const params = [];
    
    if (status && status !== 'all') {
      query += ' AND status = ?';
      params.push(status);
    }
    
    if (visibility) {
      query += ' AND visibility = ?';
      params.push(visibility);
    }
    
    if (contact_id) {
      query += ' AND contact_id = ?';
      params.push(contact_id);
    }
    
    if (inquiry_id) {
      query += ' AND inquiry_id = ?';
      params.push(inquiry_id);
    }
    
    if (start_date) {
      query += ' AND date >= ?';
      params.push(start_date);
    }
    
    if (end_date) {
      query += ' AND date <= ?';
      params.push(end_date);
    }
    
    query += ' ORDER BY date ASC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const events = db.prepare(query).all(...params);
    
    // Parse services JSON
    const parsedEvents = events.map(event => ({
      ...event,
      services: event.services ? JSON.parse(event.services) : []
    }));
    
    res.json({ events: parsedEvents, total: events.length });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// GET /api/events/:id - Obtener evento
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    const event = db.prepare('SELECT * FROM events WHERE id = ?').get(id);
    
    if (!event) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }
    
    // Get attendee count if public
    let attendeeCount = 0;
    if (event.visibility === 'publico') {
      const count = db.prepare(
        'SELECT COUNT(*) as count FROM event_attendees WHERE event_id = ?'
      ).get(id);
      attendeeCount = count.count;
    }
    
    res.json({
      event: {
        ...event,
        services: event.services ? JSON.parse(event.services) : [],
        attendeeCount,
      }
    });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// POST /api/events - Crear evento
router.post('/', [
  body('title').notEmpty().trim(),
  body('date').isDate(),
  body('status').optional().isIn(['pending', 'quoted', 'confirmed', 'cancelled', 'completed']),
  body('visibility').optional().isIn(['privado', 'publico']),
  body('event_type').optional().isIn(['gratis', 'pagado']),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title, contact_id, inquiry_id, client_name, date, time, duration, type,
      location, status, budget, description, services, notes,
      visibility, event_type, flyer_url, external_link
    } = req.body;
    
    const id = uuidv4();
    
    db.prepare(`
      INSERT INTO events (
        id, title, contact_id, inquiry_id, client_name, date, time, duration, 
        type, location, status, budget, description, services, notes,
        visibility, event_type, flyer_url, external_link
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, title, contact_id || null, inquiry_id || null, client_name || null, 
      date, time || null, duration || null, type || null, location || null, 
      status || 'pending', budget || null, description || null, 
      services ? JSON.stringify(services) : '[]', notes || null,
      visibility || 'privado', event_type || null, flyer_url || null, 
      external_link || null
    );
    
    let event = db.prepare('SELECT * FROM events WHERE id = ?').get(id);
    
    // Sync to Google Calendar if status is confirmed
    let googleSyncResult = null;
    if (status === 'confirmed') {
      try {
        googleSyncResult = await googleCalendarService.syncEventToGoogle(event);
        event = db.prepare('SELECT * FROM events WHERE id = ?').get(id);
      } catch (syncError) {
        console.error('Google Calendar sync error:', syncError.message);
        googleSyncResult = { error: syncError.message };
      }
    }
    
    res.status(201).json({
      success: true,
      event: {
        ...event,
        services: event.services ? JSON.parse(event.services) : []
      },
      googleSync: googleSyncResult,
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ error: 'Error del servidor: ' + error.message });
  }
});

// PUT /api/events/:id - Actualizar evento
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const existing = db.prepare('SELECT * FROM events WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }
    
    const allowedFields = [
      'title', 'contact_id', 'inquiry_id', 'client_name', 'date', 'time', 'duration',
      'type', 'location', 'status', 'budget', 'description', 'services', 'notes', 
      'google_calendar_id', 'visibility', 'event_type', 'flyer_url', 'external_link'
    ];
    
    const setClause = [];
    const values = [];
    
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        setClause.push(`${key} = ?`);
        values.push(key === 'services' && Array.isArray(value) ? JSON.stringify(value) : value);
      }
    }
    
    if (setClause.length === 0) {
      return res.status(400).json({ error: 'No hay campos válidos para actualizar' });
    }
    
    setClause.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);
    
    db.prepare(`UPDATE events SET ${setClause.join(', ')} WHERE id = ?`).run(...values);
    
    let event = db.prepare('SELECT * FROM events WHERE id = ?').get(id);
    
    // Sync to Google Calendar if status is confirmed
    let googleSyncResult = null;
    if (event.status === 'confirmed') {
      try {
        googleSyncResult = await googleCalendarService.syncEventToGoogle(event);
        event = db.prepare('SELECT * FROM events WHERE id = ?').get(id);
      } catch (syncError) {
        console.error('Google Calendar sync error:', syncError.message);
        googleSyncResult = { error: syncError.message };
      }
    }
    
    res.json({
      success: true,
      event: {
        ...event,
        services: event.services ? JSON.parse(event.services) : []
      },
      googleSync: googleSyncResult,
    });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// DELETE /api/events/:id - Eliminar evento
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    const existing = db.prepare('SELECT * FROM events WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }
    
    db.prepare('DELETE FROM events WHERE id = ?').run(id);
    
    res.json({ success: true, message: 'Evento eliminado' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// GET /api/events/:id/attendees - Get attendees (admin only)
router.get('/:id/attendees', (req, res) => {
  try {
    const { id } = req.params;
    
    const attendees = db.prepare(`
      SELECT ea.*, u.name, u.email 
      FROM event_attendees ea
      LEFT JOIN users u ON ea.user_id = u.id
      WHERE ea.event_id = ?
      ORDER BY ea.registered_at DESC
    `).all(id);
    
    res.json({ attendees });
  } catch (error) {
    console.error('Get attendees error:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// POST /api/events/:id/notify-attendees - Send reminder to all registered fans
router.post('/:id/notify-attendees', async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    const event = db.prepare('SELECT * FROM events WHERE id = ?').get(id);
    if (!event) return res.status(404).json({ error: 'Evento no encontrado' });

    const attendees = db.prepare(`
      SELECT ea.id as attendee_id, u.name, u.email
      FROM event_attendees ea
      LEFT JOIN users u ON ea.user_id = u.id
      WHERE ea.event_id = ? AND u.email IS NOT NULL
    `).all(id);

    if (attendees.length === 0) {
      return res.json({ success: true, sent: 0, message: 'No hay asistentes registrados' });
    }

    let sent = 0;
    for (const attendee of attendees) {
      try {
        await sendEmail({
          to: attendee.email,
          subject: `Recordatorio: ${event.title}`,
          html: `
            <div style="font-family:sans-serif;max-width:520px;margin:0 auto">
              <h2 style="color:#7c3aed">¡Hola ${attendee.name}!</h2>
              <p>Te recordamos que tienes un evento próximamente:</p>
              <h3 style="color:#1a1a2e">${event.title}</h3>
              <p><strong>Fecha:</strong> ${event.date}</p>
              ${event.time ? `<p><strong>Hora:</strong> ${event.time}</p>` : ''}
              ${event.location ? `<p><strong>Lugar:</strong> ${event.location}</p>` : ''}
              ${message ? `<p style="margin-top:12px">${message}</p>` : ''}
              <p style="margin-top:20px">¡Te esperamos! 🎶</p>
              <p>— Stephanie Miranda</p>
            </div>
          `
        });
        sent++;
      } catch (err) {
        console.error(`Failed to notify ${attendee.email}:`, err.message);
      }
    }

    res.json({ success: true, sent, total: attendees.length });
  } catch (error) {
    console.error('Notify attendees error:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Schedule notification reminders for event attendees
 */
function scheduleEventNotifications(attendeeId, eventId, eventDate) {
  try {
    const eventDateTime = new Date(eventDate);
    
    // Notification 1: 1 day before
    const oneDayBefore = new Date(eventDateTime);
    oneDayBefore.setDate(oneDayBefore.getDate() - 1);
    oneDayBefore.setHours(10, 0, 0, 0); // 10 AM
    
    // Notification 2: Same day (2 hours before)
    const sameDay = new Date(eventDateTime);
    sameDay.setHours(sameDay.getHours() - 2);
    
    const notifications = [
      { id: uuidv4(), type: 'reminder_1day', scheduled: oneDayBefore },
      { id: uuidv4(), type: 'reminder_same_day', scheduled: sameDay },
    ];
    
    // Only schedule if dates are in the future
    const now = new Date();
    
    for (const notif of notifications) {
      if (notif.scheduled > now) {
        db.prepare(`
          INSERT INTO event_notifications (id, attendee_id, event_id, type, scheduled_at, status)
          VALUES (?, ?, ?, ?, ?, 'pending')
        `).run(notif.id, attendeeId, eventId, notif.type, notif.scheduled.toISOString());
      }
    }
    
    console.log(`[Notifications] Scheduled for attendee ${attendeeId}`);
  } catch (error) {
    console.error('[Notifications] Scheduling error:', error);
  }
}

export default router;
