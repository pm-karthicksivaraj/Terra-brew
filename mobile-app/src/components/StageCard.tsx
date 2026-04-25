import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows, StageColors } from '../theme/colors';
import { format } from 'date-fns';
import { TraceabilityStage } from '../services/api';

interface StageCardProps {
  stage: TraceabilityStage;
  isLast?: boolean;
  isHighlighted?: boolean;
}

const STAGE_LABELS: Record<string, string> = {
  farming: '🌾 Farming',
  harvesting: '🫘 Harvesting',
  processing: '⚙️ Processing',
  roasting: '🔥 Roasting',
  packaging: '📦 Packaging',
  distribution: '🚚 Distribution',
  retail: '🏪 Retail',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed',
  verified: 'Verified',
  failed: 'Failed',
};

export const StageCard: React.FC<StageCardProps> = ({
  stage,
  isLast = false,
  isHighlighted = false,
}) => {
  const stageLabel = STAGE_LABELS[stage.stage] || stage.stage;
  const statusLabel = STATUS_LABELS[stage.status] || stage.status;
  const statusColor = StageColors[stage.status] || Colors.textMuted;

  const formattedDate = (() => {
    try {
      return format(new Date(stage.timestamp), 'MMM dd, yyyy • HH:mm');
    } catch {
      return stage.timestamp;
    }
  })();

  return (
    <View style={styles.container}>
      {/* Timeline connector */}
      <View style={styles.timelineColumn}>
        <View
          style={[
            styles.dot,
            { backgroundColor: statusColor },
            isHighlighted && styles.dotHighlighted,
          ]}
        />
        {!isLast && <View style={styles.line} />}
      </View>

      {/* Content card */}
      <View
        style={[
          styles.card,
          isHighlighted && styles.cardHighlighted,
        ]}
      >
        {/* Stage name & status */}
        <View style={styles.cardHeader}>
          <Text style={styles.stageLabel}>{stageLabel}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>
              {statusLabel}
            </Text>
          </View>
        </View>

        {/* Details */}
        <View style={styles.details}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Operator</Text>
            <Text style={styles.detailValue}>{stage.operator || '—'}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Location</Text>
            <Text style={styles.detailValue}>{stage.location || '—'}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date</Text>
            <Text style={styles.detailValue}>{formattedDate}</Text>
          </View>
        </View>

        {/* Notes */}
        {stage.notes ? (
          <View style={styles.notesContainer}>
            <Text style={styles.notes}>{stage.notes}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingLeft: Spacing.lg,
    paddingRight: Spacing.xl,
  },
  timelineColumn: {
    width: 24,
    alignItems: 'center',
    paddingTop: Spacing.md,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: Colors.surface,
    zIndex: 1,
  },
  dotHighlighted: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 3,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: Colors.border,
    marginTop: 2,
  },
  card: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginLeft: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  cardHighlighted: {
    backgroundColor: Colors.surfaceVariant,
    borderLeftWidth: 3,
    borderLeftColor: Colors.accent,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  stageLabel: {
    ...Typography.h4,
    color: Colors.text,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  statusText: {
    ...Typography.caption,
    fontWeight: '600',
  },
  details: {
    gap: Spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    ...Typography.bodySmall,
    color: Colors.textLight,
    flex: 1,
  },
  detailValue: {
    ...Typography.bodySmall,
    color: Colors.text,
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  notesContainer: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  notes: {
    ...Typography.bodySmall,
    color: Colors.textLight,
    fontStyle: 'italic',
  },
});
