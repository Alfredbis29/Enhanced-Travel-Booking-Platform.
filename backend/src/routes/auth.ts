import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { query } from '../db/index.js';
import { AppError } from '../middleware/errorHandler.js';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';
import { 
  generateVerificationToken, 
  generateTokenExpiry, 
  sendVerificationEmail,
  sendWelcomeEmail 
} from '../services/email.js';

const router = Router();

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
    const existingUser = await query('SELECT id, is_verified FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      const existing = existingUser.rows[0] as { id: string; is_verified: boolean };
      if (!existing.is_verified) {
        // User exists but not verified - resend verification email
        const verificationToken = generateVerificationToken();
        const tokenExpiry = generateTokenExpiry();
        
        await query(
          'UPDATE users SET verification_token = $1, token_expiry = $2 WHERE id = $3',
          [verificationToken, tokenExpiry.toISOString(), existing.id]
        );
        
        await sendVerificationEmail(email, first_name, verificationToken);
        
        throw new AppError('Email already registered but not verified. We sent a new verification email.', 409);
      }
      throw new AppError('Email already registered', 409);
    }

    // Generate verification token
    const verificationToken = generateVerificationToken();
    const tokenExpiry = generateTokenExpiry();

    // Hash password
    const password_hash = await bcrypt.hash(password, 12);

    // Create user with verification token
    const result = await query(
      `INSERT INTO users (email, password_hash, first_name, last_name, phone, verification_token, token_expiry) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING id, email, first_name, last_name, phone, is_verified, created_at`,
      [email, password_hash, first_name, last_name, phone || null, verificationToken, tokenExpiry.toISOString()]
    );

    const user = result.rows[0] as { id: string; email: string; first_name: string; last_name: string; phone?: string; is_verified: boolean };

    // Send verification email
    const emailSent = await sendVerificationEmail(email, first_name, verificationToken);

    res.status(201).json({
      success: true,
      message: emailSent 
        ? 'Registration successful! Please check your email to verify your account.' 
        : 'Registration successful! Email verification pending.',
      data: {
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          phone: user.phone,
          is_verified: user.is_verified
        },
        requiresVerification: true
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
      'SELECT id, email, password_hash, first_name, last_name, phone, is_verified FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      throw new AppError('Invalid credentials. Please check your email and password.', 401);
    }

    const user = result.rows[0] as { 
      id: string; email: string; password_hash: string; 
      first_name: string; last_name: string; phone?: string; is_verified: boolean 
    };

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      throw new AppError('Invalid credentials. Please check your email and password.', 401);
    }

    // Check if email is verified
    if (!user.is_verified) {
      // Resend verification email
      const verificationToken = generateVerificationToken();
      await query(
        'UPDATE users SET verification_token = $1, token_expiry = $2 WHERE id = $3',
        [verificationToken, generateTokenExpiry().toISOString(), user.id]
      );
      await sendVerificationEmail(email, user.first_name, verificationToken);
      
      throw new AppError('Please verify your email before logging in. We sent a new verification link to your inbox.', 403);
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
          phone: user.phone,
          is_verified: user.is_verified
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
});

// Verify email
router.post('/verify-email', [
  body('token').notEmpty().withMessage('Verification token required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required')
], async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(errors.array()[0].msg, 400);
    }

    const { token, email } = req.body;

    // Find user with this token
    const result = await query(
      'SELECT id, email, first_name, last_name, phone, verification_token, token_expiry, is_verified FROM users WHERE verification_token = $1 AND email = $2',
      [token, email]
    );

    if (result.rows.length === 0) {
      throw new AppError('Invalid or expired verification link. Please request a new one.', 400);
    }

    const user = result.rows[0] as { 
      id: string; email: string; first_name: string; last_name: string; 
      phone?: string; token_expiry?: Date; is_verified: boolean 
    };

    // Check if already verified
    if (user.is_verified) {
      throw new AppError('Email already verified. You can log in.', 400);
    }

    // Check if token expired
    if (user.token_expiry && new Date() > new Date(user.token_expiry)) {
      throw new AppError('Verification link has expired. Please request a new one.', 400);
    }

    // Verify the user
    await query(
      'UPDATE users SET is_verified = true, verification_token = NULL, token_expiry = NULL WHERE email = $1',
      [email]
    );

    // Send welcome email
    await sendWelcomeEmail(email, user.first_name);

    // Generate token for auto-login
    const authToken = generateToken(user.id, user.email);

    res.json({
      success: true,
      message: 'Email verified successfully! Welcome to Twende!',
      data: {
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          phone: user.phone,
          is_verified: true
        },
        token: authToken
      }
    });
  } catch (error) {
    next(error);
  }
});

// Resend verification email
router.post('/resend-verification', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required')
], async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(errors.array()[0].msg, 400);
    }

    const { email } = req.body;

    // Find user
    const result = await query(
      'SELECT id, email, first_name, is_verified FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      // Don't reveal if email exists or not
      res.json({
        success: true,
        message: 'If this email is registered, you will receive a verification link.'
      });
      return;
    }

    const user = result.rows[0] as { id: string; email: string; first_name: string; is_verified: boolean };

    if (user.is_verified) {
      throw new AppError('Email already verified. You can log in.', 400);
    }

    // Generate new verification token
    const verificationToken = generateVerificationToken();
    const tokenExpiry = generateTokenExpiry();

    await query(
      'UPDATE users SET verification_token = $1, token_expiry = $2 WHERE id = $3',
      [verificationToken, tokenExpiry.toISOString(), user.id]
    );

    // Send verification email
    await sendVerificationEmail(email, user.first_name, verificationToken);

    res.json({
      success: true,
      message: 'Verification email sent! Please check your inbox.'
    });
  } catch (error) {
    next(error);
  }
});

// Get current user profile
router.get('/me', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const result = await query(
      'SELECT id, email, first_name, last_name, phone, is_verified, created_at FROM users WHERE id = $1',
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
    const userData = result.rows[0] as { password_hash: string };
    const isValid = await bcrypt.compare(current_password, userData.password_hash);
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

