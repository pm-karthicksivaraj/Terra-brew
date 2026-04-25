import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';

// ─── Configuration ───────────────────────────────────────────────────────────
const BASE_URL = __DEV__
  ? 'http://localhost:3000'
  : 'https://terrabrew.app';

const API_PREFIX = '/api';

// ─── Types ───────────────────────────────────────────────────────────────────
export interface LoginRequest {
  email: string;
  password: string;
  tenantSlug: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    tenantId: string;
    tenantName: string;
    tenantSlug: string;
  };
}

export interface Farmer {
  id: string;
  name: string;
  email: string;
  phone: string;
  farmName: string;
  farmArea: number;
  location: string;
  latitude?: number;
  longitude?: number;
  status: 'active' | 'inactive';
  joinedAt: string;
  totalHarvest?: number;
}

export interface TraceabilityStage {
  id: string;
  batchId: string;
  stage: string;
  status: 'pending' | 'in_progress' | 'completed' | 'verified' | 'failed';
  timestamp: string;
  operator: string;
  location: string;
  notes?: string;
  data?: Record<string, unknown>;
}

export interface TraceabilityRecord {
  batchId: string;
  productName: string;
  productType: string;
  currentStage: string;
  status: string;
  stages: TraceabilityStage[];
  createdAt: string;
  updatedAt: string;
}

export interface NFCBinding {
  id: string;
  nfcTagId: string;
  entityType: 'farmer' | 'batch' | 'farm' | 'processing';
  entityId: string;
  entityName: string;
  verified: boolean;
  verifiedAt?: string;
  createdAt: string;
}

export interface DashboardStats {
  totalFarmers: number;
  totalFarmArea: number;
  activeBatches: number;
  completedTraceability: number;
  pendingVerifications: number;
  nfcTagsBound: number;
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: 'harvest' | 'processing' | 'verification' | 'nfc_bind' | 'batch_created';
  description: string;
  timestamp: string;
  entityName: string;
}

export interface QRVerificationResult {
  valid: boolean;
  batchId?: string;
  productName?: string;
  currentStage?: string;
  message: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ─── Axios Instance ──────────────────────────────────────────────────────────
const apiClient: AxiosInstance = axios.create({
  baseURL: `${BASE_URL}${API_PREFIX}`,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ─── Request Interceptor — Attach JWT ────────────────────────────────────────
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Attach tenant slug if available
      const tenantSlug = await SecureStore.getItemAsync('tenant_slug');
      if (tenantSlug && config.headers) {
        config.headers['X-Tenant-Slug'] = tenantSlug;
      }
    } catch (error) {
      // SecureStore may not be available in some environments
      console.warn('Failed to retrieve auth token from SecureStore:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor — Handle Auth Errors ───────────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear stored credentials
      try {
        await SecureStore.deleteItemAsync('auth_token');
        await SecureStore.deleteItemAsync('user_data');
        await SecureStore.deleteItemAsync('tenant_slug');
      } catch {
        // Ignore cleanup errors
      }
      // The auth store will detect the missing token and redirect to login
    }
    return Promise.reject(error);
  }
);

// ─── API Functions ───────────────────────────────────────────────────────────

// Auth
export const loginApi = (data: LoginRequest) =>
  apiClient.post<LoginResponse>('/mobile/auth', data);

// Farmers
export const getFarmers = (params?: { page?: number; pageSize?: number; search?: string }) =>
  apiClient.get<PaginatedResponse<Farmer>>('/farmers', { params });

export const getFarmerById = (id: string) =>
  apiClient.get<Farmer>(`/farmers/${id}`);

// Traceability
export const getTraceability = (batchId: string) =>
  apiClient.get<TraceabilityRecord>('/traceability', { params: { batchId } });

export const getTraceabilityList = (params?: { page?: number; pageSize?: number; status?: string }) =>
  apiClient.get<PaginatedResponse<TraceabilityRecord>>('/traceability', { params });

// QR Verification
export const verifyQR = (code: string) =>
  apiClient.post<QRVerificationResult>('/mobile/verify-qr', { code });

// NFC
export const getNFCBindings = (params?: { entityType?: string; entityId?: string }) =>
  apiClient.get<NFCBinding[]>('/nfc', { params });

export const getNFCBinding = (nfcTagId: string) =>
  apiClient.get<NFCBinding>(`/nfc/${nfcTagId}`);

export const createNFCBinding = (data: { nfcTagId: string; entityType: string; entityId: string }) =>
  apiClient.post<NFCBinding>('/nfc', data);

export const verifyNFC = (nfcTagId: string) =>
  apiClient.post<NFCBinding>(`/nfc/${nfcTagId}/verify`);

// Dashboard
export const getDashboardStats = () =>
  apiClient.get<DashboardStats>('/dashboard/stats');

// Sync
export const syncData = (lastSyncTimestamp?: string) =>
  apiClient.post('/mobile/sync', { lastSyncTimestamp });

// ─── Helper: Extract error message ──────────────────────────────────────────
export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message;
    if (typeof message === 'string') return message;
    if (Array.isArray(message)) return message.join(', ');
    return 'An unexpected error occurred';
  }
  if (error instanceof Error) return error.message;
  return 'An unexpected error occurred';
};

export default apiClient;
