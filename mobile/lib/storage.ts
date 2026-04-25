/**
 * Secure storage utility using expo-secure-store for sensitive data
 * and AsyncStorage for non-sensitive data.
 */
import * as SecureStore from 'expo-secure-store'
import AsyncStorage from '@react-native-async-storage/async-storage'

const TOKEN_KEY = 'terra_brew_auth_token'
const USER_KEY = 'terra_brew_auth_user'
const SYNC_STATE_KEY = 'terra_brew_sync_state'
const LAST_SYNC_KEY = 'terra_brew_last_sync'
const PENDING_CHANGES_KEY = 'terra_brew_pending_changes'

// ════════════════════════════════════════════════════════════════
// SECURE STORAGE (encrypted, for auth tokens)
// ════════════════════════════════════════════════════════════════

export async function saveToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token)
}

export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY)
}

export async function removeToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY)
}

export async function saveUser(user: string): Promise<void> {
  await SecureStore.setItemAsync(USER_KEY, user)
}

export async function getUser(): Promise<string | null> {
  return SecureStore.getItemAsync(USER_KEY)
}

export async function removeUser(): Promise<void> {
  await SecureStore.deleteItemAsync(USER_KEY)
}

// ════════════════════════════════════════════════════════════════
// ASYNC STORAGE (for non-sensitive cached data)
// ════════════════════════════════════════════════════════════════

export async function saveCachedData<T>(key: string, data: T): Promise<void> {
  await AsyncStorage.setItem(`terra_brew_${key}`, JSON.stringify(data))
}

export async function getCachedData<T>(key: string): Promise<T | null> {
  const raw = await AsyncStorage.getItem(`terra_brew_${key}`)
  if (!raw) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export async function removeCachedData(key: string): Promise<void> {
  await AsyncStorage.removeItem(`terra_brew_${key}`)
}

export async function clearAllCache(): Promise<void> {
  const keys = await AsyncStorage.getAllKeys()
  const terraKeys = keys.filter(k => k.startsWith('terra_brew_'))
  await AsyncStorage.multiRemove(terraKeys)
}

// ════════════════════════════════════════════════════════════════
// SYNC STORAGE
// ════════════════════════════════════════════════════════════════

export async function saveLastSyncTimestamp(timestamp: string): Promise<void> {
  await AsyncStorage.setItem(LAST_SYNC_KEY, timestamp)
}

export async function getLastSyncTimestamp(): Promise<string | null> {
  return AsyncStorage.getItem(LAST_SYNC_KEY)
}

export async function savePendingChanges(changes: string): Promise<void> {
  await AsyncStorage.setItem(PENDING_CHANGES_KEY, changes)
}

export async function getPendingChanges(): Promise<string | null> {
  return AsyncStorage.getItem(PENDING_CHANGES_KEY)
}

export async function saveSyncState(state: string): Promise<void> {
  await AsyncStorage.setItem(SYNC_STATE_KEY, state)
}

export async function getSyncState(): Promise<string | null> {
  return AsyncStorage.getItem(SYNC_STATE_KEY)
}

// ════════════════════════════════════════════════════════════════
// FULL CLEAR (logout)
// ════════════════════════════════════════════════════════════════

export async function clearAll(): Promise<void> {
  await Promise.all([
    removeToken(),
    removeUser(),
    clearAllCache(),
  ])
}
