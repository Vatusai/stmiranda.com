/**
 * Auth Routes
 * Login, logout y perfil de usuario
 */
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { body, validationResult } from 'express-validator';
import db from '../utils/database.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'stmiranda-super-secret-key-2024';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// POST /api/auth/login
router.post('/login', [
  body('email').notEmpty().withMessage('Usuario o email requerido'),
  body('password').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email: identifier, password } = req.body;

    // Accept email or name as identifier
    const user = db.prepare(
      'SELECT * FROM users WHERE email = ? OR name = ?'
    ).get(identifier, identifier);
    
    if (!user) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }
    
    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }
    
    // Generar JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    
    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
    });
    
    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ success: true, message: 'Sesión cerrada' });
});

// GET /api/auth/me - Obtener usuario actual
router.get('/me', requireAuth, (req, res) => {
  try {
    const user = db.prepare(`
      SELECT id, name, email, role, avatar, created_at 
      FROM users 
      WHERE id = ?
    `).get(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    res.json({ user });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// POST /api/auth/change-password (protegido)
router.post('/change-password', requireAuth, [
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;
    
    // Obtener usuario
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    // Verificar contraseña actual
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Contraseña actual incorrecta' });
    }
    
    // Hashear nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Actualizar
    db.prepare('UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(hashedPassword, req.user.userId);
    
    res.json({ success: true, message: 'Contraseña actualizada' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// POST /api/auth/attendee-access
// Passwordless quick-access for event attendees.
// Creates or updates the fan account by email, opens a 30-day session,
// and registers them for the event when eventId is provided.
router.post('/attendee-access', [
  body('name').trim().notEmpty().withMessage('El nombre es requerido'),
  body('email').isEmail().normalizeEmail().withMessage('Correo electrónico inválido'),
  body('phone').optional().trim(),
  body('eventId').optional().trim(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, phone, eventId } = req.body;

    // Find or create the fan user
    let user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

    if (user) {
      // Update name / phone in case they changed
      db.prepare(`
        UPDATE users SET name = ?, phone = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
      `).run(name, phone || user.phone, user.id);
      user = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);
    } else {
      // Create passwordless fan — store a random hash they will never use
      const userId = uuidv4();
      const unusedHash = await bcrypt.hash(uuidv4(), 8);
      db.prepare(`
        INSERT INTO users (id, name, email, password, phone, role, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, 'fan', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `).run(userId, name, email, unusedHash, phone || null);
      user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    }

    // Register for event if eventId was provided
    let eventRegistered = false;
    if (eventId) {
      const event = db.prepare(`
        SELECT id FROM events WHERE id = ? AND visibility = 'publico' AND status != 'cancelled'
      `).get(eventId);

      if (event) {
        db.prepare(`
          INSERT OR IGNORE INTO event_attendees (id, event_id, user_id, registered_at)
          VALUES (?, ?, ?, CURRENT_TIMESTAMP)
        `).run(uuidv4(), eventId, user.id);
        eventRegistered = true;
      }
    }

    // Issue a 30-day JWT cookie so the user stays logged in on this device
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    res.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      eventRegistered,
    });
  } catch (error) {
    console.error('Attendee access error:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// POST /api/auth/register - Public user registration (for event attendance)
router.post('/register', [
  body('name').trim().notEmpty().withMessage('El nombre es requerido'),
  body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, phone } = req.body;

    // Check if email already exists
    const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Este email ya está registrado' });
    }

    // Create user with 'fan' role
    const userId = uuidv4();
    const hashedPassword = await bcrypt.hash(password, 10);
    const cleanPhone = phone?.trim() || null;

    db.prepare(`
      INSERT INTO users (id, name, email, password, phone, role, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, 'fan', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `).run(userId, name, email, hashedPassword, cleanPhone);
    
    // Generate JWT
    const token = jwt.sign(
      { userId, email, role: 'fan' },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    
    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    
    res.json({
      success: true,
      user: {
        id: userId,
        name,
        email,
        phone: cleanPhone,
        role: 'fan'
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

export default router;
