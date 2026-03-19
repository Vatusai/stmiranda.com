/**
 * Database Migration V2
 * Migra de estructura monolítica (clients) a arquitectura separada (contacts + inquiries)
 * 
 * Cambios:
 * 1. Renombra clients -> contacts
 * 2. Crea tabla inquiries
 * 3. Migra datos de leads a inquiries vinculadas a contacts
 * 4. Actualiza events para vincular a contacts
 */

import db from './database.js';
import { v4 as uuidv4 } from 'uuid';

console.log('🔄 Iniciando migración a V2...\n');

// Verificar si ya se migró
try {
  const check = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='contacts'").get();
  if (check) {
    console.log('✅ La base de datos ya está en V2 (tabla contacts existe)');
    process.exit(0);
  }
} catch (e) {
  // Continuar con migración
}

db.exec('BEGIN TRANSACTION');

try {
  // ============================================
  // 1. CREAR NUEVA TABLA contacts
  // ============================================
  console.log('📦 Creando tabla contacts...');
  
  db.exec(`
    CREATE TABLE contacts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      country TEXT DEFAULT 'Costa Rica',
      city TEXT,
      first_contact DATE DEFAULT CURRENT_DATE,
      -- NUEVO: Tipo de relación (fan, lead, client, fan_lead, alumni)
      relationship_type TEXT DEFAULT 'lead',
      -- NUEVO: Preferencias de comunicación
      wants_concert_updates INTEGER DEFAULT 0,
      wants_private_event_info INTEGER DEFAULT 1,
      -- NUEVO: Origen del contacto
      source TEXT DEFAULT 'manual',
      source_details TEXT,
      notes TEXT,
      tags TEXT, -- JSON array
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // ============================================
  // 2. MIGRAR DATOS DE clients A contacts
  // ============================================
  console.log('📋 Migrando datos de clients a contacts...');
  
  const oldClients = db.prepare('SELECT * FROM clients').all();
  
  for (const client of oldClients) {
    // Determinar relationship_type basado en datos existentes
    let relationshipType = 'lead';
    if (client.events_count > 0) {
      relationshipType = 'client';
    } else if (client.status === 'inactive') {
      relationshipType = 'alumni';
    }
    
    // Si tiene event_type pero no eventos, es lead
    if (client.event_type && client.events_count === 0) {
      relationshipType = 'lead';
    }
    
    db.prepare(`
      INSERT INTO contacts (
        id, name, email, phone, country, city, first_contact,
        relationship_type, wants_concert_updates, wants_private_event_info,
        source, notes, tags, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      client.id,
      client.name,
      client.email,
      client.phone,
      client.country,
      client.city,
      client.first_contact,
      relationshipType,
      0, // wants_concert_updates - default false para migración
      1, // wants_private_event_info
      'migrated_v1',
      client.notes,
      client.tags,
      client.created_at,
      client.updated_at
    );
  }
  
  console.log(`   ✓ Migrados ${oldClients.length} contactos`);

  // ============================================
  // 3. CREAR TABLA inquiries (Pipeline Comercial)
  // ============================================
  console.log('📦 Creando tabla inquiries...');
  
  db.exec(`
    CREATE TABLE inquiries (
      id TEXT PRIMARY KEY,
      contact_id TEXT NOT NULL,
      -- Datos del evento solicitado
      event_type TEXT,
      event_date DATE,
      event_time TEXT,
      location TEXT,
      guests TEXT,
      budget TEXT,
      -- Pipeline status: nuevo, pendiente, confirmado, cancelado, cerrado
      status TEXT DEFAULT 'nuevo',
      -- Comunicación
      message TEXT,
      notes TEXT,
      -- Tracking
      source TEXT DEFAULT 'website',
      source_details TEXT,
      assigned_to TEXT,
      -- Fechas importantes
      first_contact_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_contact_date DATETIME,
      follow_up_date DATE,
      -- Vínculo a evento confirmado
      event_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE
    );
  `);

  // ============================================
  // 4. MIGRAR leads A inquiries
  // ============================================
  console.log('📋 Migrando leads a inquiries...');
  
  const oldLeads = db.prepare('SELECT * FROM leads').all();
  
  for (const lead of oldLeads) {
    // Buscar o crear contacto para este lead
    let contactId = null;
    
    if (lead.email) {
      const existing = db.prepare('SELECT id FROM contacts WHERE email = ?').get(lead.email);
      if (existing) {
        contactId = existing.id;
        // Actualizar relationship_type si es necesario
        db.prepare(`
          UPDATE contacts 
          SET relationship_type = CASE 
            WHEN relationship_type = 'fan' THEN 'fan_lead'
            ELSE relationship_type 
          END,
          updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(contactId);
      }
    }
    
    // Si no existe contacto, crear uno
    if (!contactId) {
      contactId = uuidv4();
      db.prepare(`
        INSERT INTO contacts (
          id, name, email, phone, relationship_type, source, notes, created_at
        ) VALUES (?, ?, ?, ?, 'lead', ?, ?, ?)
      `).run(
        contactId,
        lead.name,
        lead.email,
        lead.phone,
        lead.source || 'website',
        lead.notes,
        lead.created_at
      );
    }
    
    // Crear inquiry
    const inquiryId = uuidv4();
    
    // Mapear status antiguo a nuevo
    let newStatus = 'nuevo';
    if (lead.status === 'contacted') newStatus = 'pendiente';
    if (lead.status === 'converted') newStatus = 'confirmado';
    if (lead.status === 'closed') newStatus = 'cerrado';
    
    db.prepare(`
      INSERT INTO inquiries (
        id, contact_id, event_type, event_date, guests, budget,
        status, message, notes, source, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      inquiryId,
      contactId,
      lead.event_type,
      lead.event_date,
      lead.guests,
      lead.budget,
      newStatus,
      lead.message,
      lead.notes,
      lead.source || 'website',
      lead.created_at,
      lead.updated_at
    );
  }
  
  console.log(`   ✓ Migrados ${oldLeads.length} leads a inquiries`);

  // ============================================
  // 5. ACTUALIZAR TABLA events
  // ============================================
  console.log('📦 Actualizando tabla events...');
  
  // Renombrar client_id a contact_id
  db.exec(`
    CREATE TABLE events_new (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      contact_id TEXT,
      inquiry_id TEXT,
      client_name TEXT,
      date DATE NOT NULL,
      time TEXT,
      duration TEXT,
      type TEXT,
      location TEXT,
      status TEXT DEFAULT 'pending',
      budget INTEGER,
      description TEXT,
      services TEXT,
      notes TEXT,
      google_calendar_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE SET NULL,
      FOREIGN KEY (inquiry_id) REFERENCES inquiries(id) ON DELETE SET NULL
    );
  `);
  
  // Migrar datos
  db.exec(`
    INSERT INTO events_new (
      id, title, contact_id, client_name, date, time, duration,
      type, location, status, budget, description, services, notes,
      google_calendar_id, created_at, updated_at
    )
    SELECT 
      id, title, client_id, client_name, date, time, duration,
      type, location, status, budget, description, services, notes,
      google_calendar_id, created_at, updated_at
    FROM events;
  `);
  
  db.exec('DROP TABLE events');
  db.exec('ALTER TABLE events_new RENAME TO events');
  
  console.log('   ✓ Tabla events actualizada');

  // ============================================
  // 6. ELIMINAR TABLAS ANTIGUAS
  // ============================================
  console.log('🗑️  Eliminando tablas antiguas...');
  
  db.exec('DROP TABLE IF EXISTS clients');
  db.exec('DROP TABLE IF EXISTS leads');
  
  console.log('   ✓ Tablas antiguas eliminadas');

  // ============================================
  // 7. CREAR ÍNDICES
  // ============================================
  console.log('📇 Creando índices...');
  
  db.exec(`
    CREATE INDEX idx_contacts_email ON contacts(email);
    CREATE INDEX idx_contacts_relationship ON contacts(relationship_type);
    CREATE INDEX idx_contacts_created ON contacts(created_at);
    
    CREATE INDEX idx_inquiries_contact ON inquiries(contact_id);
    CREATE INDEX idx_inquiries_status ON inquiries(status);
    CREATE INDEX idx_inquiries_date ON inquiries(event_date);
    CREATE INDEX idx_inquiries_created ON inquiries(created_at);
    
    CREATE INDEX idx_events_contact ON events(contact_id);
    CREATE INDEX idx_events_inquiry ON events(inquiry_id);
    CREATE INDEX idx_events_date ON events(date);
    CREATE INDEX idx_events_status ON events(status);
  `);
  
  console.log('   ✓ Índices creados');

  // ============================================
  // 8. CREAR VISTAS PARA ADMIN
  // ============================================
  console.log('👁️  Creando vistas...');
  
  // Vista: Pipeline completo (contactos + cotizaciones)
  db.exec(`
    CREATE VIEW pipeline_view AS
    SELECT 
      i.id as inquiry_id,
      i.status as inquiry_status,
      i.event_type,
      i.event_date,
      i.location,
      i.budget,
      i.guests,
      i.created_at as inquiry_date,
      c.id as contact_id,
      c.name as contact_name,
      c.email as contact_email,
      c.phone as contact_phone,
      c.city,
      c.relationship_type
    FROM inquiries i
    JOIN contacts c ON i.contact_id = c.id;
  `);
  
  console.log('   ✓ Vistas creadas');

  db.exec('COMMIT');
  
  console.log('\n🎉 MIGRACIÓN V2 COMPLETADA EXITOSAMENTE');
  console.log('\nResumen:');
  console.log(`  • ${oldClients.length} contactos migrados`);
  console.log(`  • ${oldLeads.length} cotizaciones creadas`);
  console.log('  • Nueva estructura: contacts + inquiries + events');
  console.log('\nPróximos pasos:');
  console.log('  1. Reiniciar el servidor backend');
  console.log('  2. Actualizar el frontend (nuevas rutas API)');
  console.log('  3. Usar el panel de Cotizaciones para pipeline comercial');
  
} catch (error) {
  db.exec('ROLLBACK');
  console.error('\n❌ ERROR EN MIGRACIÓN:', error.message);
  console.error(error.stack);
  process.exit(1);
}
