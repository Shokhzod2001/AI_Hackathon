import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authApi } from '@/api/auth'
import type { User } from '@/types'

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  loadUser: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      login: async (username, password) => {
        const tokens = await authApi.login(username, password)
        localStorage.setItem('access_token', tokens.access_token)
        localStorage.setItem('refresh_token', tokens.refresh_token)
        set({ accessToken: tokens.access_token, refreshToken: tokens.refresh_token, isAuthenticated: true })
        await get().loadUser()
      },

      logout: () => {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false })
      },

      loadUser: async () => {
        try {
          const user = await authApi.me()
          set({ user, isAuthenticated: true })
        } catch {
          get().logout()
        }
      },
    }),
    { name: 'auth-store', partialize: (s) => ({ accessToken: s.accessToken, refreshToken: s.refreshToken }) }
  )
)
