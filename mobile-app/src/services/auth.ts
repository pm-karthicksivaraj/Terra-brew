import * as SecureStore from 'expo-secure-store';
import { loginApi, LoginRequest, LoginResponse, getErrorMessage } from './api';

// ─── Storage Keys ────────────────────────────────────────────────────────────
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';
const TENANT_KEY = 'tenant_slug';
const REFRESH_KEY = 'refresh_token';

// ─── Types ───────────────────────────────────────────────────────────────────
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  tenantId: string;
  tenantName: string;
  tenantSlug: string;
}

export interface AuthResult {
  success: boolean;
  user?: AuthUser;
  token?: string;
  error?: string;
}

// ─── Token Parsing ───────────────────────────────────────────────────────────
interface JWTPayload {
  exp: number;
  iat: number;
  sub: string;
  email: string;
  role: string;
  tenantId: string;
  [key: string]: unknown;
}

function parseJWT(token: string): JWTPayload | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

function isTokenExpired(token: string): boolean {
  const payload = parseJWT(token);
  if (!payload) return true;
  // Add 30 second buffer to handle clock skew
  return Date.now() >= (payload.exp - 30) * 1000;
}

// ─── Auth Service ────────────────────────────────────────────────────────────

/**
 * Authenticate user with email, password, and tenant slug.
 * Stores JWT and user data in SecureStore on success.
 */
export async function login(
  email: string,
  password: string,
  tenantSlug: string
): Promise<AuthResult> {
  try {
    const request: LoginRequest = { email, password, tenantSlug };
    const response = await loginApi(request);
    const { token, user } = response.data;

    // Store auth data securely
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
    await SecureStore.setItemAsync(TENANT_KEY, tenantSlug);

    return {
      success: true,
      user,
      token,
    };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}

/**
 * Clear all stored auth data and log the user out.
 */
export async function logout(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
    await SecureStore.deleteItemAsync(TENANT_KEY);
    await SecureStore.deleteItemAsync(REFRESH_KEY);
  } catch {
    // Ignore errors during cleanup
  }
}

/**
 * Retrieve the stored JWT token.
 * Returns null if no token is stored or if it has expired.
 */
export async function getToken(): Promise<string | null> {
  try {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    if (!token) return null;
    if (isTokenExpired(token)) {
      // Auto-cleanup expired tokens
      await logout();
      return null;
    }
    return token;
  } catch {
    return null;
  }
}

/**
 * Retrieve the stored user data.
 */
export async function getUser(): Promise<AuthUser | null> {
  try {
    const userData = await SecureStore.getItemAsync(USER_KEY);
    if (!userData) return null;
    return JSON.parse(userData) as AuthUser;
  } catch {
    return null;
  }
}

/**
 * Get the stored tenant slug.
 */
export async function getTenantSlug(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(TENANT_KEY);
  } catch {
    return null;
  }
}

/**
 * Check if the user is currently authenticated.
 * Verifies that a valid, non-expired token exists.
 */
export async function isAuthenticated(): Promise<boolean> {
  const token = await getToken();
  return token !== null;
}

/**
 * Update stored user data (e.g., after profile changes).
 */
export async function updateUser(user: AuthUser): Promise<void> {
  try {
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
  } catch {
    // Ignore storage errors
  }
}
