/**
 * Migration: Add Google Tokens Table
 * Agrega la tabla para almacenar tokens de Google Calendar
 */
import db from './database.js';

console.log('🔄 Migrating database: Adding google_tokens table...');

try {
  // Crear tabla de tokens de Google Calendar
  db.exec(`
    CREATE TABLE IF NOT EXISTS google_tokens (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL,
      access_token TEXT NOT NULL,
      refresh_token TEXT,
      expiry_date INTEGER,
      scope TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  
  console.log('✅ google_tokens table created');
  
  // Verificar si la tabla events tiene la columna google_calendar_id
  const tableInfo = db.prepare("PRAGMA table_info(events)").all();
  const hasGoogleCalendarId = tableInfo.some(col => col.name === 'google_calendar_id');
  
  if (!hasGoogleCalendarId) {
    db.exec(`ALTER TABLE events ADD COLUMN google_calendar_id TEXT;`);
    console.log('✅ google_calendar_id column added to events table');
  } else {
    console.log('ℹ️ google_calendar_id column already exists');
  }
  
  console.log('\n🎉 Migration completed successfully!');
  console.log('You can now connect Google Calendar from the admin settings.');
  
} catch (error) {
  console.error('❌ Migration failed:', error.message);
  process.exit(1);
}

process.exit(0);
