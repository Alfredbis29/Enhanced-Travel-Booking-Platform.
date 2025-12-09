export interface User {
  id: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  phone?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Booking {
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
  status: BookingStatus;
  passenger_name: string;
  passenger_phone: string;
  passenger_email?: string;
  booking_reference?: string;
  created_at: Date;
  updated_at: Date;
}

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface Trip {
  id: string;
  provider: string;
  provider_name: string;
  origin: string;
  destination: string;
  departure_time: string;
  arrival_time?: string;
  duration_minutes?: number;
  price: number;
  currency: string;
  available_seats: number;
  total_seats: number;
  bus_type?: string;
  amenities?: string[];
  rating?: number;
  image_url?: string;
}

export interface SearchParams {
  origin?: string;
  destination?: string;
  date?: string;
  min_price?: number;
  max_price?: number;
  page?: number;
  limit?: number;
  sort_by?: 'price' | 'departure_time' | 'duration' | 'rating';
  sort_order?: 'asc' | 'desc';
}

export interface SearchResponse {
  trips: Trip[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

export interface AIQueryResult {
  original_query: string;
  parsed_params: SearchParams;
  explanation: string;
  suggestions?: string[];
}

export interface JWTPayload {
  userId: string;
  email: string;
}

export interface AuthRequest extends Request {
  user?: JWTPayload;
}

