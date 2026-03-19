# Configuración de Google Calendar Integration

Esta guía te ayudará a configurar la integración con Google Calendar para sincronizar eventos.

## Requisitos previos

- Cuenta de Google
- Acceso a [Google Cloud Console](https://console.cloud.google.com/)

## Paso 1: Crear un proyecto en Google Cloud

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Haz clic en el selector de proyecto (arriba a la izquierda)
3. Haz clic en "Nuevo proyecto"
4. Nombre: `Stephanie Miranda Calendar`
5. Haz clic en "Crear"

## Paso 2: Habilitar Google Calendar API

1. En el menú lateral, ve a "APIs y servicios" > "Biblioteca"
2. Busca "Google Calendar API"
3. Haz clic en "Habilitar"

## Paso 3: Configurar pantalla de consentimiento OAuth

1. Ve a "APIs y servicios" > "Pantalla de consentimiento de OAuth"
2. Selecciona "Externo" (para usuarios fuera de tu organización)
3. Haz clic en "Crear"
4. Completa la información:
   - **Nombre de la app**: Stephanie Miranda Admin
   - **Correo electrónico de soporte**: tu-email@gmail.com
   - **Logo** (opcional)
5. En "Dominios autorizados", agrega:
   - `localhost` (para desarrollo)
   - `stmiranda.com` (para producción)
6. En "Información de contacto del desarrollador", ingresa tu email
7. Haz clic en "Guardar y continuar"
8. En "Alcances", haz clic en "Agregar o quitar alcances"
9. Agrega estos alcances:
   - `.../auth/calendar`
   - `.../auth/calendar.events`
10. Haz clic en "Actualizar" y luego "Guardar y continuar"
11. Revisa y haz clic en "Volver al panel"

## Paso 4: Crear credenciales OAuth2

1. Ve a "APIs y servicios" > "Credenciales"
2. Haz clic en "Crear credenciales" > "ID de cliente de OAuth"
3. Selecciona "Aplicación web"
4. Nombre: `Stephanie Miranda Web App`
5. En "URI de redireccionamiento autorizados", agrega:
   ```
   http://localhost:3001/api/calendar/auth/callback
   https://stmiranda.com/api/calendar/auth/callback
   ```
6. Haz clic en "Crear"
7. **Copia el Client ID y Client Secret** (los necesitarás en el siguiente paso)

## Paso 5: Configurar variables de entorno

1. Abre el archivo `backend/.env`
2. Agrega las siguientes variables:
   ```env
   # Google Calendar OAuth2
   GOOGLE_CLIENT_ID=tu_client_id_aqui
   GOOGLE_CLIENT_SECRET=tu_client_secret_aqui
   GOOGLE_REDIRECT_URI=http://localhost:3001/api/calendar/auth/callback
   ```
3. Reemplaza `tu_client_id_aqui` y `tu_client_secret_aqui` con los valores copiados

## Paso 6: Publicar la aplicación (Producción)

> **Nota**: Mientras la app esté en "Testing", los tokens expirarán después de 7 días.

Para producción, debes publicar la aplicación:

1. Ve a "APIs y servicios" > "Pantalla de consentimiento de OAuth"
2. Haz clic en "Publicar aplicación"
3. Completa la verificación de Google (puede tomar varios días)

## Paso 7: Reiniciar el backend

```bash
# Detener el servidor si está corriendo
pkill -f "node src/server.js"

# Reiniciar
./start-dev.sh
```

## Uso

1. Ve al panel de administración: `http://localhost:5173/admin`
2. Navega a "Configuración" > "Integraciones"
3. Haz clic en "Conectar Google Calendar"
4. Inicia sesión con tu cuenta de Google
5. Autoriza el acceso al calendario

## Funcionalidades

Una vez conectado, podrás:

- **Importar eventos**: Traer eventos existentes de Google Calendar al sistema
- **Sincronizar automáticamente**: Los eventos confirmados se agregan a Google Calendar
- **Recordatorios**: Configurar alertas automáticas (1 día y 1 hora antes)

## Solución de problemas

### Error: "Access denied" o "Unauthorized"
- Verifica que las credenciales sean correctas
- Asegúrate de que el redirect URI coincida exactamente

### Error: "Token expired"
- La aplicación debe estar publicada (no en "Testing")
- O reconecta Google Calendar desde el panel

### No aparecen los eventos
- Verifica que el calendario tenga eventos en el rango de fechas
- Revisa los logs del backend para errores

## API Endpoints disponibles

| Endpoint | Descripción |
|----------|-------------|
| `GET /api/calendar/auth/url` | Obtener URL de autorización |
| `POST /api/calendar/auth/exchange` | Intercambiar código por tokens |
| `GET /api/calendar/status` | Verificar estado de conexión |
| `POST /api/calendar/disconnect` | Desconectar Google Calendar |
| `GET /api/calendar/list` | Listar calendarios disponibles |
| `GET /api/calendar/events` | Listar eventos |
| `POST /api/calendar/events` | Crear evento |
| `PUT /api/calendar/events/:id` | Actualizar evento |
| `DELETE /api/calendar/events/:id` | Eliminar evento |
| `POST /api/calendar/sync/:eventId` | Sincronizar evento local |
| `POST /api/calendar/import` | Importar eventos de Google |

## Seguridad

- Los tokens se almacenan encriptados en la base de datos
- El `refresh_token` solo se obtiene una vez (durante la primera autorización)
- Los `access_token` se renuevan automáticamente cuando expiran
- Los tokens están asociados al usuario autenticado
