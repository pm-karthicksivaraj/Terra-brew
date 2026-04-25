import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../theme/colors';
import { getFarmerById, Farmer, getErrorMessage } from '../services/api';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<MainStackParamList, 'FarmerDetail'>;

export const FarmerDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { farmerId } = route.params;
  const [farmer, setFarmer] = useState<Farmer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFarmer = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getFarmerById(farmerId);
      setFarmer(response.data);
    } catch (err) {
      console.warn('Failed to fetch farmer:', getErrorMessage(err));
      setError(getErrorMessage(err));

      // Demo fallback
      setFarmer({
        id: farmerId,
        name: 'Nguyen Van Minh',
        email: 'minh@greenvalley.vn',
        phone: '+84 912 345 678',
        farmName: 'Green Valley Farm',
        farmArea: 12.5,
        location: 'Lam Dong, Vietnam',
        latitude: 11.9404,
        longitude: 108.4583,
        status: 'active',
        joinedAt: '2023-06-15T00:00:00Z',
        totalHarvest: 8450,
      });
    } finally {
      setIsLoading(false);
    }
  }, [farmerId]);

  useEffect(() => {
    fetchFarmer();
  }, [fetchFarmer]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading farmer details...</Text>
      </View>
    );
  }

  if (!farmer) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorText}>Failed to load farmer data</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchFarmer}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const initials = farmer.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const formattedDate = (() => {
    try {
      const d = new Date(farmer.joinedAt);
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return farmer.joinedAt;
    }
  })();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarLarge}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.farmerName}>{farmer.name}</Text>
        <View
          style={[
            styles.statusBadgeLarge,
            {
              backgroundColor:
                farmer.status === 'active' ? Colors.successLight : Colors.errorLight,
            },
          ]}
        >
          <Text
            style={[
              styles.statusTextLarge,
              { color: farmer.status === 'active' ? Colors.success : Colors.error },
            ]}
          >
            {farmer.status === 'active' ? '✓ Active' : '✕ Inactive'}
          </Text>
        </View>
      </View>

      {/* Farm Information Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Farm Information</Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Farm Name</Text>
          <Text style={styles.infoValue}>{farmer.farmName}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Farm Area</Text>
          <Text style={styles.infoValue}>{farmer.farmArea} hectares</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Location</Text>
          <Text style={styles.infoValue}>{farmer.location}</Text>
        </View>

        {farmer.totalHarvest !== undefined && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Total Harvest</Text>
            <Text style={styles.infoValue}>{farmer.totalHarvest.toLocaleString()} kg</Text>
          </View>
        )}

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Joined</Text>
          <Text style={styles.infoValue}>{formattedDate}</Text>
        </View>
      </View>

      {/* Contact Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Contact</Text>

        <TouchableOpacity
          style={styles.contactRow}
          onPress={() => Linking.openURL(`mailto:${farmer.email}`)}
        >
          <Text style={styles.contactIcon}>📧</Text>
          <Text style={[styles.contactValue, { color: Colors.primary }]}>
            {farmer.email}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.contactRow}
          onPress={() => Linking.openURL(`tel:${farmer.phone}`)}
        >
          <Text style={styles.contactIcon}>📱</Text>
          <Text style={[styles.contactValue, { color: Colors.primary }]}>
            {farmer.phone}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Coordinates Card */}
      {farmer.latitude && farmer.longitude && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Location Coordinates</Text>

          <View style={styles.coordinateRow}>
            <View style={styles.coordinateItem}>
              <Text style={styles.coordinateLabel}>Latitude</Text>
              <Text style={styles.coordinateValue}>{farmer.latitude.toFixed(4)}</Text>
            </View>
            <View style={styles.coordinateItem}>
              <Text style={styles.coordinateLabel}>Longitude</Text>
              <Text style={styles.coordinateValue}>{farmer.longitude.toFixed(4)}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.mapButton}
            onPress={() => {
              const url = `https://maps.google.com/?q=${farmer.latitude},${farmer.longitude}`;
              Linking.openURL(url);
            }}
          >
            <Text style={styles.mapButtonText}>📍 Open in Maps</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Quick Actions</Text>

        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionIcon}>🔍</Text>
          <Text style={styles.actionText}>View Batches</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionIcon}>📡</Text>
          <Text style={styles.actionText}>Bind NFC Tag</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionIcon}>📋</Text>
          <Text style={styles.actionText}>View Traceability</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: Spacing.xxxl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    ...Typography.bodySmall,
    color: Colors.textLight,
    marginTop: Spacing.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: Spacing.xxl,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: Spacing.lg,
  },
  errorText: {
    ...Typography.body,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  retryButtonText: {
    ...Typography.button,
    color: Colors.textInverse,
  },
  profileHeader: {
    backgroundColor: Colors.primary,
    alignItems: 'center',
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xxl,
    paddingHorizontal: Spacing.xl,
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    ...Shadows.lg,
  },
  avatarText: {
    ...Typography.h1,
    color: Colors.textInverse,
    fontWeight: '700',
  },
  farmerName: {
    ...Typography.h3,
    color: Colors.textInverse,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  statusBadgeLarge: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  statusTextLarge: {
    ...Typography.bodySmall,
    fontWeight: '700',
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.lg,
    ...Shadows.sm,
  },
  cardTitle: {
    ...Typography.h4,
    color: Colors.text,
    fontWeight: '700',
    marginBottom: Spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  infoLabel: {
    ...Typography.bodySmall,
    color: Colors.textLight,
  },
  infoValue: {
    ...Typography.bodySmall,
    color: Colors.text,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  contactIcon: {
    fontSize: 18,
    marginRight: Spacing.md,
  },
  contactValue: {
    ...Typography.bodySmall,
    fontWeight: '500',
  },
  coordinateRow: {
    flexDirection: 'row',
    marginBottom: Spacing.lg,
  },
  coordinateItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.surfaceVariant,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginHorizontal: Spacing.xs,
  },
  coordinateLabel: {
    ...Typography.caption,
    color: Colors.textLight,
    marginBottom: Spacing.xs,
  },
  coordinateValue: {
    ...Typography.h4,
    color: Colors.primary,
    fontWeight: '700',
  },
  mapButton: {
    backgroundColor: Colors.accent,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  mapButtonText: {
    ...Typography.bodySmall,
    color: Colors.textInverse,
    fontWeight: '600',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  actionIcon: {
    fontSize: 20,
    marginRight: Spacing.md,
  },
  actionText: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: '500',
  },
});
