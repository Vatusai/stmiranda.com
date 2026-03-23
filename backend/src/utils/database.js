/**
 * Database Connection
 * SQLite3 para desarrollo local (fácil de migrar a PostgreSQL después)
 */
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../database/app.db');

// Crear conexión
const db = new Database(DB_PATH);

// Habilitar foreign keys
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Migrations: add new columns without breaking existing data
try { db.exec(`ALTER TABLE users ADD COLUMN phone TEXT`); } catch {}
try { db.exec(`ALTER TABLE events ADD COLUMN slug TEXT`); } catch {}
// Backfill slugs for events that have none
try {
  const toSlug = t => t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-').substring(0, 80);
  const missing = db.prepare("SELECT id, title FROM events WHERE slug IS NULL OR slug = ''").all();
  const upd = db.prepare('UPDATE events SET slug = ? WHERE id = ?');
  for (const ev of missing) {
    let base = toSlug(ev.title || 'evento') || 'evento', slug = base, i = 2;
    while (db.prepare('SELECT id FROM events WHERE slug = ? AND id != ?').get(slug, ev.id)) slug = `${base}-${i++}`;
    upd.run(slug, ev.id);
  }
} catch {}

console.log('📦 Database connected:', DB_PATH);

export default db;
