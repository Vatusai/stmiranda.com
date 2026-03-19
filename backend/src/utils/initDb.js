/**
 * Database Initialization
 * Crea las tablas y datos iniciales
 */
import db from './database.js';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

console.log('🔄 Initializing database...');

// Migrations: add columns that may not exist in older databases
try { db.exec(`ALTER TABLE users ADD COLUMN phone TEXT`); } catch {}

// Crear tablas
db.exec(`
  -- Tabla de usuarios (admin)
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'admin',
    avatar TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Tabla de clientes
  CREATE TABLE IF NOT EXISTS clients (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    country TEXT DEFAULT 'Costa Rica',
    city TEXT,
    first_contact DATE DEFAULT CURRENT_DATE,
    event_type TEXT,
    status TEXT DEFAULT 'new',
    notes TEXT,
    events_count INTEGER DEFAULT 0,
    last_event DATE,
    tags TEXT, -- JSON array
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Tabla de eventos
  CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    client_id TEXT,
    client_name TEXT,
    date DATE NOT NULL,
    time TEXT,
    duration TEXT,
    type TEXT,
    location TEXT,
    status TEXT DEFAULT 'pending',
    budget INTEGER,
    description TEXT,
    services TEXT, -- JSON array
    notes TEXT,
    google_calendar_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL
  );

  -- Tabla de leads (solicitudes)
  CREATE TABLE IF NOT EXISTS leads (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    event_type TEXT,
    event_date DATE,
    guests TEXT,
    budget TEXT,
    message TEXT,
    status TEXT DEFAULT 'new',
    source TEXT DEFAULT 'website',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
  );

  -- Tabla de servicios
  CREATE TABLE IF NOT EXISTS services (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price INTEGER,
    duration TEXT,
    includes TEXT -- JSON array
  );

  -- Tabla de logs de actividad
  CREATE TABLE IF NOT EXISTS activity_logs (
    id TEXT PRIMARY KEY,
    type TEXT,
    action TEXT,
    description TEXT,
    user_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Tabla de logs de emails enviados
  CREATE TABLE IF NOT EXISTS email_logs (
    id TEXT PRIMARY KEY,
    to_email TEXT NOT NULL,
    subject TEXT,
    template TEXT,
    status TEXT DEFAULT 'sent',
    error_message TEXT,
    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    message_id TEXT,
    opened_at DATETIME,
    clicked_at DATETIME
  );

  -- Tabla de newsletters/campañas
  CREATE TABLE IF NOT EXISTS campaigns (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    content TEXT,
    template_type TEXT DEFAULT 'fan_newsletter',
    target_audience TEXT DEFAULT 'fans', -- fans, leads, clients, all
    status TEXT DEFAULT 'draft', -- draft, scheduled, sending, sent
    scheduled_at DATETIME,
    sent_at DATETIME,
    sent_count INTEGER DEFAULT 0,
    open_count INTEGER DEFAULT 0,
    click_count INTEGER DEFAULT 0,
    created_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Tabla de tokens de Google Calendar (OAuth2)
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

  -- Índices para búsquedas rápidas
  CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
  CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
  CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
  CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
  CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
  CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at);
`);

console.log('✅ Tables created');

// Insertar usuario admin por defecto
const adminId = uuidv4();
const adminPassword = bcrypt.hashSync('admin123', 10);

const insertAdmin = db.prepare(`
  INSERT OR IGNORE INTO users (id, name, email, password, role)
  VALUES (?, ?, ?, ?, ?)
`);

insertAdmin.run(adminId, 'Stephanie Miranda', 'stephanie@stmiranda.com', adminPassword, 'admin');

console.log('✅ Admin user created (email: stephanie@stmiranda.com, password: admin123)');

// Insertar servicios por defecto
const services = [
  {
    id: uuidv4(),
    name: 'Ceremonia Nupcial',
    description: 'Música para ceremonia civil o religiosa',
    price: 800,
    duration: '1 hora',
    includes: JSON.stringify(['Ensayo previo', 'Coordinación con oficiante', 'Selección de repertorio'])
  },
  {
    id: uuidv4(),
    name: 'Cóctel de Bienvenida',
    description: 'Ambientación musical para recepción de invitados',
    price: 600,
    duration: '2 horas',
    includes: JSON.stringify(['Equipo de sonido', 'Repertorio personalizado', 'Microfono para protocolo'])
  },
  {
    id: uuidv4(),
    name: 'Evento Corporativo',
    description: 'Música para eventos empresariales',
    price: 1500,
    duration: '4 horas',
    includes: JSON.stringify(['Sonido profesional', 'Coordinación con event planner', 'Repertorio adaptado'])
  },
  {
    id: uuidv4(),
    name: 'Paquete Completo Boda',
    description: 'Ceremonia, cóctel y recepción',
    price: 2800,
    duration: '6 horas',
    includes: JSON.stringify(['Todo lo incluido en servicios individuales', 'Descuento especial', 'Planificación completa'])
  }
];

const insertService = db.prepare(`
  INSERT OR IGNORE INTO services (id, name, description, price, duration, includes)
  VALUES (?, ?, ?, ?, ?, ?)
`);

