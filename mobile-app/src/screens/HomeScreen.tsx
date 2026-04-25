import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../theme/colors';
import { useAuthStore, selectUserName, selectTenantName } from '../stores/authStore';
import { getDashboardStats, DashboardStats, getErrorMessage } from '../services/api';
import { Header } from '../components/Header';

interface QuickAction {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  bgColor: string;
  onPress: () => void;
}

export const HomeScreen: React.FC = () => {
  const userName = useAuthStore(selectUserName);
  const tenantName = useAuthStore(selectTenantName);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const response = await getDashboardStats();
      setStats(response.data);
    } catch (error) {
      console.warn('Failed to fetch dashboard stats:', getErrorMessage(error));
      // Use placeholder data for demo
      setStats({
        totalFarmers: 156,
        totalFarmArea: 2840,
        activeBatches: 42,
        completedTraceability: 318,
        pendingVerifications: 7,
        nfcTagsBound: 89,
        recentActivity: [
          {
            id: '1',
            type: 'harvest',
            description: 'New harvest recorded for Batch #BT-2024-0042',
            timestamp: new Date().toISOString(),
            entityName: 'Highland Arabica',
          },
          {
            id: '2',
            type: 'verification',
            description: 'QR code verified for Batch #BT-2024-0038',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            entityName: 'Robusta Premium',
          },
          {
            id: '3',
            type: 'nfc_bind',
            description: 'NFC tag bound to Farm #FM-0124',
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            entityName: 'Green Valley Farm',
          },
          {
            id: '4',
            type: 'batch_created',
            description: 'New batch created for processing',
            timestamp: new Date(Date.now() - 14400000).toISOString(),
            entityName: 'Batch #BT-2024-0043',
          },
        ],
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchStats();
  }, [fetchStats]);

  const quickActions: QuickAction[] = [
    {
      id: 'scan',
      title: 'Scan QR',
      subtitle: 'Verify batches',
      icon: '📷',
      color: Colors.primary,
      bgColor: Colors.primary + '15',
      onPress: () => {
        // Navigate via tab - handled by tab navigator
      },
    },
    {
      id: 'farmers',
      title: 'Farmers',
      subtitle: 'View all',
      icon: '👨‍🌾',
      color: Colors.accent,
      bgColor: Colors.accent + '15',
      onPress: () => {},
    },
    {
      id: 'trace',
      title: 'Trace',
      subtitle: 'Track batches',
      icon: '🔍',
      color: Colors.warning,
      bgColor: Colors.warning + '15',
      onPress: () => {},
    },
    {
      id: 'nfc',
      title: 'NFC Tags',
      subtitle: 'Manage tags',
      icon: '📡',
      color: Colors.info,
      bgColor: Colors.info + '15',
      onPress: () => {},
    },
  ];

  const formatNumber = (num: number): string => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  };

  const ACTIVITY_ICONS: Record<string, string> = {
    harvest: '🫘',
    processing: '⚙️',
    verification: '✅',
    nfc_bind: '📡',
    batch_created: '📦',
  };

  return (
    <View style={styles.container}>
      <Header title="Terra Brew" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeGreeting}>
            Welcome back, {userName || 'Field Officer'}
          </Text>
          <Text style={styles.welcomeSubtitle}>
            {tenantName || 'Terra Brew'} • Ready to trace
          </Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={[styles.quickActionCard, { backgroundColor: action.bgColor }]}
                activeOpacity={0.7}
                onPress={action.onPress}
              >
                <Text style={styles.quickActionIcon}>{action.icon}</Text>
                <Text style={[styles.quickActionTitle, { color: action.color }]}>
                  {action.title}
                </Text>
                <Text style={styles.quickActionSubtitle}>{action.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Stats Grid */}
        {stats && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Overview</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{formatNumber(stats.totalFarmers)}</Text>
                <Text style={styles.statLabel}>Farmers</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{formatNumber(stats.totalFarmArea)}</Text>
                <Text style={styles.statLabel}>Hectares</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{formatNumber(stats.activeBatches)}</Text>
                <Text style={styles.statLabel}>Active Batches</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{formatNumber(stats.completedTraceability)}</Text>
                <Text style={styles.statLabel}>Traced</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{formatNumber(stats.pendingVerifications)}</Text>
                <Text style={styles.statLabel}>Pending</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{formatNumber(stats.nfcTagsBound)}</Text>
                <Text style={styles.statLabel}>NFC Tags</Text>
              </View>
            </View>
          </View>
        )}

        {/* Recent Activity */}
        {stats?.recentActivity && stats.recentActivity.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <View style={styles.activityList}>
              {stats.recentActivity.map((activity, index) => (
                <View
                  key={activity.id}
                  style={[
                    styles.activityItem,
                    index === stats.recentActivity.length - 1 && styles.activityItemLast,
                  ]}
                >
                  <View style={styles.activityIconContainer}>
                    <Text style={styles.activityIcon}>
                      {ACTIVITY_ICONS[activity.type] || '📋'}
                    </Text>
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityDescription} numberOfLines={2}>
                      {activity.description}
                    </Text>
                    <Text style={styles.activityEntity}>{activity.entityName}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xxl,
  },
  welcomeSection: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  welcomeGreeting: {
    ...Typography.h3,
    color: Colors.text,
    fontWeight: '600',
  },
  welcomeSubtitle: {
    ...Typography.bodySmall,
    color: Colors.textLight,
    marginTop: Spacing.xs,
  },
  section: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.h4,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: Spacing.lg,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  quickActionCard: {
    width: '47%',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    ...Shadows.sm,
  },
  quickActionIcon: {
    fontSize: 32,
    marginBottom: Spacing.sm,
  },
  quickActionTitle: {
    ...Typography.h4,
    fontWeight: '700',
  },
  quickActionSubtitle: {
    ...Typography.caption,
    color: Colors.textLight,
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  statCard: {
    width: '30%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    alignItems: 'center',
    ...Shadows.sm,
  },
  statValue: {
    ...Typography.h3,
    color: Colors.primary,
    fontWeight: '700',
  },
  statLabel: {
    ...Typography.caption,
    color: Colors.textLight,
    marginTop: Spacing.xs,
  },
  activityList: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  activityItemLast: {
    borderBottomWidth: 0,
  },
  activityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  activityIcon: {
    fontSize: 18,
  },
  activityContent: {
    flex: 1,
  },
  activityDescription: {
    ...Typography.bodySmall,
    color: Colors.text,
    fontWeight: '500',
  },
  activityEntity: {
    ...Typography.caption,
    color: Colors.textLight,
    marginTop: 2,
  },
});
