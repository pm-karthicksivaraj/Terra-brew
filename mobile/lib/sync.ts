/**
 * Offline-First Sync Engine for Terra Brew Mobile.
 * 
 * Architecture:
 * 1. All mutations go through the sync engine
 * 2. Changes are queued locally in AsyncStorage
 * 3. When online, queued changes are pushed to server
 * 4. Server pulls latest data and updates local cache
 * 5. Conflict resolution: server-wins by default, with manual override option
 * 
 * Conflict Resolution Strategy:
 * - For creates: If server has a record with same unique key, return conflict
 * - For updates: If server updatedAt > clientTimestamp, return conflict
 * - For deletes: If record was modified after clientTimestamp, return conflict
 * - Conflicts are stored locally and shown to user for manual resolution
 */
import { create } from 'zustand'
import { savePendingChanges, getPendingChanges, saveLastSyncTimestamp, getLastSyncTimestamp, saveCachedData, getCachedData } from './storage'
import { pullSync, pushSync } from './api'
import { SYNC_CONFIG } from '@/constants'
import type { PendingChange, SyncConflict, SyncEntityType, SyncAction, SyncPullResult } from '@/types'

interface SyncStore {
  isSyncing: boolean
  isOnline: boolean
  lastSyncAt: string | null
  pendingCount: number
  conflicts: SyncConflict[]
  pendingChanges: PendingChange[]
  error: string | null

  // Actions
  addChange: (entity: SyncEntityType, action: SyncAction, data: Record<string, unknown>) => Promise<void>
  syncNow: () => Promise<{ applied: number; conflicts: SyncConflict[] }>
  resolveConflict: (conflictIndex: number, resolution: 'client' | 'server') => Promise<void>
  clearConflicts: () => void
  setOnlineStatus: (online: boolean) => void
  restoreState: () => Promise<void>
  pullLatest: () => Promise<SyncPullResult | null>
}

function generateClientId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

function calculateRetryDelay(retries: number): number {
  const delay = SYNC_CONFIG.RETRY_BASE_DELAY * Math.pow(2, retries)
  return Math.min(delay, SYNC_CONFIG.RETRY_MAX_DELAY)
}

