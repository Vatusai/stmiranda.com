/**
 * Contacts Routes
 * Gestión de contactos (Community Layer)
 * Fans, leads, clientes - cualquier persona en el ecosistema
 */
import express from 'express';
import { body, validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import db from '../utils/database.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAdmin);

// GET /api/contacts - Listar contactos
router.get('/', (req, res) => {
  try {
    const { 
      search, 
      relationship_type, 
      wants_concert_updates,
      source,
      limit = 50, 
      offset = 0 
    } = req.query;
    
    let query = 'SELECT * FROM contacts WHERE 1=1';
    const params = [];
    
    if (search) {
      query += ' AND (name LIKE ? OR email LIKE ? OR phone LIKE ? OR city LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }
    
    if (relationship_type && relationship_type !== 'all') {
      query += ' AND relationship_type = ?';
      params.push(relationship_type);
    }
    
    if (wants_concert_updates !== undefined) {
      query += ' AND wants_concert_updates = ?';
      params.push(wants_concert_updates === 'true' ? 1 : 0);
    }
    
    if (source && source !== 'all') {
      query += ' AND source = ?';
      params.push(source);
    }
    
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const contacts = db.prepare(query).all(...params);
    
    // Parse tags JSON
    const parsedContacts = contacts.map(contact => ({
      ...contact,
      tags: contact.tags ? JSON.parse(contact.tags) : [],
      wants_concert_updates: !!contact.wants_concert_updates,
      wants_private_event_info: !!contact.wants_private_event_info
    }));
    
    // Obtener conteos por tipo para estadísticas
    const counts = db.prepare(`
      SELECT 
        relationship_type,
        COUNT(*) as count
      FROM contacts
      GROUP BY relationship_type
    `).all();
    
    res.json({ 
      contacts: parsedContacts, 
      total: contacts.length,
      counts: counts.reduce((acc, c) => {
        acc[c.relationship_type] = c.count;
        return acc;
      }, {})
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// GET /api/contacts/:id - Obtener contacto con sus cotizaciones
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    const contact = db.prepare('SELECT * FROM contacts WHERE id = ?').get(id);
    
    if (!contact) {
      return res.status(404).json({ error: 'Contacto no encontrado' });
    }
    
    // Obtener cotizaciones del contacto
    const inquiries = db.prepare(`
      SELECT * FROM inquiries 
      WHERE contact_id = ? 
      ORDER BY created_at DESC
    `).all(id);
    
    // Obtener eventos del contacto
    const events = db.prepare(`
      SELECT * FROM events 
      WHERE contact_id = ? 
      ORDER BY date DESC
    `).all(id);
    
    res.json({
      contact: {
        ...contact,
        tags: contact.tags ? JSON.parse(contact.tags) : [],
        wants_concert_updates: !!contact.wants_concert_updates,
        wants_private_event_info: !!contact.wants_private_event_info
      },
      inquiries,
      events
    });
  } catch (error) {
    console.error('Get contact error:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// POST /api/contacts - Crear contacto
router.post('/', [
  body('name').notEmpty().trim(),
  body('email').optional().isEmail().normalizeEmail(),
  body('phone').optional().trim(),
  body('relationship_type').optional().isIn(['fan', 'lead', 'client', 'fan_lead', 'alumni'])
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name, email, phone, country, city, 
      relationship_type = 'lead',
      wants_concert_updates = false,
      wants_private_event_info = true,
      source = 'manual',
      source_details,
      notes,
      tags
    } = req.body;
    
    const id = uuidv4();
    
    db.prepare(`
      INSERT INTO contacts (
        id, name, email, phone, country, city,
        relationship_type, wants_concert_updates, wants_private_event_info,
        source, source_details, notes, tags
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, name, email || null, phone || null, country || 'Costa Rica', city || null,
      relationship_type,
      wants_concert_updates ? 1 : 0,
      wants_private_event_info ? 1 : 0,
      source, source_details || null, notes || null,
      tags ? JSON.stringify(tags) : '[]'
    );
    
    const contact = db.prepare('SELECT * FROM contacts WHERE id = ?').get(id);
    
    res.status(201).json({
      success: true,
      contact: {
        ...contact,
        tags: contact.tags ? JSON.parse(contact.tags) : []
      }
    });
  } catch (error) {
    console.error('Create contact error:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// PUT /api/contacts/:id - Actualizar contacto
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const existing = db.prepare('SELECT id FROM contacts WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Contacto no encontrado' });
    }
    
    const allowedFields = [
      'name', 'email', 'phone', 'country', 'city',
      'relationship_type', 'wants_concert_updates', 'wants_private_event_info',
      'source', 'source_details', 'notes', 'tags'
    ];
    
    const setClause = [];
    const values = [];
    
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        setClause.push(`${key} = ?`);
        
        if (key === 'tags' && Array.isArray(value)) {
          values.push(JSON.stringify(value));
        } else if (key === 'wants_concert_updates' || key === 'wants_private_event_info') {
          values.push(value ? 1 : 0);
        } else {
          values.push(value);
        }
      }
    }
    
    if (setClause.length === 0) {
      return res.status(400).json({ error: 'No hay campos válidos para actualizar' });
    }
    
    setClause.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);
    
    db.prepare(`UPDATE contacts SET ${setClause.join(', ')} WHERE id = ?`).run(...values);
    
    const contact = db.prepare('SELECT * FROM contacts WHERE id = ?').get(id);
    
    res.json({
      success: true,
      contact: {
        ...contact,
        tags: contact.tags ? JSON.parse(contact.tags) : []
      }
    });
  } catch (error) {
    console.error('Update contact error:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// DELETE /api/contacts/:id - Eliminar contacto
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    const existing = db.prepare('SELECT id FROM contacts WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Contacto no encontrado' });
    }
    
    // Las cotizaciones y eventos se manejan por ON DELETE CASCADE o SET NULL
    db.prepare('DELETE FROM contacts WHERE id = ?').run(id);
    
    res.json({ success: true, message: 'Contacto eliminado' });
  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// POST /api/contacts/:id/convert - Convertir tipo de relación
router.post('/:id/convert', (req, res) => {
  try {
    const { id } = req.params;
    const { to_type } = req.body;
    
    if (!['fan', 'lead', 'client', 'fan_lead', 'alumni'].includes(to_type)) {
      return res.status(400).json({ error: 'Tipo de relación inválido' });
    }
    
    const existing = db.prepare('SELECT * FROM contacts WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Contacto no encontrado' });
    }
    
    db.prepare(`
      UPDATE contacts 
      SET relationship_type = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).run(to_type, id);
    
    const contact = db.prepare('SELECT * FROM contacts WHERE id = ?').get(id);
    
    res.json({
      success: true,
      message: `Contacto convertido a ${to_type}`,
      contact
    });
  } catch (error) {
    console.error('Convert contact error:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

export default router;
