'use client';

import { useEffect, useState, useCallback } from 'react';
import { replaySyncQueue, getSyncQueueSize } from '@/lib/offline-sync';

interface PWAState {
  /** Whether the browser is currently online */
  isOnline: boolean;
  /** The active ServiceWorkerRegistration, if any */
  registration: ServiceWorkerRegistration | null;
  /** Number of pending items in the offline sync queue */
  syncQueueSize: number;
  /** Whether a sync replay is currently in progress */
  isReplaying: boolean;
  /** Most recent replay result */
  lastReplayResult: { replayed: number; failed: number } | null;
}

/**
 * Hook that registers the Terra Brew service worker,
 * tracks online/offline status, and replays queued mutations
 * when connectivity is restored.
 */
export function usePWA(): PWAState {
  const [isOnline, setIsOnline] = useState(true);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [syncQueueSize, setSyncQueueSize] = useState(0);
  const [isReplaying, setIsReplaying] = useState(false);
  const [lastReplayResult, setLastReplayResult] = useState<{
    replayed: number;
    failed: number;
  } | null>(null);

  // ─── Register Service Worker ──────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;

    setIsOnline(navigator.onLine);

    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((reg) => {
        setRegistration(reg);

        // Check for updates
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (
                newWorker.state === 'activated' &&
                navigator.serviceWorker.controller
              ) {
                // New service worker activated — could notify user to reload
              }
            });
          }
        });
      })
      .catch((err) => {
        console.warn('[Terra Brew PWA] Service Worker registration failed:', err);
      });
  }, []);

  // ─── Online / Offline events ──────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => {
      setIsOnline(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // ─── Replay sync queue when coming back online ────────────────────────────────
  const replay = useCallback(async () => {
    setIsReplaying(true);
    try {
      const result = await replaySyncQueue();
      setLastReplayResult(result);
      const size = await getSyncQueueSize();
      setSyncQueueSize(size);
    } catch (err) {
      console.warn('[Terra Brew PWA] Sync replay failed:', err);
    } finally {
      setIsReplaying(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => {
      replay();
    };

    // Listen for the custom event from our service worker
    const handleSyncSuccess = () => {
      getSyncQueueSize().then(setSyncQueueSize);
    };

    // Listen for messages from the service worker
    const handleSWMessage = (event: MessageEvent) => {
      if (event.data?.type === 'BACKGROUND_SYNC_SUCCESS') {
        getSyncQueueSize().then(setSyncQueueSize);
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('backgroundsyncsuccess', handleSyncSuccess);
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleSWMessage);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('backgroundsyncsuccess', handleSyncSuccess);
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', handleSWMessage);
      }
    };
  }, [replay]);

  // ─── Poll sync queue size periodically ────────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateSize = () => {
      getSyncQueueSize().then(setSyncQueueSize).catch(() => {});
    };

    updateSize();
    const interval = setInterval(updateSize, 30_000); // every 30s
    return () => clearInterval(interval);
  }, []);

  return {
    isOnline,
    registration,
    syncQueueSize,
    isReplaying,
    lastReplayResult,
  };
}
