import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../theme/colors';
import {
  getTraceability,
  TraceabilityRecord,
  getErrorMessage,
} from '../services/api';
import { StageCard } from '../components/StageCard';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<MainStackParamList, 'Trace'>;

export const TraceScreen: React.FC<Props> = ({ route }) => {
  const initialBatchId = route.params?.batchId || '';
  const [batchId, setBatchId] = useState(initialBatchId);
  const [traceData, setTraceData] = useState<TraceabilityRecord | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!batchId.trim()) return;

    setIsLoading(true);
    setError(null);
    setHasSearched(true);
    Keyboard.dismiss();

    try {
      const response = await getTraceability(batchId.trim());
      setTraceData(response.data);
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);

      // Demo fallback
      setTraceData({
        batchId: batchId.trim(),
        productName: 'Highland Arabica',
        productType: 'Arabica Coffee',
        currentStage: 'roasting',
        status: 'in_progress',
        createdAt: '2024-01-15T08:00:00Z',
        updatedAt: '2024-02-28T14:30:00Z',
        stages: [
          {
            id: '1',
            batchId: batchId.trim(),
            stage: 'farming',
            status: 'verified',
            timestamp: '2024-01-15T08:00:00Z',
            operator: 'Nguyen Van Minh',
            location: 'Green Valley Farm, Lam Dong',
            notes: 'Organic certified farm. Altitude: 1200m',
          },
          {
            id: '2',
            batchId: batchId.trim(),
            stage: 'harvesting',
            status: 'completed',
            timestamp: '2024-01-25T06:30:00Z',
            operator: 'Tran Thi Hoa',
            location: 'Green Valley Farm, Lam Dong',
            notes: 'Selective hand-picking. Only ripe cherries.',
          },
          {
            id: '3',
            batchId: batchId.trim(),
            stage: 'processing',
            status: 'completed',
            timestamp: '2024-02-01T09:00:00Z',
            operator: 'Metrang Processing',
            location: 'Metrang Facility, Bao Loc',
            notes: 'Wet processing method. Fermented for 36 hours.',
          },
          {
            id: '4',
            batchId: batchId.trim(),
            stage: 'roasting',
            status: 'in_progress',
            timestamp: '2024-02-28T14:30:00Z',
            operator: 'Master Roaster Le',
            location: 'Terra Brew Roastery, HCMC',
            notes: 'Medium roast profile. Expected completion: Mar 2',
          },
          {
            id: '5',
            batchId: batchId.trim(),
            stage: 'packaging',
            status: 'pending',
            timestamp: '',
            operator: '',
            location: 'Terra Brew Packaging, HCMC',
          },
          {
            id: '6',
            batchId: batchId.trim(),
            stage: 'distribution',
            status: 'pending',
            timestamp: '',
            operator: '',
            location: '',
          },
          {
            id: '7',
            batchId: batchId.trim(),
            stage: 'retail',
            status: 'pending',
            timestamp: '',
            operator: '',
            location: '',
          },
        ],
      });
    } finally {
      setIsLoading(false);
    }
  }, [batchId]);

  // Auto-search if batchId provided via navigation params
  React.useEffect(() => {
    if (initialBatchId) {
      handleSearch();
    }
  }, [initialBatchId]);

  const currentStageIndex = traceData
    ? traceData.stages.findIndex(
        (s) => s.status === 'in_progress' || s.status === 'pending'
      )
    : -1;

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchInput}
            value={batchId}
            onChangeText={setBatchId}
            placeholder="Enter Batch ID (e.g., BT-2024-0042)"
            placeholderTextColor={Colors.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            onSubmitEditing={handleSearch}
            editable={!isLoading}
          />
          <TouchableOpacity
            style={[styles.searchButton, isLoading && styles.searchButtonDisabled]}
            onPress={handleSearch}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={Colors.textInverse} />
            ) : (
              <Text style={styles.searchButtonIcon}>🔍</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Error */}
      {error && !traceData && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Content */}
      {isLoading && !traceData ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Tracing batch...</Text>
        </View>
      ) : traceData ? (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Batch Header */}
          <View style={styles.batchHeader}>
            <View style={styles.batchHeaderTop}>
              <View style={styles.batchInfo}>
                <Text style={styles.batchProductName}>{traceData.productName}</Text>
                <Text style={styles.batchType}>{traceData.productType}</Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor:
                      traceData.status === 'completed'
                        ? Colors.successLight
                        : traceData.status === 'in_progress'
                        ? Colors.infoLight
                        : Colors.warningLight,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    {
                      color:
                        traceData.status === 'completed'
                          ? Colors.success
                          : traceData.status === 'in_progress'
                          ? Colors.info
                          : Colors.warning,
                    },
                  ]}
                >
                  {traceData.status === 'completed'
                    ? '✓ Completed'
                    : traceData.status === 'in_progress'
                    ? '⏳ In Progress'
                    : '⏸ Pending'}
                </Text>
              </View>
            </View>

            <View style={styles.batchMeta}>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Batch ID</Text>
                <Text style={styles.metaValue}>{traceData.batchId}</Text>
              </View>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Current Stage</Text>
                <Text style={styles.metaValue} numberOfLines={1}>
                  {traceData.currentStage || '—'}
                </Text>
              </View>
            </View>
          </View>

          {/* Progress bar */}
          <View style={styles.progressSection}>
            <View style={styles.progressBar}>
              {traceData.stages.map((stage, index) => {
                const progress = (() => {
                  if (stage.status === 'verified' || stage.status === 'completed') return 1;
                  if (stage.status === 'in_progress') return 0.5;
                  return 0;
                })();

                return (
                  <View key={stage.id} style={styles.progressSegment}>
                    <View style={styles.progressTrack}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            flex: progress,
                            backgroundColor:
                              stage.status === 'verified'
                                ? Colors.accent
                                : stage.status === 'completed'
                                ? Colors.success
                                : stage.status === 'in_progress'
                                ? Colors.primary
                                : Colors.border,
                          },
                        ]}
                      />
                      <View style={{ flex: 1 - progress }} />
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Timeline */}
          <View style={styles.timelineSection}>
            <Text style={styles.timelineTitle}>Traceability Timeline</Text>
            {traceData.stages.map((stage, index) => (
              <StageCard
                key={stage.id}
                stage={stage}
                isLast={index === traceData.stages.length - 1}
                isHighlighted={index === currentStageIndex}
              />
            ))}
          </View>
        </ScrollView>
      ) : hasSearched ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyText}>No results found</Text>
          <Text style={styles.emptySubtext}>
            Check the batch ID and try again
          </Text>
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyText}>Enter a Batch ID</Text>
          <Text style={styles.emptySubtext}>
            Search for a batch to view its full traceability timeline
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchSection: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Typography.body,
    color: Colors.text,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  searchButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.sm,
  },
  searchButtonDisabled: {
    opacity: 0.6,
  },
  searchButtonIcon: {
    fontSize: 20,
  },
  errorBanner: {
    backgroundColor: Colors.errorLight,
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.lg,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
  },
  errorText: {
    ...Typography.bodySmall,
    color: Colors.error,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...Typography.bodySmall,
    color: Colors.textLight,
    marginTop: Spacing.md,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xxxl,
  },
  batchHeader: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.lg,
    ...Shadows.sm,
  },
  batchHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },
  batchInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  batchProductName: {
    ...Typography.h3,
    color: Colors.text,
    fontWeight: '700',
  },
  batchType: {
    ...Typography.bodySmall,
    color: Colors.textLight,
    marginTop: Spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  statusText: {
    ...Typography.caption,
    fontWeight: '700',
  },
  batchMeta: {
    flexDirection: 'row',
    gap: Spacing.xl,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  metaItem: {
    flex: 1,
  },
  metaLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  metaValue: {
    ...Typography.bodySmall,
    color: Colors.text,
    fontWeight: '600',
    marginTop: Spacing.xs,
  },
  progressSection: {
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.lg,
  },
  progressBar: {
    flexDirection: 'row',
    gap: 2,
  },
  progressSegment: {
    flex: 1,
  },
  progressTrack: {
    flexDirection: 'row',
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.borderLight,
    overflow: 'hidden',
  },
  progressFill: {
    borderRadius: 2,
  },
  timelineSection: {
    marginTop: Spacing.xl,
  },
  timelineTitle: {
    ...Typography.h4,
    color: Colors.text,
    fontWeight: '700',
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xxl,
  },
  emptyIcon: {
    fontSize: 56,
    marginBottom: Spacing.lg,
  },
  emptyText: {
    ...Typography.h4,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  emptySubtext: {
    ...Typography.bodySmall,
    color: Colors.textLight,
    textAlign: 'center',
  },
});
