# 🎼 Stephanie Miranda - Sistema Web Completo (V2)

Sistema web integral que combina **sitio público** para clientes y **panel administrativo** profesional.

## 🆕 Novedades V2 - Arquitectura Separada

La V2 introduce una separación clara entre:
- **Contactos** (Community Layer): Fans, seguidores, comunidad
- **Cotizaciones** (Pipeline Comercial): Solicitudes de eventos privados
- **Eventos** (Confirmados): Eventos contratados

### ✨ Nuevas Funcionalidades

1. **🎵 Registro de Fans** - Formulario público separado de cotizaciones
2. **📧 Email Marketing** - Newsletters a fans + follow-ups automáticos
3. **📊 Estadísticas Separadas** - Métricas de comunidad vs pipeline
4. **📥 Exportación** - Listas segmentadas por tipo de relación

Ver [MIGRATION_V2.md](./MIGRATION_V2.md) para detalles completos.

![Vista previa](./project-screenshot.png)

## ✨ Características

### 🌐 Sitio Público
- Landing page con diseño artístico y premium
- Galería de servicios y proyectos
- Formulario de contacto funcional
- Integración con redes sociales
- Animaciones y efectos visuales

### 🔐 Panel Administrativo
- **Dashboard** con métricas en tiempo real
- **Calendario** de eventos con vista mensual
- **CRM** de clientes (crear, editar, eliminar)
- **Estadísticas** de visitas e ingresos
- **Configuración** de perfil y notificaciones

## 🚀 Inicio rápido

### 1. Instalar dependencias
```bash
# Instalar dependencias del frontend
npm install

# Instalar dependencias del backend
cd backend && npm install
```

### 2. Inicializar base de datos
```bash
npm run init-db
```

### 3. Iniciar sistema completo
```bash
npm run dev
```

Esto inicia:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3001

### Credenciales de acceso
- **Email:** `stephanie@stmiranda.com`
- **Password:** `admin123`

## 📁 Estructura del proyecto

```
stmiranda-website/
├── src/                          # Frontend React
│   ├── admin/                   # Panel de administración
│   │   ├── pages/              # Dashboard, Calendar, Clients, etc.
│   │   ├── components/         # Componentes admin
│   │   └── layouts/            # Layouts del admin
│   │
│   ├── components/              # Componentes del sitio público
│   │   ├── Hero.jsx
│   │   ├── Services.jsx
│   │   ├── Projects.jsx
│   │   └── ...
│   │
│   ├── services/               # Cliente API
│   │   └── api.js             # Conexión con backend
│   │
│   ├── contexts/               # Contextos React
│   │   └── AuthContext.jsx    # Autenticación
│   │
│   └── router/                 # Enrutamiento
│       └── AppRouter.jsx
│
├── backend/                     # Backend Node.js
│   ├── src/
│   │   ├── routes/            # Rutas API
│   │   │   ├── auth.js       # Login/logout
│   │   │   ├── clients.js    # CRUD clientes
│   │   │   ├── events.js     # CRUD eventos
│   │   │   └── stats.js      # Estadísticas
│   │   │
│   │   ├── utils/             # Utilidades
│   │   │   ├── database.js   # Conexión SQLite
│   │   │   └── initDb.js     # Inicialización DB
│   │   │
│   │   └── server.js          # Servidor Express
│   │
│   └── database/               # Base de datos SQLite
│       └── app.db
│
└── package.json               # Scripts y dependencias
```

## 🛠️ Stack tecnológico

### Frontend
- **React 18** - Framework UI
- **React Router 6** - Enrutamiento
- **Tailwind CSS** - Estilos
- **Lucide React** - Iconos

### Backend
- **Node.js** + **Express** - API REST
- **SQLite** - Base de datos (desarrollo)
- **Better-sqlite3** - Driver SQLite
- **JWT** - Autenticación
- **Bcryptjs** - Hash de contraseñas

## 📊 API Endpoints

### Autenticación
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/login` | Iniciar sesión |
| POST | `/api/auth/logout` | Cerrar sesión |
| GET | `/api/auth/me` | Obtener usuario actual |

### Clientes
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/clients` | Listar clientes |
| GET | `/api/clients/:id` | Ver cliente |
| POST | `/api/clients` | Crear cliente |
| PUT | `/api/clients/:id` | Actualizar cliente |
| DELETE | `/api/clients/:id` | Eliminar cliente |

### Eventos
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/events` | Listar eventos |
| POST | `/api/events` | Crear evento |
| PUT | `/api/events/:id` | Actualizar evento |
| DELETE | `/api/events/:id` | Eliminar evento |

### Estadísticas
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/stats/overview` | Resumen general |
| GET | `/api/stats/revenue-by-month` | Ingresos mensuales |
| GET | `/api/stats/upcoming-events` | Próximos eventos |

## 📝 Comandos disponibles

```bash
# Desarrollo completo (frontend + backend)
npm run dev

# Solo frontend
npm run client

# Solo backend
npm run server

# Inicializar base de datos
npm run init-db

# Resetear base de datos (⚠️ borra todo)
npm run reset-db

# Build para producción
npm run build
```

## 🔒 Seguridad

- Autenticación con JWT en cookies HTTP-only
- Contraseñas hasheadas con bcrypt
- CORS configurado para el dominio del frontend
- Validación de datos con express-validator

## 🚀 Deploy a producción

### 1. Preparar para producción
```bash
# Cambiar JWT_SECRET en backend/.env
JWT_SECRET=tu-clave-segura-muy-larga-y-aleatoria

# Cambiar a PostgreSQL (opcional)
# Editar backend/src/utils/database.js
```

### 2. Build del frontend
```bash
npm run build
```

### 3. Iniciar en producción
```bash
cd backend
NODE_ENV=production npm start
```

## 📋 Roadmap futuro

- [ ] Integración Google Calendar
- [ ] Notificaciones por email (SendGrid)
- [ ] WhatsApp Business API
- [ ] Exportar a Excel/PDF
- [ ] Sistema de cotizaciones
- [ ] Facturación integrada

## 📄 Licencia

Proyecto privado - Stephanie Miranda Music

---

**Desarrollado con ❤️ para Stephanie Miranda**
