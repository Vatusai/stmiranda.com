/**
 * Email Routes
 * API para gestión de emails, newsletters y automatizaciones
 */
import express from 'express';
import { body, validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import db from '../utils/database.js';
import { requireAdmin } from '../middleware/auth.js';
import {
  sendEmail,
  sendNewsletterToFans,
  sendInquiryFollowUp,
  sendEventConfirmation,
  sendEventReminders,
  verifyEmailConnection
} from '../services/emailService.js';

const router = express.Router();

router.use(requireAdmin);

// GET /api/emails/verify - Verificar conexión SMTP
router.get('/verify', async (req, res) => {
  try {
    const isConnected = await verifyEmailConnection();
    res.json({ connected: isConnected });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/emails/stats - Estadísticas de emails
router.get('/stats', (req, res) => {
  try {
    // Total emails enviados
    const totalSent = db.prepare('SELECT COUNT(*) as count FROM email_logs').get();
    
    // Emails por mes
    const byMonth = db.prepare(`
      SELECT 
        strftime('%Y-%m', sent_at) as month,
        COUNT(*) as count
      FROM email_logs
      GROUP BY month
      ORDER BY month DESC
      LIMIT 12
    `).all();
    
    // Por template
    const byTemplate = db.prepare(`
      SELECT template, COUNT(*) as count
      FROM email_logs
      GROUP BY template
    `).all();
    
    // Tasa de apertura (si se trackea)
    const opened = db.prepare(`
      SELECT COUNT(*) as count FROM email_logs WHERE opened_at IS NOT NULL
    `).get();
    
    res.json({
      total: totalSent.count,
      byMonth,
      byTemplate,
      opened: opened.count,
      openRate: totalSent.count > 0 ? ((opened.count / totalSent.count) * 100).toFixed(2) : 0
    });
  } catch (error) {
    console.error('Email stats error:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// POST /api/emails/send - Enviar email individual
router.post('/send', [
  body('to').isEmail(),
  body('subject').notEmpty(),
  body('html').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { to, subject, html, text } = req.body;
    
    const result = await sendEmail({ to, subject, html, text });
    
    res.json({ success: true, result });
  } catch (error) {
    console.error('Send email error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/emails/newsletter - Enviar newsletter a fans
router.post('/newsletter', [
  body('subject').notEmpty(),
  body('content').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { subject, content, contentText, ctaUrl, ctaText } = req.body;
    
    // Crear campaña en DB
    const campaignId = uuidv4();
    db.prepare(`
      INSERT INTO campaigns (id, name, subject, content, template_type, target_audience, status, created_by)
      VALUES (?, ?, ?, ?, 'fan_newsletter', 'fans', 'sending', ?)
    `).run(campaignId, subject, subject, content, req.user?.userId || 'system');
    
    // Enviar a fans
    const result = await sendNewsletterToFans({
      subject,
      content,
      contentText,
      ctaUrl,
      ctaText
    });
    
    // Actualizar campaña
    db.prepare(`
      UPDATE campaigns 
      SET status = 'sent', sent_at = datetime('now'), sent_count = ?
      WHERE id = ?
    `).run(result.sent, campaignId);
    
    res.json({
      success: true,
      campaignId,
      stats: result
    });
  } catch (error) {
    console.error('Newsletter error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/emails/inquiry-followup/:id - Enviar follow-up de cotización
router.post('/inquiry-followup/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { customMessage } = req.body;
    
    await sendInquiryFollowUp(id, customMessage);
    
    res.json({ success: true, message: 'Follow-up enviado' });
  } catch (error) {
    console.error('Inquiry follow-up error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/emails/event-confirmation/:id - Enviar confirmación de evento
router.post('/event-confirmation/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await sendEventConfirmation(id);
    
    res.json({ success: true, message: 'Confirmación enviada' });
  } catch (error) {
    console.error('Event confirmation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/emails/event-reminders - Enviar recordatorios (cron job)
router.post('/event-reminders', async (req, res) => {
  try {
    const result = await sendEventReminders();
    
    res.json({
      success: true,
      message: `${result.sent} recordatorios enviados`
    });
  } catch (error) {
    console.error('Event reminders error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/emails/campaigns - Listar campañas
router.get('/campaigns', (req, res) => {
  try {
    const campaigns = db.prepare(`
      SELECT * FROM campaigns
      ORDER BY created_at DESC
    `).all();
    
    res.json({ campaigns });
  } catch (error) {
    console.error('Get campaigns error:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// GET /api/emails/logs - Logs de emails enviados
router.get('/logs', (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    
    const logs = db.prepare(`
      SELECT * FROM email_logs
      ORDER BY sent_at DESC
      LIMIT ? OFFSET ?
    `).all(parseInt(limit), parseInt(offset));
    
    res.json({ logs });
  } catch (error) {
    console.error('Get email logs error:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

export default router;
