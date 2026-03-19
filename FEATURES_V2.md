# ✨ Funcionalidades V2 - Comunidad y Pipeline Separados

Documentación detallada de las nuevas funcionalidades implementadas.

---

## 1. 🎵 Formulario Público de Registro de Fans

### Descripción
Permite a los visitantes del sitio registrarse como **fans** sin necesidad de solicitar una cotización de evento privado.

### Ubicación
- Componente: `src/components/fan-registration/`
- Página: Accesible desde cualquier parte del sitio público

### Características
- ✅ Campos: Nombre, Email, Ciudad, País
- ✅ Opción "Quiero updates de conciertos" (por defecto activo)
- ✅ Opción "También me interesan eventos privados"
- ✅ Crea contacto con `relationship_type = 'fan'`
- ✅ No crea cotización automáticamente

### Uso
```jsx
// Botón flotante
<FanRegistrationButton variant="floating" />

// Modal controlado
<FanRegistrationModal isOpen={show} onClose={handleClose} />

// Formulario directo
<FanRegistrationForm />
```

### Diferencias con formulario de cotización
| Aspecto | Formulario Fan | Formulario Cotización |
|---------|---------------|----------------------|
| Propósito | Unirse a comunidad | Solicitar evento privado |
| Crea contacto | ✅ Sí | ✅ Sí |
| Crea inquiry | ❌ No | ✅ Sí |
| relationship_type | 'fan' | 'lead' |
| Email automation | Newsletter | Follow-up comercial |

---

## 2. 📧 Sistema de Email Automation

### Descripción
Sistema completo de envío de emails con templates profesionales y segmentación.

### Backend
- Servicio: `backend/src/services/emailService.js`
- Rutas: `backend/src/routes/emails.js`
- Templates HTML responsivos incluidos

### Templates Disponibles

#### 2.1 Newsletter para Fans
**Uso:** Comunicaciones generales, anuncios de conciertos
**Destinatarios:** Contactos con `wants_concert_updates = true`

```javascript
await sendNewsletterToFans({
  subject: '🎵 Nuevo concierto anunciado',
  content: '<h2>¡Hola!</h2><p>...</p>',
  ctaUrl: 'https://stmiranda.com/eventos',
  ctaText: 'Ver detalles'
});
```

#### 2.2 Follow-up de Cotización
**Uso:** Seguimiento de leads en pipeline
**Trigger:** Manual desde panel o automático

```javascript
await sendInquiryFollowUp(inquiryId, 'Mensaje personalizado opcional');
```

#### 2.3 Confirmación de Evento
**Uso:** Cuando una cotización se confirma
**Incluye:** Detalles del evento, próximos pasos, contacto de Stephanie

#### 2.4 Recordatorio de Evento
**Uso:** 24 horas antes del evento
**Automático:** Se ejecuta vía cron job

### Panel de Email Marketing
**Ruta:** `/admin/emails`

Funcionalidades:
- Crear y enviar newsletters
- Ver estadísticas de envíos
- Gestión de templates
- Historial de campañas

