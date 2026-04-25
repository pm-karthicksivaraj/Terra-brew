/**
 * Custom hook for offline sync state and actions.
 */
import { useSyncStore } from '@/lib/sync'
import { useEffect, useCallback } from 'react'
import { SYNC_CONFIG } from '@/constants'
import type { SyncEntityType, SyncAction } from '@/types'

export function useSync() {
  const store = useSyncStore()

  // Auto-restore sync state on mount
  useEffect(() => {
    store.restoreState()
  }, [])

  // Auto-sync on interval when online
  useEffect(() => {
    if (!store.isOnline || store.pendingCount === 0) return

    const interval = setInterval(() => {
      if (store.isOnline && !store.isSyncing && store.pendingCount > 0) {
        store.syncNow()
      }
    }, SYNC_CONFIG.SYNC_INTERVAL)

    return () => clearInterval(interval)
  }, [store.isOnline, store.pendingCount, store.isSyncing])

  const queueChange = useCallback(async (entity: SyncEntityType, action: SyncAction, data: Record<string, unknown>) => {
    await store.addChange(entity, action, data)
    // Immediately try to sync if online
    if (store.isOnline) {
      store.syncNow()
    }
  }, [store])

  return {
    isSyncing: store.isSyncing,
    isOnline: store.isOnline,
    lastSyncAt: store.lastSyncAt,
    pendingCount: store.pendingCount,
    conflicts: store.conflicts,
    pendingChanges: store.pendingChanges,
    error: store.error,

    syncNow: store.syncNow,
    queueChange,
    resolveConflict: store.resolveConflict,
    setOnlineStatus: store.setOnlineStatus,
  }
}
