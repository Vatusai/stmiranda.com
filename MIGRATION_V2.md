# 🚀 Migración a V2 - Arquitectura Separada

Esta guía explica la nueva arquitectura del sistema y cómo migrar desde V1.

---

## 📋 Resumen de Cambios

### Problema en V1
La tabla `clients` mezclaba:
- Datos de contacto (nombre, email, teléfono)
- Datos de pipeline (event_type, status de cotización)
- No había forma de representar un "fan" sin evento asociado

### Solución en V2
Separación en **tres capas distintas**:

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│    contacts     │     │    inquiries     │     │     events      │
│  (Community)    │◄────┤   (Pipeline)     │────►┤  (Confirmed)    │
├─────────────────┤     ├──────────────────┤     ├─────────────────┤
│ id              │     │ id               │     │ id              │
│ name            │     │ contact_id       │     │ contact_id      │
│ email           │     │ event_type       │     │ inquiry_id      │
│ phone           │     │ event_date       │     │ title           │
│ city/country    │     │ location         │     │ date            │
│ relationship_   │     │ budget           │     │ status          │
│   type          │     │ status           │     └─────────────────┘
│ wants_updates   │     │ (nuevo/pendiente/│
│ source          │     │  confirmado/etc) │
└─────────────────┘     └──────────────────┘
```

---

## 🔄 Estados y Tipos

### relationship_type (en contacts)
| Valor | Significado |
|-------|-------------|
| `fan` | Solo quiere updates de conciertos |
| `lead` | Ha mostrado interés en evento privado |
| `client` | Ya ha contratado/evento confirmado |
| `fan_lead` | Es fan Y ha solicitado cotización |
| `alumni` | Cliente anterior, no activo |

### status (en inquiries) - SOLO para pipeline comercial
| Valor | Significado |
|-------|-------------|
| `nuevo` | Cotización recién recibida |
| `pendiente` | En seguimiento, esperando respuesta |
| `confirmado` | Cliente confirmó, listo para crear evento |
| `cancelado` | Cliente canceló/no procedió |
| `cerrado` | Cerrado por otro motivo |

---

## 🚀 Instrucciones de Migración

### 1. Hacer backup de la base de datos
```bash
cp backend/database/app.db backend/database/app.db.backup
```

### 2. Ejecutar migración
```bash
npm run migrate-v2
```

Este script:
- Crea tabla `contacts` (migrando datos de `clients`)
- Crea tabla `inquiries` (migrando datos de `leads`)
- Actualiza tabla `events` (vinculando a contacts)
- Elimina tablas antiguas
- Crea índices y vistas

### 3. Reiniciar servidor
```bash
# Detener servidor actual (Ctrl+C)
./start-dev.sh
```

---

## 📊 Nuevas Rutas en Admin Panel

| Ruta | Descripción |
|------|-------------|
| `/admin/contacts` | Gestión de contactos (fans, leads, clientes) |
| `/admin/inquiries` | Pipeline comercial (cotizaciones) |

### Redirecciones legacy
- `/admin/clients` → `/admin/contacts`
- `/api/clients` → `/api/contacts`
- `/api/leads` → `/api/inquiries`

---

## 💡 Escenarios de Uso

### Escenario 1: Fan solo
1. Persona se registra en sitio
2. Se crea contacto con `relationship_type = 'fan'`
3. Aparece en Contactos, NO en Cotizaciones
4. Recibe updates de conciertos

### Escenario 2: Lead (cotización)
1. Persona llena formulario de cotización
2. Se crea contacto con `relationship_type = 'lead'`
3. Se crea inquiry vinculada al contacto
4. Aparece en AMBAS secciones

### Escenario 3: Fan → Lead
1. Fan existente solicita cotización
2. Contacto actualiza a `relationship_type = 'fan_lead'`
3. Se crea inquiry vinculada
4. Pipeline muestra el historial completo

### Escenario 4: Confirmación
1. Inquiry en estado `confirmado`
2. Botón "Crear Evento" genera evento vinculado
3. Contacto actualiza a `relationship_type = 'client'`
4. Evento aparece en Calendario

---

## 🔌 API Endpoints Nuevos

### Contacts
```
GET    /api/contacts              # Listar con filtros
GET    /api/contacts/:id          # Ver detalle + historial
POST   /api/contacts              # Crear contacto
PUT    /api/contacts/:id          # Actualizar
DELETE /api/contacts/:id          # Eliminar
POST   /api/contacts/:id/convert  # Cambiar relationship_type
```

### Inquiries
```
GET    /api/inquiries             # Listar pipeline
GET    /api/inquiries/:id         # Ver detalle
POST   /api/inquiries             # Crear cotización
PUT    /api/inquiries/:id         # Actualizar
POST   /api/inquiries/:id/status  # Cambiar estado
POST   /api/inquiries/:id/convert-to-event  # Crear evento
DELETE /api/inquiries/:id         # Eliminar
```

---

## ✅ Checklist Post-Migración

- [ ] Migración ejecuta sin errores
- [ ] Datos antiguos aparecen en nuevas tablas
- [ ] Contactos muestran historial correcto
- [ ] Pipeline muestra cotizaciones
- [ ] Crear nuevo contacto funciona
- [ ] Crear nueva cotización funciona
- [ ] Cambiar estados en pipeline funciona
- [ ] Convertir a evento funciona

---

## ⚠️ Si algo falla

### Rollback
```bash
# Restaurar backup
cp backend/database/app.db.backup backend/database/app.db

# O regenerar desde cero
npm run reset-db
```

### Debug
```bash
# Verificar estructura
sqlite3 backend/database/app.db ".schema"

# Verificar datos
sqlite3 backend/database/app.db "SELECT * FROM contacts LIMIT 5"
sqlite3 backend/database/app.db "SELECT * FROM inquiries LIMIT 5"
```

---

## 🎯 Próximos Pasos Sugeridos

1. **Integrar registro público**: Formulario de fans separado de cotización
2. **Email automation**: Notificaciones diferentes para fans vs leads
3. **Segmentación**: Exportar listas de fans para newsletters
4. **Analytics**: Métricas separadas de comunidad vs pipeline

---

**Arquitectura by Stephanie Miranda Team 🎼**
