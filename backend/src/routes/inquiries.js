/**
 * Inquiries Routes  
 * Pipeline comercial para eventos privados
 * Cotizaciones y solicitudes de booking
 */
import express from 'express';
import { body, validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import db from '../utils/database.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAdmin);

// Estados válidos del pipeline
const VALID_STATUSES = ['nuevo', 'pendiente', 'confirmado', 'cancelado', 'cerrado'];

// GET /api/inquiries - Listar cotizaciones (pipeline view)
router.get('/', (req, res) => {
  try {
    const { 
      status, 
      event_type,
      contact_id,
      start_date,
      end_date,
      assigned_to,
      limit = 50, 
      offset = 0 
    } = req.query;
    
    let query = `
      SELECT 
        i.*,
        c.name as contact_name,
        c.email as contact_email,
        c.phone as contact_phone,
        c.city as contact_city,
        c.relationship_type as contact_type
      FROM inquiries i
      JOIN contacts c ON i.contact_id = c.id
      WHERE 1=1
    `;
    const params = [];
    
    if (status && status !== 'all') {
      query += ' AND i.status = ?';
      params.push(status);
    }
    
    if (event_type && event_type !== 'all') {
      query += ' AND i.event_type = ?';
      params.push(event_type);
    }
    
    if (contact_id) {
      query += ' AND i.contact_id = ?';
      params.push(contact_id);
    }
    
    if (assigned_to) {
      query += ' AND i.assigned_to = ?';
      params.push(assigned_to);
    }
    
    if (start_date) {
      query += ' AND i.event_date >= ?';
      params.push(start_date);
    }
    
    if (end_date) {
      query += ' AND i.event_date <= ?';
      params.push(end_date);
    }
    
    query += ' ORDER BY i.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const inquiries = db.prepare(query).all(...params);
    
    // Obtener estadísticas del pipeline
    const stats = db.prepare(`
      SELECT 
        status,
        COUNT(*) as count,
        SUM(CASE WHEN budget IS NOT NULL THEN 1 ELSE 0 END) as with_budget
      FROM inquiries
      GROUP BY status
    `).all();
    
    res.json({ 
      inquiries, 
      total: inquiries.length,
      stats: stats.reduce((acc, s) => {
        acc[s.status] = {
          count: s.count,
          with_budget: s.with_budget
        };
        return acc;
      }, {})
    });
  } catch (error) {
    console.error('Get inquiries error:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// GET /api/inquiries/:id - Obtener cotización detallada
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    const inquiry = db.prepare(`
      SELECT 
        i.*,
        c.name as contact_name,
        c.email as contact_email,
        c.phone as contact_phone,
        c.city as contact_city,
        c.country as contact_country,
        c.relationship_type as contact_type,
        c.notes as contact_notes
      FROM inquiries i
      JOIN contacts c ON i.contact_id = c.id
      WHERE i.id = ?
    `).get(id);
    
    if (!inquiry) {
      return res.status(404).json({ error: 'Cotización no encontrada' });
    }
    
    // Si está confirmada, obtener datos del evento
    let event = null;
    if (inquiry.event_id) {
      event = db.prepare('SELECT * FROM events WHERE id = ?').get(inquiry.event_id);
    }
    
    res.json({ inquiry, event });
  } catch (error) {
    console.error('Get inquiry error:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// POST /api/inquiries - Crear nueva cotización
router.post('/', [
  body('contact_id').notEmpty(),
  body('event_type').optional().trim(),
  body('status').optional().isIn(VALID_STATUSES)
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      contact_id,
      event_type,
      event_date,
      event_time,
      location,
      guests,
      budget,
      message,
      notes,
      source = 'manual',
      source_details,
      assigned_to
    } = req.body;
    
    // Verificar que el contacto existe
    const contact = db.prepare('SELECT id FROM contacts WHERE id = ?').get(contact_id);
    if (!contact) {
      return res.status(404).json({ error: 'Contacto no encontrado' });
    }
    
    const id = uuidv4();
    
    db.prepare(`
      INSERT INTO inquiries (
        id, contact_id, event_type, event_date, event_time, location,
        guests, budget, message, notes, source, source_details, assigned_to,
        status, first_contact_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'nuevo', CURRENT_TIMESTAMP)
    `).run(
      id, contact_id, event_type || null, event_date || null, event_time || null,
      location || null, guests || null, budget || null, message || null,
      notes || null, source, source_details || null, assigned_to || null
    );
    
    // Actualizar relationship_type del contacto si es necesario
    db.prepare(`
      UPDATE contacts 
      SET relationship_type = CASE 
        WHEN relationship_type = 'fan' THEN 'fan_lead'
        WHEN relationship_type = 'alumni' THEN 'lead'
        ELSE relationship_type
      END,
      updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(contact_id);
    
    const inquiry = db.prepare(`
      SELECT i.*, c.name as contact_name, c.email as contact_email
      FROM inquiries i
      JOIN contacts c ON i.contact_id = c.id
      WHERE i.id = ?
    `).get(id);
    
    res.status(201).json({
      success: true,
      inquiry
    });
  } catch (error) {
    console.error('Create inquiry error:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// PUT /api/inquiries/:id - Actualizar cotización
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const existing = db.prepare('SELECT * FROM inquiries WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Cotización no encontrada' });
    }
    
    const allowedFields = [
      'event_type', 'event_date', 'event_time', 'location', 'guests', 'budget',
      'message', 'notes', 'status', 'assigned_to', 'follow_up_date', 'last_contact_date'
    ];
    
    const setClause = [];
    const values = [];
    
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        setClause.push(`${key} = ?`);
        values.push(value);
      }
    }
    
    if (setClause.length === 0) {
      return res.status(400).json({ error: 'No hay campos válidos para actualizar' });
    }
    
    setClause.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);
    
    db.prepare(`UPDATE inquiries SET ${setClause.join(', ')} WHERE id = ?`).run(...values);
    
    const inquiry = db.prepare(`
      SELECT i.*, c.name as contact_name, c.email as contact_email
      FROM inquiries i
      JOIN contacts c ON i.contact_id = c.id
      WHERE i.id = ?
    `).get(id);
    
    res.json({ success: true, inquiry });
  } catch (error) {
    console.error('Update inquiry error:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// POST /api/inquiries/:id/status - Cambiar estado (acción común)
router.post('/:id/status', [
  body('status').isIn(VALID_STATUSES),
  body('notes').optional().trim()
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { status, notes } = req.body;
    
    const existing = db.prepare('SELECT * FROM inquiries WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Cotización no encontrada' });
    }
    
    const oldStatus = existing.status;
    
    // Actualizar estado
    db.prepare(`
      UPDATE inquiries 
      SET status = ?, notes = COALESCE(?, notes), updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).run(status, notes, id);
    
    // Si se confirma, opcionalmente crear evento
    if (status === 'confirmado' && oldStatus !== 'confirmado') {
      // La creación del evento se hace en paso separado o automáticamente
      // según preferencia de Stephanie
    }
    
    // Actualizar relationship_type del contacto si se confirma
    if (status === 'confirmado') {
      db.prepare(`
        UPDATE contacts 
        SET relationship_type = 'client',
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(existing.contact_id);
    }
    
    const inquiry = db.prepare(`
      SELECT i.*, c.name as contact_name, c.email as contact_email
      FROM inquiries i
      JOIN contacts c ON i.contact_id = c.id
      WHERE i.id = ?
    `).get(id);
    
    res.json({ 
      success: true, 
      message: `Estado actualizado de "${oldStatus}" a "${status}"`,
      inquiry 
    });
  } catch (error) {
    console.error('Update inquiry status error:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// POST /api/inquiries/:id/convert-to-event - Convertir cotización en evento confirmado
router.post('/:id/convert-to-event', (req, res) => {
  try {
    const { id } = req.params;
    const { title, date, time, budget, location, description } = req.body;
    
    const inquiry = db.prepare('SELECT * FROM inquiries WHERE id = ?').get(id);
    if (!inquiry) {
      return res.status(404).json({ error: 'Cotización no encontrada' });
    }
    
    if (inquiry.status !== 'confirmado') {
      return res.status(400).json({ 
        error: 'La cotización debe estar en estado "confirmado" para crear un evento' 
      });
    }
    
    // Crear evento
    const eventId = uuidv4();
    db.prepare(`
      INSERT INTO events (
        id, contact_id, inquiry_id, client_name, title, date, time,
        location, status, budget, description, type
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'confirmed', ?, ?, ?)
    `).run(
      eventId,
      inquiry.contact_id,
      id,
      inquiry.contact_name || '',
      title || inquiry.event_type || 'Evento',
      date || inquiry.event_date,
      time || inquiry.event_time,
      location || inquiry.location,
      budget || inquiry.budget,
      description || inquiry.notes,
      inquiry.event_type
    );
    
    // Actualizar inquiry con referencia al evento
    db.prepare(`
      UPDATE inquiries 
      SET event_id = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).run(eventId, id);
    
    // Actualizar contacto a cliente
    db.prepare(`
      UPDATE contacts 
      SET relationship_type = 'client', updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).run(inquiry.contact_id);
    
    const event = db.prepare('SELECT * FROM events WHERE id = ?').get(eventId);
    
    res.json({
      success: true,
      message: 'Cotización convertida a evento confirmado',
      event
    });
  } catch (error) {
    console.error('Convert to event error:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// DELETE /api/inquiries/:id - Eliminar cotización
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    const existing = db.prepare('SELECT id FROM inquiries WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Cotización no encontrada' });
    }
    
    db.prepare('DELETE FROM inquiries WHERE id = ?').run(id);
    
    res.json({ success: true, message: 'Cotización eliminada' });
  } catch (error) {
    console.error('Delete inquiry error:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

export default router;
