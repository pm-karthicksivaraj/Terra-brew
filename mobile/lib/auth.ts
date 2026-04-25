/**
 * Authentication state management using Zustand.
 * Handles login, logout, token persistence, and user state.
 */
import { create } from 'zustand'
import { mobileLogin as apiLogin } from './api'
import { saveToken, removeToken, saveUser, removeUser, getUser, getToken, clearAll } from './storage'
import type { AuthState, LoginCredentials, AuthUser } from '@/types'

interface AuthStore extends AuthState {
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  restoreSession: () => Promise<void>
  updateUser: (user: Partial<AuthUser>) => void
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true, // Start true to handle session restore

  login: async (credentials: LoginCredentials) => {
    try {
      set({ isLoading: true })
      const response = await apiLogin(credentials)

      if (!response.success || !response.data) {
        set({ isLoading: false })
        return { success: false, error: response.error || 'Login failed' }
      }

      const { token, user } = response.data

      // Persist to secure storage
      await saveToken(token)
      await saveUser(JSON.stringify(user))

      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      })

      return { success: true }
    } catch (error) {
      set({ isLoading: false })
      return { success: false, error: error instanceof Error ? error.message : 'Network error' }
    }
  },

  logout: async () => {
    await clearAll()
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    })
  },

  restoreSession: async () => {
    try {
      const [token, userJson] = await Promise.all([getToken(), getUser()])

      if (token && userJson) {
        const user = JSON.parse(userJson) as AuthUser
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        })
      } else {
        set({ isLoading: false })
      }
    } catch {
      set({ isLoading: false })
    }
  },

  updateUser: (partial) => {
    const current = get().user
    if (current) {
      const updated = { ...current, ...partial }
      saveUser(JSON.stringify(updated))
      set({ user: updated })
    }
  },
}))
