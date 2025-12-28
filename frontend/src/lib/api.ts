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
    // Use mock search when no backend
    if (USE_MOCK_AUTH || !import.meta.env.VITE_API_URL) {
      const origin = params.origin || 'Nairobi'
      const destination = params.destination || 'Mombasa'
      const trips = generateMockTrips({ origin, destination, date: params.date })
      
      // Apply filters
      let filtered = trips
      if (params.min_price) {
        filtered = filtered.filter(t => t.price >= params.min_price!)
      }
      if (params.max_price) {
        filtered = filtered.filter(t => t.price <= params.max_price!)
      }
      
      // Sort
      if (params.sort_by === 'price') {
        filtered.sort((a, b) => params.sort_order === 'desc' ? b.price - a.price : a.price - b.price)
      } else if (params.sort_by === 'duration') {
        filtered.sort((a, b) => {
          const aDuration = a.duration_minutes || 0
          const bDuration = b.duration_minutes || 0
          return params.sort_order === 'desc' ? bDuration - aDuration : aDuration - bDuration
        })
      }
      
      return {
        trips: filtered,
        total: filtered.length,
        page: params.page || 1,
        limit: params.limit || 10,
        has_more: false
      }
    }
    
    const { data } = await api.get<ApiResponse<SearchResponse>>('/search', { params })
    return data.data
  },

  getTripById: async (tripId: string): Promise<Trip> => {
    // Mock trip lookup
    if (USE_MOCK_AUTH || !import.meta.env.VITE_API_URL) {
      const trips = generateMockTrips({ origin: 'Nairobi', destination: 'Mombasa' })
      return trips[0] // Return first mock trip
    }
    
    const { data } = await api.get<ApiResponse<{ trip: Trip }>>(`/search/trip/${tripId}`)
    return data.data.trip
  },

  getDestinations: async (): Promise<string[]> => {
    if (USE_MOCK_AUTH || !import.meta.env.VITE_API_URL) {
      return CITIES
    }
    const { data } = await api.get<ApiResponse<{ destinations: string[] }>>('/search/destinations')
    return data.data.destinations
  },

  getOrigins: async (): Promise<string[]> => {
    if (USE_MOCK_AUTH || !import.meta.env.VITE_API_URL) {
      return CITIES
    }
    const { data } = await api.get<ApiResponse<{ origins: string[] }>>('/search/origins')
    return data.data.origins
  },
}

// East African cities for AI parsing
const CITIES = [
  'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Malindi', 'Thika',
  'Kampala', 'Entebbe', 'Jinja', 'Mbarara', 'Gulu',
  'Dar es Salaam', 'Arusha', 'Mwanza', 'Dodoma', 'Zanzibar', 'Moshi',
  'Kigali', 'Butare', 'Gisenyi', 'Musanze', 'Rubavu',
  'Goma', 'Bukavu', 'Kinshasa', 'Lubumbashi',
  'Bujumbura', 'Gitega', 'Ngozi',
  'Juba', 'Addis Ababa'
]

const PROVIDERS = [
  { id: 'easy-coach', name: 'Easy Coach', rating: 4.5 },
  { id: 'modern-coast', name: 'Modern Coast', rating: 4.6 },
  { id: 'trans-africa', name: 'Trans Africa Express', rating: 4.4 },
  { id: 'safari-link', name: 'Safari Link Airways', rating: 4.7 },
  { id: 'mash-poa', name: 'Mash Poa', rating: 4.4 },
  { id: 'tahmeed', name: 'Tahmeed Express', rating: 4.5 },
]

