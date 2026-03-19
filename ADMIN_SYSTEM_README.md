# 🎼 Sistema Web Stephanie Miranda - Documentación Completa

## Resumen del Sistema

Sistema web integral que combina:
1. **Sitio Público** - Landing para clientes potenciales
2. **Panel Administrativo** - Gestión completa del negocio

---

## 📁 Estructura de Archivos

```
/src
├── /admin                    # Panel de administración
│   ├── /components
│   │   ├── AdminHeader.jsx
│   │   ├── AdminSidebar.jsx
│   │   ├── DashboardStats.jsx
│   │   ├── EventCalendar.jsx
│   │   ├── ClientTable.jsx
│   │   ├── StatsCharts.jsx
│   │   └── SettingsForm.jsx
│   ├── /pages
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Calendar.jsx
│   │   ├── Clients.jsx
│   │   ├── Statistics.jsx
│   │   └── Settings.jsx
│   ├── /hooks
│   │   ├── useAuth.js
│   │   ├── useClients.js
│   │   └── useEvents.js
│   └── /layouts
│       └── AdminLayout.jsx
│
├── /components               # Componentes compartidos
│   └── /ui                   # Componentes UI primitivos
│       ├── Button.jsx
│       ├── Input.jsx
│       ├── Card.jsx
│       ├── Badge.jsx
│       ├── Modal.jsx
│       ├── Select.jsx
│       └── DataTable.jsx
│
├── /contexts                 # Contextos de React
│   └── AuthContext.jsx
│
├── /utils                    # Utilidades
│   ├── formatters.js
│   └── mockData.js
│
├── /styles
│   └── admin-theme.css
│
├── /router
│   └── AppRouter.jsx
│
└── App.jsx
```

---

## 🚀 Cómo usar el sistema

### Acceso al Panel Admin

1. Navega a: `http://localhost:5173/admin/login`
2. Credenciales de prueba:
   - **Email:** `stephanie@stmiranda.com`
   - **Password:** `admin123`

### Rutas disponibles

#### Sitio Público
- `/` - Home/Landing
- `/about` - Sobre Stephanie
- `/services` - Servicios
- `/gallery` - Galería
- `/contact` - Contacto
- `/booking` - Solicitud de evento

#### Panel Admin (requiere login)
- `/admin/login` - Login
- `/admin/dashboard` - Dashboard general
- `/admin/calendar` - Calendario de eventos
- `/admin/clients` - Base de clientes (CRM)
- `/admin/stats` - Estadísticas
- `/admin/settings` - Configuración

---

## 🛠️ Implementación Futura - Roadmap

### Fase 1: Backend Básico (Prioridad Alta)

#### 1.1 Base de Datos
```sql
-- Tablas necesarias:
- users (autenticación)
- clients (CRM)
- events (calendario)
- leads (solicitudes)
- services (catálogo)
- activity_logs (auditoría)
```

#### 1.2 API REST Endpoints
```
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me

GET    /api/clients
POST   /api/clients
PUT    /api/clients/:id
DELETE /api/clients/:id

GET    /api/events
POST   /api/events
PUT    /api/events/:id
DELETE /api/events/:id

GET    /api/leads
POST   /api/leads
PUT    /api/leads/:id

GET    /api/stats/overview
GET    /api/stats/visits
GET    /api/stats/revenue
```

#### 1.3 Stack recomendado para VPS
- **Node.js + Express** (API)
- **PostgreSQL** (Base de datos)
- **Redis** (Sesiones/cache)
- **Nginx** (Reverse proxy)
- **PM2** (Process manager)

### Fase 2: Autenticación Real (Prioridad Alta)

#### 2.1 Opciones de implementación:

**Opción A: JWT + Cookies (Recomendada)**
```javascript
// Backend - Login
const token = jwt.sign(
  { userId: user.id, email: user.email },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);

res.cookie('token', token, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000
});
```

**Opción B: OAuth con Google**
```javascript
// Passport.js o similar
passport.use(new GoogleStrategy({
  clientID: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  callbackURL: "/auth/google/callback"
}, (accessToken, refreshToken, profile, done) => {
  // Buscar o crear usuario
}));
```

#### 2.2 Middleware de protección
```javascript
const requireAuth = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: 'No autorizado' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido' });
  }
};
```

### Fase 3: Integraciones (Prioridad Media)

#### 3.1 Google Calendar API
```javascript
// Flujo de sincronización
const syncWithGoogleCalendar = async (event) => {
  const calendarEvent = {
    summary: event.title,
    location: event.location,
    description: event.description,
    start: {
      dateTime: `${event.date}T${event.time}`,
      timeZone: 'America/Costa_Rica',
    },
    end: {
      dateTime: calculateEndTime(event),
      timeZone: 'America/Costa_Rica',
    },
  };
  
  const response = await calendar.events.insert({
    calendarId: 'primary',
    resource: calendarEvent,
  });
  
  // Guardar ID de Google Calendar en DB
  await updateEvent(event.id, { googleCalendarId: response.data.id });
};
```

