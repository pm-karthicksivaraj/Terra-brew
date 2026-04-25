import AsyncStorage from '@react-native-async-storage/async-storage';
import { syncData } from './api';

// ─── Types ───────────────────────────────────────────────────────────────────
export interface SyncMutation {
  id: string;
  endpoint: string;
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  data: Record<string, unknown>;
  timestamp: string;
  retryCount: number;
  maxRetries: number;
}

export interface SyncStatus {
  pendingCount: number;
  lastSyncAt: string | null;
  isSyncing: boolean;
  errors: string[];
}

// ─── Storage Keys ────────────────────────────────────────────────────────────
const MUTATIONS_KEY = 'sync_mutations';
const LAST_SYNC_KEY = 'last_sync_timestamp';
const SYNC_STATUS_KEY = 'sync_status';

// ─── Mutation Queue ──────────────────────────────────────────────────────────

/**
 * Add a mutation to the offline sync queue.
 * Used when network is unavailable to persist changes locally.
 */
export async function enqueueMutation(
  endpoint: string,
  method: SyncMutation['method'],
  data: Record<string, unknown>
): Promise<string> {
  try {
    const mutations = await getMutations();
    const id = `mutation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const mutation: SyncMutation = {
      id,
      endpoint,
      method,
      data,
      timestamp: new Date().toISOString(),
      retryCount: 0,
      maxRetries: 3,
    };

    mutations.push(mutation);
    await AsyncStorage.setItem(MUTATIONS_KEY, JSON.stringify(mutations));

    return id;
  } catch (error) {
    console.error('Failed to enqueue mutation:', error);
    throw error;
  }
}

/**
 * Get all pending mutations from the queue.
 */
export async function getMutations(): Promise<SyncMutation[]> {
  try {
    const raw = await AsyncStorage.getItem(MUTATIONS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SyncMutation[];
  } catch {
    return [];
  }
}

/**
 * Remove a mutation from the queue after successful sync.
 */
export async function dequeueMutation(id: string): Promise<void> {
  try {
    const mutations = await getMutations();
    const filtered = mutations.filter((m) => m.id !== id);
    await AsyncStorage.setItem(MUTATIONS_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to dequeue mutation:', error);
  }
}

/**
 * Increment retry count for a mutation. Remove if max retries exceeded.
 */
async function incrementRetry(id: string): Promise<boolean> {
  try {
    const mutations = await getMutations();
    const index = mutations.findIndex((m) => m.id === id);
    if (index === -1) return false;

    mutations[index].retryCount += 1;
    if (mutations[index].retryCount >= mutations[index].maxRetries) {
      await dequeueMutation(id);
      return false; // Removed due to max retries
    }

    await AsyncStorage.setItem(MUTATIONS_KEY, JSON.stringify(mutations));
    return true; // Still in queue
  } catch {
    return false;
  }
}

// ─── Sync Operations ─────────────────────────────────────────────────────────

/**
 * Attempt to sync all pending mutations with the server.
 * Processes mutations in order, removing successful ones.
 */
export async function syncPendingMutations(): Promise<SyncStatus> {
  const mutations = await getMutations();
  const errors: string[] = [];

  if (mutations.length === 0) {
    return {
      pendingCount: 0,
      lastSyncAt: await getLastSyncTimestamp(),
      isSyncing: false,
      errors: [],
    };
  }

  // Mark as syncing
  await updateSyncStatus({ isSyncing: true });

  for (const mutation of mutations) {
    try {
      await processMutation(mutation);
      await dequeueMutation(mutation.id);
    } catch (error) {
      const stillInQueue = await incrementRetry(mutation.id);
      if (!stillInQueue) {
        errors.push(
          `Mutation ${mutation.id} failed after max retries: ${mutation.method} ${mutation.endpoint}`
        );
      } else {
        errors.push(
          `Mutation ${mutation.id} failed (retry ${mutation.retryCount + 1}/${mutation.maxRetries}): ${mutation.method} ${mutation.endpoint}`
        );
      }
    }
  }

  // Update last sync timestamp
  const now = new Date().toISOString();
  await AsyncStorage.setItem(LAST_SYNC_KEY, now);
  await updateSyncStatus({ isSyncing: false });

  const remainingMutations = await getMutations();

  return {
    pendingCount: remainingMutations.length,
    lastSyncAt: now,
    isSyncing: false,
    errors,
  };
}

/**
 * Process a single mutation by sending it to the API.
 */
async function processMutation(mutation: SyncMutation): Promise<void> {
  const { endpoint, method, data } = mutation;

  // Use fetch directly to avoid circular dependency with apiClient
  const token = await getStoredToken();
  const baseURL = __DEV__ ? 'http://localhost:3000' : 'https://terrabrew.app';

  const response = await fetch(`${baseURL}/api${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
}

/**
 * Full data sync — pull latest data from server.
 */
export async function performFullSync(): Promise<SyncStatus> {
  try {
    await updateSyncStatus({ isSyncing: true });

    // First, push any pending mutations
    const mutationStatus = await syncPendingMutations();

    // Then pull latest data from server
    const lastSync = await getLastSyncTimestamp();
    await syncData(lastSync || undefined);

    const now = new Date().toISOString();
    await AsyncStorage.setItem(LAST_SYNC_KEY, now);
    await updateSyncStatus({ isSyncing: false });

    return {
      pendingCount: mutationStatus.pendingCount,
      lastSyncAt: now,
      isSyncing: false,
      errors: mutationStatus.errors,
    };
  } catch (error) {
    await updateSyncStatus({ isSyncing: false });
    return {
      pendingCount: (await getMutations()).length,
      lastSyncAt: await getLastSyncTimestamp(),
      isSyncing: false,
      errors: [error instanceof Error ? error.message : 'Sync failed'],
    };
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function getLastSyncTimestamp(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(LAST_SYNC_KEY);
  } catch {
    return null;
  }
}

async function updateSyncStatus(partial: Partial<SyncStatus>): Promise<void> {
  try {
    const current = await getSyncStatus();
    const updated = { ...current, ...partial };
    await AsyncStorage.setItem(SYNC_STATUS_KEY, JSON.stringify(updated));
  } catch {
    // Ignore
  }
}

export async function getSyncStatus(): Promise<SyncStatus> {
  try {
    const raw = await AsyncStorage.getItem(SYNC_STATUS_KEY);
    if (!raw) {
      return {
        pendingCount: 0,
        lastSyncAt: null,
        isSyncing: false,
        errors: [],
      };
    }
    return JSON.parse(raw) as SyncStatus;
  } catch {
    return {
      pendingCount: 0,
      lastSyncAt: null,
      isSyncing: false,
      errors: [],
    };
  }
}

async function getStoredToken(): Promise<string | null> {
  try {
    // Use SecureStore directly to avoid circular imports
    const SecureStore = require('expo-secure-store');
    return await SecureStore.getItemAsync('auth_token');
  } catch {
    return null;
  }
}

/**
 * Clear all sync data (useful on logout).
 */
export async function clearSyncData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([MUTATIONS_KEY, LAST_SYNC_KEY, SYNC_STATUS_KEY]);
  } catch {
    // Ignore
  }
}

/**
 * Get count of pending mutations (lightweight check).
 */
export async function getPendingCount(): Promise<number> {
  const mutations = await getMutations();
  return mutations.length;
}
