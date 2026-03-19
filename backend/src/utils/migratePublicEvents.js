/**
 * Migration: Add Public Events Support
 * Extends event system to support public events with flyers
 */
import db from './database.js';

console.log('🔄 Migrating database: Adding public events support...');

try {
  // Add new columns to events table
  const tableInfo = db.prepare("PRAGMA table_info(events)").all();
  const columns = tableInfo.map(col => col.name);

  // Add visibility column
  if (!columns.includes('visibility')) {
    db.exec(`ALTER TABLE events ADD COLUMN visibility TEXT DEFAULT 'privado';`);
    console.log('✅ visibility column added');
  } else {
    console.log('ℹ️ visibility column already exists');
  }

  // Add event_type column (for public events: gratis/pagado)
  if (!columns.includes('event_type')) {
    db.exec(`ALTER TABLE events ADD COLUMN event_type TEXT;`);
    console.log('✅ event_type column added');
  } else {
    console.log('ℹ️ event_type column already exists');
  }

  // Add flyer_url column
  if (!columns.includes('flyer_url')) {
    db.exec(`ALTER TABLE events ADD COLUMN flyer_url TEXT;`);
    console.log('✅ flyer_url column added');
  } else {
    console.log('ℹ️ flyer_url column already exists');
  }

  // Add external_link column (for ticket purchase)
  if (!columns.includes('external_link')) {
    db.exec(`ALTER TABLE events ADD COLUMN external_link TEXT;`);
    console.log('✅ external_link column added');
  } else {
    console.log('ℹ️ external_link column already exists');
  }

  // Create event_attendees table
  db.exec(`
    CREATE TABLE IF NOT EXISTS event_attendees (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      event_id TEXT NOT NULL,
      status TEXT DEFAULT 'attending',
      registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
    );
  `);
  console.log('✅ event_attendees table created');

  // Create indexes for event_attendees
  db.exec(`CREATE INDEX IF NOT EXISTS idx_attendees_event ON event_attendees(event_id);`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_attendees_user ON event_attendees(user_id);`);
  console.log('✅ Indexes created for event_attendees');

  // Create event_notifications table for scheduled reminders
  db.exec(`
    CREATE TABLE IF NOT EXISTS event_notifications (
      id TEXT PRIMARY KEY,
      attendee_id TEXT NOT NULL,
      event_id TEXT NOT NULL,
      type TEXT NOT NULL,
      scheduled_at DATETIME NOT NULL,
      sent_at DATETIME,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (attendee_id) REFERENCES event_attendees(id) ON DELETE CASCADE,
      FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
    );
  `);
  console.log('✅ event_notifications table created');

  // Create index for notifications
  db.exec(`CREATE INDEX IF NOT EXISTS idx_notifications_pending ON event_notifications(status, scheduled_at);`);
  console.log('✅ Indexes created for event_notifications');

  console.log('\n🎉 Migration completed successfully!');
  console.log('Public events feature is now ready.');

} catch (error) {
  console.error('❌ Migration failed:', error.message);
  process.exit(1);
}

process.exit(0);
