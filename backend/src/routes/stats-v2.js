/**
 * Stats V2 Routes
 * Estadísticas separadas: Comunidad vs Pipeline Comercial
 */
import express from 'express';
import db from '../utils/database.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAdmin);

// ============================================
// COMMUNITY STATS (Fans y Contactos)
// ============================================

// GET /api/stats/community - Estadísticas de comunidad
router.get('/community', (req, res) => {
  try {
    // Total de contactos
    const totalContacts = db.prepare('SELECT COUNT(*) as count FROM contacts').get();
    
    // Por tipo de relación
    const byRelationship = db.prepare(`
      SELECT relationship_type, COUNT(*) as count
      FROM contacts
      GROUP BY relationship_type
    `).all();
    
    // Fans que quieren updates de conciertos
    const concertFans = db.prepare(`
      SELECT COUNT(*) as count FROM contacts WHERE wants_concert_updates = 1
    `).get();
    
    // Interesados en eventos privados
    const privateEventInterest = db.prepare(`
      SELECT COUNT(*) as count FROM contacts WHERE wants_private_event_info = 1
    `).get();
    
    // Por fuente
    const bySource = db.prepare(`
      SELECT source, COUNT(*) as count
      FROM contacts
      GROUP BY source
      ORDER BY count DESC
    `).all();
    
    // Por ciudad (top 10)
    const byCity = db.prepare(`
      SELECT city, COUNT(*) as count
      FROM contacts
      WHERE city IS NOT NULL AND city != ''
      GROUP BY city
      ORDER BY count DESC
      LIMIT 10
    `).all();
    
    // Crecimiento mensual
    const monthlyGrowth = db.prepare(`
      SELECT 
        strftime('%Y-%m', created_at) as month,
        COUNT(*) as new_contacts,
        SUM(CASE WHEN wants_concert_updates = 1 THEN 1 ELSE 0 END) as new_fans
      FROM contacts
      GROUP BY month
      ORDER BY month DESC
      LIMIT 12
    `).all();
    
    res.json({
      overview: {
        total: totalContacts.count,
        concertFans: concertFans.count,
        privateEventInterest: privateEventInterest.count
      },
      byRelationship: byRelationship.reduce((acc, r) => {
        acc[r.relationship_type] = r.count;
        return acc;
      }, {}),
      bySource,
      byCity,
      monthlyGrowth
    });
  } catch (error) {
    console.error('Community stats error:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// ============================================
// PIPELINE STATS (Cotizaciones y Ventas)
// ============================================

// GET /api/stats/pipeline - Estadísticas de pipeline comercial
router.get('/pipeline', (req, res) => {
  try {
    // Total de cotizaciones
    const totalInquiries = db.prepare('SELECT COUNT(*) as count FROM inquiries').get();
    
    // Por estado
    const byStatus = db.prepare(`
      SELECT status, COUNT(*) as count,
      SUM(CASE WHEN budget IS NOT NULL THEN 1 ELSE 0 END) as with_budget
      FROM inquiries
      GROUP BY status
    `).all();
    
    // Por tipo de evento
    const byEventType = db.prepare(`
      SELECT event_type, COUNT(*) as count,
      AVG(CAST(REPLACE(REPLACE(budget, '$', ''), ',', '') AS INTEGER)) as avg_budget
      FROM inquiries
      WHERE event_type IS NOT NULL
      GROUP BY event_type
    `).all();
    
    // Valor potencial del pipeline (suma de budgets en nuevo + pendiente)
    const pipelineValue = db.prepare(`
      SELECT 
        SUM(CAST(REPLACE(REPLACE(budget, '$', ''), ',', '') AS INTEGER)) as total
      FROM inquiries
      WHERE status IN ('nuevo', 'pendiente')
      AND budget IS NOT NULL
    `).get();
    
    // Tiempo promedio de conversión (días entre creación y confirmación)
    const avgConversionTime = db.prepare(`
      SELECT AVG(
        julianday(updated_at) - julianday(created_at)
      ) as avg_days
      FROM inquiries
      WHERE status = 'confirmado'
    `).get();
    
    // Cotizaciones este mes
    const thisMonth = db.prepare(`
      SELECT COUNT(*) as count
      FROM inquiries
      WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')
    `).get();
    
    // Tasa de conversión
    const confirmed = db.prepare(`
      SELECT COUNT(*) as count FROM inquiries WHERE status = 'confirmado'
    `).get();
    
    const conversionRate = totalInquiries.count > 0 
      ? ((confirmed.count / totalInquiries.count) * 100).toFixed(2)
      : 0;
    
    // Pipeline mensual (últimos 12 meses)
    const monthlyPipeline = db.prepare(`
      SELECT 
        strftime('%Y-%m', created_at) as month,
        COUNT(*) as total_inquiries,
        SUM(CASE WHEN status = 'confirmado' THEN 1 ELSE 0 END) as confirmed,
        SUM(CASE WHEN status = 'cancelado' THEN 1 ELSE 0 END) as cancelled
      FROM inquiries
      GROUP BY month
      ORDER BY month DESC
      LIMIT 12
    `).all();
    
    res.json({
      overview: {
        totalInquiries: totalInquiries.count,
        pipelineValue: pipelineValue.total || 0,
        conversionRate: `${conversionRate}%`,
        avgConversionDays: Math.round(avgConversionTime.avg_days || 0),
        thisMonth: thisMonth.count,
        confirmed: confirmed.count
      },
      byStatus: byStatus.reduce((acc, s) => {
        acc[s.status] = {
          count: s.count,
          withBudget: s.with_budget
        };
        return acc;
      }, {}),
      byEventType,
      monthlyPipeline
    });
  } catch (error) {
    console.error('Pipeline stats error:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// ============================================
// REVENUE STATS (Ingresos)
// ============================================

// GET /api/stats/revenue - Estadísticas de ingresos
router.get('/revenue', (req, res) => {
  try {
    // Ingresos confirmados por mes
    const monthlyRevenue = db.prepare(`
      SELECT 
        strftime('%Y-%m', date) as month,
        SUM(budget) as revenue,
        COUNT(*) as event_count
      FROM events
      WHERE status = 'confirmed'
      GROUP BY month
      ORDER BY month DESC
      LIMIT 12
    `).all();
    
    // Ingresos por tipo de evento
    const revenueByType = db.prepare(`
      SELECT 
        type,
        SUM(budget) as revenue,
        COUNT(*) as count,
        AVG(budget) as avg_budget
      FROM events
      WHERE status = 'confirmed'
      GROUP BY type
      ORDER BY revenue DESC
    `).all();
    
    // Totales
    const totals = db.prepare(`
      SELECT 
        SUM(budget) as total_revenue,
        COUNT(*) as total_events,
        AVG(budget) as avg_event_value
      FROM events
      WHERE status = 'confirmed'
    `).get();
    
    // Proyección (valor potencial en pipeline)
    const projection = db.prepare(`
      SELECT SUM(budget) as potential_revenue
      FROM inquiries
      WHERE status IN ('nuevo', 'pendiente')
    `).get();
    
    res.json({
      actual: {
        totalRevenue: totals.total_revenue || 0,
        totalEvents: totals.total_events || 0,
        avgEventValue: Math.round(totals.avg_event_value || 0)
      },
      projection: {
        potentialRevenue: projection.potential_revenue || 0
      },
      monthly: monthlyRevenue,
      byType: revenueByType
    });
  } catch (error) {
    console.error('Revenue stats error:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// ============================================
// DASHBOARD COMBINED STATS
// ============================================

// GET /api/stats/dashboard - Stats resumidas para dashboard
router.get('/dashboard', (req, res) => {
  try {
    // Community
    const totalContacts = db.prepare('SELECT COUNT(*) as count FROM contacts').get();
    const newFansThisMonth = db.prepare(`
      SELECT COUNT(*) as count FROM contacts 
      WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')
    `).get();
    
    // Pipeline
    const newInquiries = db.prepare(`
      SELECT COUNT(*) as count FROM inquiries WHERE status = 'nuevo'
    `).get();
    const pendingInquiries = db.prepare(`
      SELECT COUNT(*) as count FROM inquiries WHERE status = 'pendiente'
    `).get();
    
    // Events
    const upcomingEvents = db.prepare(`
      SELECT COUNT(*) as count FROM events 
      WHERE date >= date('now') AND status = 'confirmed'
    `).get();
    
    // Revenue this month
    const thisMonthRevenue = db.prepare(`
      SELECT COALESCE(SUM(budget), 0) as revenue
      FROM events
      WHERE strftime('%Y-%m', date) = strftime('%Y-%m', 'now')
      AND status = 'confirmed'
    `).get();
    
    res.json({
      community: {
        totalContacts: totalContacts.count,
        newThisMonth: newFansThisMonth.count
      },
      pipeline: {
        newInquiries: newInquiries.count,
        pendingInquiries: pendingInquiries.count
      },
      events: {
        upcoming: upcomingEvents.count
      },
      revenue: {
        thisMonth: thisMonthRevenue.revenue
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

export default router;
