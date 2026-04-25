/**
 * Reusable UI components for Terra Brew Mobile.
 * Dark theme with coffee gold accents, Space Mono font.
 */
import React from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  type ViewStyle,
  type TextStyle,
  type TouchableOpacityProps,
} from 'react-native'
import { Colors, Spacing, Typography } from '@/constants'

// ════════════════════════════════════════════════════════════════
// BUTTON
// ════════════════════════════════════════════════════════════════

interface ButtonProps extends TouchableOpacityProps {
  title: string
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: React.ReactNode
  fullWidth?: boolean
}

export function Button({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  fullWidth = false,
  disabled,
  style,
  ...props
}: ButtonProps) {
  const variantStyles = {
    primary: { bg: Colors.primary, text: Colors.background, border: Colors.primary },
    secondary: { bg: Colors.surfaceLight, text: Colors.text, border: Colors.surfaceLight },
    outline: { bg: 'transparent', text: Colors.primary, border: Colors.primary },
    ghost: { bg: 'transparent', text: Colors.textSecondary, border: 'transparent' },
    danger: { bg: Colors.error, text: Colors.text, border: Colors.error },
  }

  const sizeStyles = {
    sm: { px: Spacing.md, py: Spacing.xs, fontSize: 12 },
    md: { px: Spacing.lg, py: Spacing.sm + 2, fontSize: 14 },
    lg: { px: Spacing.xl, py: Spacing.md, fontSize: 16 },
  }

  const v = variantStyles[variant]
  const s = sizeStyles[size]

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: disabled ? Colors.textMuted : v.bg,
          borderColor: disabled ? Colors.textMuted : v.border,
          paddingHorizontal: s.px,
          paddingVertical: s.py,
          borderWidth: variant === 'outline' ? 1.5 : 0,
        },
        fullWidth && styles.fullWidth,
        style,
      ]}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={v.text} size="small" />
      ) : (
        <View style={styles.buttonContent}>
          {icon && <View style={styles.buttonIcon}>{icon}</View>}
          <Text style={[styles.buttonText, { color: disabled ? Colors.textMuted : v.text, fontSize: s.fontSize }]}>
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  )
}

// ════════════════════════════════════════════════════════════════
// CARD
// ════════════════════════════════════════════════════════════════

interface CardProps {
  children: React.ReactNode
  style?: ViewStyle
  onPress?: () => void
  padding?: keyof typeof Spacing
}

export function Card({ children, style, onPress, padding = 'md' }: CardProps) {
  const Wrapper = onPress ? TouchableOpacity : View
  return (
    <Wrapper
      style={[styles.card, { padding: Spacing[padding] }, style]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {children}
    </Wrapper>
  )
}

// ════════════════════════════════════════════════════════════════
// BADGE
// ════════════════════════════════════════════════════════════════

interface BadgeProps {
  label: string
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral'
  size?: 'sm' | 'md'
}

export function Badge({ label, variant = 'neutral', size = 'sm' }: BadgeProps) {
  const colorMap = {
    success: { bg: '#22C55E20', text: Colors.success },
    warning: { bg: '#F59E0B20', text: Colors.warning },
    error: { bg: '#EF444420', text: Colors.error },
    info: { bg: '#3B82F620', text: Colors.info },
    neutral: { bg: '#66666620', text: Colors.textSecondary },
  }
  const c = colorMap[variant]

  return (
    <View style={[styles.badge, { backgroundColor: c.bg }, size === 'md' && styles.badgeMd]}>
      <Text style={[styles.badgeText, { color: c.text }, size === 'md' && styles.badgeTextMd]}>
        {label}
      </Text>
    </View>
  )
}

// ════════════════════════════════════════════════════════════════
// INPUT
// ════════════════════════════════════════════════════════════════

import { TextInput, type TextInputProps } from 'react-native'

interface InputProps extends TextInputProps {
  label?: string
  error?: string
  helperText?: string
}

export function Input({ label, error, helperText, style, ...props }: InputProps) {
  return (
    <View style={styles.inputContainer}>
      {label && <Text style={styles.inputLabel}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          error && styles.inputError,
          style,
        ]}
        placeholderTextColor={Colors.textMuted}
        {...props}
      />
      {error && <Text style={styles.inputErrorText}>{error}</Text>}
      {helperText && !error && <Text style={styles.inputHelperText}>{helperText}</Text>}
    </View>
  )
}

