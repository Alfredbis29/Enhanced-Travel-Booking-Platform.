import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

// In-memory storage for development without PostgreSQL
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

// In-memory data stores
const users: Map<string, User> = new Map();
const bookings: Map<string, Booking> = new Map();
const searchHistory: SearchHistory[] = [];

// Helper to simulate query results
interface QueryResult {
  rows: unknown[];
  rowCount: number;
}

export async function initializeDatabase(): Promise<void> {
  console.log('✅ Using in-memory database (PostgreSQL not available)');
  console.log('   Note: Data will be lost on server restart');
  return Promise.resolve();
}

export async function query(text: string, params?: unknown[]): Promise<QueryResult> {
  // Parse SQL and handle in-memory operations
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
    console.log(`[DB] Created booking: id=${id}, ref=${booking_reference}, status=${status}`);
    return { rows: [booking], rowCount: 1 };
  }
  
  // SELECT from bookings
  if (normalizedText.includes('select') && normalizedText.includes('from bookings')) {
    // Handle COUNT query
    if (normalizedText.includes('count(*)')) {
      const userId = params?.[0] as string;
      const userBookings = Array.from(bookings.values()).filter(b => b.user_id === userId);
      return { rows: [{ count: userBookings.length.toString() }], rowCount: 1 };
    }
    
    // Handle single booking lookup by id and user_id (e.g., WHERE id = $1 AND user_id = $2)
    if (normalizedText.includes('where id = $1') && normalizedText.includes('user_id = $2')) {
      const bookingId = params?.[0] as string;
      const userId = params?.[1] as string;
      console.log(`[DB] SELECT single booking: id=${bookingId}, userId=${userId}`);
      console.log(`[DB] Current bookings:`, Array.from(bookings.keys()));
      const booking = bookings.get(bookingId);
      if (booking && booking.user_id === userId) {
        console.log(`[DB] Found booking with status: ${booking.status}`);
        return { rows: [booking], rowCount: 1 };
      }
      console.log(`[DB] Booking not found`);
      return { rows: [], rowCount: 0 };
    }
    
    // Handle booking lookup by reference
    if (normalizedText.includes('booking_reference')) {
      const reference = params?.[0] as string;
      const userId = params?.[1] as string;
      const booking = Array.from(bookings.values()).find(
        b => b.booking_reference?.toUpperCase() === reference.toUpperCase() && b.user_id === userId
      );
      return { rows: booking ? [booking] : [], rowCount: booking ? 1 : 0 };
    }
    
    // Handle all bookings for a user (WHERE user_id = $1)
    const userId = params?.[0] as string;
    let userBookings = Array.from(bookings.values()).filter(b => b.user_id === userId);
    
    // Handle status filter if present
    if (normalizedText.includes('and status =')) {
      const status = params?.[1] as string;
      userBookings = userBookings.filter(b => b.status === status);
    }
    
    // Sort by created_at DESC
    userBookings.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
    
    return { rows: userBookings, rowCount: userBookings.length };
  }
  
  // UPDATE bookings
  if (normalizedText.includes('update bookings')) {
    const bookingId = params?.[0] as string;
    const userId = params?.[1] as string;
    console.log(`[DB] UPDATE booking: id=${bookingId}, userId=${userId}`);
    const booking = bookings.get(bookingId);
    if (booking && booking.user_id === userId) {
      if (normalizedText.includes("status = 'confirmed'")) {
        booking.status = 'confirmed';
        console.log(`[DB] Booking confirmed`);
      } else if (normalizedText.includes("status = 'cancelled'")) {
        booking.status = 'cancelled';
        console.log(`[DB] Booking cancelled`);
      }
      booking.updated_at = new Date();
      return { rows: [booking], rowCount: 1 };
    }
    console.log(`[DB] Booking not found for update`);
    return { rows: [], rowCount: 0 };
  }
  
  // DELETE FROM bookings
  if (normalizedText.includes('delete from bookings')) {
    const bookingId = params?.[0] as string;
    const userId = params?.[1] as string;
    console.log(`[DB] DELETE booking: id=${bookingId}, userId=${userId}`);
    console.log(`[DB] Current bookings count: ${bookings.size}`);
    const booking = bookings.get(bookingId);
    if (booking && booking.user_id === userId) {
      bookings.delete(bookingId);
      console.log(`[DB] Booking deleted successfully`);
      return { rows: [booking], rowCount: 1 };
    }
    console.log(`[DB] Booking not found or user mismatch`);
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
  
  // Default: return empty result
  return { rows: [], rowCount: 0 };
}

export const pool = { query };

export default { pool, query, initializeDatabase };

