/**
 * Notification Service
 * Handles scheduling and sending event reminders
 */
import db from '../utils/database.js';
import { sendEmail } from './emailService.js';

/**
 * Check and send pending notifications
 * Should be called periodically (e.g., every 5 minutes via cron)
 */
export const processPendingNotifications = async () => {
  try {
    const now = new Date().toISOString();
    
    // Get pending notifications that are due
    const notifications = db.prepare(`
      SELECT n.*, e.title as event_title, e.date as event_date, e.time as event_time,
             e.location, u.email as user_email, u.name as user_name
      FROM event_notifications n
      JOIN events e ON n.event_id = e.id
      JOIN event_attendees ea ON n.attendee_id = ea.id
      JOIN users u ON ea.user_id = u.id
      WHERE n.status = 'pending'
      AND n.scheduled_at <= ?
    `).all(now);
    
    console.log(`[Notifications] Processing ${notifications.length} pending notifications`);
    
    for (const notif of notifications) {
      try {
        await sendNotification(notif);
        
        // Mark as sent
        db.prepare(`
          UPDATE event_notifications 
          SET status = 'sent', sent_at = CURRENT_TIMESTAMP 
          WHERE id = ?
        `).run(notif.id);
        
        console.log(`[Notifications] Sent ${notif.type} for event ${notif.event_id}`);
      } catch (error) {
        console.error(`[Notifications] Failed to send ${notif.id}:`, error);
        
        // Mark as failed
        db.prepare(`
          UPDATE event_notifications 
          SET status = 'failed' 
          WHERE id = ?
        `).run(notif.id);
      }
    }
    
    return { processed: notifications.length };
  } catch (error) {
    console.error('[Notifications] Processing error:', error);
    throw error;
  }
};

/**
 * Send a single notification
 */
const sendNotification = async (notif) => {
  const eventDate = new Date(notif.event_date);
  const formattedDate = eventDate.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  
  const subjectMap = {
    'reminder_1day': `Recordatorio: ${notif.event_title} es mañana`,
    'reminder_same_day': `Hoy: ${notif.event_title}`,
  };
  
  const subject = subjectMap[notif.type] || `Recordatorio de evento: ${notif.event_title}`;
  
  // Build email content
  const htmlContent = buildEmailTemplate(notif.type, {
    userName: notif.user_name,
    eventTitle: notif.event_title,
    eventDate: formattedDate,
    eventTime: notif.event_time,
    eventLocation: notif.location,
  });
  
  // Send email (using existing email service)
  await sendEmail({
    to: notif.user_email,
    subject,
    html: htmlContent,
    text: `Hola ${notif.user_name}, te recordamos que ${notif.event_title} es ${notif.type === 'reminder_1day' ? 'mañana' : 'hoy'}. Fecha: ${formattedDate}, Hora: ${notif.event_time}, Lugar: ${notif.location}`,
  });
};

/**
 * Build HTML email template
 */
const buildEmailTemplate = (type, data) => {
  const isOneDay = type === 'reminder_1day';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #7c3aed, #a855f7); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .event-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .button { display: inline-block; background: #7c3aed; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${isOneDay ? '¡Tu evento es mañana! 🎵' : '¡Hoy es el día! 🎉'}</h1>
        </div>
        <div class="content">
          <p>Hola <strong>${data.userName}</strong>,</p>
          <p>${isOneDay 
            ? 'Te recordamos que el evento al que te registraste es <strong>mañana</strong>.' 
            '¡Es hoy! El evento al que te registraste es <strong>hoy</strong>.'
          }</p>
          
          <div class="event-details">
            <h2>${data.eventTitle}</h2>
            <p><strong>📅 Fecha:</strong> ${data.eventDate}</p>
            <p><strong>🕐 Hora:</strong> ${data.eventTime || 'Por confirmar'}</p>
            <p><strong>📍 Lugar:</strong> ${data.eventLocation || 'Por confirmar'}</p>
          </div>
          
          <p>¡Te esperamos!</p>
          
          <center>
            <a href="https://stmiranda.com/eventos" class="button">Ver detalles</a>
          </center>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Schedule notifications for a new attendee
 */
export const scheduleNotificationsForAttendee = (attendeeId, eventId, eventDate) => {
  try {
    const eventDateTime = new Date(eventDate);
    const now = new Date();
    
    // Notification 1: 1 day before at 10 AM
    const oneDayBefore = new Date(eventDateTime);
    oneDayBefore.setDate(oneDayBefore.getDate() - 1);
    oneDayBefore.setHours(10, 0, 0, 0);
    
    // Notification 2: Same day, 3 hours before event
    const sameDay = new Date(eventDateTime);
    sameDay.setHours(sameDay.getHours() - 3);
    
    const notifications = [];
    
    if (oneDayBefore > now) {
      notifications.push({
        type: 'reminder_1day',
        scheduled: oneDayBefore,
      });
    }
    
    if (sameDay > now) {
      notifications.push({
        type: 'reminder_same_day',
        scheduled: sameDay,
      });
    }
    
    // Insert notifications
    for (const notif of notifications) {
      const id = require('uuid').v4();
      db.prepare(`
        INSERT INTO event_notifications (id, attendee_id, event_id, type, scheduled_at, status)
        VALUES (?, ?, ?, ?, ?, 'pending')
      `).run(id, attendeeId, eventId, notif.type, notif.scheduled.toISOString());
    }
    
    console.log(`[Notifications] Scheduled ${notifications.length} notifications for attendee ${attendeeId}`);
    return notifications.length;
  } catch (error) {
    console.error('[Notifications] Scheduling error:', error);
    throw error;
  }
};

/**
 * Cancel all pending notifications for an attendee
 */
export const cancelNotificationsForAttendee = (attendeeId) => {
  try {
    db.prepare(`
      DELETE FROM event_notifications 
      WHERE attendee_id = ? AND status = 'pending'
    `).run(attendeeId);
    
    console.log(`[Notifications] Cancelled pending notifications for attendee ${attendeeId}`);
  } catch (error) {
    console.error('[Notifications] Cancellation error:', error);
    throw error;
  }
};

/**
 * Get notification stats for an event
 */
export const getEventNotificationStats = (eventId) => {
  try {
    const stats = db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END) as sent,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed
      FROM event_notifications
      WHERE event_id = ?
    `).get(eventId);
    
    return stats;
  } catch (error) {
    console.error('[Notifications] Stats error:', error);
    throw error;
  }
};

export default {
  processPendingNotifications,
  scheduleNotificationsForAttendee,
  cancelNotificationsForAttendee,
  getEventNotificationStats,
};
