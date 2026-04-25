/**
 * Settings Screen — App configuration and NFC management.
 */
import React, { useState } from 'react'
import { View, Text, ScrollView, StyleSheet, Alert, Switch, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useAuthStore } from '@/lib/auth'
import { useSync } from '@/hooks/useSync'
import { useNFC } from '@/hooks/useNFC'
import { getHashChain, anchorOnChain, getNFCTags, createNFCTag } from '@/lib/api'
import { Card, Button, Badge, SectionHeader, Divider, Input } from '@/components/ui'
import { Colors, Spacing } from '@/constants'

export default function SettingsScreen() {
  const user = useAuthStore(s => s.user)
  const { isOnline, syncNow, isSyncing, lastSyncAt, pendingCount, conflicts } = useSync()
  const nfc = useNFC()
  const [nfcEntityType, setNfcEntityType] = useState('HarvestTraceability')
  const [nfcEntityId, setNfcEntityId] = useState('')
  const [nfcTagId, setNfcTagId] = useState('')
  const [writingNFC, setWritingNFC] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [locationEnabled, setLocationEnabled] = useState(true)

  const handleWriteNFC = async () => {
    if (!nfcEntityId.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập Entity ID')
      return
    }

    setWritingNFC(true)
    try {
      // First create the NFC tag on server
      const response = await createNFCTag(nfcEntityType, nfcEntityId.trim(), nfcTagId.trim() || `NFC-${Date.now()}`)
      if (response.success && response.data) {
        const { qrCode, hmacSignature } = response.data as any
        // Then write to physical NFC tag
        const written = await nfc.write(qrCode, nfcEntityType, nfcEntityId.trim(), hmacSignature)
        if (written) {
          Alert.alert('Thành công', 'Đã ghi thẻ NFC thành công!')
        }
      } else {
        Alert.alert('Lỗi', response.error || 'Không thể tạo thẻ NFC')
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể ghi thẻ NFC')
    } finally {
      setWritingNFC(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.pageTitle}>Cài đặt</Text>

        {/* NFC Settings */}
        <SectionHeader title="NFC" />
        <Card style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="nfc-outline" size={20} color={Colors.primary} />
              <View>
                <Text style={styles.settingLabel}>NFC</Text>
                <Text style={styles.settingSubtext}>
                  {nfc.isSupported ? (nfc.isEnabled ? 'Đã bật' : 'Đã tắt') : 'Không hỗ trợ'}
                </Text>
              </View>
            </View>
            <Badge
              label={nfc.isSupported ? 'Hỗ trợ' : 'Không hỗ trợ'}
              variant={nfc.isSupported ? 'success' : 'error'}
            />
          </View>
        </Card>

        {/* NFC Tag Writing */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Ghi thẻ NFC</Text>
          <Text style={styles.cardSubtitle}>Liên kết thẻ NFC với thực thể truy xuất</Text>
          
          <Text style={styles.fieldLabel}>Loại thực thể</Text>
          <View style={styles.chipContainer}>
            {['HarvestTraceability', 'ProcurementRecord', 'ProcessingJobOrder', 'Farmer'].map(t => (
              <TouchableOpacity
                key={t}
                style={[styles.chip, nfcEntityType === t && styles.chipActive]}
                onPress={() => setNfcEntityType(t)}
              >
                <Text style={[styles.chipText, nfcEntityType === t && styles.chipTextActive]}>
                  {t.replace(/([A-Z])/g, ' $1').trim().split(' ').pop()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Input
            label="Entity ID"
            value={nfcEntityId}
            onChangeText={setNfcEntityId}
            placeholder="Nhập ID thực thể"
          />
          <Input
            label="NFC Tag ID (tùy chọn)"
            value={nfcTagId}
            onChangeText={setNfcTagId}
            placeholder="UID của thẻ NFC vật lý"
          />

          <Button
            title={writingNFC ? 'Đang ghi...' : 'Ghi thẻ NFC'}
            onPress={handleWriteNFC}
            loading={writingNFC}
            disabled={!nfc.isSupported || !nfcEntityId.trim()}
            fullWidth
          />
        </Card>

        {/* App Settings */}
        <SectionHeader title="Ứng dụng" />
        <Card style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="notifications-outline" size={20} color={Colors.textSecondary} />
              <Text style={styles.settingLabel}>Thông báo</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor={Colors.text}
            />
          </View>
          <Divider />
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="location-outline" size={20} color={Colors.textSecondary} />
              <Text style={styles.settingLabel}>Vị trí</Text>
            </View>
            <Switch
              value={locationEnabled}
              onValueChange={setLocationEnabled}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor={Colors.text}
            />
          </View>
        </Card>

        {/* Sync Settings */}
        <SectionHeader title="Đồng bộ" />
        <Card style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="cloud-outline" size={20} color={isOnline ? Colors.success : Colors.error} />
              <View>
                <Text style={styles.settingLabel}>Trạng thái</Text>
                <Text style={styles.settingSubtext}>{isOnline ? 'Trực tuyến' : 'Ngoại tuyến'}</Text>
              </View>
            </View>
          </View>
          <Divider />
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="sync-outline" size={20} color={Colors.textSecondary} />
              <View>
                <Text style={styles.settingLabel}>Chờ đồng bộ</Text>
                <Text style={styles.settingSubtext}>{pendingCount} thay đổi</Text>
              </View>
            </View>
            <Button
              title="Sync"
              onPress={syncNow}
              variant="outline"
              size="sm"
              loading={isSyncing}
              disabled={!isOnline}
            />
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  pageTitle: { fontFamily: 'SpaceMono', fontSize: 24, fontWeight: '700', color: Colors.text, marginBottom: Spacing.lg },
  card: { marginBottom: Spacing.md },
  cardTitle: { fontFamily: 'SpaceMono', fontSize: 14, fontWeight: '600', color: Colors.text, marginBottom: 4 },
  cardSubtitle: { fontFamily: 'SpaceMono', fontSize: 11, color: Colors.textSecondary, marginBottom: Spacing.md },
  fieldLabel: { fontFamily: 'SpaceMono', fontSize: 12, color: Colors.textSecondary, marginBottom: Spacing.xs },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: Spacing.md },
  chip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, backgroundColor: Colors.surfaceLight, borderWidth: 1, borderColor: Colors.border },
  chipActive: { backgroundColor: Colors.primary + '30', borderColor: Colors.primary },
  chipText: { fontFamily: 'SpaceMono', fontSize: 10, color: Colors.textSecondary },
  chipTextActive: { color: Colors.primary, fontWeight: '600' },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.xs },
  settingInfo: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  settingLabel: { fontFamily: 'SpaceMono', fontSize: 13, color: Colors.text },
  settingSubtext: { fontFamily: 'SpaceMono', fontSize: 11, color: Colors.textSecondary },
})
