/**
 * Terra Brew — IndexedDB-based Offline Sync Queue
 *
 * Stores pending mutations (POST/PUT/DELETE) when offline
 * and auto-replays them when connectivity is restored.
 *
 * Uses:
 *  - 'backgroundsyncsuccess' custom event from the service worker
 *  - 'online' browser event as fallback
 *
 * Store name: 'sync-queue'  (separate from the SW's own IndexedDB store)
 */

const DB_NAME = 'terra-brew-offline-sync';
const DB_VERSION = 1;
const STORE_NAME = 'sync-queue';

// ─── Types ──────────────────────────────────────────────────────────────────────

export interface SyncQueueEntry {
  id?: number;
  method: string;
  url: string;
  body: unknown;
  headers?: Record<string, string>;
  timestamp: number;
}

// ─── IndexedDB Wrapper ──────────────────────────────────────────────────────────

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, {
          keyPath: 'id',
          autoIncrement: true,
        });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function withTransaction<T>(
  mode: IDBTransactionMode,
  work: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  return openDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, mode);
        const store = tx.objectStore(STORE_NAME);
        const req = work(store);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      })
  );
}

// ─── Public API ─────────────────────────────────────────────────────────────────

/**
 * Add a mutation request to the offline sync queue.
 * Called when a POST/PUT/DELETE fails due to being offline.
 */
export async function addToSyncQueue(
  method: string,
  url: string,
  body: unknown,
  headers?: Record<string, string>
): Promise<number> {
  const entry: SyncQueueEntry = {
    method: method.toUpperCase(),
    url,
    body,
    headers,
    timestamp: Date.now(),
  };

  const id = await withTransaction<IDBValidKey>('readwrite', (store) => store.add(entry));
  return id as number;
}

/**
 * Replay all queued mutations in order.
 * On success, each entry is removed from the queue.
 * On failure, we stop and leave remaining entries for the next attempt.
 *
 * Returns the number of successfully replayed entries.
 */
export async function replaySyncQueue(): Promise<{ replayed: number; failed: number }> {
  const db = await openDB();
  const entries: SyncQueueEntry[] = await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });

  if (entries.length === 0) return { replayed: 0, failed: 0 };

  let replayed = 0;
  let failed = 0;

  for (const entry of entries) {
    try {
      const fetchOpts: RequestInit = {
        method: entry.method,
        headers: {
          'Content-Type': 'application/json',
          ...entry.headers,
        },
      };

      if (entry.body !== null && entry.body !== undefined) {
        fetchOpts.body = JSON.stringify(entry.body);
      }

      const response = await fetch(entry.url, fetchOpts);

      if (response.ok) {
        // Remove from queue
        await withTransaction('readwrite', (store) => store.delete(entry.id!));
        replayed++;
      } else {
        // Server rejected — keep in queue for manual review? Or discard?
        // We'll mark as failed but still remove to avoid infinite loops.
        failed++;
      }
    } catch {
      // Network error again — stop replaying, will retry later
      failed++;
      break;
    }
  }

  // Dispatch a custom event so UI can react
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('backgroundsyncsuccess', {
        detail: { replayed, failed },
      })
    );
  }

  return { replayed, failed };
}

/**
 * Get the current number of items in the sync queue.
 */
export async function getSyncQueueSize(): Promise<number> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.count();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Get all entries in the sync queue (useful for UI display).
 */
export async function getSyncQueue(): Promise<SyncQueueEntry[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Clear the entire sync queue.
 */
export async function clearSyncQueue(): Promise<void> {
  await withTransaction('readwrite', (store) => store.clear());
}
