import { Request } from 'express';

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
  payment_id?: string;
  payment_status?: PaymentStatus;
  payment_method?: PaymentMethod;
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

// ==================== PAYMENT TYPES ====================

export type PaymentMethod = 
  | 'mpesa'           // Kenya - Safaricom M-Pesa
  | 'mtn_momo'        // Rwanda - MTN Mobile Money
  | 'airtel_money'    // Congo - Airtel Money
  | 'paypal'          // International - PayPal
  | 'visa'            // International - Visa Card
  | 'mastercard';     // International - Mastercard

export type PaymentStatus = 
  | 'pending'         // Payment initiated
  | 'processing'      // Payment being processed
  | 'completed'       // Payment successful
  | 'failed'          // Payment failed
  | 'cancelled'       // Payment cancelled by user
  | 'refunded';       // Payment refunded

export type PaymentCurrency = 'KES' | 'UGX' | 'RWF' | 'USD' | 'CDF';

export interface Payment {
  id: string;
  booking_id: string;
  user_id: string;
  amount: number;
  currency: PaymentCurrency;
  method: PaymentMethod;
  status: PaymentStatus;
  provider_transaction_id?: string;  // Transaction ID from payment provider
  provider_reference?: string;       // Reference from payment provider
  phone_number?: string;             // For mobile money payments
  card_last_four?: string;           // Last 4 digits of card
  card_brand?: string;               // Visa, Mastercard
  paypal_email?: string;             // For PayPal payments
  failure_reason?: string;           // Reason if payment failed
  metadata?: Record<string, unknown>; // Additional provider-specific data
  created_at: Date;
  updated_at: Date;
  completed_at?: Date;
}

export interface PaymentInitiateRequest {
  booking_id: string;
  amount: number;
  currency: PaymentCurrency;
  method: PaymentMethod;
  phone_number?: string;             // Required for mobile money
  card_token?: string;               // Tokenized card for card payments
  paypal_order_id?: string;          // PayPal order ID
  return_url?: string;               // Redirect URL after payment
  callback_url?: string;             // Webhook callback URL
}

export interface PaymentInitiateResponse {
  payment_id: string;
  status: PaymentStatus;
  checkout_url?: string;             // URL to redirect for payment (PayPal, card)
  stk_push_sent?: boolean;           // For M-Pesa STK push
  ussd_code?: string;                // USSD code for manual payment
  instructions?: string;             // Payment instructions
  expires_at?: Date;                 // Payment expiry time
}

export interface PaymentVerifyResponse {
  payment_id: string;
  status: PaymentStatus;
  amount: number;
  currency: PaymentCurrency;
  method: PaymentMethod;
  provider_transaction_id?: string;
  completed_at?: Date;
  failure_reason?: string;
}

export interface MpesaSTKPushRequest {
  phone_number: string;
  amount: number;
  account_reference: string;
  transaction_desc: string;
}

export interface MpesaSTKPushResponse {
  merchant_request_id: string;
  checkout_request_id: string;
  response_code: string;
  response_description: string;
  customer_message: string;
}

export interface MpesaCallbackData {
  merchant_request_id: string;
  checkout_request_id: string;
  result_code: number;
  result_desc: string;
  amount?: number;
  mpesa_receipt_number?: string;
  transaction_date?: string;
  phone_number?: string;
}

export interface MTNMomoRequest {
  phone_number: string;
  amount: number;
  currency: string;
  external_id: string;
  payer_message: string;
  payee_note: string;
}

export interface AirtelMoneyRequest {
  phone_number: string;
  amount: number;
  currency: string;
  reference: string;
  transaction_id: string;
}

export interface CardPaymentRequest {
  card_token: string;
  amount: number;
  currency: string;
  description: string;
  metadata?: Record<string, unknown>;
}

export interface PayPalOrderRequest {
  amount: number;
  currency: string;
  description: string;
  return_url: string;
  cancel_url: string;
}

// Payment method availability by country
export const PAYMENT_METHODS_BY_COUNTRY: Record<string, PaymentMethod[]> = {
  'Kenya': ['mpesa', 'paypal', 'visa', 'mastercard'],
  'Uganda': ['mtn_momo', 'airtel_money', 'paypal', 'visa', 'mastercard'],
  'Rwanda': ['mtn_momo', 'paypal', 'visa', 'mastercard'],
  'DRC': ['airtel_money', 'paypal', 'visa', 'mastercard'],
  'Tanzania': ['mpesa', 'airtel_money', 'paypal', 'visa', 'mastercard'],
};

export const PAYMENT_METHOD_INFO: Record<PaymentMethod, { name: string; icon: string; description: string }> = {
  'mpesa': {
    name: 'M-Pesa',
    icon: '📱',
    description: 'Pay with Safaricom M-Pesa mobile money'
  },
  'mtn_momo': {
    name: 'MTN Mobile Money',
    icon: '📱',
    description: 'Pay with MTN Mobile Money'
  },
  'airtel_money': {
    name: 'Airtel Money',
    icon: '📱',
    description: 'Pay with Airtel Money'
  },
  'paypal': {
    name: 'PayPal',
    icon: '💳',
    description: 'Pay securely with PayPal'
  },
  'visa': {
    name: 'Visa Card',
    icon: '💳',
    description: 'Pay with Visa debit or credit card'
  },
  'mastercard': {
    name: 'Mastercard',
    icon: '💳',
    description: 'Pay with Mastercard debit or credit card'
  }
};
