// Load environment variables FIRST - before any imports that use them
import dotenv from 'dotenv';
dotenv.config();

/**
 * Main Server
 * API REST para Stephanie Miranda Admin Panel
 */
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';

// Import routes
import authRoutes from './routes/auth.js';
import quotationRoutes from './routes/quotation.js';
import contactRoutes from './routes/contacts.js';
import inquiryRoutes from './routes/inquiries.js';
import eventRoutes from './routes/events.js';
import statsRoutes from './routes/stats.js';
import statsV2Routes from './routes/stats-v2.js';
import emailRoutes from './routes/emails.js';
import exportRoutes from './routes/exports.js';
import calendarRoutes from './routes/calendar.js';
import { requireAuth } from './middleware/auth.js';

// Initialize database (creates tables if not exist)
import './utils/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Middleware
app.use(morgan('dev'));
app.use(cookieParser());
// Increase body parser limits for image uploads (10MB)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS configuration
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Notification processing endpoint (for cron job)
app.post('/api/admin/process-notifications', requireAuth, async (req, res) => {
  try {
    const { processPendingNotifications } = await import('./services/notificationService.js');
    const result = await processPendingNotifications();
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Notification processing error:', error);
    res.status(500).json({ error: 'Error processing notifications' });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/quotation', quotationRoutes);   // Public quotation form (no auth)
app.use('/api/contacts', contactRoutes);      // Community layer
app.use('/api/inquiries', inquiryRoutes);     // Commercial pipeline
app.use('/api/events', eventRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/stats-v2', statsV2Routes);      // New separated stats
app.use('/api/emails', emailRoutes);          // Email automation
app.use('/api/exports', exportRoutes);        // Data export
app.use('/api/calendar', calendarRoutes);     // Google Calendar integration

// Legacy redirects (for backwards compatibility during transition)
app.use('/api/clients', contactRoutes);
app.use('/api/leads', inquiryRoutes);

// 404 handler
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint no encontrado' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log('\n🎼 Stephanie Miranda Admin API');
  console.log('================================');
  console.log(`📡 Server running on http://localhost:${PORT}`);
  console.log(`🔗 Frontend URL: ${FRONTEND_URL}`);
  console.log(`💾 Database: SQLite (./database/app.db)`);
  console.log('\n📚 API Endpoints:');
  console.log('  POST /api/auth/login');
  console.log('  POST /api/auth/logout');
  console.log('  GET  /api/auth/me');
  console.log('  GET  /api/clients');
  console.log('  POST /api/clients');
  console.log('  GET  /api/events');
  console.log('  POST /api/events');
  console.log('  GET  /api/leads');
  console.log('  GET  /api/stats/overview');
  console.log('\n✨ Para inicializar la base de datos:');
  console.log('   npm run init-db');
  console.log('');
});

export default app;
