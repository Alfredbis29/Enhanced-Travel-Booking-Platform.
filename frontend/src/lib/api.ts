import axios from 'axios'
import type { 
  AuthResponse, 
  SearchParams, 
  SearchResponse, 
  Trip, 
  Booking, 
  AIRecommendationResponse,
  ApiResponse,
  Payment,
  PaymentMethod,
  PaymentCurrency,
  PaymentMethodInfo,
  PaymentInitiateResponse,
  PaymentVerifyResponse
} from '@/types'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth endpoints
export const authApi = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/login', { email, password })
    return data
  },

  register: async (userData: {
    email: string
    password: string
    first_name: string
    last_name: string
    phone?: string
  }): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/register', userData)
    return data
  },

  getProfile: async () => {
    const { data } = await api.get<ApiResponse<{ user: AuthResponse['data']['user'] }>>('/auth/me')
    return data.data.user
  },

  updateProfile: async (updates: Partial<AuthResponse['data']['user']>) => {
    const { data } = await api.put<ApiResponse<{ user: AuthResponse['data']['user'] }>>('/auth/me', updates)
    return data.data.user
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    const { data } = await api.put('/auth/password', {
      current_password: currentPassword,
      new_password: newPassword,
    })
    return data
  },

  forgotPassword: async (email: string) => {
    const { data } = await api.post<ApiResponse<{ message: string }>>('/auth/forgot-password', { email })
    return data
  },

  resetPassword: async (token: string, email: string, password: string) => {
    const { data } = await api.post<ApiResponse<{ message: string }>>('/auth/reset-password', { 
      token, 
      email, 
      password 
    })
    return data
  },

  verifyEmail: async (token: string, email: string): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/verify-email', { token, email })
    return data
  },

  resendVerification: async (email: string) => {
    const { data } = await api.post<ApiResponse<{ message: string }>>('/auth/resend-verification', { email })
    return data
  },
}

// Search endpoints
export const searchApi = {
  searchTrips: async (params: SearchParams): Promise<SearchResponse> => {
    const { data } = await api.get<ApiResponse<SearchResponse>>('/search', { params })
    return data.data
  },

  getTripById: async (tripId: string): Promise<Trip> => {
    const { data } = await api.get<ApiResponse<{ trip: Trip }>>(`/search/trip/${tripId}`)
    return data.data.trip
  },

  getDestinations: async (): Promise<string[]> => {
    const { data } = await api.get<ApiResponse<{ destinations: string[] }>>('/search/destinations')
    return data.data.destinations
  },

  getOrigins: async (): Promise<string[]> => {
    const { data } = await api.get<ApiResponse<{ origins: string[] }>>('/search/origins')
    return data.data.origins
  },
}

// AI endpoints
export const aiApi = {
  getRecommendations: async (query: string): Promise<AIRecommendationResponse> => {
    const { data } = await api.post<ApiResponse<AIRecommendationResponse>>('/ai/recommendations', { query })
    return data.data
  },

  getSuggestions: async () => {
    const { data } = await api.get<ApiResponse<{
      text_suggestions: string[]
      featured_trips: Trip[]
      popular_destinations: string[]
    }>>('/ai/suggestions')
    return data.data
  },
}

// Booking endpoints
export const bookingApi = {
  createBooking: async (bookingData: {
    trip_id: string
    seats: number
    passenger_name: string
    passenger_phone: string
    passenger_email?: string
  }): Promise<Booking> => {
    const { data } = await api.post<ApiResponse<{ booking: Booking }>>('/bookings', bookingData)
    return data.data.booking
  },

  getBookings: async (params?: { page?: number; limit?: number; status?: string }) => {
    const { data } = await api.get<ApiResponse<{
      bookings: Booking[]
      pagination: {
        total: number
        page: number
        limit: number
        pages: number
        has_more: boolean
      }
    }>>('/bookings', { params })
    return data.data
  },

  getBookingById: async (bookingId: string): Promise<Booking> => {
    const { data } = await api.get<ApiResponse<{ booking: Booking }>>(`/bookings/${bookingId}`)
    return data.data.booking
  },

  confirmBooking: async (bookingId: string): Promise<Booking> => {
    const { data } = await api.post<ApiResponse<{ booking: Booking }>>(`/bookings/${bookingId}/confirm`)
    return data.data.booking
  },

  cancelBooking: async (bookingId: string): Promise<Booking> => {
    const { data } = await api.post<ApiResponse<{ booking: Booking }>>(`/bookings/${bookingId}/cancel`)
    return data.data.booking
  },
}

// Payment endpoints
export const paymentApi = {
  // Get available payment methods
  getPaymentMethods: async (country?: string): Promise<{
    methods: PaymentMethodInfo[]
    by_country?: Record<string, PaymentMethod[]>
  }> => {
    const params = country ? { country } : {}
    const { data } = await api.get<ApiResponse<{
      methods: PaymentMethodInfo[]
      by_country?: Record<string, PaymentMethod[]>
    }>>('/payments/methods', { params })
    return data.data
  },

  // Initiate a payment
  initiatePayment: async (request: {
    booking_id: string
    amount: number
    currency: PaymentCurrency
    method: PaymentMethod
    phone_number?: string
    return_url?: string
  }): Promise<PaymentInitiateResponse> => {
    const { data } = await api.post<ApiResponse<PaymentInitiateResponse>>('/payments/initiate', request)
    return data.data
  },

  // Verify payment status
  verifyPayment: async (paymentId: string): Promise<PaymentVerifyResponse> => {
    const { data } = await api.get<ApiResponse<PaymentVerifyResponse>>(`/payments/${paymentId}/verify`)
    return data.data
  },

  // Get payment details
  getPayment: async (paymentId: string): Promise<Payment> => {
    const { data } = await api.get<ApiResponse<Payment>>(`/payments/${paymentId}`)
    return data.data
  },

  // Get all user payments
  getUserPayments: async (): Promise<Payment[]> => {
    const { data } = await api.get<ApiResponse<Payment[]>>('/payments')
    return data.data
  },

  // Get payments for a booking
  getBookingPayments: async (bookingId: string): Promise<Payment[]> => {
    const { data } = await api.get<ApiResponse<Payment[]>>(`/payments/booking/${bookingId}`)
    return data.data
  },

  // Capture PayPal payment
  capturePayPalPayment: async (paymentId: string, paypalOrderId: string): Promise<PaymentVerifyResponse> => {
    const { data } = await api.post<ApiResponse<PaymentVerifyResponse>>(
      `/payments/${paymentId}/paypal/capture`,
      { paypal_order_id: paypalOrderId }
    )
    return data.data
  },

  // Request refund
  requestRefund: async (paymentId: string, reason: string): Promise<Payment> => {
    const { data } = await api.post<ApiResponse<Payment>>(`/payments/${paymentId}/refund`, { reason })
    return data.data
  },

  // Simulate payment completion (for testing)
  simulateComplete: async (paymentId: string): Promise<Payment> => {
    const { data } = await api.post<ApiResponse<Payment>>(`/payments/${paymentId}/simulate/complete`)
    return data.data
  },

  // Simulate payment failure (for testing)
  simulateFail: async (paymentId: string, reason?: string): Promise<Payment> => {
    const { data } = await api.post<ApiResponse<Payment>>(
      `/payments/${paymentId}/simulate/fail`,
      { reason }
    )
    return data.data
  },
}

export default api