export const useSyncStore = create<SyncStore>((set, get) => ({
  isSyncing: false,
  isOnline: true,
  lastSyncAt: null,
  pendingCount: 0,
  conflicts: [],
  pendingChanges: [],
  error: null,

  addChange: async (entity, action, data) => {
    const { pendingChanges } = get()

    // Check for duplicate pending changes on the same entity
    // If there's already a pending "create" and we're now "updating", merge them
    const existingIndex = pendingChanges.findIndex(
      c => c.entity === entity && c.data.id === data.id && c.action !== 'delete'
    )

    let updatedChanges: PendingChange[]

    if (existingIndex >= 0 && action === 'update') {
      // Merge update into existing pending change
      updatedChanges = [...pendingChanges]
      updatedChanges[existingIndex] = {
        ...updatedChanges[existingIndex],
        data: { ...updatedChanges[existingIndex].data, ...data },
        clientTimestamp: new Date().toISOString(),
      }
    } else if (existingIndex >= 0 && action === 'delete') {
      // Replace with delete
      updatedChanges = [...pendingChanges]
      updatedChanges[existingIndex] = {
        ...updatedChanges[existingIndex],
        action: 'delete',
        data: { id: data.id },
        clientTimestamp: new Date().toISOString(),
      }
    } else {
      // New pending change
      const change: PendingChange = {
        id: generateClientId(),
        entity,
        action,
        data,
        clientTimestamp: new Date().toISOString(),
        clientId: generateClientId(),
        retries: 0,
        maxRetries: SYNC_CONFIG.MAX_RETRIES,
        status: 'pending',
        createdAt: new Date().toISOString(),
      }
      updatedChanges = [...pendingChanges, change]
    }

    // Enforce max pending changes
    if (updatedChanges.length > SYNC_CONFIG.MAX_PENDING_CHANGES) {
      updatedChanges = updatedChanges.slice(-SYNC_CONFIG.MAX_PENDING_CHANGES)
    }

    set({
      pendingChanges: updatedChanges,
      pendingCount: updatedChanges.filter(c => c.status === 'pending').length,
    })

    // Persist to storage
    await savePendingChanges(JSON.stringify(updatedChanges))
  },

  syncNow: async () => {
    const { isSyncing, isOnline, pendingChanges } = get()
    if (isSyncing || !isOnline) {
      return { applied: 0, conflicts: [] }
    }

    set({ isSyncing: true, error: null })

    try {
      let totalApplied = 0
      const allConflicts: SyncConflict[] = []

      // 1. Push pending changes in batches
      const pendingItems = pendingChanges.filter(c => c.status === 'pending')
      
      for (let i = 0; i < pendingItems.length; i += SYNC_CONFIG.BATCH_SIZE) {
        const batch = pendingItems.slice(i, i + SYNC_CONFIG.BATCH_SIZE)

        // Mark as syncing
        const updatedChanges = [...get().pendingChanges]
        batch.forEach(item => {
          const idx = updatedChanges.findIndex(c => c.id === item.id)
          if (idx >= 0) updatedChanges[idx] = { ...updatedChanges[idx], status: 'syncing' }
        })
        set({ pendingChanges: updatedChanges })

        const response = await pushSync(batch)

        if (response.success && response.data) {
          const { applied, conflicts } = response.data
          totalApplied += applied
          allConflicts.push(...conflicts)

          // Remove successfully applied changes
          const appliedIds = batch.slice(0, applied).map(b => b.id)
          const remaining = get().pendingChanges.filter(c => !appliedIds.includes(c.id))
          
          // Mark conflicted changes
          const withConflicts = remaining.map(c => {
            const isConflicted = conflicts.some(conf => 
              conf.entity === c.entity && conf.entityId === c.data.id as string
            )
            return isConflicted ? { ...c, status: 'conflicted' as const } : c
          })

          // Mark failed changes (increase retry count)
          const final = withConflicts.map(c => {
            if (c.status === 'syncing') {
              const newRetries = c.retries + 1
              return {
                ...c,
                retries: newRetries,
                status: newRetries >= c.maxRetries ? 'failed' as const : 'pending' as const,
              }
            }
            return c
          })

          set({
            pendingChanges: final,
            pendingCount: final.filter(c => c.status === 'pending').length,
          })
        } else {
          // Push failed, mark batch back to pending with retry
          const updatedChanges = [...get().pendingChanges]
          batch.forEach(item => {
            const idx = updatedChanges.findIndex(c => c.id === item.id)
            if (idx >= 0) {
              const newRetries = updatedChanges[idx].retries + 1
              updatedChanges[idx] = {
                ...updatedChanges[idx],
                retries: newRetries,
                status: newRetries >= SYNC_CONFIG.MAX_RETRIES ? 'failed' : 'pending',
                error: response.error,
              }
            }
          })
          set({
            pendingChanges: updatedChanges,
            pendingCount: updatedChanges.filter(c => c.status === 'pending').length,
          })
        }
      }

      // 2. Pull latest data from server
      const lastSync = get().lastSyncAt || new Date(0).toISOString()
      await get().pullLatest()

      // 3. Update sync timestamp
      const now = new Date().toISOString()
      await saveLastSyncTimestamp(now)
      set({ lastSyncAt: now, isSyncing: false, conflicts: allConflicts })

      // Persist pending changes
      await savePendingChanges(JSON.stringify(get().pendingChanges))

      return { applied: totalApplied, conflicts: allConflicts }
    } catch (error) {
      set({
        isSyncing: false,
        error: error instanceof Error ? error.message : 'Sync failed',
      })
      return { applied: 0, conflicts: [] }
    }
  },

  resolveConflict: async (conflictIndex, resolution) => {
    const { conflicts, pendingChanges } = get()
    const conflict = conflicts[conflictIndex]
    if (!conflict) return

    if (resolution === 'client') {
      // Re-queue the client version as a new pending change
      const newChange: PendingChange = {
        id: generateClientId(),
        entity: conflict.entity,
        action: 'update',
        data: conflict.clientData,
        clientTimestamp: new Date().toISOString(),
        clientId: generateClientId(),
        retries: 0,
        maxRetries: SYNC_CONFIG.MAX_RETRIES,
        status: 'pending',
        createdAt: new Date().toISOString(),
      }
      set({ pendingChanges: [...pendingChanges, newChange] })
    }

    // Remove from conflicts
    const updatedConflicts = conflicts.filter((_, i) => i !== conflictIndex)
    set({ conflicts: updatedConflicts })
  },

  clearConflicts: () => set({ conflicts: [] }),

  setOnlineStatus: (online) => {
    set({ isOnline: online })
    // Auto-sync when coming back online
    if (online && get().pendingCount > 0) {
      get().syncNow()
    }
  },

  restoreState: async () => {
    const [pendingJson, lastSync] = await Promise.all([
      getPendingChanges(),
      getLastSyncTimestamp(),
    ])

    const pendingChanges: PendingChange[] = pendingJson ? JSON.parse(pendingJson) : []
    set({
      pendingChanges,
      pendingCount: pendingChanges.filter(c => c.status === 'pending').length,
      lastSyncAt: lastSync,
    })
  },

  pullLatest: async () => {
    const lastSync = get().lastSyncAt || new Date(0).toISOString()
    const response = await pullSync(lastSync)

    if (response.success && response.data) {
      // Cache each entity type locally
      const { farmers, farmlands, harvests, procurements, processing, inspections, serverTimestamp } = response.data

      await Promise.all([
        saveCachedData('farmers', farmers),
        saveCachedData('farmlands', farmlands),
        saveCachedData('harvests', harvests),
        saveCachedData('procurements', procurements),
        saveCachedData('processing', processing),
        saveCachedData('inspections', inspections),
        saveLastSyncTimestamp(serverTimestamp),
      ])

      set({ lastSyncAt: serverTimestamp })
      return response.data
    }

    return null
  },
}))
