/**
 * Dashboard Screen — Overview stats, recent activity, quick actions.
 */
import React, { useEffect, useState } from 'react'
import { View, Text, ScrollView, RefreshControl, StyleSheet, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useAuthStore } from '@/lib/auth'
import { getDashboardStats } from '@/lib/api'
import { useSync } from '@/hooks/useSync'
import { Card, StatCard, SectionHeader, Badge, Button } from '@/components/ui'
import { Colors, Spacing, ENTITY_LABELS } from '@/constants'
import type { DashboardStats } from '@/types'

export default function DashboardScreen() {
  const user = useAuthStore(s => s.user)
  const { isOnline, pendingCount, isSyncing, syncNow } = useSync()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadStats = async () => {
    const response = await getDashboardStats()
    if (response.success && response.data) {
      setStats(response.data)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadStats()
  }, [])

  const onRefresh = async () => {
    setRefreshing(true)
    await loadStats()
    setRefreshing(false)
  }

  const formatNumber = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
    return String(n)
  }

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {/* Greeting */}
        <View style={styles.greeting}>
          <View>
            <Text style={styles.greetingHello}>Xin chào,</Text>
            <Text style={styles.greetingName}>{user?.name || 'Nông dân'}</Text>
          </View>
          <View style={styles.greetingRight}>
            <Badge label={user?.role === 'tenant_admin' ? 'Quản trị' : user?.role === 'field_officer' ? 'Cán bộ' : 'Nông dân'} variant="info" size="md" />
          </View>
        </View>

        {/* Tenant Info */}
        <Card style={styles.tenantCard}>
          <View style={styles.tenantHeader}>
            <Text style={styles.tenantIcon}>☕</Text>
            <View style={styles.tenantInfo}>
              <Text style={styles.tenantName}>{user?.tenantName || 'Metrang Coffee'}</Text>
              <Text style={styles.tenantSlug}>@{user?.tenantSlug || 'metrang-coffee'}</Text>
            </View>
          </View>
        </Card>

        {/* Stats Grid */}
        <SectionHeader title="Thống kê" />
        <View style={styles.statsGrid}>
          <StatCard
            label="Nông dân"
            value={stats ? formatNumber(stats.totalFarmers) : '-'}
            icon={<Ionicons name="people" size={16} color={Colors.primary} />}
            color={Colors.primary}
          />
          <StatCard
            label="Thu hoạch"
            value={stats ? formatNumber(stats.totalHarvestRecords) : '-'}
            icon={<Ionicons name="leaf" size={16} color={Colors.success} />}
            color={Colors.success}
          />
          <StatCard
            label="Thu mua"
            value={stats ? formatNumber(stats.totalProcurementRecords) : '-'}
            icon={<Ionicons name="cart" size={16} color={Colors.info} />}
            color={Colors.info}
          />
          <StatCard
            label="Kiểm định"
            value={stats ? formatNumber(stats.totalInspections) : '-'}
            icon={<Ionicons name="checkmark-circle" size={16} color={Colors.accent} />}
            color={Colors.accent}
          />
        </View>

        {/* Financial Summary */}
        {stats && (
          <Card style={styles.financeCard}>
            <Text style={styles.financeTitle}>Tài chính</Text>
            <View style={styles.financeRow}>
              <View style={styles.financeItem}>
                <Text style={styles.financeLabel}>Tổng thu mua</Text>
                <Text style={styles.financeValue}>{formatVND(stats.totalPurchaseAmount)}</Text>
              </View>
              <View style={styles.financeItem}>
                <Text style={styles.financeLabel}>Giá TB/kg</Text>
                <Text style={styles.financeValue}>{formatVND(stats.avgPricePerKg)}</Text>
              </View>
            </View>
            <View style={styles.financeRow}>
              <View style={styles.financeItem}>
                <Text style={styles.financeLabel}>Điểm cup TB</Text>
                <Text style={styles.financeValue}>{stats.avgCupScore?.toFixed(1) || '-'}</Text>
              </View>
              <View style={styles.financeItem}>
                <Text style={styles.financeLabel}>Chứng nhận</Text>
                <Text style={styles.financeValue}>{stats.activeCertifications || 0}</Text>
              </View>
            </View>
          </Card>
        )}

        {/* Quick Actions */}
        <SectionHeader title="Thao tác nhanh" />
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickAction} onPress={() => {}}>
            <View style={[styles.quickActionIcon, { backgroundColor: '#D4A85320' }]}>
              <Ionicons name="person-add-outline" size={24} color={Colors.primary} />
            </View>
            <Text style={styles.quickActionLabel}>Đăng ký nông dân</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction} onPress={() => {}}>
            <View style={[styles.quickActionIcon, { backgroundColor: '#22C55E20' }]}>
              <Ionicons name="leaf-outline" size={24} color={Colors.success} />
            </View>
            <Text style={styles.quickActionLabel}>Ghi thu hoạch</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction} onPress={() => {}}>
            <View style={[styles.quickActionIcon, { backgroundColor: '#3B82F620' }]}>
              <Ionicons name="cart-outline" size={24} color={Colors.info} />
            </View>
            <Text style={styles.quickActionLabel}>Thu mua</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction} onPress={() => {}}>
            <View style={[styles.quickActionIcon, { backgroundColor: '#8B5CF620' }]}>
              <Ionicons name="shield-checkmark-outline" size={24} color={Colors.accent} />
            </View>
            <Text style={styles.quickActionLabel}>Kiểm định</Text>
          </TouchableOpacity>
        </View>

        {/* Sync Status */}
        {!isOnline && (
          <Card style={styles.syncCard}>
            <View style={styles.syncRow}>
              <Ionicons name="cloud-offline-outline" size={20} color={Colors.warning} />
              <View style={styles.syncInfo}>
                <Text style={styles.syncTitle}>Chế độ ngoại tuyến</Text>
                <Text style={styles.syncSubtitle}>{pendingCount} thay đổi chờ đồng bộ</Text>
              </View>
              <Button
                title={isSyncing ? 'Đang sync...' : 'Sync'}
                variant="outline"
                size="sm"
                onPress={syncNow}
                loading={isSyncing}
                disabled={!isOnline}
              />
            </View>
          </Card>
        )}
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
  greeting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  greetingHello: {
    fontFamily: 'SpaceMono',
    fontSize: 14,
    color: Colors.textSecondary,
  },
  greetingName: {
    fontFamily: 'SpaceMono',
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
  },
  greetingRight: {},
  tenantCard: {
    marginBottom: Spacing.lg,
  },
  tenantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tenantIcon: {
    fontSize: 28,
  },
  tenantInfo: {
    flex: 1,
  },
  tenantName: {
    fontFamily: 'SpaceMono',
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  tenantSlug: {
    fontFamily: 'SpaceMono',
    fontSize: 12,
    color: Colors.textSecondary,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  financeCard: {
    marginBottom: Spacing.lg,
  },
  financeTitle: {
    fontFamily: 'SpaceMono',
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  financeRow: {
    flexDirection: 'row',
    marginBottom: Spacing.sm,
  },
  financeItem: {
    flex: 1,
  },
  financeLabel: {
    fontFamily: 'SpaceMono',
    fontSize: 11,
    color: Colors.textSecondary,
  },
  financeValue: {
    fontFamily: 'SpaceMono',
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  quickAction: {
    width: '48%',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  quickActionLabel: {
    fontFamily: 'SpaceMono',
    fontSize: 11,
    color: Colors.text,
    textAlign: 'center',
  },
  syncCard: {
    borderColor: Colors.warning,
  },
  syncRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  syncInfo: {
    flex: 1,
  },
  syncTitle: {
    fontFamily: 'SpaceMono',
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
  },
  syncSubtitle: {
    fontFamily: 'SpaceMono',
    fontSize: 11,
    color: Colors.textSecondary,
  },
})
