/**
 * Processing Order Detail Screen — View processing stages and add stage records.
 */
import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView, StyleSheet, Alert, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { getProcessingOrders } from '@/lib/api'
import { Card, Badge, Button, Divider, SectionHeader } from '@/components/ui'
import { Colors, Spacing, PROCESSING_STAGES } from '@/constants'
import { useSync } from '@/hooks/useSync'
import type { ProcessingJobOrder, ProcessingStageRecord } from '@/types'

export default function ProcessingDetailScreen() {
  const { queueChange, isOnline } = useSync()
  const [orders, setOrders] = useState<ProcessingJobOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<ProcessingJobOrder | null>(null)

  useEffect(() => {
    async function load() {
      const response = await getProcessingOrders(1, 20)
      if (response.success && response.data) {
        setOrders((response.data as any).items || [])
      }
      setLoading(false)
    }
    load()
  }, [])

  const getStageIcon = (stage: string | null) => {
    const icons: Record<string, string> = {
      receiving: '📦', sorting: '🔍', pulping: '⚙️', fermentation: '🧪',
      washing: '💧', drying: '☀️', hulling: '🔩', grading: '⭐',
      roasting: '🔥', packaging: '📦',
    }
    return icons[stage || ''] || '📌'
  }

  const getStageLabel = (stage: string | null) => {
    return PROCESSING_STAGES.find(s => s.value === stage)?.label || stage || 'Chưa xác định'
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Ionicons name="construct-outline" size={24} color={Colors.accent} />
          <Text style={styles.headerTitle}>Chế biến</Text>
        </View>

        {/* Order List */}
        <SectionHeader title="Lệnh chế biến" />
        {orders.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>Chưa có lệnh chế biến nào</Text>
          </Card>
        ) : (
          orders.map(order => (
            <Card key={order.id} style={styles.orderCard} onPress={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}>
              <View style={styles.orderHeader}>
                <Text style={styles.orderId}>{order.jobOrderId || order.id.substring(0, 8)}</Text>
                <Badge
                  label={order.qcApprovedBy ? 'Đã duyệt' : 'Chờ duyệt'}
                  variant={order.qcApprovedBy ? 'success' : 'warning'}
                />
              </View>
              <View style={styles.orderDetails}>
                <View style={styles.orderDetail}>
                  <Text style={styles.orderDetailLabel}>Lô đầu vào:</Text>
                  <Text style={styles.orderDetailValue}>{order.batchIdInput || '-'}</Text>
                </View>
                <View style={styles.orderDetail}>
                  <Text style={styles.orderDetailLabel}>Phương thức:</Text>
                  <Text style={styles.orderDetailValue}>{order.processingMethod || '-'}</Text>
                </View>
                <View style={styles.orderDetail}>
                  <Text style={styles.orderDetailLabel}>Đầu vào:</Text>
                  <Text style={styles.orderDetailValue}>{order.inputQuantityKg ? `${order.inputQuantityKg} kg` : '-'}</Text>
                </View>
                <View style={styles.orderDetail}>
                  <Text style={styles.orderDetailLabel}>Đầu ra:</Text>
                  <Text style={styles.orderDetailValue}>{order.finalOutputWeightKg ? `${order.finalOutputWeightKg} kg` : '-'}</Text>
                </View>
                {order.cupScore && (
                  <View style={styles.orderDetail}>
                    <Text style={styles.orderDetailLabel}>Cup score:</Text>
                    <Text style={[styles.orderDetailValue, { color: Colors.primary }]}>{order.cupScore}</Text>
                  </View>
                )}
              </View>

              {/* Processing Stages */}
              {selectedOrder?.id === order.id && order.processingStages && (
                <View style={styles.stagesSection}>
                  <Divider />
                  <Text style={styles.stagesTitle}>Các giai đoạn chế biến</Text>
                  {order.processingStages.map((stage, idx) => (
                    <View key={stage.id} style={styles.stageItem}>
                      <View style={styles.stageHeader}>
                        <Text style={styles.stageIcon}>{getStageIcon(stage.stageType)}</Text>
                        <Text style={styles.stageName}>{getStageLabel(stage.stageType)}</Text>
                        <Badge
                          label={stage.qualityCheckPassed ? 'Đạt' : 'Chưa đạt'}
                          variant={stage.qualityCheckPassed ? 'success' : 'error'}
                          size="sm"
                        />
                      </View>
                      <View style={styles.stageDetails}>
                        {stage.inputWeight && <Text style={styles.stageDetail}>Đầu vào: {stage.inputWeight} kg</Text>}
                        {stage.outputWeight && <Text style={styles.stageDetail}>Đầu ra: {stage.outputWeight} kg</Text>}
                        {stage.temperature && <Text style={styles.stageDetail}>Nhiệt độ: {stage.temperature}°C</Text>}
                        {stage.machineUsed && <Text style={styles.stageDetail}>Máy: {stage.machineUsed}</Text>}
                        {stage.operatorName && <Text style={styles.stageDetail}>Người vận hành: {stage.operatorName}</Text>}
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </Card>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: Spacing.lg },
  headerTitle: { fontFamily: 'SpaceMono', fontSize: 20, fontWeight: '700', color: Colors.text },
  emptyCard: { alignItems: 'center', paddingVertical: Spacing.xl },
  emptyText: { fontFamily: 'SpaceMono', fontSize: 13, color: Colors.textSecondary },
  orderCard: { marginBottom: Spacing.sm },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  orderId: { fontFamily: 'SpaceMono', fontSize: 13, fontWeight: '600', color: Colors.primary },
  orderDetails: { gap: 2 },
  orderDetail: { flexDirection: 'row', justifyContent: 'space-between' },
  orderDetailLabel: { fontFamily: 'SpaceMono', fontSize: 11, color: Colors.textSecondary },
  orderDetailValue: { fontFamily: 'SpaceMono', fontSize: 11, color: Colors.text },
  stagesSection: { marginTop: Spacing.sm },
  stagesTitle: { fontFamily: 'SpaceMono', fontSize: 12, fontWeight: '600', color: Colors.text, marginBottom: Spacing.sm },
  stageItem: { paddingVertical: Spacing.xs, borderBottomWidth: 1, borderBottomColor: Colors.border },
  stageHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  stageIcon: { fontSize: 14 },
  stageName: { fontFamily: 'SpaceMono', fontSize: 12, fontWeight: '600', color: Colors.text, flex: 1 },
  stageDetails: { paddingLeft: 20 },
  stageDetail: { fontFamily: 'SpaceMono', fontSize: 10, color: Colors.textSecondary },
})