// Parse natural language query for AI search
const parseAIQuery = (query: string): { origin?: string; destination?: string; date?: string; busType?: string; pricePreference?: string } => {
  const lowerQuery = query.toLowerCase()
  let origin: string | undefined
  let destination: string | undefined
  
  // Find cities mentioned in query
  const foundCities: string[] = []
  for (const city of CITIES) {
    if (lowerQuery.includes(city.toLowerCase())) {
      foundCities.push(city)
    }
  }
  
  // Parse "from X to Y" pattern
  const fromToMatch = lowerQuery.match(/from\s+(\w+(?:\s+\w+)?)\s+to\s+(\w+(?:\s+\w+)?)/i)
  if (fromToMatch) {
    origin = CITIES.find(c => c.toLowerCase() === fromToMatch[1].toLowerCase()) || foundCities[0]
    destination = CITIES.find(c => c.toLowerCase() === fromToMatch[2].toLowerCase()) || foundCities[1]
  } else if (foundCities.length >= 2) {
    origin = foundCities[0]
    destination = foundCities[1]
  } else if (foundCities.length === 1) {
    // If only destination mentioned, assume Nairobi as origin
    destination = foundCities[0]
    if (destination !== 'Nairobi') origin = 'Nairobi'
  }
  
  // Parse date
  let date: string | undefined
  const today = new Date()
  if (lowerQuery.includes('today')) {
    date = today.toISOString().split('T')[0]
  } else if (lowerQuery.includes('tomorrow')) {
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    date = tomorrow.toISOString().split('T')[0]
  } else if (lowerQuery.includes('weekend') || lowerQuery.includes('saturday')) {
    const daysUntilSat = (6 - today.getDay() + 7) % 7 || 7
    const saturday = new Date(today)
    saturday.setDate(saturday.getDate() + daysUntilSat)
    date = saturday.toISOString().split('T')[0]
  } else if (lowerQuery.includes('next week')) {
    const nextWeek = new Date(today)
    nextWeek.setDate(nextWeek.getDate() + 7)
    date = nextWeek.toISOString().split('T')[0]
  }
  
  // Parse bus type preference
  let busType: string | undefined
  if (lowerQuery.includes('vip')) busType = 'VIP'
  else if (lowerQuery.includes('executive')) busType = 'Executive'
  else if (lowerQuery.includes('sleeper') || lowerQuery.includes('night')) busType = 'Sleeper'
  
  // Parse price preference
  let pricePreference: string | undefined
  if (lowerQuery.includes('cheap') || lowerQuery.includes('budget') || lowerQuery.includes('affordable')) {
    pricePreference = 'cheap'
  } else if (lowerQuery.includes('luxury') || lowerQuery.includes('premium')) {
    pricePreference = 'luxury'
  }
  
  return { origin, destination, date, busType, pricePreference }
}

