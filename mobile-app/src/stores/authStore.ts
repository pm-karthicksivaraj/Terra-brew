import { create } from 'zustand';
import { AuthUser } from '../services/auth';

// ─── Types ───────────────────────────────────────────────────────────────────
export type Language = 'en' | 'vi';

interface AuthState {
  // User data
  user: AuthUser | null;
  token: string | null;
  tenantSlug: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  lang: Language;

  // Actions
  setUser: (user: AuthUser) => void;
  setToken: (token: string) => void;
  setTenantSlug: (slug: string) => void;
  setAuthenticated: (value: boolean) => void;
  setLoading: (loading: boolean) => void;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  logout: () => void;
  hydrate: (user: AuthUser, token: string, tenantSlug: string) => void;
}

// ─── Store ───────────────────────────────────────────────────────────────────
export const useAuthStore = create<AuthState>((set, get) => ({
  // Initial state
  user: null,
  token: null,
  tenantSlug: null,
  isAuthenticated: false,
  isLoading: true, // Start true to handle initial auth check
  lang: 'en',

  // Actions
  setUser: (user) =>
    set({ user, isAuthenticated: true }),

  setToken: (token) =>
    set({ token }),

  setTenantSlug: (tenantSlug) =>
    set({ tenantSlug }),

  setAuthenticated: (isAuthenticated) =>
    set({ isAuthenticated }),

  setLoading: (isLoading) =>
    set({ isLoading }),

  setLang: (lang) =>
    set({ lang }),

  toggleLang: () => {
    const current = get().lang;
    set({ lang: current === 'en' ? 'vi' : 'en' });
  },

  logout: () =>
    set({
      user: null,
      token: null,
      tenantSlug: null,
      isAuthenticated: false,
      isLoading: false,
    }),

  hydrate: (user, token, tenantSlug) =>
    set({
      user,
      token,
      tenantSlug,
      isAuthenticated: true,
      isLoading: false,
    }),
}));

// ─── Selectors ───────────────────────────────────────────────────────────────
export const selectUser = (state: AuthState) => state.user;
export const selectIsAuthenticated = (state: AuthState) => state.isAuthenticated;
export const selectIsLoading = (state: AuthState) => state.isLoading;
export const selectLang = (state: AuthState) => state.lang;
export const selectTenantName = (state: AuthState) => state.user?.tenantName ?? '';
export const selectUserName = (state: AuthState) => state.user?.name ?? '';
