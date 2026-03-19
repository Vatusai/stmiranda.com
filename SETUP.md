# 🚀 Guía de Instalación - Sistema Stephanie Miranda

## Requisitos previos
- Node.js 18+ instalado
- npm o yarn

## Instalación inicial

### 1. Instalar dependencias del frontend
```bash
npm install
```

### 2. Instalar dependencias del backend
```bash
cd backend && npm install
```

### 3. Inicializar la base de datos
```bash
npm run init-db
```

Esto creará:
- Base de datos SQLite en `backend/database/app.db`
- Tablas: users, clients, events, leads, services, activity_logs
- Usuario admin: `stephanie@stmiranda.com` / `admin123`
- Datos de ejemplo (clientes, eventos, leads)

## Ejecutar en desarrollo

### Opción A: Todo junto (recomendado)
```bash
npm run dev
```

Esto inicia:
- Backend: http://localhost:3001
- Frontend: http://localhost:5173

### Opción B: Por separado
Terminal 1 - Backend:
```bash
npm run server
```

Terminal 2 - Frontend:
```bash
npm run client
```

## Acceder al sistema

1. **Sitio público:** http://localhost:5173/
2. **Panel admin:** http://localhost:5173/admin/login

**Credenciales:**
- Email: `stephanie@stmiranda.com`
- Password: `admin123`

## Comandos útiles

```bash
# Reconstruir base de datos (borra todo)
npm run reset-db

# Solo backend
npm run server

# Solo frontend
npm run client

# Build para producción
npm run build
```

## Estructura de archivos importantes

```
/
├── src/                      # Frontend React
│   ├── admin/               # Panel admin
│   ├── components/          # Componentes UI
│   ├── services/api.js      # Cliente API
│   └── contexts/            # Contextos React
│
├── backend/                 # Backend Node.js
│   ├── src/
│   │   ├── routes/         # Rutas API
│   │   ├── utils/          # Database
│   │   └── server.js       # Servidor
│   └── database/           # SQLite DB
│
└── package.json            # Scripts
```

## API Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | /api/auth/login | Login |
| POST | /api/auth/logout | Logout |
| GET | /api/auth/me | Usuario actual |
| GET | /api/clients | Listar clientes |
| POST | /api/clients | Crear cliente |
| PUT | /api/clients/:id | Actualizar cliente |
| DELETE | /api/clients/:id | Eliminar cliente |
| GET | /api/events | Listar eventos |
| POST | /api/events | Crear evento |
| PUT | /api/events/:id | Actualizar evento |
| DELETE | /api/events/:id | Eliminar evento |
| GET | /api/stats/overview | Estadísticas |

## Para producción (VPS)

1. Cambiar `JWT_SECRET` en `backend/.env`
2. Cambiar a PostgreSQL (modificar `backend/src/utils/database.js`)
3. Usar PM2 para mantener el servidor activo
4. Configurar Nginx como reverse proxy
5. Habilitar HTTPS con Let's Encrypt

## Soporte

Si hay errores:
1. Revisar que el backend está corriendo en puerto 3001
2. Verificar que la base de datos existe: `backend/database/app.db`
3. Revisar logs del backend en la terminal
