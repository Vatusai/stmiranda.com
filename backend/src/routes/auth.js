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
