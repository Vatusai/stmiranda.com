/**
 * Migration: Add slug column to events table
 * Run with: npm run migrate-slug
 * This migration is also applied automatically on server startup via database.js.
 */
import db from './database.js';

console.log('🔄 Migrating database: Adding slug support to events...');

function toSlug(t) {
  return t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-').substring(0, 80) || 'evento';
}

try {
  const tableInfo = db.prepare('PRAGMA table_info(events)').all();
  const columns = tableInfo.map(c => c.name);

  if (!columns.includes('slug')) {
    db.exec(`ALTER TABLE events ADD COLUMN slug TEXT;`);
    console.log('✅ slug column added');
  } else {
    console.log('ℹ️  slug column already exists');
  }

  // Backfill any events missing a slug
  const missing = db.prepare("SELECT id, title FROM events WHERE slug IS NULL OR slug = ''").all();
  if (missing.length > 0) {
    const stmt = db.prepare('UPDATE events SET slug = ? WHERE id = ?');
    for (const ev of missing) {
      let base = toSlug(ev.title || 'evento'), slug = base, i = 2;
      while (db.prepare('SELECT id FROM events WHERE slug = ? AND id != ?').get(slug, ev.id)) slug = `${base}-${i++}`;
      stmt.run(slug, ev.id);
    }
    console.log(`✅ Backfilled slugs for ${missing.length} event(s)`);
  } else {
    console.log('ℹ️  All events already have slugs');
  }

  // Unique index (best-effort — may already exist or fail on duplicate data)
  try {
    db.exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_events_slug ON events(slug);`);
    console.log('✅ Unique index on events.slug ensured');
  } catch (e) {
    console.warn('⚠️  Could not create unique index:', e.message);
  }

  console.log('\n🎉 Migration completed!');
} catch (error) {
  console.error('❌ Migration failed:', error.message);
  process.exit(1);
}

process.exit(0);
