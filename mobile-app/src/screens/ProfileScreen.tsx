import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../theme/colors';
import { useAuthStore, selectUser, selectLang, Language } from '../stores/authStore';
import { logout as authLogout } from '../services/auth';
import { getPendingCount, performFullSync, clearSyncData, SyncStatus, getSyncStatus } from '../services/sync';
import { Header } from '../components/Header';

export const ProfileScreen: React.FC = () => {
  const user = useAuthStore(selectUser);
  const lang = useAuthStore(selectLang);
  const storeLogout = useAuthStore((s) => s.logout);
  const toggleLang = useAuthStore((s) => s.toggleLang);

  const [pendingCount, setPendingCount] = useState(0);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    loadSyncInfo();
  }, []);

  const loadSyncInfo = async () => {
    try {
      const count = await getPendingCount();
      setPendingCount(count);
      const status = await getSyncStatus();
      setSyncStatus(status);
    } catch {
      // Ignore
    }
  };

  const handleSync = useCallback(async () => {
    setIsSyncing(true);
    try {
      const status = await performFullSync();
      setSyncStatus(status);
      setPendingCount(status.pendingCount);
      Alert.alert(
        'Sync Complete',
        status.errors.length > 0
          ? `Synced with ${status.errors.length} errors. Pending: ${status.pendingCount}`
          : `All data synced successfully. Pending: ${status.pendingCount}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Sync Failed', 'Failed to sync data. Please try again.');
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const handleLogout = useCallback(() => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out? Any unsynced data will be preserved for next login.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await clearSyncData();
            await authLogout();
            storeLogout();
          },
        },
      ]
    );
  }, [storeLogout]);

  const handleLanguageToggle = useCallback(() => {
    toggleLang();
    Alert.alert(
      'Language Changed',
      lang === 'en' ? 'Đã chuyển sang Tiếng Việt' : 'Switched to English'
    );
  }, [lang, toggleLang]);

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : '??';

  return (
    <View style={styles.container}>
      <Header title="Profile" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User Info Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View
              style={[
                styles.onlineIndicator,
                { backgroundColor: Colors.success },
              ]}
            />
          </View>
          <Text style={styles.userName}>{user?.name || 'Unknown User'}</Text>
          <Text style={styles.userEmail}>{user?.email || ''}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{user?.role || 'field_officer'}</Text>
          </View>
        </View>

        {/* Tenant Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Organization</Text>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>🏢</Text>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Tenant</Text>
                <Text style={styles.infoValue}>{user?.tenantName || 'Unknown'}</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>🔗</Text>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Slug</Text>
                <Text style={styles.infoValue}>{user?.tenantSlug || '—'}</Text>
              </View>
            </View>
            <View style={styles.infoRowLast}>
              <Text style={styles.infoIcon}>👤</Text>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>User ID</Text>
                <Text style={styles.infoValue} numberOfLines={1}>
                  {user?.id || '—'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Language */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <TouchableOpacity style={styles.card} onPress={handleLanguageToggle} activeOpacity={0.7}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Text style={styles.infoIcon}>🌐</Text>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Language</Text>
                  <Text style={styles.infoValue}>
                    {lang === 'en' ? 'English' : 'Tiếng Việt'}
                  </Text>
                </View>
              </View>
              <View style={styles.languageToggle}>
                <View
                  style={[
                    styles.langOption,
                    lang === 'en' && styles.langOptionActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.langOptionText,
                      lang === 'en' && styles.langOptionTextActive,
                    ]}
                  >
                    EN
                  </Text>
                </View>
                <View
                  style={[
                    styles.langOption,
                    lang === 'vi' && styles.langOptionActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.langOptionText,
                      lang === 'vi' && styles.langOptionTextActive,
                    ]}
                  >
                    VI
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Sync Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Sync</Text>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>📤</Text>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Pending Uploads</Text>
                <Text style={styles.infoValue}>
                  {pendingCount > 0 ? `${pendingCount} pending` : 'All synced'}
                </Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>🕐</Text>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Last Sync</Text>
                <Text style={styles.infoValue}>
                  {syncStatus?.lastSyncAt
                    ? new Date(syncStatus.lastSyncAt).toLocaleString()
                    : 'Never'}
                </Text>
              </View>
            </View>
            <View style={styles.infoRowLast}>
              <Text style={styles.infoIcon}>📶</Text>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Status</Text>
                <Text
                  style={[
                    styles.infoValue,
                    {
                      color:
                        pendingCount > 0 ? Colors.warning : Colors.success,
                    },
                  ]}
                >
                  {isSyncing
                    ? 'Syncing...'
                    : pendingCount > 0
                    ? `${pendingCount} pending`
                    : 'Up to date'}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.syncButton, isSyncing && styles.syncButtonDisabled]}
              onPress={handleSync}
              disabled={isSyncing}
            >
              <Text style={styles.syncButtonText}>
                {isSyncing ? 'Syncing...' : '🔄 Sync Now'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>📱</Text>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>App Version</Text>
                <Text style={styles.infoValue}>1.0.0</Text>
              </View>
            </View>
            <View style={styles.infoRowLast}>
              <Text style={styles.infoIcon}>☕</Text>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Platform</Text>
                <Text style={styles.infoValue}>Terra Brew Coffee Traceability</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Text style={styles.logoutIcon}>🚪</Text>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
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
    paddingBottom: Spacing.xxxl,
  },
  profileCard: {
    backgroundColor: Colors.primary,
    alignItems: 'center',
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xxl,
    paddingHorizontal: Spacing.xl,
    borderBottomLeftRadius: BorderRadius.xxl,
    borderBottomRightRadius: BorderRadius.xxl,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: Spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.lg,
  },
  avatarText: {
    ...Typography.h1,
    color: Colors.textInverse,
    fontWeight: '700',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  userName: {
    ...Typography.h3,
    color: Colors.textInverse,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  userEmail: {
    ...Typography.bodySmall,
    color: Colors.secondaryLight,
    marginBottom: Spacing.md,
  },
  roleBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  roleText: {
    ...Typography.caption,
    color: Colors.secondaryLight,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  section: {
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.h4,
    color: Colors.text,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadows.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  infoRowLast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: Spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  infoValue: {
    ...Typography.bodySmall,
    color: Colors.text,
    fontWeight: '600',
    marginTop: 2,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  languageToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: 3,
  },
  langOption: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  langOptionActive: {
    backgroundColor: Colors.primary,
  },
  langOptionText: {
    ...Typography.caption,
    color: Colors.textLight,
    fontWeight: '700',
  },
  langOptionTextActive: {
    color: Colors.textInverse,
  },
  syncButton: {
    backgroundColor: Colors.accent,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  syncButtonDisabled: {
    opacity: 0.6,
  },
  syncButtonText: {
    ...Typography.bodySmall,
    color: Colors.textInverse,
    fontWeight: '600',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.errorLight,
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.xxl,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.xl,
    ...Shadows.sm,
  },
  logoutIcon: {
    fontSize: 20,
    marginRight: Spacing.md,
  },
  logoutText: {
    ...Typography.button,
    color: Colors.error,
  },
});
