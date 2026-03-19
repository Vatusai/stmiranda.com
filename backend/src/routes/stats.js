/**
 * Stats Routes
 * Estadísticas y métricas del negocio
 */
import express from 'express';
import db from '../utils/database.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAdmin);

// GET /api/stats/overview - Resumen general
router.get('/overview', (req, res) => {
  try {
    // Total de clientes
    const totalClients = db.prepare('SELECT COUNT(*) as count FROM clients').get();
    
    // Clientes nuevos este mes
    const newClientsThisMonth = db.prepare(`
      SELECT COUNT(*) as count FROM clients 
      WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')
    `).get();
    
    // Total de eventos
    const totalEvents = db.prepare('SELECT COUNT(*) as count FROM events').get();
    
    // Eventos confirmados
    const confirmedEvents = db.prepare(`
      SELECT COUNT(*) as count FROM events WHERE status = 'confirmed'
    `).get();
    
    // Eventos próximos
    const upcomingEvents = db.prepare(`
      SELECT COUNT(*) as count FROM events 
      WHERE date >= date('now') AND status = 'confirmed'
    `).get();
    
    // Total de leads
    const totalLeads = db.prepare('SELECT COUNT(*) as count FROM leads').get();
    
    // Nuevos leads esta semana
    const newLeadsThisWeek = db.prepare(`
      SELECT COUNT(*) as count FROM leads 
      WHERE created_at >= date('now', '-7 days')
    `).get();
    
    // Ingresos totales estimados (de eventos confirmados)
    const totalRevenue = db.prepare(`
      SELECT COALESCE(SUM(budget), 0) as total FROM events WHERE status = 'confirmed'
    `).get();
    
    // Ingresos este mes
    const monthlyRevenue = db.prepare(`
      SELECT COALESCE(SUM(budget), 0) as total FROM events 
      WHERE status = 'confirmed' AND strftime('%Y-%m', date) = strftime('%Y-%m', 'now')
    `).get();
    
    res.json({
      clients: {
        total: totalClients.count,
        newThisMonth: newClientsThisMonth.count
      },
      events: {
        total: totalEvents.count,
        confirmed: confirmedEvents.count,
        upcoming: upcomingEvents.count
      },
      leads: {
        total: totalLeads.count,
        newThisWeek: newLeadsThisWeek.count
      },
      revenue: {
        total: totalRevenue.total,
        thisMonth: monthlyRevenue.total
      }
    });
  } catch (error) {
    console.error('Get overview stats error:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// GET /api/stats/events-by-type
router.get('/events-by-type', (req, res) => {
  try {
    const stats = db.prepare(`
      SELECT type, COUNT(*) as count 
      FROM events 
      WHERE type IS NOT NULL 
      GROUP BY type
    `).all();
    
    const total = stats.reduce((sum, s) => sum + s.count, 0);
    
    const result = stats.map(s => ({
      type: s.type,
      count: s.count,
      percentage: total > 0 ? Math.round((s.count / total) * 100) : 0
    }));
    
    res.json({ stats: result, total });
  } catch (error) {
    console.error('Get events by type error:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// GET /api/stats/leads-by-status
router.get('/leads-by-status', (req, res) => {
  try {
    const stats = db.prepare(`
      SELECT status, COUNT(*) as count 
      FROM leads 
      GROUP BY status
    `).all();
    
    res.json({ stats });
  } catch (error) {
    console.error('Get leads by status error:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// GET /api/stats/revenue-by-month
router.get('/revenue-by-month', (req, res) => {
  try {
    const stats = db.prepare(`
      SELECT 
        strftime('%Y-%m', date) as month,
        COALESCE(SUM(budget), 0) as revenue,
        COUNT(*) as eventCount
      FROM events 
      WHERE status = 'confirmed' AND date >= date('now', '-12 months')
      GROUP BY month
      ORDER BY month ASC
    `).all();
    
    res.json({ stats });
  } catch (error) {
    console.error('Get revenue by month error:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// GET /api/stats/upcoming-events
router.get('/upcoming-events', (req, res) => {
  try {
    const { limit = 5 } = req.query;
    
    const events = db.prepare(`
      SELECT e.*, c.email as client_email, c.phone as client_phone
      FROM events e
      LEFT JOIN clients c ON e.client_id = c.id
      WHERE e.date >= date('now') AND e.status = 'confirmed'
      ORDER BY e.date ASC
      LIMIT ?
    `).all(parseInt(limit));
    
    const parsedEvents = events.map(event => ({
      ...event,
      services: event.services ? JSON.parse(event.services) : []
    }));
    
    res.json({ events: parsedEvents });
  } catch (error) {
    console.error('Get upcoming events error:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// GET /api/stats/recent-leads
router.get('/recent-leads', (req, res) => {
  try {
    const { limit = 5 } = req.query;
    
    const leads = db.prepare(`
      SELECT * FROM leads
      ORDER BY created_at DESC
      LIMIT ?
    `).all(parseInt(limit));
    
    res.json({ leads });
  } catch (error) {
    console.error('Get recent leads error:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

export default router;
