/**
 * Leads Routes
 * Gestión de solicitudes/ leads
 */
import express from 'express';
import { body, validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import db from '../utils/database.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// POST /api/leads - Crear lead (público, desde el sitio web)
router.post('/', [
  body('name').notEmpty().trim(),
  body('email').optional().isEmail().normalizeEmail(),
  body('event_type').optional().trim()
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name, email, phone, event_type, event_date, guests,
      budget, message, source
    } = req.body;
    
    const id = uuidv4();
    
    db.prepare(`
      INSERT INTO leads (id, name, email, phone, event_type, event_date, guests, budget, message, source, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, name, email || null, phone || null, event_type || null,
      event_date || null, guests || null, budget || null, message || null,
      source || 'website', 'new'
    );
    
    const lead = db.prepare('SELECT * FROM leads WHERE id = ?').get(id);
    
    // Aquí podrías enviar email de notificación
    
    res.status(201).json({
      success: true,
      message: 'Solicitud recibida. Nos pondremos en contacto pronto.',
      lead
    });
  } catch (error) {
    console.error('Create lead error:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// GET /api/leads - Listar leads (protegido)
router.get('/', requireAuth, (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;
    
    let query = 'SELECT * FROM leads WHERE 1=1';
    const params = [];
    
    if (status && status !== 'all') {
      query += ' AND status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const leads = db.prepare(query).all(...params);
    
    res.json({ leads, total: leads.length });
  } catch (error) {
    console.error('Get leads error:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// GET /api/leads/:id (protegido)
router.get('/:id', requireAuth, (req, res) => {
  try {
    const { id } = req.params;
    
    const lead = db.prepare('SELECT * FROM leads WHERE id = ?').get(id);
    
    if (!lead) {
      return res.status(404).json({ error: 'Lead no encontrado' });
    }
    
    res.json({ lead });
  } catch (error) {
    console.error('Get lead error:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// PUT /api/leads/:id - Actualizar lead (protegido)
router.put('/:id', requireAuth, (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const existing = db.prepare('SELECT id FROM leads WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Lead no encontrado' });
    }
    
    const allowedFields = ['name', 'email', 'phone', 'event_type', 'event_date', 
                          'guests', 'budget', 'message', 'status', 'notes'];
    
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
    
    db.prepare(`UPDATE leads SET ${setClause.join(', ')} WHERE id = ?`).run(...values);
    
    const lead = db.prepare('SELECT * FROM leads WHERE id = ?').get(id);
    
    res.json({ success: true, lead });
  } catch (error) {
    console.error('Update lead error:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// DELETE /api/leads/:id (protegido)
router.delete('/:id', requireAuth, (req, res) => {
  try {
    const { id } = req.params;
    
    const existing = db.prepare('SELECT id FROM leads WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Lead no encontrado' });
    }
    
    db.prepare('DELETE FROM leads WHERE id = ?').run(id);
    
    res.json({ success: true, message: 'Lead eliminado' });
  } catch (error) {
    console.error('Delete lead error:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

export default router;