### Configuración SMTP
Variables de entorno en `backend/.env`:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=stephanie@stmiranda.com
SMTP_PASS=tu-app-password
FROM_EMAIL=stephanie@stmiranda.com
```

---

## 3. 📥 Exportación por Segmentos

### Descripción
Permite exportar listas de contactos filtradas por múltiples criterios para usar en marketing.

### Formatos
- **CSV** (por defecto) - Compatible con Excel, Google Sheets, Mailchimp
- **JSON** (opcional) - Para integraciones API

### Segmentos Predefinidos

#### 3.1 Fans Suscritos
**Endpoint:** `GET /api/exports/fans`
**Filtro:** `wants_concert_updates = 1`

#### 3.2 Leads Activos
**Endpoint:** `GET /api/exports/leads?status=activo`
**Filtro:** Cotizaciones en estado 'nuevo' o 'pendiente'

#### 3.3 Clientes Confirmados
**Endpoint:** `GET /api/exports/clients`
**Filtro:** Contactos con `relationship_type IN ('client', 'fan_lead')`

### Segmento Personalizado
**Endpoint:** `POST /api/exports/segment`

Filtros disponibles:
```javascript
{
  relationship_types: ['fan', 'fan_lead'],  // Tipos de relación
  wants_concert_updates: true,               // Solo fans de conciertos
  wants_private_event_info: false,           // No interesados en privados
  city: 'San José',                          // Por ciudad
  source: 'instagram',                       // Por origen
  created_after: '2024-01-01',              // Fechas
  created_before: '2024-12-31'
}
```

### Panel de Exportaciones
**Ruta:** `/admin/exports`

- Exportes rápidos con un click
- Constructor de segmentos visuales
- Preview de cantidad antes de descargar

---

## 4. 📊 Estadísticas Separadas

### Descripción
Dashboard y reportes que distinguen claramente entre métricas de comunidad y métricas de negocio.

### Endpoints de Stats V2

#### 4.1 Estadísticas de Comunidad
**Endpoint:** `GET /api/stats-v2/community`

Métricas incluidas:
- Total de contactos
- Distribución por tipo de relación (fan, lead, client, etc.)
- Fans que quieren updates de conciertos
- Interesados en eventos privados
- Crecimiento mensual
- Por fuente (website, instagram, etc.)
- Por ciudad (top 10)

#### 4.2 Estadísticas de Pipeline
**Endpoint:** `GET /api/stats-v2/pipeline`

Métricas incluidas:
- Cotizaciones por estado (nuevo, pendiente, confirmado, etc.)
- Valor potencial del pipeline
- Tasa de conversión
- Tiempo promedio de conversión
- Cotizaciones por tipo de evento
- Pipeline mensual (últimos 12 meses)

#### 4.3 Estadísticas de Ingresos
**Endpoint:** `GET /api/stats-v2/revenue`

Métricas incluidas:
- Ingresos totales confirmados
- Ingresos por tipo de evento
- Promedio por evento
- Ingresos mensuales
- Proyección de pipeline

### Dashboard Actualizado
**Ruta:** `/admin/dashboard`

Secciones separadas visualmente:
1. **Comunidad** (icono corazón rosa) - Fans y seguidores
2. **Pipeline Comercial** (icono portapapeles violeta) - Cotizaciones
3. **Ingresos** (icono dólar esmeralda) - Revenue

---

## 📁 Archivos Nuevos y Modificados

### Backend
```
backend/
├── src/
│   ├── services/
│   │   └── emailService.js       # NUEVO - Sistema de emails
│   ├── routes/
│   │   ├── emails.js             # NUEVO - API de emails
│   │   ├── exports.js            # NUEVO - API de exportaciones
│   │   └── stats-v2.js           # NUEVO - Stats separadas
│   └── utils/
│       └── initDb.js             # MODIFICADO - Tablas email_logs, campaigns
```

### Frontend
```
src/
├── components/
│   └── fan-registration/
│       ├── FanRegistrationForm.jsx   # NUEVO
│       └── FanRegistrationModal.jsx  # NUEVO
├── admin/
│   └── pages/
│       ├── Contacts.jsx              # MODIFICADO - Mejorado V2
│       ├── Inquiries.jsx             # MODIFICADO - Pipeline comercial
│       ├── EmailMarketing.jsx        # NUEVO
│       ├── Exports.jsx               # NUEVO
│       └── Dashboard.jsx             # MODIFICADO - Stats separadas
├── services/
│   └── api.js                        # MODIFICADO - Nuevos endpoints
└── router/
    └── AppRouter.jsx                 # MODIFICADO - Nuevas rutas
```

---

## 🚀 Instrucciones de Uso

### Configurar Email (SMTP)

1. Crear archivo `backend/.env`:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-app-password-de-gmail
FROM_EMAIL=stephanie@stmiranda.com
```

2. Para Gmail, generar "App Password" en:
   - Configuración de Google → Seguridad → Contraseñas de aplicaciones

3. Verificar conexión:
```bash
curl http://localhost:3001/api/emails/verify
```

### Primer Newsletter

1. Ir a `/admin/emails`
2. Click en "Crear Newsletter"
3. Escribir asunto y contenido HTML
4. Preview mostrará cantidad de suscriptores
5. Click en "Enviar"

### Exportar Lista de Fans

1. Ir a `/admin/exports`
2. Click en "Exportar CSV" en tarjeta "Fans Suscritos"
3. O usar "Segmento Personalizado" para filtros avanzados
4. Importar CSV en Mailchimp, SendGrid, etc.

---

## 📊 Flujo de Datos

### Escenario: Nuevo Fan
```
1. Visitante llena formulario Fan
   ↓
2. Se crea Contacto (relationship_type='fan')
   ↓
3. Aparece en Dashboard → sección Comunidad
   ↓
4. Incluido en exportación "Fans Suscritos"
   ↓
5. Recibe newsletters futuras
```

### Escenario: Fan Solicita Cotización
```
1. Fan existente solicita cotización
   ↓
2. Contacto actualiza a relationship_type='fan_lead'
   ↓
3. Se crea Inquiry vinculada al contacto
   ↓
4. Aparece en Dashboard → ambas secciones
   ↓
5. Follow-up automático enviado
   ↓
6. Stephanie gestiona en Pipeline
```

---

## 🔒 Seguridad y Privacidad

- ✅ Emails enviados solo a contactos con consentimiento
- ✅ Opción "wants_concert_updates" respeta preferencias
- ✅ Unsubscribe link incluido en todos los newsletters
- ✅ Logs de emails para auditoría
- ✅ Rate limiting: 5 emails/segundo

---

## 📝 Próximas Mejoras Sugeridas

1. **Automatización avanzada:**
   - Drip campaigns (secuencias de emails automáticas)
   - Trigger basados en comportamiento

2. **Integraciones:**
   - Mailchimp API sync
   - WhatsApp Business API
   - Calendly para bookings

3. **Analytics:**
   - Tracking de aperturas y clicks
   - Heatmaps de engagement
   - A/B testing de newsletters

---

**Documentación completa del sistema V2**
