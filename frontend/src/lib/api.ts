import axios from 'axios'
import type { 
  AuthResponse, 
  SearchParams, 
  SearchResponse, 
  Trip, 
  Booking, 
  AIRecommendationResponse,
  ApiResponse 
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

export default api

