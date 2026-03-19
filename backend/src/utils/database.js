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

console.log('📦 Database connected:', DB_PATH);

export default db;
