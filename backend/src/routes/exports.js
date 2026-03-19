/**
 * Exports Routes
 * Exportación de datos por segmentos para marketing
 */
import express from 'express';
import db from '../utils/database.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);

// Helper para convertir a CSV
const toCSV = (data, headers) => {
  const rows = data.map(row => 
    headers.map(h => {
      const value = row[h.key] || '';
      // Escapar comillas y envolver en comillas si tiene comas
      const escaped = String(value).replace(/"/g, '""');
      return escaped.includes(',') ? `"${escaped}"` : escaped;
    }).join(',')
  );
  
  const headerRow = headers.map(h => h.label).join(',');
  return [headerRow, ...rows].join('\n');
};

// GET /api/exports/fans - Exportar lista de fans
router.get('/fans', (req, res) => {
  try {
    const { format = 'csv' } = req.query;
    
    const fans = db.prepare(`
      SELECT 
        name, email, phone, city, country,
        relationship_type, wants_concert_updates,
        wants_private_event_info, source, created_at
      FROM contacts
      WHERE wants_concert_updates = 1
      AND email IS NOT NULL
      ORDER BY created_at DESC
    `).all();
    
    if (format === 'json') {
      return res.json({ fans, count: fans.length });
    }
    
    const csv = toCSV(fans, [
      { key: 'name', label: 'Nombre' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Teléfono' },
      { key: 'city', label: 'Ciudad' },
      { key: 'country', label: 'País' },
      { key: 'relationship_type', label: 'Tipo' },
      { key: 'wants_concert_updates', label: 'Conciertos' },
      { key: 'source', label: 'Origen' },
      { key: 'created_at', label: 'Fecha Registro' }
    ]);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=fans_${new Date().toISOString().split('T')[0]}.csv`);
    res.send(csv);
    
  } catch (error) {
    console.error('Export fans error:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// GET /api/exports/leads - Exportar leads (pipeline)
router.get('/leads', (req, res) => {
  try {
    const { status, format = 'csv' } = req.query;
    
    let query = `
      SELECT 
        c.name, c.email, c.phone, c.city,
        i.event_type, i.event_date, i.location, i.budget,
        i.status as inquiry_status, i.created_at as inquiry_date,
        i.message
      FROM inquiries i
      JOIN contacts c ON i.contact_id = c.id
      WHERE 1=1
    `;
    const params = [];
    
    if (status && status !== 'all') {
      query += ' AND i.status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY i.created_at DESC';
    
    const leads = db.prepare(query).all(...params);
    
    if (format === 'json') {
      return res.json({ leads, count: leads.length });
    }
    
    const csv = toCSV(leads, [
      { key: 'name', label: 'Nombre' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Teléfono' },
      { key: 'city', label: 'Ciudad' },
      { key: 'event_type', label: 'Tipo Evento' },
      { key: 'event_date', label: 'Fecha Evento' },
      { key: 'location', label: 'Ubicación' },
      { key: 'budget', label: 'Presupuesto' },
      { key: 'inquiry_status', label: 'Estado' },
      { key: 'inquiry_date', label: 'Fecha Cotización' }
    ]);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=leads_${new Date().toISOString().split('T')[0]}.csv`);
    res.send(csv);
    
  } catch (error) {
    console.error('Export leads error:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// GET /api/exports/clients - Exportar clientes confirmados
router.get('/clients', (req, res) => {
  try {
    const { format = 'csv' } = req.query;
    
    const clients = db.prepare(`
      SELECT 
        c.name, c.email, c.phone, c.city, c.country,
        COUNT(e.id) as event_count,
        SUM(e.budget) as total_revenue,
        MAX(e.date) as last_event_date,
        c.created_at
      FROM contacts c
      LEFT JOIN events e ON e.contact_id = c.id
      WHERE c.relationship_type IN ('client', 'fan_lead')
      GROUP BY c.id
      ORDER BY total_revenue DESC
    `).all();
    
    if (format === 'json') {
      return res.json({ clients, count: clients.length });
    }
    
    const csv = toCSV(clients, [
      { key: 'name', label: 'Nombre' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Teléfono' },
      { key: 'city', label: 'Ciudad' },
      { key: 'country', label: 'País' },
      { key: 'event_count', label: 'Eventos' },
      { key: 'total_revenue', label: 'Ingresos Totales' },
      { key: 'last_event_date', label: 'Último Evento' }
    ]);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=clientes_${new Date().toISOString().split('T')[0]}.csv`);
    res.send(csv);
    
  } catch (error) {
    console.error('Export clients error:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// GET /api/exports/segment - Exportar segmento personalizado
router.post('/segment', (req, res) => {
  try {
    const { 
      relationship_types = [],
      wants_concert_updates,
      wants_private_event_info,
      city,
      source,
      created_after,
      created_before,
      format = 'csv'
    } = req.body;
    
    let query = `
      SELECT 
        name, email, phone, city, country,
        relationship_type, wants_concert_updates,
        wants_private_event_info, source, created_at
      FROM contacts
      WHERE 1=1
    `;
    const params = [];
    
    if (relationship_types.length > 0) {
      query += ` AND relationship_type IN (${relationship_types.map(() => '?').join(',')})`;
      params.push(...relationship_types);
    }
    
    if (wants_concert_updates !== undefined) {
      query += ' AND wants_concert_updates = ?';
      params.push(wants_concert_updates ? 1 : 0);
    }
    
    if (wants_private_event_info !== undefined) {
      query += ' AND wants_private_event_info = ?';
      params.push(wants_private_event_info ? 1 : 0);
    }
    
    if (city) {
      query += ' AND city LIKE ?';
      params.push(`%${city}%`);
    }
    
    if (source) {
      query += ' AND source = ?';
      params.push(source);
    }
    
    if (created_after) {
      query += ' AND created_at >= ?';
      params.push(created_after);
    }
    
    if (created_before) {
      query += ' AND created_at <= ?';
      params.push(created_before);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const contacts = db.prepare(query).all(...params);
    
    if (format === 'json') {
      return res.json({ contacts, count: contacts.length });
    }
    
    const csv = toCSV(contacts, [
      { key: 'name', label: 'Nombre' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Teléfono' },
      { key: 'city', label: 'Ciudad' },
      { key: 'country', label: 'País' },
      { key: 'relationship_type', label: 'Tipo' },
      { key: 'source', label: 'Origen' },
      { key: 'created_at', label: 'Fecha Registro' }
    ]);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=segmento_${new Date().toISOString().split('T')[0]}.csv`);
    res.send(csv);
    
  } catch (error) {
    console.error('Export segment error:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

export default router;
