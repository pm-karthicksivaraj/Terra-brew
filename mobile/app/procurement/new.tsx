/**
 * Procurement Recording Screen — Record coffee procurement with offline support.
 */
import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView, StyleSheet, Alert, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { createProcurement, getFarmers, getFarmLands } from '@/lib/api'
import { useSync } from '@/hooks/useSync'
import { Card, Button, Input, Badge } from '@/components/ui'
import { Colors, Spacing, COFFEE_VARIETIES, PAYMENT_STATUSES } from '@/constants'
import type { Farmer, FarmLand } from '@/types'

export default function ProcurementNewScreen() {
  const { queueChange, isOnline } = useSync()
  const user = useAuthStore(s => s.user)
  const [saving, setSaving] = useState(false)
  const [farmers, setFarmers] = useState<Farmer[]>([])
  const [selectedFarmer, setSelectedFarmer] = useState('')

  const [coffeeType, setCoffeeType] = useState('')
  const [coffeeVariety, setCoffeeVariety] = useState('')
  const [grossWeight, setGrossWeight] = useState('')
  const [tareWeight, setTareWeight] = useState('')
  const [moistureAtGate, setMoistureAtGate] = useState('')
  const [pricePerKg, setPricePerKg] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [vehicleNumber, setVehicleNumber] = useState('')
  const [driverName, setDriverName] = useState('')
  const [destination, setDestination] = useState('')

  useEffect(() => {
    async function load() {
      const res = await getFarmers(1, 100)
      if (res.success && res.data) setFarmers((res.data as any).items || [])
    }
    load()
  }, [])

  const netWeight = grossWeight && tareWeight ? (parseFloat(grossWeight) - parseFloat(tareWeight)) : 0
  const totalAmount = netWeight > 0 && pricePerKg ? netWeight * parseFloat(pricePerKg) : 0

  const handleSave = async () => {
    if (!selectedFarmer || !grossWeight || !pricePerKg) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin bắt buộc')
      return
    }

    setSaving(true)

    const procData = {
      farmerId: selectedFarmer,
      coffeeType: coffeeType || undefined,
      coffeeVariety: coffeeVariety || undefined,
      grossWeight: parseFloat(grossWeight),
      tareWeight: tareWeight ? parseFloat(tareWeight) : 0,
      netWeight,
      moistureContentAtGate: moistureAtGate ? parseFloat(moistureAtGate) : undefined,
      purchasePricePerKg: parseFloat(pricePerKg),
      totalPurchaseAmount: totalAmount,
      priceBasis: 'per_kg',
      paymentMethod,
      paymentStatus: 'pending',
      procurementDate: new Date().toISOString(),
      batchId: `P${Date.now().toString(36).toUpperCase()}`,
      vehicleNumber: vehicleNumber.trim() || undefined,
      driverName: driverName.trim() || undefined,
      destination: destination.trim() || undefined,
    }

    try {
      if (isOnline) {
        const response = await createProcurement(procData)
        if (response.success) {
          Alert.alert('Thành công', 'Đã ghi nhận thu mua!')
          return
        }
      }
      await queueChange('procurement', 'create', procData)
      Alert.alert('Đã lưu ngoại tuyến', 'Thu mua sẽ đồng bộ khi có mạng.')
    } catch {
      Alert.alert('Lỗi', 'Không thể lưu thông tin thu mua.')
    } finally {
      setSaving(false)
    }
  }

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(amount)
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardAvoid}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Ionicons name="cart-outline" size={24} color={Colors.info} />
            <Text style={styles.headerTitle}>Thu mua cà phê</Text>
            {!isOnline && <Badge label="Ngoại tuyến" variant="warning" size="sm" />}
          </View>

          {/* Farmer Selection */}
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Nông dân</Text>
            <View style={styles.chipContainer}>
              {farmers.map(f => (
                <TouchableOpacity
                  key={f.id}
                  style={[styles.chip, selectedFarmer === f.id && styles.chipActive]}
                  onPress={() => setSelectedFarmer(f.id)}
                >
                  <Text style={[styles.chipText, selectedFarmer === f.id && styles.chipTextActive]}>
                    {f.fullName}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          {/* Coffee Details */}
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Chi tiết cà phê</Text>
            <Text style={styles.fieldLabel}>Loại cà phê</Text>
            <View style={styles.chipContainer}>
              {['Cherry', 'Parchment', 'Green Bean'].map(t => (
                <TouchableOpacity key={t} style={[styles.chip, coffeeType === t && styles.chipActive]} onPress={() => setCoffeeType(t)}>
                  <Text style={[styles.chipText, coffeeType === t && styles.chipTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.fieldLabel}>Giống</Text>
            <View style={styles.chipContainer}>
              {COFFEE_VARIETIES.slice(0, 4).map(v => (
                <TouchableOpacity key={v.value} style={[styles.chip, coffeeVariety === v.value && styles.chipActive]} onPress={() => setCoffeeVariety(v.value)}>
                  <Text style={[styles.chipText, coffeeVariety === v.value && styles.chipTextActive]}>{v.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          {/* Weight & Pricing */}
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Cân nặng & Giá</Text>
            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <Input label="Tổng trọng lượng (kg)" value={grossWeight} onChangeText={setGrossWeight} placeholder="100" keyboardType="decimal-pad" />
              </View>
              <View style={styles.halfWidth}>
                <Input label="Trừ bì (kg)" value={tareWeight} onChangeText={setTareWeight} placeholder="5" keyboardType="decimal-pad" />
              </View>
            </View>
            {netWeight > 0 && (
              <View style={styles.calculatedRow}>
                <Text style={styles.calculatedLabel}>Trọng lượng thực:</Text>
                <Text style={styles.calculatedValue}>{netWeight.toFixed(1)} kg</Text>
              </View>
            )}
            <Input label="Độ ẩm tại cổng (%)" value={moistureAtGate} onChangeText={setMoistureAtGate} placeholder="12.5" keyboardType="decimal-pad" />
            <Input label={`Giá/kg (${user?.currencySymbol || '₫'})`} value={pricePerKg} onChangeText={setPricePerKg} placeholder="35000" keyboardType="decimal-pad" />
            {totalAmount > 0 && (
              <View style={[styles.calculatedRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Tổng tiền:</Text>
                <Text style={styles.totalValue}>{formatVND(totalAmount)}</Text>
              </View>
            )}
          </Card>

          {/* Transport */}
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Vận chuyển</Text>
            <Input label="Biển số xe" value={vehicleNumber} onChangeText={setVehicleNumber} placeholder="51A-12345" autoCapitalize="characters" />
            <Input label="Tên tài xế" value={driverName} onChangeText={setDriverName} placeholder="Nguyễn Văn B" />
            <Input label="Điểm đến" value={destination} onChangeText={setDestination} placeholder="Nhà máy chế biến Metrang" />
          </Card>

          <Button
            title={saving ? 'Đang lưu...' : 'Ghi nhận thu mua'}
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

import { useAuthStore } from '@/lib/auth'

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
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: Colors.surfaceLight, borderWidth: 1, borderColor: Colors.border },
  chipActive: { backgroundColor: Colors.primary + '30', borderColor: Colors.primary },
  chipText: { fontFamily: 'SpaceMono', fontSize: 11, color: Colors.textSecondary },
  chipTextActive: { color: Colors.primary, fontWeight: '600' },
  row: { flexDirection: 'row', gap: Spacing.sm },
  halfWidth: { flex: 1 },
  calculatedRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: Spacing.xs },
  calculatedLabel: { fontFamily: 'SpaceMono', fontSize: 12, color: Colors.textSecondary },
  calculatedValue: { fontFamily: 'SpaceMono', fontSize: 14, fontWeight: '600', color: Colors.text },
  totalRow: { marginTop: Spacing.sm, paddingTop: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.border },
  totalLabel: { fontFamily: 'SpaceMono', fontSize: 14, fontWeight: '700', color: Colors.text },
  totalValue: { fontFamily: 'SpaceMono', fontSize: 18, fontWeight: '700', color: Colors.primary },
  saveButton: { marginTop: Spacing.lg },
})
