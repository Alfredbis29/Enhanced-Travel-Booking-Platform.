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

// Get API URL from environment or use relative path
// In production, set VITE_API_URL to your backend URL (e.g., https://your-backend.vercel.app/api)
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

// Check if we should use mock mode (when no backend is available)
const USE_MOCK_AUTH = !import.meta.env.VITE_API_URL && import.meta.env.PROD

// Log API URL in development for debugging
if (import.meta.env.DEV) {
  console.log('API Base URL:', API_BASE_URL)
}
if (USE_MOCK_AUTH) {
  console.log('Running in demo mode - using mock authentication')
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout for slow connections
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

// Mock user for demo mode
const createMockUser = (email: string, firstName: string, lastName: string, phone?: string) => ({
  id: 'demo-' + Date.now(),
  email,
  first_name: firstName,
  last_name: lastName,
  phone: phone || undefined,
  created_at: new Date().toISOString()
})

// Auth endpoints
export const authApi = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    // Demo mode - simulate login
    if (USE_MOCK_AUTH) {
      // Check localStorage for registered users
      const users = JSON.parse(localStorage.getItem('demo_users') || '[]')
      const user = users.find((u: { email: string; password: string }) => u.email === email && u.password === password)
      if (user) {
        return {
          success: true,
          message: 'Login successful',
          data: {
            user: { id: user.id, email: user.email, first_name: user.first_name, last_name: user.last_name, phone: user.phone },
            token: 'demo-token-' + Date.now()
          }
        }
      }
      throw { response: { data: { message: 'Invalid email or password' } } }
    }
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
    // Demo mode - simulate registration
    if (USE_MOCK_AUTH) {
      const users = JSON.parse(localStorage.getItem('demo_users') || '[]')
      if (users.find((u: { email: string }) => u.email === userData.email)) {
        throw { response: { data: { message: 'Email already registered' } } }
      }
      const newUser = {
        ...createMockUser(userData.email, userData.first_name, userData.last_name, userData.phone),
        password: userData.password
      }
      users.push(newUser)
      localStorage.setItem('demo_users', JSON.stringify(users))
      return {
        success: true,
        message: 'Registration successful',
        data: {
          user: { id: newUser.id, email: newUser.email, first_name: newUser.first_name, last_name: newUser.last_name, phone: newUser.phone },
          token: 'demo-token-' + Date.now()
        }
      }
    }
    const { data } = await api.post<AuthResponse>('/auth/register', userData)
    return data
  },

  getProfile: async () => {
    if (USE_MOCK_AUTH) {
      const storedUser = localStorage.getItem('user')
      if (storedUser) return JSON.parse(storedUser)
      throw { response: { data: { message: 'Not authenticated' } } }
    }
    const { data } = await api.get<ApiResponse<{ user: AuthResponse['data']['user'] }>>('/auth/me')
    return data.data.user
  },

  updateProfile: async (updates: Partial<AuthResponse['data']['user']>) => {
    if (USE_MOCK_AUTH) {
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
      const updatedUser = { ...storedUser, ...updates }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      return updatedUser
    }
    const { data } = await api.put<ApiResponse<{ user: AuthResponse['data']['user'] }>>('/auth/me', updates)
    return data.data.user
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    if (USE_MOCK_AUTH) {
      return { success: true, message: 'Password updated (demo mode)' }
    }
    const { data } = await api.put('/auth/password', {
      current_password: currentPassword,
      new_password: newPassword,
    })
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
    if (USE_MOCK_AUTH) {
      const bookings = JSON.parse(localStorage.getItem('demo_bookings') || '[]')
      const newBooking: Booking = {
        id: 'booking-' + Date.now(),
        user_id: 'demo-user',
        trip_id: bookingData.trip_id,
        trip_provider: 'demo-provider',
        origin: 'Demo Origin',
        destination: 'Demo Destination',
        departure_time: new Date(Date.now() + 86400000).toISOString(),
        price: 2500,
        currency: 'KES',
        seats: bookingData.seats,
        status: 'pending',
        passenger_name: bookingData.passenger_name,
        passenger_phone: bookingData.passenger_phone,
        passenger_email: bookingData.passenger_email,
        booking_reference: 'TW' + Date.now().toString(36).toUpperCase(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      bookings.push(newBooking)
      localStorage.setItem('demo_bookings', JSON.stringify(bookings))
      return newBooking
    }
    const { data } = await api.post<ApiResponse<{ booking: Booking }>>('/bookings', bookingData)
    return data.data.booking
  },

  getBookings: async (params?: { page?: number; limit?: number; status?: string }) => {
    if (USE_MOCK_AUTH) {
      const bookings = JSON.parse(localStorage.getItem('demo_bookings') || '[]')
      return {
        bookings,
        pagination: { total: bookings.length, page: 1, limit: 10, pages: 1, has_more: false }
      }
    }
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
    if (USE_MOCK_AUTH) {
      const bookings = JSON.parse(localStorage.getItem('demo_bookings') || '[]')
      const booking = bookings.find((b: Booking) => b.id === bookingId)
      if (booking) return booking
      throw { response: { data: { message: 'Booking not found' } } }
    }
    const { data } = await api.get<ApiResponse<{ booking: Booking }>>(`/bookings/${bookingId}`)
    return data.data.booking
  },

  confirmBooking: async (bookingId: string): Promise<Booking> => {
    if (USE_MOCK_AUTH) {
      const bookings = JSON.parse(localStorage.getItem('demo_bookings') || '[]')
      const index = bookings.findIndex((b: Booking) => b.id === bookingId)
      if (index !== -1) {
        bookings[index].status = 'confirmed'
        localStorage.setItem('demo_bookings', JSON.stringify(bookings))
        return bookings[index]
      }
      throw { response: { data: { message: 'Booking not found' } } }
    }
    const { data } = await api.post<ApiResponse<{ booking: Booking }>>(`/bookings/${bookingId}/confirm`)
    return data.data.booking
  },

  cancelBooking: async (bookingId: string): Promise<Booking> => {
    if (USE_MOCK_AUTH) {
      const bookings = JSON.parse(localStorage.getItem('demo_bookings') || '[]')
      const index = bookings.findIndex((b: Booking) => b.id === bookingId)
      if (index !== -1) {
        bookings[index].status = 'cancelled'
        localStorage.setItem('demo_bookings', JSON.stringify(bookings))
        return bookings[index]
      }
      throw { response: { data: { message: 'Booking not found' } } }
    }
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