#### 3.2 WhatsApp Business API (opcional)
- Usar **Twilio** o **Meta Business API**
- Automatizar notificaciones de nuevos leads
- Recordatorios de eventos

#### 3.3 Email Service
- **SendGrid** o **Resend**
- Templates para:
  - Confirmación de solicitud
  - Cotización enviada
  - Recordatorio de evento
  - Agradecimiento post-evento

### Fase 4: Analytics Avanzado (Prioridad Baja)

#### 4.1 Tracking de visitas
```javascript
// Middleware de tracking
const trackVisit = async (req, res, next) => {
  await db.visits.create({
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    page: req.path,
    referrer: req.headers.referer,
    country: req.geo?.country,
    timestamp: new Date()
  });
  next();
};
```

#### 4.2 Dashboard de métricas en tiempo real
- WebSockets para actualizaciones
- Agregaciones diarias/semanales/mensuales

---

## 📊 Mock Data vs Datos Reales

### Estructura de Mock Data (actual)
```javascript
// src/utils/mockData.js
export const mockClients = [...];
export const mockEvents = [...];
export const mockLeads = [...];
export const mockStats = {...};
```

### Migración a datos reales

1. **Crear servicios API:**
```javascript
// src/services/api.js
const API_URL = process.env.VITE_API_URL;

export const clientsApi = {
  getAll: () => fetch(`${API_URL}/clients`).then(r => r.json()),
  getById: (id) => fetch(`${API_URL}/clients/${id}`).then(r => r.json()),
  create: (data) => fetch(`${API_URL}/clients`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),
  // ...
};
```

2. **Reemplazar mock data en componentes:**
```javascript
// Antes (con mock)
import { mockClients } from '../utils/mockData';

// Después (con API real)
import { clientsApi } from '../services/api';

const [clients, setClients] = useState([]);
useEffect(() => {
  clientsApi.getAll().then(setClients);
}, []);
```

---

## 🎨 Personalización Visual

### Variables CSS modificables
```css
/* src/styles/admin-theme.css */
:root {
  --admin-bg-primary: #0F0F23;      /* Fondo principal */
  --admin-bg-secondary: #1A1A2E;    /* Fondo tarjetas */
  --admin-accent-violet: #8B5CF6;   /* Color primario */
  --admin-accent-purple: #A855F7;   /* Color secundario */
}
```

### Cambiar paleta de colores
El sistema usa Tailwind CSS. Para cambiar colores, modificar:
```javascript
// tailwind.config.cjs
colors: {
  admin: {
    primary: '#8B5CF6',
    secondary: '#A855F7',
    // ...
  }
}
```

---

## 🔒 Seguridad - Checklist

- [ ] Validar todas las entradas de usuario
- [ ] Sanitizar datos antes de guardar en DB
- [ ] Usar HTTPS en producción
- [ ] Implementar rate limiting
- [ ] Hashear contraseñas con bcrypt
- [ ] Validar tokens JWT en cada request protegido
- [ ] Configurar CORS apropiadamente
- [ ] Prevenir SQL injection (usar ORM/parametrized queries)
- [ ] Prevenir XSS (escapar output HTML)
- [ ] Backups automáticos de DB

---

## 📱 Responsive Design

El sistema está diseñado mobile-first:
- **Mobile:** Sidebar colapsa en drawer
- **Tablet:** Sidebar compacto (iconos solo)
- **Desktop:** Sidebar expandido completo

Breakpoints:
- `sm:` 640px
- `md:` 768px
- `lg:` 1024px
- `xl:` 1280px

---

## 🧪 Testing

### Tests recomendados
```bash
# Unit tests con Vitest
npm install -D vitest @testing-library/react

# E2E tests con Playwright
npm install -D @playwright/test
```

### Estructura de tests
```
/src
├── /tests
│   ├── /unit
│   │   ├── Button.test.jsx
│   │   └── formatters.test.js
│   ├── /integration
│   │   └── auth.test.jsx
│   └── /e2e
│       └── booking-flow.spec.js
```

---

## 🚀 Deployment a VPS

### 1. Build de producción
```bash
npm run build
```

### 2. Estructura en VPS
```
/var/www/stmiranda.com/
├── /frontend          # Build de React (dist/)
├── /backend           # API Node.js
├── /database          # Scripts SQL
└── docker-compose.yml
```

### 3. Docker Compose (recomendado)
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://...
      - JWT_SECRET=...
  
  db:
    image: postgres:15
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
```

---

## 📞 Soporte y Contacto

Para dudas o soporte técnico:
- Revisar logs en `/var/log/stmiranda/`
- Documentación de componentes en código

---

## 📝 Changelog

### v1.0.0 - Sistema Base
- ✅ Diseño completo UI/UX
- ✅ Panel admin funcional con mock data
- ✅ Routing y autenticación simulada
- ✅ Componentes UI reutilizables
- 🔄 Backend real (pendiente)
- 🔄 Integraciones externas (pendiente)
