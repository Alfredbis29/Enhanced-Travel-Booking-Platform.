import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import searchRoutes from './routes/search.js';
import bookingRoutes from './routes/bookings.js';
import aiRoutes from './routes/ai.js';
import paymentRoutes from './routes/payments.js';
import { errorHandler } from './middleware/errorHandler.js';
import { sanitizeBody, sanitizeQuery, blockSQLInjection, securityHeaders } from './middleware/security.js';
import { initializeDatabase } from './db/index.js';
import { verifyEmailConfig, getEmailConfigStatus, sendTestEmail } from './services/email.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === 'production';

// ============================================
// SECURITY CONFIGURATION
// ============================================

// Warn if important env vars are missing in production
if (isProduction) {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'fallback-secret') {
    console.warn('⚠️  WARNING: JWT_SECRET is not set! Authentication will be insecure.');
  }
  if (!process.env.FRONTEND_URL) {
    console.warn('⚠️  WARNING: FRONTEND_URL is not set! CORS may block requests.');
  }
  if (!process.env.OPENAI_API_KEY) {
    console.log('ℹ️  Note: OPENAI_API_KEY not set. AI features will use fallback parsing.');
  }
}

// ============================================
// SECURITY MIDDLEWARE
// ============================================

// 1. Helmet - Security headers (XSS, clickjacking, MIME sniffing protection)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false, // Allow embedding
}));

// 2. Rate Limiting - Prevent brute force attacks
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: { 
    success: false, 
    message: 'Too many requests, please try again later.' 
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => !isProduction, // Skip in development
});

// Stricter rate limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Only 10 login/register attempts per 15 min
  message: { 
    success: false, 
    message: 'Too many login attempts. Please try again in 15 minutes.' 
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => !isProduction,
});

// Rate limit for sensitive operations
const sensitiveLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 requests per hour
  message: { 
    success: false, 
    message: 'Too many requests. Please try again later.' 
  },
  skip: () => !isProduction,
});

// Apply general rate limiting
app.use(generalLimiter);

// 3. HPP - Prevent HTTP Parameter Pollution
app.use(hpp());

// 4. Request size limits - Prevent DoS attacks
app.use(express.json({ limit: '10kb' })); // Limit JSON body size
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// 5. Custom security middleware
app.use(securityHeaders); // Additional security headers
app.use(sanitizeBody); // XSS protection for body
app.use(sanitizeQuery); // XSS protection for query params
app.use(blockSQLInjection); // SQL injection protection

// ============================================
// CORS CONFIGURATION
// ============================================

const ALLOWED_PLATFORMS = [
  '.vercel.app',
  '.netlify.app', 
  '.railway.app',
  '.onrender.com',
  '.render.com',
  '.herokuapp.com',
  '.fly.dev',
  '.up.railway.app',
  '.pages.dev',
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    // In development, allow ALL origins
    if (!isProduction) {
      return callback(null, true);
    }
    
    // Localhost origins
    const localhostOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:4173',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:3000',
    ];
    
    if (localhostOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Check FRONTEND_URL
    if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) {
      return callback(null, true);
    }
    
    // Check allowed deployment platforms
    const isAllowedPlatform = ALLOWED_PLATFORMS.some(platform => origin.includes(platform));
    if (isAllowedPlatform) {
      return callback(null, true);
    }
    
    console.warn(`⚠️ CORS blocked origin: ${origin}`);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  maxAge: 86400, // Cache preflight for 24 hours
}));

// ============================================
// API ROUTES
// ============================================

// Auth routes with stricter rate limiting
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth', authRoutes);

// Other routes
app.use('/api/search', searchRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/payments', sensitiveLimiter, paymentRoutes);

// ============================================
// UTILITY ENDPOINTS
// ============================================

// Health check (public)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: isProduction ? 'production' : 'development'
  });
});

// Email configuration status (protected in production)
app.get('/api/email-status', (req, res) => {
  // In production, require a secret key to access
  if (isProduction && req.query.key !== process.env.ADMIN_KEY) {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }
  
  const status = getEmailConfigStatus();
  res.json({ 
    status: status.configured ? 'configured' : 'not_configured',
    details: status
  });
});

// Test email endpoint (protected)
app.post('/api/test-email', sensitiveLimiter, async (req, res) => {
  // Require admin key in production
  if (isProduction && req.body.admin_key !== process.env.ADMIN_KEY) {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }
  
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email address required' });
  }
  const result = await sendTestEmail(email);
  res.json(result);
});

// Security info endpoint (only in development)
app.get('/api/security-info', (req, res) => {
  if (isProduction) {
    return res.status(404).json({ message: 'Not found' });
  }
  
  res.json({
    helmet: 'enabled',
    rateLimiting: 'enabled',
    hpp: 'enabled',
    cors: 'configured',
    bodyLimit: '10kb',
    authRateLimit: '10 requests per 15 minutes',
    generalRateLimit: '100 requests per 15 minutes'
  });
});

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Endpoint not found' 
  });
});

// Global error handler
app.use(errorHandler);

// ============================================
// SERVER STARTUP
// ============================================

initializeDatabase()
  .then(async () => {
    await verifyEmailConfig();
    
    app.listen(PORT, () => {
      console.log('');
      console.log('🔒 Security Features:');
      console.log('   ✅ Helmet (security headers)');
      console.log('   ✅ Rate limiting (brute force protection)');
      console.log('   ✅ HPP (parameter pollution protection)');
      console.log('   ✅ CORS (cross-origin protection)');
      console.log('   ✅ Request size limits (DoS protection)');
      console.log('');
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    });
  })
  .catch((error) => {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  });

export default app;
