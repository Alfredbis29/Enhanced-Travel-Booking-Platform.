import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import searchRoutes from './routes/search.js';
import bookingRoutes from './routes/bookings.js';
import aiRoutes from './routes/ai.js';
import paymentRoutes from './routes/payments.js';
import { errorHandler } from './middleware/errorHandler.js';
import { initializeDatabase } from './db/index.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Warn if important env vars are missing in production
if (process.env.NODE_ENV === 'production') {
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

// Allowed deployment platforms
const ALLOWED_PLATFORMS = [
  '.vercel.app',
  '.netlify.app', 
  '.railway.app',
  '.onrender.com',
  '.render.com',
  '.herokuapp.com',
  '.fly.dev',
  '.up.railway.app',
  '.pages.dev', // Cloudflare Pages
];

// Middleware
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, curl, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // In development, allow ALL origins
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    
    // Localhost origins for development
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
    
    // Check if origin matches FRONTEND_URL
    if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) {
      return callback(null, true);
    }
    
    // Check if origin is from an allowed deployment platform
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
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/payments', paymentRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

// Initialize database and start server
initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    });
  })
  .catch((error) => {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  });

export default app;