services.forEach(service => {
  insertService.run(service.id, service.name, service.description, service.price, service.duration, service.includes);
});

console.log('✅ Default services created');

// Insertar algunos clientes de ejemplo
const sampleClients = [
  {
    id: uuidv4(),
    name: 'María Elena García',
    email: 'maria.garcia@email.com',
    phone: '+506 8888-9999',
    country: 'Costa Rica',
    city: 'San José',
    event_type: 'Boda',
    status: 'active',
    notes: 'Prefiere música jazz para la ceremonia.',
    tags: JSON.stringify(['VIP'])
  },
  {
    id: uuidv4(),
    name: 'Carlos Andrés López',
    email: 'carlos.lopez@empresacr.com',
    phone: '+506 7777-8888',
    country: 'Costa Rica',
    city: 'Heredia',
    event_type: 'Corporativo',
    status: 'new',
    notes: 'Evento anual de la empresa.',
    tags: JSON.stringify(['Potencial'])
  },
  {
    id: uuidv4(),
    name: 'Ana Lucía Martínez',
    email: 'ana.martinez@email.com',
    phone: '+506 6666-7777',
    country: 'Costa Rica',
    city: 'Cartago',
    event_type: 'Cumpleaños',
    status: 'active',
    notes: 'Celebración de 50 años.',
    tags: JSON.stringify([])
  }
];

const insertClient = db.prepare(`
  INSERT OR IGNORE INTO clients (id, name, email, phone, country, city, event_type, status, notes, tags)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

sampleClients.forEach(client => {
  insertClient.run(
    client.id, client.name, client.email, client.phone, 
    client.country, client.city, client.event_type, 
    client.status, client.notes, client.tags
  );
});

console.log('✅ Sample clients created');

// Insertar eventos de ejemplo
const today = new Date();
const sampleEvents = [
  {
    id: uuidv4(),
    title: 'Boda García-Soto',
    client_name: 'María Elena García',
    date: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +7 días
    time: '16:00',
    duration: '5 horas',
    type: 'Boda',
    location: 'Hotel Real Intercontinental, San José',
    status: 'confirmed',
    budget: 3500,
    description: 'Ceremonia y recepción. 150 invitados.',
    services: JSON.stringify(['Ceremonia', 'Cóctel', 'Recepción'])
  },
  {
    id: uuidv4(),
    title: 'Evento Corporativo ACME',
    client_name: 'Carlos Andrés López',
    date: new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +14 días
    time: '18:00',
    duration: '4 horas',
    type: 'Corporativo',
    location: 'Centro de Convenciones, Heredia',
    status: 'confirmed',
    budget: 2800,
    description: 'Cena de gala anual.',
    services: JSON.stringify(['Ambientación', 'Show principal'])
  },
  {
    id: uuidv4(),
    title: 'Cumpleaños Familia Martínez',
    client_name: 'Ana Lucía Martínez',
    date: new Date(today.getTime() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +21 días
    time: '19:00',
    duration: '3 horas',
    type: 'Cumpleaños',
    location: 'Residencia privada, Cartago',
    status: 'quoted',
    budget: 1200,
    description: 'Celebración sorpresa de 50 años.',
    services: JSON.stringify(['Show sorpresa', 'Ambientación'])
  }
];

const insertEvent = db.prepare(`
  INSERT OR IGNORE INTO events (id, title, client_name, date, time, duration, type, location, status, budget, description, services)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

sampleEvents.forEach(event => {
  insertEvent.run(
    event.id, event.title, event.client_name, event.date, event.time,
    event.duration, event.type, event.location, event.status, 
    event.budget, event.description, event.services
  );
});

console.log('✅ Sample events created');

// Insertar leads de ejemplo
const sampleLeads = [
  {
    id: uuidv4(),
    name: 'María Fernanda Vega',
    email: 'mvega@email.com',
    phone: '+506 9999-0000',
    event_type: 'Boda',
    event_date: new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    guests: '120',
    budget: '3000-5000',
    message: 'Nos encantaría tener música en vivo para nuestra boda.',
    status: 'new',
    source: 'website'
  },
  {
    id: uuidv4(),
    name: 'Daniel Campos',
    email: 'dcampos@company.com',
    phone: '+506 8888-1111',
    event_type: 'Corporativo',
    event_date: new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    guests: '300',
    budget: '5000+',
    message: 'Evento anual de la empresa. Necesitamos propuesta formal.',
    status: 'contacted',
    source: 'referral'
  }
];

const insertLead = db.prepare(`
  INSERT OR IGNORE INTO leads (id, name, email, phone, event_type, event_date, guests, budget, message, status, source)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

sampleLeads.forEach(lead => {
  insertLead.run(
    lead.id, lead.name, lead.email, lead.phone, lead.event_type,
    lead.event_date, lead.guests, lead.budget, lead.message, 
    lead.status, lead.source
  );
});

console.log('✅ Sample leads created');

console.log('\n🎉 Database initialization complete!');
console.log('📧 Admin login: stephanie@stmiranda.com / admin123');
