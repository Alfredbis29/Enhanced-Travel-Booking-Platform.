import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { query } from '../db/index.js';
import { AppError } from '../middleware/errorHandler.js';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// User type for database queries
interface DbUser {
  id: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  created_at?: string;
}

// Validation middleware
const registerValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('first_name').trim().notEmpty().withMessage('First name required'),
  body('last_name').trim().notEmpty().withMessage('Last name required'),
  body('phone').optional().trim()
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required')
];

// Helper to generate JWT
function generateToken(userId: string, email: string): string {
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign(
    { userId, email },
    process.env.JWT_SECRET || 'fallback-secret',
    { expiresIn: expiresIn as jwt.SignOptions['expiresIn'] }
  );
}

// Register new user
router.post('/register', registerValidation, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(errors.array()[0].msg, 400);
    }

    const { email, password, first_name, last_name, phone } = req.body;

    // Check if user exists
    const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      throw new AppError('Email already registered', 409);
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 12);

    // Create user
    const result = await query(
      `INSERT INTO users (email, password_hash, first_name, last_name, phone) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, email, first_name, last_name, phone, created_at`,
      [email, password_hash, first_name, last_name, phone || null]
    );

    const user = result.rows[0] as DbUser;
    const token = generateToken(user.id, user.email);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          phone: user.phone
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
});

// Login user
router.post('/login', loginValidation, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(errors.array()[0].msg, 400);
    }

    const { email, password } = req.body;

    // Find user
    const result = await query(
      'SELECT id, email, password_hash, first_name, last_name, phone FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      throw new AppError('Invalid credentials', 401);
    }

    const user = result.rows[0] as DbUser;

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      throw new AppError('Invalid credentials', 401);
    }

    const token = generateToken(user.id, user.email);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          phone: user.phone
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get current user profile
router.get('/me', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const result = await query(
      'SELECT id, email, first_name, last_name, phone, created_at FROM users WHERE id = $1',
      [req.user!.userId]
    );

    if (result.rows.length === 0) {
      throw new AppError('User not found', 404);
    }

    res.json({
      success: true,
      data: { user: result.rows[0] }
    });
  } catch (error) {
    next(error);
  }
});

// Update user profile
router.put('/me', authenticate, [
  body('first_name').optional().trim().notEmpty(),
  body('last_name').optional().trim().notEmpty(),
  body('phone').optional().trim()
], async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(errors.array()[0].msg, 400);
    }

    const { first_name, last_name, phone } = req.body;
    const updates: string[] = [];
    const values: unknown[] = [];
    let paramCount = 1;

    if (first_name) {
      updates.push(`first_name = $${paramCount++}`);
      values.push(first_name);
    }
    if (last_name) {
      updates.push(`last_name = $${paramCount++}`);
      values.push(last_name);
    }
    if (phone !== undefined) {
      updates.push(`phone = $${paramCount++}`);
      values.push(phone);
    }

    if (updates.length === 0) {
      throw new AppError('No fields to update', 400);
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(req.user!.userId);

    const result = await query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramCount} 
       RETURNING id, email, first_name, last_name, phone`,
      values
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: result.rows[0] }
    });
  } catch (error) {
    next(error);
  }
});

// Change password
router.put('/password', authenticate, [
  body('current_password').notEmpty().withMessage('Current password required'),
  body('new_password').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(errors.array()[0].msg, 400);
    }

    const { current_password, new_password } = req.body;

    // Get current password hash
    const result = await query('SELECT password_hash FROM users WHERE id = $1', [req.user!.userId]);
    if (result.rows.length === 0) {
      throw new AppError('User not found', 404);
    }

    // Verify current password
    const passwordRow = result.rows[0] as { password_hash: string };
    const isValid = await bcrypt.compare(current_password, passwordRow.password_hash);
    if (!isValid) {
      throw new AppError('Current password is incorrect', 401);
    }

    // Update password
    const newHash = await bcrypt.hash(new_password, 12);
    await query('UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', 
      [newHash, req.user!.userId]);

    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    next(error);
  }
});

export default router;

