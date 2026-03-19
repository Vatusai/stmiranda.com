/**
 * Migration: Add selected calendar support
 * Agrega columna para almacenar el calendario seleccionado
 */
import db from './database.js';

console.log('🔄 Migrating database: Adding calendar selection support...');

try {
  // Verificar si la columna selected_calendar_id existe
  const tableInfo = db.prepare("PRAGMA table_info(google_tokens)").all();
  const hasSelectedCalendar = tableInfo.some(col => col.name === 'selected_calendar_id');
  
  if (!hasSelectedCalendar) {
    db.exec(`ALTER TABLE google_tokens ADD COLUMN selected_calendar_id TEXT;`);
    console.log('✅ selected_calendar_id column added to google_tokens table');
  } else {
    console.log('ℹ️ selected_calendar_id column already exists');
  }
  
  console.log('\n🎉 Migration completed successfully!');
  
} catch (error) {
  console.error('❌ Migration failed:', error.message);
  process.exit(1);
}

process.exit(0);
