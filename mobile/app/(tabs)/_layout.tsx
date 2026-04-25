/**
 * Tab layout — Main app navigation with bottom tabs.
 * Tabs: Dashboard | Scan | Trace | Profile
 */
import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '@/constants'
import { OfflineBanner } from '@/components/ui'
import { useSyncStore } from '@/lib/sync'
import { View, StyleSheet } from 'react-native'

export default function TabLayout() {
  const isOnline = useSyncStore(s => s.isOnline)
  const pendingCount = useSyncStore(s => s.pendingCount)
  const isSyncing = useSyncStore(s => s.isSyncing)
  const syncNow = useSyncStore(s => s.syncNow)

  return (
    <View style={styles.container}>
      <OfflineBanner
        isOnline={isOnline}
        pendingCount={pendingCount}
        isSyncing={isSyncing}
        onSyncPress={syncNow}
      />
      <Tabs
        screenOptions={{
          headerShown: true,
          headerStyle: {
            backgroundColor: Colors.surface,
            borderBottomColor: Colors.border,
            borderBottomWidth: 1,
          },
          headerTitleStyle: {
            fontFamily: 'SpaceMono',
            fontSize: 16,
            fontWeight: '700',
            color: Colors.text,
          },
          headerTintColor: Colors.primary,
          tabBarStyle: {
            backgroundColor: Colors.surface,
            borderTopColor: Colors.border,
            borderTopWidth: 1,
            height: 60,
            paddingBottom: 8,
          },
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: Colors.textMuted,
          tabBarLabelStyle: {
            fontFamily: 'SpaceMono',
            fontSize: 10,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Tổng quan',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="grid-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="scan"
          options={{
            title: 'Quét mã',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="scan-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="trace"
          options={{
            title: 'Truy xuất',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="link-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Tài khoản',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person-outline" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
})
