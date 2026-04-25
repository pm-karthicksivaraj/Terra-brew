/**
 * API Client for Terra Brew Mobile.
 * Handles authentication, request/response, offline queue, and error handling.
 */
import { getToken } from './storage'
import { API_BASE_URL } from '@/constants'
import type { ApiResponse } from '@/types'

// ════════════════════════════════════════════════════════════════
// HTTP CLIENT
// ════════════════════════════════════════════════════════════════

interface RequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  path: string
  body?: unknown
  params?: Record<string, string | number | boolean | undefined>
  headers?: Record<string, string>
  requireAuth?: boolean
}

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  private async buildHeaders(requireAuth: boolean = true): Promise<HeadersInit> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Platform': 'mobile',
      'X-App-Version': '1.0.0',
    }

    if (requireAuth) {
      const token = await getToken()
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
    }

    return headers
  }

  private buildUrl(path: string, params?: Record<string, string | number | boolean | undefined>): string {
    const url = new URL(`${this.baseUrl}${path}`)
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, String(value))
        }
      })
    }
    return url.toString()
  }

  async request<T>(config: RequestConfig): Promise<ApiResponse<T>> {
    const { method, path, body, params, headers: extraHeaders, requireAuth = true } = config

    try {
      const headers = await this.buildHeaders(requireAuth)
      const url = this.buildUrl(path, params)

      const response = await fetch(url, {
        method,
        headers: { ...headers, ...extraHeaders },
        body: body ? JSON.stringify(body) : undefined,
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP ${response.status}: ${response.statusText}`,
        }
      }

      return data as ApiResponse<T>
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Network error'
      return {
        success: false,
        error: message,
      }
    }
  }

  // ════════════════════════════════════════════════════════════════
  // CONVENIENCE METHODS
  // ════════════════════════════════════════════════════════════════

  async get<T>(path: string, params?: Record<string, string | number | boolean | undefined>, requireAuth = true): Promise<ApiResponse<T>> {
    return this.request<T>({ method: 'GET', path, params, requireAuth })
  }

  async post<T>(path: string, body?: unknown, requireAuth = true): Promise<ApiResponse<T>> {
    return this.request<T>({ method: 'POST', path, body, requireAuth })
  }

  async put<T>(path: string, body?: unknown, requireAuth = true): Promise<ApiResponse<T>> {
    return this.request<T>({ method: 'PUT', path, body, requireAuth })
  }

  async patch<T>(path: string, body?: unknown, requireAuth = true): Promise<ApiResponse<T>> {
    return this.request<T>({ method: 'PATCH', path, body, requireAuth })
  }

  async delete<T>(path: string, requireAuth = true): Promise<ApiResponse<T>> {
    return this.request<T>({ method: 'DELETE', path, requireAuth })
  }
}

// Singleton instance
export const api = new ApiClient()

// ════════════════════════════════════════════════════════════════
// API ENDPOINT FUNCTIONS
// ════════════════════════════════════════════════════════════════

import type {
  AuthUser,
  LoginCredentials,
  Farmer,
  FarmLand,
  HarvestTraceability,
  ProcurementRecord,
  ProcessingJobOrder,
  CoffeeInspection,
  DashboardStats,
  QRVerificationResult,
  SyncPullResult,
  SyncResult,
  PendingChange,
  NFCTag,
} from '@/types'

// ── Auth ──────────────────────────────────────────────────────

export async function mobileLogin(credentials: LoginCredentials): Promise<ApiResponse<{ token: string; user: AuthUser }>> {
  return api.post<{ token: string; user: AuthUser }>('/api/mobile/auth', credentials, false)
}

// ── Dashboard ──────────────────────────────────────────────────

export async function getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
  return api.get<DashboardStats>('/api/dashboard/stats')
}

// ── Farmers ────────────────────────────────────────────────────

export async function getFarmers(page = 1, pageSize = 20, search?: string): Promise<ApiResponse<{ items: Farmer[]; total: number }>> {
  return api.get<{ items: Farmer[]; total: number }>('/api/farmers', { page, pageSize, search })
}

export async function getFarmer(id: string): Promise<ApiResponse<Farmer>> {
  return api.get<Farmer>(`/api/farmers`, { id })
}

export async function createFarmer(data: Record<string, unknown>): Promise<ApiResponse<Farmer>> {
  return api.post<Farmer>('/api/farmers', data)
}

export async function updateFarmer(id: string, data: Record<string, unknown>): Promise<ApiResponse<Farmer>> {
  return api.put<Farmer>(`/api/farmers`, { id, ...data })
}

// ── Farm Lands ─────────────────────────────────────────────────

export async function getFarmLands(page = 1, pageSize = 20): Promise<ApiResponse<{ items: FarmLand[]; total: number }>> {
  return api.get<{ items: FarmLand[]; total: number }>('/api/farmlands', { page, pageSize })
}

// ── Harvest ────────────────────────────────────────────────────

export async function getHarvests(page = 1, pageSize = 20, batchId?: string): Promise<ApiResponse<{ items: HarvestTraceability[]; total: number }>> {
  return api.get<{ items: HarvestTraceability[]; total: number }>('/api/harvest-traceabilities', { page, pageSize, batchId })
}

export async function createHarvest(data: Record<string, unknown>): Promise<ApiResponse<HarvestTraceability>> {
  return api.post<HarvestTraceability>('/api/harvest-traceabilities', data)
}

// ── Procurement ────────────────────────────────────────────────

export async function getProcurements(page = 1, pageSize = 20): Promise<ApiResponse<{ items: ProcurementRecord[]; total: number }>> {
  return api.get<{ items: ProcurementRecord[]; total: number }>('/api/procurement', { page, pageSize })
}

export async function createProcurement(data: Record<string, unknown>): Promise<ApiResponse<ProcurementRecord>> {
  return api.post<ProcurementRecord>('/api/procurement', data)
}

// ── Processing ─────────────────────────────────────────────────

export async function getProcessingOrders(page = 1, pageSize = 20): Promise<ApiResponse<{ items: ProcessingJobOrder[]; total: number }>> {
  return api.get<{ items: ProcessingJobOrder[]; total: number }>('/api/processing', { page, pageSize })
}

// ── Inspections ────────────────────────────────────────────────

export async function getInspections(page = 1, pageSize = 20): Promise<ApiResponse<{ items: CoffeeInspection[]; total: number }>> {
  return api.get<{ items: CoffeeInspection[]; total: number }>('/api/coffee-inspections', { page, pageSize })
}

// ── QR/NFC Verification (Public) ──────────────────────────────

export async function verifyQROnline(qrCode: string): Promise<ApiResponse<QRVerificationResult>> {
  return api.get<QRVerificationResult>(`/api/public/verify/${encodeURIComponent(qrCode)}`, undefined, false)
}

// ── Hash Chain ─────────────────────────────────────────────────

export async function getHashChain(batchId: string): Promise<ApiResponse<{ blocks: unknown[]; verification: unknown }>> {
  return api.get<{ blocks: unknown[]; verification: unknown }>('/api/hash-chain', { batchId })
}

// ── NFC ────────────────────────────────────────────────────────

export async function getNFCTags(page = 1, pageSize = 20): Promise<ApiResponse<{ items: NFCTag[]; total: number }>> {
  return api.get<{ items: NFCTag[]; total: number }>('/api/nfc', { page, pageSize })
}

export async function createNFCTag(entityType: string, entityId: string, nfcTagId: string): Promise<ApiResponse<NFCTag>> {
  return api.post<NFCTag>('/api/nfc', { entityType, entityId, nfcTagId })
}

export async function verifyNFCTap(nfcTagId: string): Promise<ApiResponse<QRVerificationResult>> {
  return api.put<QRVerificationResult>('/api/nfc', { nfcTagId })
}

// ── Offline Sync ───────────────────────────────────────────────

export async function pullSync(since: string, entities?: string[]): Promise<ApiResponse<SyncPullResult>> {
  return api.get<SyncPullResult>('/api/mobile/sync', { since, entities: entities?.join(',') })
}

export async function pushSync(changes: PendingChange[]): Promise<ApiResponse<SyncResult>> {
  return api.post<SyncResult>('/api/mobile/sync', {
    changes: changes.map(c => ({
      entity: c.entity,
      action: c.action,
      data: c.data,
      clientTimestamp: c.clientTimestamp,
      clientId: c.clientId,
    })),
  })
}

// ── On-Chain Anchor ────────────────────────────────────────────

export async function anchorOnChain(batchId: string): Promise<ApiResponse<Record<string, unknown>>> {
  return api.post<Record<string, unknown>>('/api/on-chain/anchor', { batchId })
}

export async function getAnchorStatus(batchId: string): Promise<ApiResponse<Record<string, unknown> | null>> {
  return api.get<Record<string, unknown> | null>('/api/on-chain/anchor', { batchId })
}