// Generate mock trips for AI search
const generateMockTrips = (params: { origin?: string; destination?: string; date?: string; busType?: string; pricePreference?: string }): Trip[] => {
  const origin = params.origin || 'Nairobi'
  const destination = params.destination || 'Mombasa'
  const baseDate = params.date ? new Date(params.date) : new Date(Date.now() + 86400000)
  
  // Currency based on origin
  const currencyMap: Record<string, string> = {
    'Nairobi': 'KES', 'Mombasa': 'KES', 'Kisumu': 'KES',
    'Kampala': 'UGX', 'Entebbe': 'UGX',
    'Kigali': 'RWF', 'Bujumbura': 'BIF',
    'Dar es Salaam': 'TZS', 'Arusha': 'TZS',
    'Goma': 'USD', 'Kinshasa': 'CDF'
  }
  const currency = currencyMap[origin] || 'KES'
  
  // Base price by currency
  const basePrices: Record<string, number> = {
    'KES': 1500, 'UGX': 50000, 'RWF': 8000, 'TZS': 30000, 'USD': 25, 'CDF': 50000, 'BIF': 15000
  }
  const basePrice = basePrices[currency] || 1500
  
  // Generate 5-8 trips
  const numTrips = 5 + Math.floor(Math.random() * 4)
  const trips: Trip[] = []
  
  for (let i = 0; i < numTrips; i++) {
    const provider = PROVIDERS[i % PROVIDERS.length]
    const departureHour = 6 + i * 2 // Spread departures through the day
    const durationMinutes = 240 + Math.floor(Math.random() * 300)
    const departureTime = new Date(baseDate)
    departureTime.setHours(departureHour, 0, 0, 0)
    const arrivalTime = new Date(departureTime.getTime() + durationMinutes * 60000)
    
    // Determine bus type
    let busType = params.busType || ['Standard', 'Executive', 'VIP'][i % 3]
    
    // Adjust price based on bus type
    let price = basePrice + Math.floor(Math.random() * basePrice * 0.5)
    if (busType === 'VIP') price *= 1.5
    else if (busType === 'Executive') price *= 1.2
    if (params.pricePreference === 'cheap') price *= 0.8
    else if (params.pricePreference === 'luxury') price *= 1.4
    
    trips.push({
      id: `trip-ai-${Date.now()}-${i}`,
      provider: provider.id,
      provider_name: provider.name,
      origin,
      destination,
      departure_time: departureTime.toISOString(),
      arrival_time: arrivalTime.toISOString(),
      duration_minutes: durationMinutes,
      price: Math.round(price),
      currency,
      available_seats: 15 + Math.floor(Math.random() * 25),
      total_seats: 45,
      bus_type: busType,
      amenities: ['AC', 'USB Charging', ...(busType !== 'Standard' ? ['WiFi', 'Reclining Seats'] : [])],
      rating: provider.rating,
      image_url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&h=400&fit=crop&q=80'
    })
  }
  
  // Sort by price if cheap preference, by rating if luxury
  if (params.pricePreference === 'cheap') {
    trips.sort((a, b) => a.price - b.price)
  } else if (params.pricePreference === 'luxury') {
    trips.sort((a, b) => (b.rating || 0) - (a.rating || 0))
  }
  
  return trips
}

// AI endpoints
export const aiApi = {
  getRecommendations: async (query: string): Promise<AIRecommendationResponse> => {
    // Use mock AI search when no backend
    if (USE_MOCK_AUTH || !import.meta.env.VITE_API_URL) {
      const parsed = parseAIQuery(query)
      const trips = generateMockTrips(parsed)
      
      let explanation = `Found ${trips.length} trips`
      if (parsed.origin && parsed.destination) {
        explanation = `Found ${trips.length} trips from ${parsed.origin} to ${parsed.destination}`
      } else if (parsed.destination) {
        explanation = `Found ${trips.length} trips to ${parsed.destination}`
      }
      if (parsed.busType) explanation += ` with ${parsed.busType} class`
      if (parsed.pricePreference === 'cheap') explanation += ', sorted by lowest price'
      if (parsed.date) explanation += ` for ${new Date(parsed.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}`
      
      return {
        ai_interpretation: {
          original_query: query,
          parsed_params: {
            origin: parsed.origin,
            destination: parsed.destination,
            date: parsed.date,
            bus_type: parsed.busType
          },
          explanation,
          confidence: 0.85 + Math.random() * 0.1
        },
        search_results: {
          trips,
          total: trips.length,
          page: 1,
          limit: 10,
          has_more: false
        }
      }
    }
    
    const { data } = await api.post<ApiResponse<AIRecommendationResponse>>('/ai/recommendations', { query })
    return data.data
  },

  getSuggestions: async () => {
    // Mock suggestions for demo mode
    if (USE_MOCK_AUTH || !import.meta.env.VITE_API_URL) {
      return {
        text_suggestions: [
          "Find buses from Nairobi to Mombasa tomorrow",
          "Show VIP coaches to Kampala this weekend",
          "Cheapest route to Kigali next week"
        ],
        featured_trips: [],
        popular_destinations: ['Mombasa', 'Kampala', 'Kigali', 'Dar es Salaam', 'Arusha']
      }
    }
    
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

