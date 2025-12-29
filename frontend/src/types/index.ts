export interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  phone?: string
  is_verified?: boolean
  created_at?: string
}

export type TravelMode = 'bus' | 'flight' | 'train' | 'ferry' | 'shuttle'

export interface Trip {
  id: string
  provider: string
  provider_name: string
  origin: string
  destination: string
  departure_time: string
  arrival_time?: string
  duration_minutes?: number
  price: number
  currency: string
  available_seats: number
  total_seats: number
  travel_mode?: TravelMode
  vehicle_type?: string // bus_type renamed for flexibility
  bus_type?: string // kept for backward compatibility
  amenities?: string[]
  rating?: number
  image_url?: string
  class?: string // economy, business, first class
}

// Travel mode display info
export const TRAVEL_MODE_INFO: Record<TravelMode, { name: string; icon: string; color: string }> = {
  bus: { name: 'Bus', icon: '🚌', color: 'bg-sky-600' },
  flight: { name: 'Flight', icon: '✈️', color: 'bg-violet-600' },
  train: { name: 'Train', icon: '🚂', color: 'bg-emerald-600' },
  ferry: { name: 'Ferry', icon: '⛴️', color: 'bg-blue-600' },
  shuttle: { name: 'Shuttle', icon: '🚐', color: 'bg-amber-600' }
}

export interface Booking {
  id: string
  user_id: string
  trip_id: string
  trip_provider: string
  origin: string
  destination: string
  departure_time: string
  arrival_time?: string
  price: number
  currency: string
  seats: number
  status: BookingStatus
  passenger_name: string
  passenger_phone: string
  passenger_email?: string
  booking_reference?: string
  payment_id?: string
  payment_status?: PaymentStatus
  payment_method?: PaymentMethod
  created_at: string
  updated_at: string
  trip_details?: {
    provider_name: string
    bus_type?: string
    amenities?: string[]
    image_url?: string
    rating?: number
  }
}

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'

export interface SearchParams {
  origin?: string
  destination?: string
  date?: string
  min_price?: number
  max_price?: number
  page?: number
  limit?: number
  sort_by?: 'price' | 'departure_time' | 'duration' | 'rating'
  sort_order?: 'asc' | 'desc'
  bus_type?: string
}

export interface SearchResponse {
  trips: Trip[]
  total: number
  page: number
  limit: number
  has_more: boolean
}

export interface AIRecommendationResponse {
  ai_interpretation: {
    original_query: string
    parsed_params: SearchParams
    explanation: string
    suggestions?: string[]
    confidence?: number
  }
  search_results: SearchResponse
}

export interface AuthResponse {
  success: boolean
  message: string
  data: {
    user: User
    token: string
  }
}

export interface ApiResponse<T> {
  success: boolean
  message?: string
  data: T
}

// ==================== PAYMENT TYPES ====================

export type PaymentMethod = 
  | 'mpesa'           // Kenya - Safaricom M-Pesa
  | 'mtn_momo'        // Rwanda - MTN Mobile Money
  | 'airtel_money'    // Congo - Airtel Money
  | 'paypal'          // International - PayPal
  | 'visa'            // International - Visa Card
  | 'mastercard'      // International - Mastercard

export type PaymentStatus = 
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'refunded'

export type PaymentCurrency = 'KES' | 'UGX' | 'RWF' | 'USD' | 'CDF'

export interface Payment {
  id: string
  booking_id: string
  user_id: string
  amount: number
  currency: PaymentCurrency
  method: PaymentMethod
  status: PaymentStatus
  provider_transaction_id?: string
  phone_number?: string
  card_last_four?: string
  card_brand?: string
  failure_reason?: string
  created_at: string
  updated_at: string
  completed_at?: string
}

export interface PaymentMethodInfo {
  id: PaymentMethod
  name: string
  icon: string
  description: string
  available_in?: string[]
}

export interface PaymentInitiateRequest {
  booking_id: string
  amount: number
  currency: PaymentCurrency
  method: PaymentMethod
  phone_number?: string
  card_token?: string
  return_url?: string
}

export interface PaymentInitiateResponse {
  payment_id: string
  status: PaymentStatus
  checkout_url?: string
  stk_push_sent?: boolean
  ussd_code?: string
  instructions?: string
  expires_at?: string
}

export interface PaymentVerifyResponse {
  payment_id: string
  status: PaymentStatus
  amount: number
  currency: PaymentCurrency
  method: PaymentMethod
  provider_transaction_id?: string
  completed_at?: string
  failure_reason?: string
}

// Payment method info for UI
export const PAYMENT_METHOD_INFO: Record<PaymentMethod, { name: string; icon: string; description: string; color: string }> = {
  mpesa: {
    name: 'M-Pesa',
    icon: '📱',
    description: 'Pay with Safaricom M-Pesa',
    color: 'bg-green-600'
  },
  mtn_momo: {
    name: 'MTN Mobile Money',
    icon: '📱',
    description: 'Pay with MTN MoMo',
    color: 'bg-yellow-500'
  },
  airtel_money: {
    name: 'Airtel Money',
    icon: '📱',
    description: 'Pay with Airtel Money',
    color: 'bg-red-600'
  },
  paypal: {
    name: 'PayPal',
    icon: '💳',
    description: 'Pay securely with PayPal',
    color: 'bg-blue-600'
  },
  visa: {
    name: 'Visa',
    icon: '💳',
    description: 'Pay with Visa card',
    color: 'bg-blue-800'
  },
  mastercard: {
    name: 'Mastercard',
    icon: '💳',
    description: 'Pay with Mastercard',
    color: 'bg-orange-600'
  }
}

// Payment methods by country
export const PAYMENT_METHODS_BY_COUNTRY: Record<string, PaymentMethod[]> = {
  'Kenya': ['mpesa', 'paypal', 'visa', 'mastercard'],
  'Uganda': ['mtn_momo', 'airtel_money', 'paypal', 'visa', 'mastercard'],
  'Rwanda': ['mtn_momo', 'paypal', 'visa', 'mastercard'],
  'DRC': ['airtel_money', 'paypal', 'visa', 'mastercard'],
  'Tanzania': ['mpesa', 'airtel_money', 'paypal', 'visa', 'mastercard'],
}

// Currency symbols
export const CURRENCY_SYMBOLS: Record<PaymentCurrency, string> = {
  KES: 'KSh',
  UGX: 'USh',
  RWF: 'FRw',
  USD: '$',
  CDF: 'FC'
}
