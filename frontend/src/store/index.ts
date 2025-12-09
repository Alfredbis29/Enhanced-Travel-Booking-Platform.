import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, Trip, SearchParams } from '@/types'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  setAuth: (user: User, token: string) => void
  logout: () => void
  updateUser: (updates: Partial<User>) => void
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
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user, token) => {
        localStorage.setItem('token', token)
        set({ user, token, isAuthenticated: true })
      },

      logout: () => {
        localStorage.removeItem('token')
        set({ user: null, token: null, isAuthenticated: false })
      },

      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
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

