/**
 * Clients Routes
 * CRUD completo de clientes
 */
import express from 'express';
import { body, validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import db from '../utils/database.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(requireAuth);

// GET /api/clients - Listar clientes
router.get('/', (req, res) => {
  try {
    const { search, status, limit = 50, offset = 0 } = req.query;
    
    let query = 'SELECT * FROM clients WHERE 1=1';
    const params = [];
    
    if (search) {
      query += ' AND (name LIKE ? OR email LIKE ? OR phone LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    if (status && status !== 'all') {
      query += ' AND status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const clients = db.prepare(query).all(...params);
    
    // Parse tags JSON
    const parsedClients = clients.map(client => ({
      ...client,
      tags: client.tags ? JSON.parse(client.tags) : []
    }));
    
    res.json({ clients: parsedClients, total: clients.length });
  } catch (error) {
    console.error('Get clients error:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// GET /api/clients/:id - Obtener cliente por ID
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(id);
    
    if (!client) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    
    // Obtener eventos del cliente
    const events = db.prepare('SELECT * FROM events WHERE client_id = ? ORDER BY date DESC').all(id);
    
    res.json({
      client: {
        ...client,
        tags: client.tags ? JSON.parse(client.tags) : []
      },
      events
    });
  } catch (error) {
    console.error('Get client error:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// POST /api/clients - Crear cliente
router.post('/', [
  body('name').notEmpty().trim(),
  body('email').optional().isEmail().normalizeEmail(),
  body('phone').optional().trim(),
  body('event_type').optional().trim()
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name, email, phone, country, city, event_type, status, notes, tags
    } = req.body;
    
    const id = uuidv4();
    
    db.prepare(`
      INSERT INTO clients (id, name, email, phone, country, city, event_type, status, notes, tags)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, name, email || null, phone || null, country || 'Costa Rica',
      city || null, event_type || null, status || 'new', notes || null,
      tags ? JSON.stringify(tags) : '[]'
    );
    
    const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(id);
    
    res.status(201).json({
      success: true,
      client: {
        ...client,
        tags: client.tags ? JSON.parse(client.tags) : []
      }
    });
  } catch (error) {
    console.error('Create client error:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// PUT /api/clients/:id - Actualizar cliente
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Verificar que existe
    const existing = db.prepare('SELECT id FROM clients WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    
    // Construir query dinámica
    const allowedFields = ['name', 'email', 'phone', 'country', 'city', 'event_type', 'status', 'notes', 'tags'];
    const setClause = [];
    const values = [];
    
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        setClause.push(`${key} = ?`);
        values.push(key === 'tags' && Array.isArray(value) ? JSON.stringify(value) : value);
      }
    }
    
    if (setClause.length === 0) {
      return res.status(400).json({ error: 'No hay campos válidos para actualizar' });
    }
    
    setClause.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);
    
    db.prepare(`UPDATE clients SET ${setClause.join(', ')} WHERE id = ?`).run(...values);
    
    const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(id);
    
    res.json({
      success: true,
      client: {
        ...client,
        tags: client.tags ? JSON.parse(client.tags) : []
      }
    });
  } catch (error) {
    console.error('Update client error:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// DELETE /api/clients/:id - Eliminar cliente
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    const existing = db.prepare('SELECT id FROM clients WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    
    db.prepare('DELETE FROM clients WHERE id = ?').run(id);
    
    res.json({ success: true, message: 'Cliente eliminado' });
  } catch (error) {
    console.error('Delete client error:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

export default router;
