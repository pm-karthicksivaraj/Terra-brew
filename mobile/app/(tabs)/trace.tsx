/**
 * Traceability Screen — Full traceability chain viewer.
 * Shows the blockchain hash chain for a batch, with verification status.
 */
import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  ScrollView,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { getHashChain, getHarvests, anchorOnChain, getAnchorStatus } from '@/lib/api'
import { Card, Button, Badge, SectionHeader, EmptyState, Divider } from '@/components/ui'
import { Colors, Spacing, PROCESSING_STAGES, ENTITY_LABELS } from '@/constants'
import { useSync } from '@/hooks/useSync'
import type { HashChainBlock } from '@/types'

export default function TraceScreen() {
  const [batchId, setBatchId] = useState('')
  const [blocks, setBlocks] = useState<HashChainBlock[]>([])
  const [chainValid, setChainValid] = useState<boolean | null>(null)
  const [totalBlocks, setTotalBlocks] = useState(0)
  const [loading, setLoading] = useState(false)
  const [anchoring, setAnchoring] = useState(false)
  const [anchorData, setAnchorData] = useState<Record<string, unknown> | null>(null)
  const [harvests, setHarvests] = useState<Array<{ id: string; batchId: string | null; coffeeVariety: string | null }>>([])
  const { isOnline } = useSync()

  // Load recent harvests with batch IDs
  useEffect(() => {
    async function load() {
      const response = await getHarvests(1, 20)
      if (response.success && response.data) {
        setHarvests((response.data as any).items || [])
      }
    }
    load()
  }, [])

  // Search for batch chain
  const searchChain = async (searchBatchId?: string) => {
    const id = searchBatchId || batchId
    if (!id.trim()) return
    setLoading(true)
    setBlocks([])
    setChainValid(null)
    setAnchorData(null)

    const response = await getHashChain(id.trim())
    if (response.success && response.data) {
      const { blocks: chainBlocks, verification } = response.data as any
      setBlocks(chainBlocks || [])
      setChainValid(verification?.valid ?? null)
      setTotalBlocks(verification?.totalBlocks ?? 0)
    }
    setLoading(false)

    // Also check anchor status
    const anchorResponse = await getAnchorStatus(id.trim())
    if (anchorResponse.success && anchorResponse.data) {
      setAnchorData(anchorResponse.data)
    }
  }

  // Anchor on-chain
  const handleAnchor = async () => {
    if (!batchId.trim()) return
    setAnchoring(true)
    const response = await anchorOnChain(batchId.trim())
    if (response.success && response.data) {
      setAnchorData(response.data)
      Alert.alert('Thành công', 'Đã neo chuỗi blockchain lên on-chain!')
    } else {
      Alert.alert('Lỗi', response.error || 'Không thể neo on-chain')
    }
    setAnchoring(false)
  }

  // Get stage label
  const getStageLabel = (stage: string) => {
    const found = PROCESSING_STAGES.find(s => s.value === stage)
    return found?.label || stage
  }

  // Get stage icon
  const getStageIcon = (stage: string): string => {
    const icons: Record<string, string> = {
      harvest: '🌾',
      receiving: '📦',
      sorting: '🔍',
      pulping: '⚙️',
      fermentation: '🧪',
      washing: '💧',
      drying: '☀️',
      hulling: '🔩',
      grading: '⭐',
      roasting: '🔥',
      packaging: '📦',
      procurement: '🚚',
      inspection: '✅',
      on_chain_anchor: '⛓️',
    }
    return icons[stage] || '📌'
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          batchId ? <RefreshControl refreshing={loading} onRefresh={() => searchChain()} tintColor={Colors.primary} /> : undefined
        }
      >
        {/* Search */}
        <Card style={styles.searchCard}>
          <Text style={styles.searchTitle}>Tìm kiếm chuỗi truy xuất</Text>
          <View style={styles.searchRow}>
            <TextInput
              style={styles.searchInput}
              value={batchId}
              onChangeText={setBatchId}
              placeholder="Nhập mã lô (Batch ID)"
              placeholderTextColor={Colors.textMuted}
              autoCapitalize="none"
              onSubmitEditing={() => searchChain()}
            />
            <Button title="Tìm" onPress={() => searchChain()} variant="primary" size="sm" />
          </View>
        </Card>

        {/* Recent Batches */}
        {harvests.length > 0 && !blocks.length && (
          <Card style={styles.recentCard}>
            <Text style={styles.recentTitle}>Lô hàng gần đây</Text>
            {harvests.filter(h => h.batchId).slice(0, 5).map((h, idx) => (
              <TouchableOpacity key={h.id} onPress={() => { setBatchId(h.batchId || ''); searchChain(h.batchId || '') }}>
                <View style={styles.batchItem}>
                  <Ionicons name="link-outline" size={16} color={Colors.primary} />
                  <View style={styles.batchInfo}>
                    <Text style={styles.batchId}>{h.batchId}</Text>
                    <Text style={styles.batchVariety}>{h.coffeeVariety || 'Chưa xác định'}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
                </View>
              </TouchableOpacity>
            ))}
          </Card>
        )}

        {/* Chain Verification Status */}
        {chainValid !== null && (
          <Card style={[styles.statusCard, { borderColor: chainValid ? Colors.success : Colors.error }]}>
            <View style={styles.statusHeader}>
              <Text style={[styles.statusIcon, { color: chainValid ? Colors.success : Colors.error }]}>
                {chainValid ? '✓' : '✗'}
              </Text>
              <View>
                <Text style={[styles.statusTitle, { color: chainValid ? Colors.success : Colors.error }]}>
                  {chainValid ? 'Chuỗi nguyên vẹn' : 'Chuỗi bị đứt gãy'}
                </Text>
                <Text style={styles.statusSubtitle}>{totalBlocks} khối trong chuỗi</Text>
              </View>
            </View>
          </Card>
        )}

        {/* Blockchain Timeline */}
        {blocks.length > 0 && (
          <>
            <SectionHeader title="Chuỗi khối" action={{ label: 'Neo on-chain', onPress: handleAnchor }} />
            <View style={styles.timeline}>
              {blocks.map((block, idx) => (
                <View key={block.id} style={styles.timelineItem}>
                  {/* Vertical line */}
                  {idx < blocks.length - 1 && <View style={styles.timelineLine} />}
                  {/* Node */}
                  <View style={[styles.timelineNode, { backgroundColor: idx === 0 ? Colors.primary : Colors.surfaceLight }]}>
                    <Text style={styles.timelineNodeIcon}>{getStageIcon(block.stage)}</Text>
                  </View>
                  {/* Content */}
                  <Card style={styles.timelineCard} padding="sm">
                    <View style={styles.timelineHeader}>
                      <Text style={styles.timelineStage}>{getStageLabel(block.stage)}</Text>
                      <Badge
                        label={idx === 0 ? 'Khối gốc' : `#${block.blockIndex}`}
                        variant={idx === 0 ? 'info' : 'neutral'}
                        size="sm"
                      />
                    </View>
                    <Text style={styles.timelineData} numberOfLines={2}>
                      {block.data}
                    </Text>
                    <View style={styles.timelineHashRow}>
                      <Text style={styles.timelineHashLabel}>Hash:</Text>
                      <Text style={styles.timelineHash} numberOfLines={1}>
                        {block.blockHash.substring(0, 20)}...
                      </Text>
                    </View>
                    <Text style={styles.timelineTime}>
                      {new Date(block.timestamp).toLocaleString('vi-VN')}
                    </Text>
                  </Card>
                </View>
              ))}
            </View>

            {/* On-Chain Anchor */}
            <Card style={styles.anchorCard}>
              <View style={styles.anchorHeader}>
                <Ionicons name="shield-checkmark" size={20} color={Colors.primary} />
                <Text style={styles.anchorTitle}>Neo On-Chain</Text>
              </View>
              {anchorData ? (
                <View style={styles.anchorInfo}>
                  <Badge label="Đã neo on-chain" variant="success" size="md" />
                  <Text style={styles.anchorDetail}>
                    Merkle Root: {(anchorData as any).merkleRoot?.substring(0, 24)}...
                  </Text>
                  <Text style={styles.anchorDetail}>
                    {(anchorData as any).blockCount} khối đã được xác nhận
                  </Text>
                </View>
              ) : (
                <View style={styles.anchorInfo}>
                  <Text style={styles.anchorNotYet}>Chưa neo on-chain</Text>
                  <Button
                    title="Neo chuỗi lên blockchain"
                    onPress={handleAnchor}
                    loading={anchoring}
                    variant="outline"
                    size="sm"
                  />
                </View>
              )}
            </Card>
          </>
        )}

        {/* Empty State */}
        {!blocks.length && !loading && (
          <EmptyState
            icon={<Ionicons name="link-outline" size={48} color={Colors.textMuted} />}
            title="Truy xuất nguồn gốc"
            description="Nhập mã lô hàng để xem chuỗi blockchain và lịch sử truy xuất"
          />
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

import { Alert } from 'react-native'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  searchCard: {
    marginBottom: Spacing.md,
  },
  searchTitle: {
    fontFamily: 'SpaceMono',
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  searchRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'SpaceMono',
    fontSize: 14,
    color: Colors.text,
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  recentCard: {
    marginBottom: Spacing.md,
  },
  recentTitle: {
    fontFamily: 'SpaceMono',
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  batchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  batchInfo: {
    flex: 1,
  },
  batchId: {
    fontFamily: 'SpaceMono',
    fontSize: 12,
    color: Colors.primary,
  },
  batchVariety: {
    fontFamily: 'SpaceMono',
    fontSize: 10,
    color: Colors.textSecondary,
  },
  statusCard: {
    borderWidth: 2,
    marginBottom: Spacing.md,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusIcon: {
    fontSize: 28,
    fontWeight: '700',
  },
  statusTitle: {
    fontFamily: 'SpaceMono',
    fontSize: 16,
    fontWeight: '700',
  },
  statusSubtitle: {
    fontFamily: 'SpaceMono',
    fontSize: 12,
    color: Colors.textSecondary,
  },
  timeline: {
    gap: 0,
    marginBottom: Spacing.lg,
  },
  timelineItem: {
    flexDirection: 'row',
    gap: 10,
    position: 'relative',
  },
  timelineLine: {
    position: 'absolute',
    left: 15,
    top: 32,
    bottom: 0,
    width: 2,
    backgroundColor: Colors.border,
  },
  timelineNode: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  timelineNodeIcon: {
    fontSize: 14,
  },
  timelineCard: {
    flex: 1,
    marginBottom: Spacing.sm,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  timelineStage: {
    fontFamily: 'SpaceMono',
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
  },
  timelineData: {
    fontFamily: 'SpaceMono',
    fontSize: 10,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  timelineHashRow: {
    flexDirection: 'row',
    gap: 4,
  },
  timelineHashLabel: {
    fontFamily: 'SpaceMono',
    fontSize: 9,
    color: Colors.textMuted,
  },
  timelineHash: {
    fontFamily: 'SpaceMono',
    fontSize: 9,
    color: Colors.primary,
    flex: 1,
  },
  timelineTime: {
    fontFamily: 'SpaceMono',
    fontSize: 9,
    color: Colors.textMuted,
    marginTop: 2,
  },
  anchorCard: {
    marginBottom: Spacing.md,
  },
  anchorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Spacing.sm,
  },
  anchorTitle: {
    fontFamily: 'SpaceMono',
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  anchorInfo: {
    gap: 8,
  },
  anchorDetail: {
    fontFamily: 'SpaceMono',
    fontSize: 11,
    color: Colors.textSecondary,
  },
  anchorNotYet: {
    fontFamily: 'SpaceMono',
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
})