// ════════════════════════════════════════════════════════════════
// DIVIDER
// ════════════════════════════════════════════════════════════════

export function Divider({ style }: { style?: ViewStyle }) {
  return <View style={[styles.divider, style]} />
}

// ════════════════════════════════════════════════════════════════
// STAT CARD
// ════════════════════════════════════════════════════════════════

interface StatCardProps {
  label: string
  value: string | number
  icon?: React.ReactNode
  trend?: { value: number; label: string }
  color?: string
}

export function StatCard({ label, value, icon, trend, color = Colors.primary }: StatCardProps) {
  return (
    <Card style={styles.statCard}>
      <View style={styles.statHeader}>
        {icon}
        <Text style={styles.statLabel}>{label}</Text>
      </View>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      {trend && (
        <Text style={[styles.statTrend, { color: trend.value >= 0 ? Colors.success : Colors.error }]}>
          {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
        </Text>
      )}
    </Card>
  )
}

// ════════════════════════════════════════════════════════════════
// OFFLINE BANNER
// ════════════════════════════════════════════════════════════════

interface OfflineBannerProps {
  isOnline: boolean
  pendingCount: number
  isSyncing: boolean
  onSyncPress: () => void
}

export function OfflineBanner({ isOnline, pendingCount, isSyncing, onSyncPress }: OfflineBannerProps) {
  if (isOnline && pendingCount === 0) return null

  return (
    <View style={[styles.offlineBanner, { backgroundColor: isOnline ? Colors.warning : Colors.error }]}>
      <View style={styles.offlineBannerContent}>
        <Text style={styles.offlineBannerText}>
          {isOnline
            ? `${pendingCount} thay đổi chờ đồng bộ`
            : 'Không có kết nối mạng — Dữ liệu được lưu ngoại tuyến'}
        </Text>
        {isOnline && pendingCount > 0 && (
          <TouchableOpacity onPress={onSyncPress}>
            <Text style={styles.offlineBannerAction}>
              {isSyncing ? 'Đang đồng bộ...' : 'Đồng bộ ngay'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

// ════════════════════════════════════════════════════════════════
// SECTION HEADER
// ════════════════════════════════════════════════════════════════

interface SectionHeaderProps {
  title: string
  action?: { label: string; onPress: () => void }
}

export function SectionHeader({ title, action }: SectionHeaderProps) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action && (
        <TouchableOpacity onPress={action.onPress}>
          <Text style={styles.sectionAction}>{action.label}</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

// ════════════════════════════════════════════════════════════════
// EMPTY STATE
// ════════════════════════════════════════════════════════════════

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: { label: string; onPress: () => void }
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <View style={styles.emptyState}>
      {icon}
      <Text style={styles.emptyStateTitle}>{title}</Text>
      {description && <Text style={styles.emptyStateDescription}>{description}</Text>}
      {action && (
        <Button title={action.label} onPress={action.onPress} variant="outline" size="sm" />
      )}
    </View>
  )
}

// ════════════════════════════════════════════════════════════════
// VERIFY RESULT CARD
// ════════════════════════════════════════════════════════════════

interface VerifyResultCardProps {
  isValid: boolean
  entityType: string
  entityDetails: Record<string, unknown>
  chainIntegrity: { valid: boolean; totalBlocks: number }
  scanCount: number
}

export function VerifyResultCard({ isValid, entityType, entityDetails, chainIntegrity, scanCount }: VerifyResultCardProps) {
  return (
    <Card style={[styles.verifyCard, { borderColor: isValid ? Colors.success : Colors.error }]}>
      <View style={styles.verifyHeader}>
        <Text style={[styles.verifyIcon, { color: isValid ? Colors.success : Colors.error }]}>
          {isValid ? '✓' : '✗'}
        </Text>
        <View style={styles.verifyHeaderText}>
          <Text style={[styles.verifyTitle, { color: isValid ? Colors.success : Colors.error }]}>
            {isValid ? 'Xác minh thành công' : 'Xác minh thất bại'}
          </Text>
          <Text style={styles.verifySubtitle}>
            {isValid ? 'Sản phẩm chính hãng — Chuỗi nguyên vẹn' : 'Có thể phát hiện giả mạo'}
          </Text>
        </View>
      </View>

      <Divider />

      <View style={styles.verifyDetails}>
        <View style={styles.verifyRow}>
          <Text style={styles.verifyLabel}>Loại</Text>
          <Text style={styles.verifyValue}>{entityType}</Text>
        </View>
        <View style={styles.verifyRow}>
          <Text style={styles.verifyLabel}>Chuỗi blockchain</Text>
          <Text style={[styles.verifyValue, { color: chainIntegrity.valid ? Colors.success : Colors.error }]}>
            {chainIntegrity.valid ? `Nguyên vẹn (${chainIntegrity.totalBlocks} khối)` : 'Đứt gãy'}
          </Text>
        </View>
        <View style={styles.verifyRow}>
          <Text style={styles.verifyLabel}>Lượt quét</Text>
          <Text style={styles.verifyValue}>{scanCount}</Text>
        </View>
      </View>

      {entityDetails && Object.keys(entityDetails).length > 0 && (
        <>
          <Divider />
          <Text style={styles.verifySectionTitle}>Chi tiết sản phẩm</Text>
          {Object.entries(entityDetails).map(([key, value]) => (
            <View key={key} style={styles.verifyRow}>
              <Text style={styles.verifyLabel}>{key}</Text>
              <Text style={styles.verifyValue} numberOfLines={1}>
                {typeof value === 'object' ? JSON.stringify(value) : String(value ?? '-')}
              </Text>
            </View>
          ))}
        </>
      )}
    </Card>
  )
}

// ════════════════════════════════════════════════════════════════
// STYLES
// ════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  fullWidth: { width: '100%' },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonIcon: { marginRight: 4 },
  buttonText: {
    fontFamily: 'SpaceMono',
    fontWeight: '600',
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  badgeMd: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontFamily: 'SpaceMono',
    fontSize: 10,
    fontWeight: '600',
  },
  badgeTextMd: {
    fontSize: 12,
  },
  inputContainer: {
    marginBottom: Spacing.md,
  },
  inputLabel: {
    fontFamily: 'SpaceMono',
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  input: {
    fontFamily: 'SpaceMono',
    fontSize: 14,
    color: Colors.text,
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
  },
  inputError: {
    borderColor: Colors.error,
  },
  inputErrorText: {
    fontFamily: 'SpaceMono',
    fontSize: 11,
    color: Colors.error,
    marginTop: 4,
  },
  inputHelperText: {
    fontFamily: 'SpaceMono',
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.sm,
  },
  statCard: {
    minWidth: 140,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: 'SpaceMono',
    fontSize: 11,
    color: Colors.textSecondary,
  },
  statValue: {
    fontFamily: 'SpaceMono',
    fontSize: 22,
    fontWeight: '700',
  },
  statTrend: {
    fontFamily: 'SpaceMono',
    fontSize: 10,
    marginTop: 2,
  },
  offlineBanner: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  offlineBannerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  offlineBannerText: {
    fontFamily: 'SpaceMono',
    fontSize: 12,
    color: Colors.background,
    flex: 1,
  },
  offlineBannerAction: {
    fontFamily: 'SpaceMono',
    fontSize: 12,
    fontWeight: '700',
    color: Colors.background,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontFamily: 'SpaceMono',
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  sectionAction: {
    fontFamily: 'SpaceMono',
    fontSize: 13,
    color: Colors.primary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
  },
  emptyStateTitle: {
    fontFamily: 'SpaceMono',
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginTop: Spacing.md,
  },
  emptyStateDescription: {
    fontFamily: 'SpaceMono',
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  verifyCard: {
    borderWidth: 2,
  },
  verifyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  verifyIcon: {
    fontSize: 32,
    fontWeight: '700',
  },
  verifyHeaderText: {
    flex: 1,
  },
  verifyTitle: {
    fontFamily: 'SpaceMono',
    fontSize: 18,
    fontWeight: '700',
  },
  verifySubtitle: {
    fontFamily: 'SpaceMono',
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  verifyDetails: {
    gap: 6,
  },
  verifyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  verifyLabel: {
    fontFamily: 'SpaceMono',
    fontSize: 12,
    color: Colors.textSecondary,
    flex: 1,
  },
  verifyValue: {
    fontFamily: 'SpaceMono',
    fontSize: 12,
    color: Colors.text,
    flex: 2,
    textAlign: 'right',
  },
  verifySectionTitle: {
    fontFamily: 'SpaceMono',
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
})
