import dotenv from 'dotenv';
import pg from 'pg';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const { Pool } = pg;

// ============================================
// DATABASE CONFIGURATION
// ============================================
// Set DATABASE_URL in Render to use PostgreSQL
// Without it, in-memory storage is used (data lost on restart)
// ============================================

const USE_POSTGRES = !!process.env.DATABASE_URL;

// PostgreSQL pool (only if DATABASE_URL is set)
let pgPool: pg.Pool | null = null;

if (USE_POSTGRES) {
  pgPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });
}

// ============================================
// IN-MEMORY FALLBACK (for development)
// ============================================

interface User {
  id: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  phone?: string;
  created_at: Date;
  updated_at: Date;
}

interface Booking {
  id: string;
  user_id: string;
  trip_id: string;
  trip_provider: string;
  origin: string;
  destination: string;
  departure_time: Date;
  arrival_time?: Date;
  price: number;
  currency: string;
  seats: number;
  status: string;
  passenger_name: string;
  passenger_phone: string;
  passenger_email?: string;
  booking_reference?: string;
  created_at: Date;
  updated_at: Date;
}

interface SearchHistory {
  id: string;
  user_id?: string;
  query: string;
  parsed_params: unknown;
  results_count: number;
  created_at: Date;
}

// In-memory data stores (fallback)
const users: Map<string, User> = new Map();
const bookings: Map<string, Booking> = new Map();
const searchHistory: SearchHistory[] = [];

// Query result interface
interface QueryResult {
  rows: unknown[];
  rowCount: number;
}

// ============================================
// DATABASE INITIALIZATION
// ============================================

export async function initializeDatabase(): Promise<void> {
  if (USE_POSTGRES && pgPool) {
    try {
      // Test connection
      await pgPool.query('SELECT NOW()');
      console.log('✅ Connected to PostgreSQL database');
      
      // Create tables if they don't exist
      await createTables();
      console.log('✅ Database tables ready');
    } catch (error) {
      console.error('❌ PostgreSQL connection failed:', error);
      throw error;
    }
  } else {
    console.log('⚠️  Using in-memory database (no DATABASE_URL)');
    console.log('   Data will be lost on server restart!');
    console.log('');
    console.log('   To persist data, add PostgreSQL on Render:');
    console.log('   1. Dashboard → New → PostgreSQL');
    console.log('   2. Copy Internal Database URL');
    console.log('   3. Add as DATABASE_URL in your web service');
  }
}

