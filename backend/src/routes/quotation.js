/**
 * Public Quotation Submission
 * Entry point for landing-page form — no authentication required.
 * Creates contact + inquiry in DB, sends email notifications.
 */
import express from 'express';
import { body, validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import db from '../utils/database.js';
import { sendEmail } from '../services/emailService.js';

const router = express.Router();

// Map ContactWizard MMERGE fields → domain objects
const mapFormFields = (body) => {
  const {
    EMAIL,
    MMERGE2,                  // name
    MMERGE5,                  // service / event_type
    service_custom_description,
    MMERGE7,                  // location
    MMERGE8,                  // special requirements
    MMERGE9,                  // duration
    MMERGE10,                 // event time
    MMERGE11,                 // budget
    MMERGE13,                 // event date
    MMERGE14,                 // phone
  } = body;

  // Combine requirements, duration and custom service into one message field
  const messageParts = [];
  if (MMERGE8?.trim()) messageParts.push(`Requerimientos: ${MMERGE8.trim()}`);
  if (MMERGE9?.trim()) messageParts.push(`Duración: ${MMERGE9.trim()}`);
  if (service_custom_description?.trim()) {
    messageParts.push(`Formación personalizada: ${service_custom_description.trim()}`);
  }

  return {
    contact: {
      email: EMAIL?.trim()   || null,
      name:  MMERGE2?.trim() || null,
      phone: MMERGE14?.trim() || null,
    },
    inquiry: {
      event_type: MMERGE5?.trim()  || null,
      event_date: MMERGE13?.trim() || null,
      event_time: MMERGE10?.trim() || null,
      location:   MMERGE7?.trim()  || null,
      budget:     MMERGE11?.trim() || null,
      message:    messageParts.length ? messageParts.join('\n') : null,
    },
  };
};

// POST /api/quotation — public form submission
router.post('/', [
  body('EMAIL').isEmail().normalizeEmail().withMessage('Email inválido'),
  body('MMERGE2').trim().notEmpty().withMessage('Nombre requerido'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { contact: contactData, inquiry: inquiryData } = mapFormFields(req.body);

    // ── 1. Find or create contact ────────────────────────────────────────────
    let contact = db.prepare('SELECT * FROM contacts WHERE email = ?').get(contactData.email);

    if (!contact) {
      const contactId = uuidv4();
      db.prepare(`
        INSERT INTO contacts (id, name, email, phone, relationship_type, source, created_at, updated_at)
        VALUES (?, ?, ?, ?, 'lead', 'website_form', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `).run(contactId, contactData.name, contactData.email, contactData.phone || null);
      contact = db.prepare('SELECT * FROM contacts WHERE id = ?').get(contactId);
    } else {
      // Fill in missing phone if provided
      if (contactData.phone && !contact.phone) {
        db.prepare('UPDATE contacts SET phone = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
          .run(contactData.phone, contact.id);
      }
      // Upgrade relationship type: fan → fan_lead, alumni → lead
      db.prepare(`
        UPDATE contacts
        SET relationship_type = CASE
          WHEN relationship_type = 'fan'    THEN 'fan_lead'
          WHEN relationship_type = 'alumni' THEN 'lead'
          ELSE relationship_type
        END,
        updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(contact.id);
    }

    // ── 2. Create inquiry with status = 'nuevo' ──────────────────────────────
    const inquiryId = uuidv4();
    db.prepare(`
      INSERT INTO inquiries (
        id, contact_id, event_type, event_date, event_time, location,
        budget, message, source, status, first_contact_date, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'website_form', 'nuevo',
                CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `).run(
      inquiryId,
      contact.id,
      inquiryData.event_type || null,
      inquiryData.event_date || null,
      inquiryData.event_time || null,
      inquiryData.location   || null,
      inquiryData.budget     || null,
      inquiryData.message    || null,
    );

    // ── 3. Admin notification email (non-blocking) ───────────────────────────
    const adminEmail = process.env.ADMIN_EMAIL || 'smirandar712@gmail.com';
    sendEmail({
      to: adminEmail,
      subject: `🎼 Nueva cotización - ${contactData.name}`,
      html: buildAdminEmail({ ...contactData, ...inquiryData }),
      text: [
        `Nueva cotización de ${contactData.name} (${contactData.email})`,
        `Servicio: ${inquiryData.event_type || 'No especificado'}`,
        `Fecha: ${inquiryData.event_date || 'Por definir'}`,
        `Presupuesto: ${inquiryData.budget || 'No especificado'}`,
        `\nVer en admin: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/inquiries`,
      ].join('\n'),
    }).catch(err => console.error('Admin notification email failed (non-fatal):', err.message));

    // ── 4. Client confirmation email (non-blocking) ──────────────────────────
    sendEmail({
      to: contactData.email,
      subject: `✅ Recibimos tu solicitud - Stephanie Miranda`,
      html: buildClientEmail({ name: contactData.name }),
      text: [
        `Hola ${contactData.name},`,
        '',
        'Hemos recibido tu solicitud de cotización. Te contactaremos en las próximas 24-48 horas.',
        '',
        '📱 WhatsApp: +506 7231-5028',
        '📧 Email: smirandar712@gmail.com',
        '',
        '¡Gracias por considerarme para tu evento!',
        'Stephanie Miranda 🎼',
      ].join('\n'),
    }).catch(err => console.error('Client confirmation email failed (non-fatal):', err.message));

    return res.json({
      success: true,
      message: '¡Solicitud enviada! Te contactaremos pronto.',
      inquiry_id: inquiryId,
    });

  } catch (error) {
    console.error('Quotation submission error:', error);
    return res.status(500).json({ error: 'Error al procesar tu solicitud. Intenta de nuevo.' });
  }
});

// ── Email templates ──────────────────────────────────────────────────────────

function buildAdminEmail({ name, email, phone, event_type, event_date, event_time, location, budget, message }) {
  const adminUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/inquiries`;
  const row = (label, value) =>
    value ? `<div class="field"><strong>${label}</strong><span>${value}</span></div>` : '';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; background: #0F0F23; color: #fff; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; }
    .header { background: linear-gradient(135deg, #8B5CF6, #A855F7); padding: 24px 30px; border-radius: 10px 10px 0 0; }
    .content { background: #1A1A2E; padding: 28px 30px; border-radius: 0 0 10px 10px; }
    .badge { background: #10B981; color: white; padding: 4px 14px; border-radius: 20px; font-size: 12px; font-weight: bold; display: inline-block; margin-bottom: 16px; }
    .field { margin-bottom: 10px; padding: 10px 14px; background: rgba(255,255,255,0.05); border-radius: 6px; }
    .field strong { color: #A78BFA; display: block; font-size: 11px; margin-bottom: 2px; text-transform: uppercase; }
    .field span { color: #E5E7EB; white-space: pre-wrap; }
    .cta { background: #8B5CF6; color: white; padding: 11px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 20px; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin:0;font-size:18px;">🎼 Nueva Solicitud de Cotización</h1>
    </div>
    <div class="content">
      <span class="badge">NUEVO</span>
      <h2 style="margin-top:0;color:#E5E7EB;">${name}</h2>
      ${row('Email', email)}
      ${row('Teléfono / WhatsApp', phone)}
      ${row('Servicio solicitado', event_type)}
      ${row('Fecha del evento', event_date)}
      ${row('Hora del evento', event_time)}
      ${row('Lugar', location)}
      ${row('Presupuesto', budget)}
      ${row('Requerimientos / Notas', message)}
      <a href="${adminUrl}" class="cta">Ver en el panel admin →</a>
    </div>
  </div>
</body>
</html>`;
}

function buildClientEmail({ name }) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; background: #0F0F23; color: #fff; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; }
    .header { background: linear-gradient(135deg, #8B5CF6, #A855F7); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #1A1A2E; padding: 30px; border-radius: 0 0 10px 10px; line-height: 1.7; }
    .highlight { background: rgba(139,92,246,0.1); border-left: 3px solid #8B5CF6; padding: 14px 18px; border-radius: 0 8px 8px 0; margin: 20px 0; }
    .footer { text-align: center; padding: 18px; color: #6B7280; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin:0;font-size:22px;">🎼 Stephanie Miranda</h1>
      <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);">Música que transforma momentos</p>
    </div>
    <div class="content">
      <h2>¡Hola ${name}! 👋</h2>
      <p>Hemos recibido tu solicitud de cotización y estamos muy emocionados de ser parte de tu evento especial.</p>
      <div class="highlight">
        <strong>¿Qué sigue?</strong><br>
        Me pondré en contacto contigo en las próximas <strong>24–48 horas</strong> para hablar sobre los detalles y enviarte una propuesta personalizada.
      </div>
      <p>Mientras tanto, si tienes alguna pregunta urgente, contáctame directamente:</p>
      <p>📱 WhatsApp: <strong>+506 7231-5028</strong><br>
         📧 Email: <strong>smirandar712@gmail.com</strong></p>
      <p>¡Gracias por considerarme para tu evento! 🎵</p>
      <p>Con cariño,<br><strong>Stephanie Miranda</strong></p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Stephanie Miranda Music</p>
    </div>
  </div>
</body>
</html>`;
}

export default router;
