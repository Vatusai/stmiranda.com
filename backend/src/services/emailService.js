/**
 * Email Service
 * Sistema de envío de emails con templates para:
 * - Newsletters a fans
 * - Follow-ups de cotizaciones
 * - Confirmaciones y recordatorios
 */
import { Resend } from 'resend';
import { v4 as uuidv4 } from 'uuid';
import db from '../utils/database.js';

// Resend client — created on first use so dotenv has already loaded by then
let _resend = null;
function getResend() {
  if (_resend) return _resend;
  if (!process.env.RESEND_API_KEY) {
    console.warn('⚠️  RESEND_API_KEY not set — email sending disabled');
    return null;
  }
  _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

// Remitente por defecto
const FROM_EMAIL = process.env.EMAIL_FROM || 'Stephanie Miranda <onboarding@resend.dev>';
const FROM_NAME = 'Stephanie Miranda';

/**
 * Templates de emails
 */
const templates = {
  // Newsletter para fans
  fanNewsletter: (data) => ({
    subject: `🎵 ${data.subject}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${data.subject}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0F0F23; color: #fff; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; padding: 30px 0; border-bottom: 2px solid #8B5CF6; }
          .logo { font-size: 24px; font-weight: bold; color: #8B5CF6; }
          .content { padding: 30px 0; line-height: 1.6; }
          .content h2 { color: #EC4899; }
          .button { display: inline-block; background: linear-gradient(135deg, #8B5CF6, #EC4899); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #9CA3AF; font-size: 12px; border-top: 1px solid rgba(255,255,255,0.1); }
          .social { margin: 20px 0; }
          .social a { margin: 0 10px; color: #8B5CF6; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🎼 STEPHANIE MIRANDA</div>
            <p style="color: #9CA3AF; margin-top: 10px;">Música que transforma momentos</p>
          </div>
          
          <div class="content">
            <h2>¡Hola ${data.name}! 👋</h2>
            
            ${data.content}
            
            ${data.ctaUrl ? `<a href="${data.ctaUrl}" class="button">${data.ctaText || 'Ver más'}</a>` : ''}
          </div>
          
          <div class="footer">
            <div class="social">
              <a href="https://instagram.com/stephaniemirandamusic">Instagram</a> |
              <a href="https://youtube.com/@stephaniemirandamusic">YouTube</a> |
              <a href="https://facebook.com/stephaniemirandamusic">Facebook</a>
            </div>
            <p>© ${new Date().getFullYear()} Stephanie Miranda Music</p>
            <p>
              Estás recibiendo esto porque te registraste en nuestra comunidad de fans.<br>
              <a href="${data.unsubscribeUrl || '#'}">Darme de baja</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Hola ${data.name},

${data.contentText || data.content.replace(/<[^>]*>/g, '')}

---
© ${new Date().getFullYear()} Stephanie Miranda Music
Darte de baja: ${data.unsubscribeUrl || '#'}
    `
  }),

  // Follow-up de cotización
  inquiryFollowUp: (data) => ({
    subject: `✨ Seguimiento: Tu evento ${data.eventType || ''}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; background: #0F0F23; color: #fff; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #8B5CF6, #A855F7); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #1A1A2E; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { background: #10B981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
          .details { background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #9CA3AF; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎼 Stephanie Miranda</h1>
            <p>Eventos Privados</p>
          </div>
          <div class="content">
            <h2>Hola ${data.name},</h2>
            
            <p>${data.message}</p>
            
            <div class="details">
              <h3>Detalles de tu solicitud:</h3>
              <p><strong>Tipo de evento:</strong> ${data.eventType || 'Por definir'}</p>
              <p><strong>Fecha:</strong> ${data.eventDate || 'Por definir'}</p>
              ${data.budget ? `<p><strong>Presupuesto:</strong> ${data.budget}</p>` : ''}
            </div>
            
            ${data.nextSteps ? `<p><strong>Próximos pasos:</strong> ${data.nextSteps}</p>` : ''}
            
            <a href="mailto:stephanie@stmiranda.com?subject=Re: Cotización ${data.eventType || ''}" class="button">Responder a Stephanie</a>
            
            <p style="margin-top: 30px;">
              ¿Tienes preguntas? Responde a este email o escríbeme por WhatsApp al +506 7231-5028.
            </p>
            
            <p>¡Gracias por considerarme para tu evento!<br>
            <strong>Stephanie Miranda</strong></p>
          </div>
          <div class="footer">
            <p>Este es un seguimiento de tu cotización del ${new Date(data.inquiryDate).toLocaleDateString()}.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Hola ${data.name},

${data.message}

Detalles de tu solicitud:
- Tipo de evento: ${data.eventType || 'Por definir'}
- Fecha: ${data.eventDate || 'Por definir'}
${data.budget ? `- Presupuesto: ${data.budget}` : ''}

${data.nextSteps ? `Próximos pasos: ${data.nextSteps}` : ''}

Responder: stephanie@stmiranda.com
WhatsApp: +506 7231-5028

Gracias,
Stephanie Miranda
    `
  }),

  // Confirmación de evento
  eventConfirmation: (data) => ({
    subject: `🎉 ¡Confirmado! Tu evento con Stephanie Miranda`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; background: #0F0F23; color: #fff; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10B981, #059669); padding: 40px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #1A1A2E; padding: 30px; border-radius: 0 0 10px 10px; }
          .success-badge { background: #10B981; color: white; padding: 10px 20px; border-radius: 20px; display: inline-block; margin: 10px 0; }
          .event-details { background: rgba(16, 185, 129, 0.1); border: 1px solid #10B981; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .button { background: #8B5CF6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎊 ¡Evento Confirmado!</h1>
            <span class="success-badge">RESERVA CONFIRMADA</span>
          </div>
          <div class="content">
            <h2>Hola ${data.name},</h2>
            
            <p>¡Excelentes noticias! Tu evento ha sido confirmado y está oficialmente en mi calendario.</p>
            
            <div class="event-details">
              <h3>📅 Detalles del Evento</h3>
              <p><strong>Evento:</strong> ${data.eventTitle}</p>
              <p><strong>Fecha:</strong> ${new Date(data.eventDate).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p><strong>Hora:</strong> ${data.eventTime || 'Por confirmar'}</p>
              <p><strong>Ubicación:</strong> ${data.location || 'Por confirmar'}</p>
              <p><strong>Tipo:</strong> ${data.eventType}</p>
            </div>
            
            <h3>📝 Próximos pasos:</h3>
            <ol>
              <li>Recibirás un contrato/detalle formal en las próximas 24-48 horas.</li>
              <li>Coordinaremos una llamada o reunión para finalizar detalles.</li>
              <li>Te enviaré una playlist de canciones para personalizar tu evento.</li>
            </ol>
            
            <p style="background: rgba(139, 92, 246, 0.1); padding: 15px; border-radius: 8px; margin: 20px 0;">
              <strong>📱 Guarda mi contacto:</strong><br>
              WhatsApp: +506 7231-5028<br>
              Email: stephanie@stmiranda.com
            </p>
            
            <p>¡Gracias por confiar en mí para hacer de tu evento algo inolvidable!</p>
            
            <p>Con cariño,<br>
            <strong>Stephanie Miranda</strong> 🎼</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
¡EVENTO CONFIRMADO!

Hola ${data.name},

¡Excelentes noticias! Tu evento ha sido confirmado y está oficialmente en mi calendario.

DETALLES DEL EVENTO:
- Evento: ${data.eventTitle}
- Fecha: ${data.eventDate}
- Hora: ${data.eventTime || 'Por confirmar'}
- Ubicación: ${data.location || 'Por confirmar'}
- Tipo: ${data.eventType}

PRÓXIMOS PASOS:
1. Recibirás un contrato/detalle formal en las próximas 24-48 horas
2. Coordinaremos una llamada para finalizar detalles
3. Te enviaré una playlist para personalizar tu evento

Mi contacto:
WhatsApp: +506 7231-5028
Email: stephanie@stmiranda.com

¡Gracias por confiar en mí!
Stephanie Miranda 🎼
    `
  }),

  // Recordatorio de evento (24h antes)
  eventReminder: (data) => ({
    subject: `⏰ Recordatorio: Tu evento es mañana`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; background: #0F0F23; color: #fff; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .alert { background: #F59E0B; color: #000; padding: 15px; text-align: center; border-radius: 8px; font-weight: bold; }
          .content { background: #1A1A2E; padding: 30px; border-radius: 10px; margin-top: 20px; }
          .details { background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="alert">⏰ RECORDATORIO: EVENTO MAÑANA</div>
          <div class="content">
            <h2>Hola ${data.name},</h2>
            <p>Este es un recordatorio de que tu evento con Stephanie Miranda es <strong>mañana</strong>.</p>
            
            <div class="details">
              <p><strong>📅 Fecha:</strong> ${new Date(data.eventDate).toLocaleDateString('es-ES', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
              <p><strong>🕐 Hora:</strong> ${data.eventTime}</p>
              <p><strong>📍 Ubicación:</strong> ${data.location}</p>
              <p><strong>🎵 Evento:</strong> ${data.eventTitle}</p>
            </div>
            
            <p><strong>📱 Contacto de emergencia:</strong><br>
            Stephanie: +506 7231-5028</p>
            
            <p>¡Nos vemos mañana! 🎼</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
⏰ RECORDATORIO: EVENTO MAÑANA

Hola ${data.name},

Tu evento con Stephanie Miranda es MAÑANA:

📅 Fecha: ${data.eventDate}
🕐 Hora: ${data.eventTime}
📍 Ubicación: ${data.location}
🎵 Evento: ${data.eventTitle}

Contacto de emergencia:
Stephanie: +506 7231-5028

¡Nos vemos mañana! 🎼
    `
  })
};

/**
 * Enviar email
 */
export const sendEmail = async ({ to, subject, html, text, from = FROM_EMAIL }) => {
  const resend = getResend();
  if (!resend) {
    console.warn('⚠️  Email skipped (no RESEND_API_KEY):', subject);
    return { success: false, skipped: true };
  }

  try {
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
      text,
    });

    if (error) {
      console.error('❌ Resend error:', error);
      throw new Error(error.message);
    }

    console.log('✉️  Email enviado via Resend:', data.id);

    // Log en base de datos
    db.prepare(`
      INSERT INTO email_logs (id, to_email, subject, template, sent_at, message_id)
      VALUES (?, ?, ?, ?, datetime('now'), ?)
    `).run(uuidv4(), to, subject, 'custom', data.id);

    return { success: true, messageId: data.id };
  } catch (error) {
    console.error('❌ Error enviando email:', error);
    throw error;
  }
};

/**
 * Enviar newsletter a lista de fans
 */
export const sendNewsletterToFans = async (newsletterData) => {
  try {
    // Obtener fans que quieren recibir updates
    const fans = db.prepare(`
      SELECT id, name, email, wants_concert_updates
      FROM contacts
      WHERE wants_concert_updates = 1
      AND email IS NOT NULL
      AND email != ''
    `).all();
    
    console.log(`📧 Enviando newsletter a ${fans.length} fans...`);
    
    const results = {
      sent: 0,
      failed: 0,
      errors: []
    };
    
    // Enviar con rate limiting (5 emails por segundo)
    for (const fan of fans) {
      try {
        const template = templates.fanNewsletter({
          ...newsletterData,
          name: fan.name || 'Amante de la música',
          unsubscribeUrl: `${process.env.FRONTEND_URL}/unsubscribe?contact=${fan.id}`
        });
        
        await sendEmail({
          to: fan.email,
          ...template
        });
        
        results.sent++;
        
        // Delay de 200ms entre emails
        await new Promise(resolve => setTimeout(resolve, 200));
        
      } catch (error) {
        results.failed++;
        results.errors.push({ email: fan.email, error: error.message });
      }
    }
    
    console.log(`✅ Newsletter enviado: ${results.sent} exitosos, ${results.failed} fallidos`);
    return results;
    
  } catch (error) {
    console.error('Error en sendNewsletterToFans:', error);
    throw error;
  }
};

/**
 * Enviar follow-up de cotización
 */
export const sendInquiryFollowUp = async (inquiryId, customMessage = null) => {
  try {
    const inquiry = db.prepare(`
      SELECT i.*, c.name, c.email
      FROM inquiries i
      JOIN contacts c ON i.contact_id = c.id
      WHERE i.id = ?
    `).get(inquiryId);
    
    if (!inquiry) {
      throw new Error('Cotización no encontrada');
    }
    
    const template = templates.inquiryFollowUp({
      name: inquiry.name,
      eventType: inquiry.event_type,
      eventDate: inquiry.event_date,
      budget: inquiry.budget,
      inquiryDate: inquiry.created_at,
      message: customMessage || `Gracias por tu interés en tenerme en tu ${inquiry.event_type || 'evento'}. Quería hacer seguimiento de tu cotización.`,
      nextSteps: 'Por favor, responde a este email con cualquier pregunta o para confirmar los detalles finales.'
    });
    
    await sendEmail({
      to: inquiry.email,
      ...template
    });
    
    // Actualizar fecha de último contacto
    db.prepare(`
      UPDATE inquiries 
      SET last_contact_date = datetime('now'), updated_at = datetime('now')
      WHERE id = ?
    `).run(inquiryId);
    
    return { success: true };
    
  } catch (error) {
    console.error('Error en sendInquiryFollowUp:', error);
    throw error;
  }
};

/**
 * Enviar confirmación de evento
 */
export const sendEventConfirmation = async (eventId) => {
  try {
    const event = db.prepare(`
      SELECT e.*, c.name, c.email
      FROM events e
      JOIN contacts c ON e.contact_id = c.id
      WHERE e.id = ?
    `).get(eventId);
    
    if (!event) {
      throw new Error('Evento no encontrado');
    }
    
    const template = templates.eventConfirmation({
      name: event.name,
      eventTitle: event.title,
      eventDate: event.date,
      eventTime: event.time,
      location: event.location,
      eventType: event.type
    });
    
    await sendEmail({
      to: event.email,
      ...template
    });
    
    return { success: true };
    
  } catch (error) {
    console.error('Error en sendEventConfirmation:', error);
    throw error;
  }
};

/**
 * Enviar recordatorios de eventos (para ejecutar en cron job)
 */
export const sendEventReminders = async () => {
  try {
    // Eventos de mañana
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    const events = db.prepare(`
      SELECT e.*, c.name, c.email
      FROM events e
      JOIN contacts c ON e.contact_id = c.id
      WHERE e.date = ?
      AND e.status = 'confirmed'
      AND e.reminder_sent = 0
    `).all(tomorrowStr);
    
    console.log(`⏰ Enviando recordatorios para ${events.length} eventos de mañana...`);
    
    for (const event of events) {
      try {
        const template = templates.eventReminder({
          name: event.name,
          eventDate: event.date,
          eventTime: event.time,
          location: event.location,
          eventTitle: event.title
        });
        
        await sendEmail({
          to: event.email,
          ...template
        });
        
        // Marcar como recordatorio enviado
        db.prepare('UPDATE events SET reminder_sent = 1 WHERE id = ?').run(event.id);
        
      } catch (error) {
        console.error(`Error enviando recordatorio para ${event.email}:`, error);
      }
    }
    
    return { sent: events.length };
    
  } catch (error) {
    console.error('Error en sendEventReminders:', error);
    throw error;
  }
};

/**
 * Verificar conexión Resend
 */
export const verifyEmailConnection = async () => {
  const resend = getResend();
  if (!resend) return false;
  try {
    // Resend has no dedicated verify call; hitting the domains list is a lightweight check
    const { error } = await resend.domains.list();
    if (error) throw new Error(error.message);
    console.log('✅ Resend API key válida');
    return true;
  } catch (error) {
    console.error('❌ Error verificando Resend:', error);
    return false;
  }
};

export default {
  sendEmail,
  sendNewsletterToFans,
  sendInquiryFollowUp,
  sendEventConfirmation,
  sendEventReminders,
  verifyEmailConnection,
  templates
};
