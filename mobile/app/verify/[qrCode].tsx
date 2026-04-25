/**
 * Verification Result Screen — Consumer-facing QR/NFC verification.
 * Accessible via deep link: terrabrew://verify/{qrCode}
 */
import React, { useEffect, useState } from 'react'
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { verifyQROnline } from '@/lib/api'
import { Card, VerifyResultCard, Badge, Divider, Button } from '@/components/ui'
import { Colors, Spacing, PROCESSING_STAGES, ENTITY_LABELS } from '@/constants'
import type { QRVerificationResult, HashChainBlock } from '@/types'

export default function VerifyScreen() {
  const { qrCode } = useLocalSearchParams<{ qrCode: string }>()
  const [result, setResult] = useState<QRVerificationResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!qrCode) {
      setError('Mã truy xuất không hợp lệ')
      setLoading(false)
      return
    }

    async function verify() {
      const response = await verifyQROnline(qrCode)
      if (response.success && response.data) {
        setResult(response.data)
      } else {
        setError(response.error || 'Không thể xác minh')
      }
      setLoading(false)
    }
    verify()
  }, [qrCode])

  const getStageLabel = (stage: string) => {
    return PROCESSING_STAGES.find(s => s.value === stage)?.label || stage
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Đang xác minh chuỗi blockchain...</Text>
        </View>
      </SafeAreaView>
    )
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="close-circle-outline" size={64} color={Colors.error} />
          <Text style={styles.errorTitle}>Xác minh thất bại</Text>
          <Text style={styles.errorMessage}>{error}</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Result */}
        {result && (
          <VerifyResultCard
            isValid={result.signatureValid}
            entityType={result.entityType}
            entityDetails={result.entityDetails}
            chainIntegrity={result.chainIntegrity}
            scanCount={result.scanCount}
          />
        )}

        {/* Trace Steps Timeline */}
        {result && result.traceSteps && result.traceSteps.length > 0 && (
          <Card style={styles.timelineCard}>
            <Text style={styles.timelineTitle}>Hành trình sản phẩm</Text>
            {result.traceSteps.map((step, idx) => (
              <View key={idx} style={styles.timelineItem}>
                <View style={styles.timelineNode}>
                  <View style={[styles.timelineDot, { backgroundColor: step.verified ? Colors.success : Colors.error }]} />
                  {idx < result.traceSteps.length - 1 && <View style={styles.timelineLine} />}
                </View>
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineStage}>{getStageLabel(step.stage)}</Text>
                  <Text style={styles.timelineTime}>{new Date(step.timestamp).toLocaleString('vi-VN')}</Text>
                  <Text style={styles.timelineHash} numberOfLines={1}>{step.blockHash.substring(0, 24)}...</Text>
                </View>
                <Badge
                  label={step.verified ? '✓' : '✗'}
                  variant={step.verified ? 'success' : 'error'}
                  size="sm"
                />
              </View>
            ))}
          </Card>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Được bảo vệ bởi chuỗi blockchain SHA-256 + HMAC-SHA256
          </Text>
          <Text style={styles.footerBrand}>Terra Brew — Nền tảng Truy xuất Nguồn gốc Cà phê</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  loadingText: { fontFamily: 'SpaceMono', fontSize: 14, color: Colors.textSecondary },
  errorContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: Spacing.lg },
  errorTitle: { fontFamily: 'SpaceMono', fontSize: 20, fontWeight: '700', color: Colors.error },
  errorMessage: { fontFamily: 'SpaceMono', fontSize: 13, color: Colors.textSecondary, textAlign: 'center' },
  timelineCard: { marginBottom: Spacing.lg },
  timelineTitle: { fontFamily: 'SpaceMono', fontSize: 14, fontWeight: '700', color: Colors.text, marginBottom: Spacing.md },
  timelineItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: Spacing.xs },
  timelineNode: { width: 20, alignItems: 'center' },
  timelineDot: { width: 10, height: 10, borderRadius: 5 },
  timelineLine: { width: 2, height: 24, backgroundColor: Colors.border, position: 'absolute', top: 10 },
  timelineContent: { flex: 1 },
  timelineStage: { fontFamily: 'SpaceMono', fontSize: 12, fontWeight: '600', color: Colors.text },
  timelineTime: { fontFamily: 'SpaceMono', fontSize: 10, color: Colors.textSecondary },
  timelineHash: { fontFamily: 'SpaceMono', fontSize: 9, color: Colors.textMuted },
  footer: { alignItems: 'center', paddingTop: Spacing.xl },
  footerText: { fontFamily: 'SpaceMono', fontSize: 10, color: Colors.textMuted, textAlign: 'center' },
  footerBrand: { fontFamily: 'SpaceMono', fontSize: 11, color: Colors.primary, textAlign: 'center', marginTop: 4 },
})
