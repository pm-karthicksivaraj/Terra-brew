/**
 * Profile Screen — User info, settings, sync status, logout.
 */
import React from 'react'
import { View, Text, ScrollView, StyleSheet, Alert, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useAuthStore } from '@/lib/auth'
import { useSync } from '@/hooks/useSync'
import { Card, Button, Badge, Divider } from '@/components/ui'
import { Colors, Spacing } from '@/constants'

export default function ProfileScreen() {
  const user = useAuthStore(s => s.user)
  const logout = useAuthStore(s => s.logout)
  const { isOnline, pendingCount, lastSyncAt, isSyncing, syncNow, conflicts } = useSync()

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc muốn đăng xuất? Dữ liệu ngoại tuyến sẽ được giữ lại.',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Đăng xuất', style: 'destructive', onPress: logout },
      ]
    )
  }

  const formatDateTime = (iso: string | null) => {
    if (!iso) return 'Chưa đồng bộ'
    return new Date(iso).toLocaleString('vi-VN')
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* User Info Card */}
        <Card style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0)?.toUpperCase() || 'T'}
            </Text>
          </View>
          <Text style={styles.userName}>{user?.name || 'Người dùng'}</Text>
          <Text style={styles.userEmail}>{user?.email || ''}</Text>
          <View style={styles.roleBadges}>
            <Badge
              label={user?.role === 'tenant_admin' ? 'Quản trị viên' : user?.role === 'manager' ? 'Quản lý' : user?.role === 'field_officer' ? 'Cán bộ nông nghiệp' : user?.role === 'inspector' ? 'Kiểm định viên' : user?.role === 'farmer' ? 'Nông dân' : 'Người xem'}
              variant="info"
              size="md"
            />
            <Badge label={isOnline ? 'Trực tuyến' : 'Ngoại tuyến'} variant={isOnline ? 'success' : 'error'} size="md" />
          </View>
        </Card>

        {/* Tenant Info */}
        <Card style={styles.infoCard}>
          <Text style={styles.infoCardTitle}>Thông tin đối tác</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tên đối tác</Text>
            <Text style={styles.infoValue}>{user?.tenantName || '-'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Mã đối tác</Text>
            <Text style={styles.infoValue}>@{user?.tenantSlug || '-'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tiền tệ</Text>
            <Text style={styles.infoValue}>{user?.currencySymbol} {user?.currency || 'VND'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Ngôn ngữ</Text>
            <Text style={styles.infoValue}>{user?.language === 'vi' ? 'Tiếng Việt' : 'English'}</Text>
          </View>
        </Card>

        {/* Sync Status */}
        <Card style={styles.infoCard}>
          <Text style={styles.infoCardTitle}>Trạng thái đồng bộ</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Kết nối</Text>
            <Badge label={isOnline ? 'Trực tuyến' : 'Ngoại tuyến'} variant={isOnline ? 'success' : 'error'} />
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Đồng bộ lần cuối</Text>
            <Text style={styles.infoValue}>{formatDateTime(lastSyncAt)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Thay đổi chờ</Text>
            <Text style={[styles.infoValue, { color: pendingCount > 0 ? Colors.warning : Colors.success }]}>
              {pendingCount} thay đổi
            </Text>
          </View>
          {conflicts.length > 0 && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Xung đột</Text>
              <Text style={[styles.infoValue, { color: Colors.error }]}>{conflicts.length} xung đột</Text>
            </View>
          )}
          <Button
            title={isSyncing ? 'Đang đồng bộ...' : 'Đồng bộ ngay'}
            onPress={syncNow}
            loading={isSyncing}
            disabled={!isOnline || isSyncing}
            variant="outline"
            fullWidth
            style={styles.syncButton}
          />
        </Card>

        {/* Security Info */}
        <Card style={styles.infoCard}>
          <Text style={styles.infoCardTitle}>Bảo mật</Text>
          <View style={styles.securityItem}>
            <Ionicons name="lock-closed-outline" size={16} color={Colors.success} />
            <Text style={styles.securityText}>AES-256-GCM mã hóa PII</Text>
          </View>
          <View style={styles.securityItem}>
            <Ionicons name="shield-checkmark-outline" size={16} color={Colors.success} />
            <Text style={styles.securityText}>HMAC-SHA256 ký QR/NFC</Text>
          </View>
          <View style={styles.securityItem}>
            <Ionicons name="link-outline" size={16} color={Colors.success} />
            <Text style={styles.securityText}>SHA-256 chuỗi blockchain</Text>
          </View>
          <View style={styles.securityItem}>
            <Ionicons name="key-outline" size={16} color={Colors.success} />
            <Text style={styles.securityText}>JWT RS256 xác thực</Text>
          </View>
        </Card>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title="Đăng xuất"
            onPress={handleLogout}
            variant="danger"
            fullWidth
            size="lg"
          />
        </View>

        <Text style={styles.version}>Terra Brew Mobile v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  profileCard: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primary + '30',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  avatarText: {
    fontFamily: 'SpaceMono',
    fontSize: 28,
    fontWeight: '700',
    color: Colors.primary,
  },
  userName: {
    fontFamily: 'SpaceMono',
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  userEmail: {
    fontFamily: 'SpaceMono',
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  roleBadges: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  infoCard: {
    marginBottom: Spacing.md,
  },
  infoCardTitle: {
    fontFamily: 'SpaceMono',
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  infoLabel: {
    fontFamily: 'SpaceMono',
    fontSize: 12,
    color: Colors.textSecondary,
  },
  infoValue: {
    fontFamily: 'SpaceMono',
    fontSize: 12,
    color: Colors.text,
  },
  syncButton: {
    marginTop: Spacing.md,
  },
  securityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: Spacing.xs,
  },
  securityText: {
    fontFamily: 'SpaceMono',
    fontSize: 12,
    color: Colors.text,
  },
  actions: {
    marginTop: Spacing.lg,
  },
  version: {
    fontFamily: 'SpaceMono',
    fontSize: 10,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: Spacing.lg,
  },
})
