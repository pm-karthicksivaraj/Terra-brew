/**
 * Custom hook for authentication state and actions.
 */
import { useAuthStore } from '@/lib/auth'
import type { LoginCredentials } from '@/types'

export function useAuth() {
  const store = useAuthStore()

  return {
    user: store.user,
    token: store.token,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,

    login: async (credentials: LoginCredentials) => {
      return store.login(credentials)
    },

    logout: async () => {
      await store.logout()
    },

    restoreSession: async () => {
      await store.restoreSession()
    },
  }
}
