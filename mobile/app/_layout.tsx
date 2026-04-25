/**
 * Root layout for Terra Brew Mobile.
 * Handles session restore and routing between auth and main app.
 */
import { Stack } from 'expo-router'
import { useEffect, useState } from 'react'
import { View, ActivityIndicator, StyleSheet } from 'react-native'
import { useAuthStore } from '@/lib/auth'
import { useSyncStore } from '@/lib/sync'
import { initNFC } from '@/lib/nfc'
import { Colors } from '@/constants'
import * as Network from 'expo-network'

export default function RootLayout() {
  const restoreSession = useAuthStore(s => s.restoreSession)
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  const isLoading = useAuthStore(s => s.isLoading)
  const setOnlineStatus = useSyncStore(s => s.setOnlineStatus)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    async function bootstrap() {
      // Restore auth session
      await restoreSession()

      // Initialize NFC
      await initNFC()

      // Restore sync state
      await useSyncStore.getState().restoreState()

      // Monitor network
      try {
        const initialState = await Network.getNetworkStateAsync()
        setOnlineStatus(initialState.isConnected ?? false)

        // Poll network status every 30 seconds
        setInterval(async () => {
          try {
            const state = await Network.getNetworkStateAsync()
            setOnlineStatus(state.isConnected ?? false)
          } catch {}
        }, 30000)
      } catch {}

      setReady(true)
    }
    bootstrap()
  }, [])

  if (!ready || isLoading) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    )
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <Stack.Screen name="(auth)" />
      ) : (
        <Stack.Screen name="(tabs)" />
      )}
    </Stack>
  )
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
