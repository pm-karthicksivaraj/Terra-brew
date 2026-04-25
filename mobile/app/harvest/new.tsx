/**
 * Harvest Recording Screen — Record a new harvest with offline support.
 */
import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView, StyleSheet, Alert, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { createHarvest, getFarmers, getFarmLands } from '@/lib/api'
import { useSync } from '@/hooks/useSync'
import { Card, Button, Input, Badge, SectionHeader } from '@/components/ui'
import { Colors, Spacing, HARVEST_METHODS, PROCESSING_METHODS, COFFEE_VARIETIES } from '@/constants'
import type { Farmer, FarmLand } from '@/types'

export default function HarvestNewScreen() {
  const { queueChange, isOnline } = useSync()
  const [saving, setSaving] = useState(false)
  const [farmers, setFarmers] = useState<Farmer[]>([])
  const [farmLands, setFarmLands] = useState<FarmLand[]>([])
  const [selectedFarmer, setSelectedFarmer] = useState('')
  const [selectedFarmLand, setSelectedFarmLand] = useState('')

  // Form fields
  const [coffeeVariety, setCoffeeVariety] = useState('')
  const [harvestMethod, setHarvestMethod] = useState('Selective Picking')
  const [cherryRipeness, setCherryRipeness] = useState('')
  const [cupScore, setCupScore] = useState('')
  const [processingMethod, setProcessingMethod] = useState('')
  const [moistureContent, setMoistureContent] = useState('')
  const [batchNotes, setBatchNotes] = useState('')
  const [actualHarvestDate, setActualHarvestDate] = useState(new Date().toISOString().split('T')[0])

  // Load farmers and farmlands
  useEffect(() => {
    async function load() {
      const [farmersRes, landsRes] = await Promise.all([
        getFarmers(1, 100),
        getFarmLands(1, 100),
      ])
      if (farmersRes.success && farmersRes.data) {
        setFarmers((farmersRes.data as any).items || [])
      }
      if (landsRes.success && landsRes.data) {
        setFarmLands((landsRes.data as any).items || [])
      }
    }
    load()
  }, [])

  const filteredFarmLands = farmLands.filter(fl => !selectedFarmer || fl.farmerId === selectedFarmer)

  const handleSave = async () => {
    if (!selectedFarmer || !selectedFarmLand) {
      Alert.alert('Lỗi', 'Vui lòng chọn nông dân và đất nông nghiệp')
      return
    }

    setSaving(true)

    const harvestData = {
      farmerId: selectedFarmer,
      farmLandId: selectedFarmLand,
      coffeeVariety: coffeeVariety || undefined,
      harvestMethod: harvestMethod || undefined,
      cherryRipeness: cherryRipeness ? parseFloat(cherryRipeness) : undefined,
      cupScore: cupScore ? parseFloat(cupScore) : undefined,
      processingMethod: processingMethod || undefined,
      moistureContent: moistureContent ? parseFloat(moistureContent) : undefined,
      actualHarvestDate: actualHarvestDate || undefined,
      batchNotes: batchNotes.trim() || undefined,
      batchId: `B${Date.now().toString(36).toUpperCase()}`,
      processingStage: 'harvest',
    }

    try {
      if (isOnline) {
        const response = await createHarvest(harvestData)
        if (response.success) {
          Alert.alert('Thành công', 'Đã ghi nhận thu hoạch!')
          return
        }
      }

      await queueChange('harvest-traceabilities', 'create', harvestData)
      Alert.alert('Đã lưu ngoại tuyến', 'Thu hoạch sẽ đồng bộ khi có mạng.')
    } catch {
      Alert.alert('Lỗi', 'Không thể lưu thông tin thu hoạch.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardAvoid}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Ionicons name="leaf-outline" size={24} color={Colors.success} />
            <Text style={styles.headerTitle}>Ghi nhận thu hoạch</Text>
            {!isOnline && <Badge label="Ngoại tuyến" variant="warning" size="sm" />}
          </View>

          {/* Farmer Selection */}
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Nông dân & Đất</Text>
            <Text style={styles.fieldLabel}>Chọn nông dân</Text>
            <View style={styles.chipContainer}>
              {farmers.map(f => (
                <TouchableOpacity
                  key={f.id}
                  style={[styles.chip, selectedFarmer === f.id && styles.chipActive]}
                  onPress={() => { setSelectedFarmer(f.id); setSelectedFarmLand('') }}
                >
                  <Text style={[styles.chipText, selectedFarmer === f.id && styles.chipTextActive]}>
                    {f.fullName}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {selectedFarmer && (
              <>
                <Text style={styles.fieldLabel}>Chọn đất nông nghiệp</Text>
                <View style={styles.chipContainer}>
                  {filteredFarmLands.map(fl => (
                    <TouchableOpacity
                      key={fl.id}
                      style={[styles.chip, selectedFarmLand === fl.id && styles.chipActive]}
                      onPress={() => setSelectedFarmLand(fl.id)}
                    >
                      <Text style={[styles.chipText, selectedFarmLand === fl.id && styles.chipTextActive]}>
                        {fl.farmName}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}
          </Card>

          {/* Harvest Details */}
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Chi tiết thu hoạch</Text>

            <Text style={styles.fieldLabel}>Giống cà phê</Text>
            <View style={styles.chipContainer}>
              {COFFEE_VARIETIES.map(v => (
                <TouchableOpacity
                  key={v.value}
                  style={[styles.chip, coffeeVariety === v.value && styles.chipActive]}
                  onPress={() => setCoffeeVariety(v.value)}
                >
                  <Text style={[styles.chipText, coffeeVariety === v.value && styles.chipTextActive]}>
                    {v.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Phương thức thu hoạch</Text>
            <View style={styles.chipContainer}>
              {HARVEST_METHODS.map(m => (
                <TouchableOpacity
                  key={m.value}
                  style={[styles.chip, harvestMethod === m.value && styles.chipActive]}
                  onPress={() => setHarvestMethod(m.value)}
                >
                  <Text style={[styles.chipText, harvestMethod === m.value && styles.chipTextActive]}>
                    {m.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <Input
                  label="Độ chín cherry (%)"
                  value={cherryRipeness}
                  onChangeText={setCherryRipeness}
                  placeholder="85"
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={styles.halfWidth}>
                <Input
                  label="Điểm cup"
                  value={cupScore}
                  onChangeText={setCupScore}
                  placeholder="82.5"
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            <Text style={styles.fieldLabel}>Phương thức chế biến</Text>
            <View style={styles.chipContainer}>
              {PROCESSING_METHODS.map(m => (
                <TouchableOpacity
                  key={m.value}
                  style={[styles.chip, processingMethod === m.value && styles.chipActive]}
                  onPress={() => setProcessingMethod(m.value)}
                >
                  <Text style={[styles.chipText, processingMethod === m.value && styles.chipTextActive]}>
                    {m.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Input
              label="Độ ẩm (%)"
              value={moistureContent}
              onChangeText={setMoistureContent}
              placeholder="12.5"
              keyboardType="decimal-pad"
            />
            <Input
              label="Ghi chú"
              value={batchNotes}
              onChangeText={setBatchNotes}
              placeholder="Ghi chú về lô thu hoạch..."
              multiline
            />
          </Card>

          <Button
            title={saving ? 'Đang lưu...' : 'Ghi nhận thu hoạch'}
            onPress={handleSave}
            loading={saving}
            fullWidth
            size="lg"
            style={styles.saveButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  keyboardAvoid: { flex: 1 },
  content: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: Spacing.lg },
  headerTitle: { fontFamily: 'SpaceMono', fontSize: 20, fontWeight: '700', color: Colors.text, flex: 1 },
  section: { marginBottom: Spacing.md },
  sectionTitle: { fontFamily: 'SpaceMono', fontSize: 14, fontWeight: '600', color: Colors.primary, marginBottom: Spacing.sm },
  fieldLabel: { fontFamily: 'SpaceMono', fontSize: 12, color: Colors.textSecondary, marginBottom: Spacing.xs },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: Spacing.md },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: { backgroundColor: Colors.primary + '30', borderColor: Colors.primary },
  chipText: { fontFamily: 'SpaceMono', fontSize: 11, color: Colors.textSecondary },
  chipTextActive: { color: Colors.primary, fontWeight: '600' },
  row: { flexDirection: 'row', gap: Spacing.sm },
  halfWidth: { flex: 1 },
  saveButton: { marginTop: Spacing.lg },
})