// Create PostgreSQL tables
async function createTables(): Promise<void> {
  if (!pgPool) return;

  // Users table
  await pgPool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(100) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      first_name VARCHAR(50) NOT NULL,
      last_name VARCHAR(50) NOT NULL,
      phone VARCHAR(20),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Bookings table
  await pgPool.query(`
    CREATE TABLE IF NOT EXISTS bookings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      trip_id VARCHAR(100) NOT NULL,
      trip_provider VARCHAR(100) NOT NULL,
      origin VARCHAR(100) NOT NULL,
      destination VARCHAR(100) NOT NULL,
      departure_time TIMESTAMP NOT NULL,
      arrival_time TIMESTAMP,
      price DECIMAL(10, 2) NOT NULL,
      currency VARCHAR(10) DEFAULT 'KES',
      seats INTEGER DEFAULT 1,
      status VARCHAR(20) DEFAULT 'pending',
      passenger_name VARCHAR(100) NOT NULL,
      passenger_phone VARCHAR(20) NOT NULL,
      passenger_email VARCHAR(100),
      booking_reference VARCHAR(20) UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Search history table
  await pgPool.query(`
    CREATE TABLE IF NOT EXISTS search_history (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE SET NULL,
      query TEXT NOT NULL,
      parsed_params JSONB,
      results_count INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create indexes for better performance
  await pgPool.query(`
    CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
    CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
    CREATE INDEX IF NOT EXISTS idx_search_history_user_id ON search_history(user_id);
  `);
}

// ============================================
// QUERY FUNCTION
// ============================================

export async function query(text: string, params?: unknown[]): Promise<QueryResult> {
  // Use PostgreSQL if available
  if (USE_POSTGRES && pgPool) {
    try {
      const result = await pgPool.query(text, params);
      return { rows: result.rows, rowCount: result.rowCount || 0 };
    } catch (error) {
      console.error('PostgreSQL query error:', error);
      throw error;
    }
  }

  // Fallback to in-memory storage
  return inMemoryQuery(text, params);
}

// In-memory query handler
function inMemoryQuery(text: string, params?: unknown[]): QueryResult {
  const normalizedText = text.toLowerCase().trim();
  
  // INSERT INTO users
  if (normalizedText.includes('insert into users')) {
    const [email, password_hash, first_name, last_name, phone] = params as string[];
    const id = uuidv4();
    const user: User = {
      id,
      email,
      password_hash,
      first_name,
      last_name,
      phone: phone || undefined,
      created_at: new Date(),
      updated_at: new Date()
    };
    users.set(id, user);
    return { rows: [{ id, email, first_name, last_name, phone, created_at: user.created_at }], rowCount: 1 };
  }
  
  // SELECT from users by email
  if (normalizedText.includes('select') && normalizedText.includes('from users') && normalizedText.includes('email')) {
    const email = params?.[0] as string;
    const user = Array.from(users.values()).find(u => u.email === email);
    return { rows: user ? [user] : [], rowCount: user ? 1 : 0 };
  }
  
  // SELECT from users by id
  if (normalizedText.includes('select') && normalizedText.includes('from users') && normalizedText.includes('id')) {
    const id = params?.[0] as string;
    const user = users.get(id);
    return { rows: user ? [user] : [], rowCount: user ? 1 : 0 };
  }
  
  // UPDATE users
  if (normalizedText.includes('update users')) {
    const userId = params?.[params.length - 1] as string;
    const user = users.get(userId);
    if (user) {
      user.updated_at = new Date();
      return { rows: [user], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }
  
  // INSERT INTO bookings
  if (normalizedText.includes('insert into bookings')) {
    const [user_id, trip_id, trip_provider, origin, destination, departure_time, arrival_time, price, currency, seats, status, passenger_name, passenger_phone, passenger_email, booking_reference] = params as unknown[];
    const id = uuidv4();
    const booking: Booking = {
      id,
      user_id: user_id as string,
      trip_id: trip_id as string,
      trip_provider: trip_provider as string,
      origin: origin as string,
      destination: destination as string,
      departure_time: new Date(departure_time as string),
      arrival_time: arrival_time ? new Date(arrival_time as string) : undefined,
      price: price as number,
      currency: currency as string,
      seats: seats as number,
      status: status as string,
      passenger_name: passenger_name as string,
      passenger_phone: passenger_phone as string,
      passenger_email: passenger_email as string || undefined,
      booking_reference: booking_reference as string,
      created_at: new Date(),
      updated_at: new Date()
    };
    bookings.set(id, booking);
    return { rows: [booking], rowCount: 1 };
  }
  
  // SELECT from bookings
  if (normalizedText.includes('select') && normalizedText.includes('from bookings')) {
    if (normalizedText.includes('count(*)')) {
      const userId = params?.[0] as string;
      const userBookings = Array.from(bookings.values()).filter(b => b.user_id === userId);
      return { rows: [{ count: userBookings.length.toString() }], rowCount: 1 };
    }
    
    if (normalizedText.includes('where id = $1') && normalizedText.includes('user_id = $2')) {
      const bookingId = params?.[0] as string;
      const userId = params?.[1] as string;
      const booking = bookings.get(bookingId);
      if (booking && booking.user_id === userId) {
        return { rows: [booking], rowCount: 1 };
      }
      return { rows: [], rowCount: 0 };
    }
    
    if (normalizedText.includes('booking_reference')) {
      const reference = params?.[0] as string;
      const userId = params?.[1] as string;
      const booking = Array.from(bookings.values()).find(
        b => b.booking_reference?.toUpperCase() === reference.toUpperCase() && b.user_id === userId
      );
      return { rows: booking ? [booking] : [], rowCount: booking ? 1 : 0 };
    }
    
    const userId = params?.[0] as string;
    let userBookings = Array.from(bookings.values()).filter(b => b.user_id === userId);
    
    if (normalizedText.includes('and status =')) {
      const status = params?.[1] as string;
      userBookings = userBookings.filter(b => b.status === status);
    }
    
    userBookings.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
    return { rows: userBookings, rowCount: userBookings.length };
  }
  
  // UPDATE bookings
  if (normalizedText.includes('update bookings')) {
    const bookingId = params?.[0] as string;
    const userId = params?.[1] as string;
    const booking = bookings.get(bookingId);
    if (booking && booking.user_id === userId) {
      if (normalizedText.includes("status = 'confirmed'")) {
        booking.status = 'confirmed';
      } else if (normalizedText.includes("status = 'cancelled'")) {
        booking.status = 'cancelled';
      }
      booking.updated_at = new Date();
      return { rows: [booking], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }
  
  // DELETE FROM bookings
  if (normalizedText.includes('delete from bookings')) {
    const bookingId = params?.[0] as string;
    const userId = params?.[1] as string;
    const booking = bookings.get(bookingId);
    if (booking && booking.user_id === userId) {
      bookings.delete(bookingId);
      return { rows: [booking], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }
  
  // INSERT INTO search_history
  if (normalizedText.includes('insert into search_history')) {
    const entry: SearchHistory = {
      id: uuidv4(),
      user_id: params?.[0] as string,
      query: params?.[1] as string,
      parsed_params: params?.[2],
      results_count: params?.[3] as number,
      created_at: new Date()
    };
    searchHistory.push(entry);
    return { rows: [entry], rowCount: 1 };
  }
  
  // SELECT from search_history
  if (normalizedText.includes('select') && normalizedText.includes('from search_history')) {
    const userId = params?.[0] as string;
    const userHistory = searchHistory.filter(h => h.user_id === userId).slice(0, 10);
    return { rows: userHistory, rowCount: userHistory.length };
  }
  
  return { rows: [], rowCount: 0 };
}

export const pool = { query };
export default { pool, query, initializeDatabase };
