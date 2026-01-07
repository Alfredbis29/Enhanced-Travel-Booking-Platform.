import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, Trip, SearchParams } from '@/types'

// 12 hours in milliseconds
const INACTIVITY_TIMEOUT = 12 * 60 * 60 * 1000

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  lastActivity: number | null
  setAuth: (user: User, token: string) => void
  logout: () => void
  updateUser: (updates: Partial<User>) => void
  updateActivity: () => void
  checkInactivity: () => boolean
}

interface SearchState {
  searchParams: SearchParams
  searchQuery: string
  selectedTrip: Trip | null
  recentSearches: string[]
  setSearchParams: (params: SearchParams) => void
  setSearchQuery: (query: string) => void
  setSelectedTrip: (trip: Trip | null) => void
  addRecentSearch: (query: string) => void
  clearSearch: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      lastActivity: null,

      setAuth: (user, token) => {
        localStorage.setItem('token', token)
        set({ user, token, isAuthenticated: true, lastActivity: Date.now() })
      },

      logout: () => {
        localStorage.removeItem('token')
        set({ user: null, token: null, isAuthenticated: false, lastActivity: null })
      },

      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      updateActivity: () => {
        if (get().isAuthenticated) {
          set({ lastActivity: Date.now() })
        }
      },

      checkInactivity: () => {
        const { lastActivity, isAuthenticated, logout } = get()
        if (!isAuthenticated || !lastActivity) return false
        
        const now = Date.now()
        const timeSinceActivity = now - lastActivity
        
        if (timeSinceActivity >= INACTIVITY_TIMEOUT) {
          logout()
          return true // User was logged out due to inactivity
        }
        return false
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token, 
        isAuthenticated: state.isAuthenticated,
        lastActivity: state.lastActivity 
      }),
      onRehydrateStorage: () => (state) => {
        // Immediately check for inactivity when the app loads
        // If user was inactive for 12+ hours, log them out right away
        if (state && state.isAuthenticated && state.lastActivity) {
          const now = Date.now()
          const timeSinceActivity = now - state.lastActivity
          
          if (timeSinceActivity >= INACTIVITY_TIMEOUT) {
            // Clear auth state immediately - don't let them appear logged in
            localStorage.removeItem('token')
            state.user = null
            state.token = null
            state.isAuthenticated = false
            state.lastActivity = null
          }
        }
      },
    }
  )
)

export const useSearchStore = create<SearchState>()(
  persist(
    (set) => ({
      searchParams: {},
      searchQuery: '',
      selectedTrip: null,
      recentSearches: [],

      setSearchParams: (params) =>
        set((state) => ({
          searchParams: { ...state.searchParams, ...params },
        })),

      setSearchQuery: (query) => set({ searchQuery: query }),

      setSelectedTrip: (trip) => set({ selectedTrip: trip }),

      addRecentSearch: (query) =>
        set((state) => ({
          recentSearches: [
            query,
            ...state.recentSearches.filter((s) => s !== query),
          ].slice(0, 5),
        })),

      clearSearch: () =>
        set({
          searchParams: {},
          searchQuery: '',
          selectedTrip: null,
        }),
    }),
    {
      name: 'search-storage',
      partialize: (state) => ({ recentSearches: state.recentSearches }),
    }
  )
)

