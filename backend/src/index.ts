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

// Middleware
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://127.0.0.1:5173',
      process.env.FRONTEND_URL,
    ].filter(Boolean);
    
    // Allow any origin in production if FRONTEND_URL contains the origin
    // or if it matches the pattern
    if (allowedOrigins.includes(origin) || 
        origin.includes('vercel.app') || 
        origin.includes('netlify.app') ||
        origin.includes('railway.app') ||
        origin.includes('render.com') ||
        origin.includes('herokuapp.com')) {
      return callback(null, true);
    }
    
    // In development, allow all origins
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
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

