/**
 * Farmer Registration Screen — Offline-capable farmer registration form.
 */
import React, { useState } from 'react'
import { View, Text, ScrollView, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { createFarmer } from '@/lib/api'
import { useSync } from '@/hooks/useSync'
import { useAuthStore } from '@/lib/auth'
import { Card, Button, Input, Badge } from '@/components/ui'
import { Colors, Spacing, COFFEE_VARIETIES } from '@/constants'

export default function FarmerRegisterScreen() {
  const user = useAuthStore(s => s.user)
  const { queueChange, isOnline } = useSync()
  const [saving, setSaving] = useState(false)

  // Form fields
  const [fullName, setFullName] = useState('')
  const [contactNumber, setContactNumber] = useState('')
  const [province, setProvince] = useState('')
  const [district, setDistrict] = useState('')
  const [commune, setCommune] = useState('')
  const [gender, setGender] = useState('')
  const [nationalIdNo, setNationalIdNo] = useState('')
  const [yearsExperience, setYearsExperience] = useState('')
  const [cooperative, setCooperative] = useState('')

  const handleSave = async () => {
    if (!fullName.trim() || !contactNumber.trim()) {
      Alert.alert('Lỗi', 'Vui lòng điền tên và số điện thoại')
      return
    }

    setSaving(true)

    const farmerData = {
      fullName: fullName.trim(),
      contactNumber: contactNumber.trim(),
      province: province.trim() || undefined,
      district: district.trim() || undefined,
      commune: commune.trim() || undefined,
      gender: gender || undefined,
      nationalIdNo: nationalIdNo.trim() || undefined,
      yearsOfFarmingExperience: yearsExperience ? parseInt(yearsExperience) : undefined,
      cooperative: cooperative.trim() || undefined,
      farmerCode: `F${Date.now().toString(36).toUpperCase()}`,
      country: 'VN',
      ekycConsent: true,
      smartphoneOwnership: true,
    }

    try {
      if (isOnline) {
        // Try online save first
        const response = await createFarmer(farmerData)
        if (response.success) {
          Alert.alert('Thành công', 'Đã đăng ký nông dân thành công!')
          // Reset form
          setFullName('')
          setContactNumber('')
          setProvince('')
          setDistrict('')
          setCommune('')
          return
        }
      }

      // Queue for offline sync
      await queueChange('farmers', 'create', farmerData)
      Alert.alert(
        'Đã lưu ngoại tuyến',
        'Thông tin nông dân đã được lưu và sẽ đồng bộ khi có mạng.'
      )

      // Reset form
      setFullName('')
      setContactNumber('')
      setProvince('')
      setDistrict('')
      setCommune('')
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể lưu thông tin. Vui lòng thử lại.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardAvoid}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {/* Header */}
          <View style={styles.header}>
            <Ionicons name="person-add-outline" size={24} color={Colors.primary} />
            <Text style={styles.headerTitle}>Đăng ký nông dân</Text>
            {!isOnline && <Badge label="Ngoại tuyến" variant="warning" size="sm" />}
          </View>

          {/* Personal Info */}
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>
            <Input
              label="Họ và tên *"
              value={fullName}
              onChangeText={setFullName}
              placeholder="Nguyễn Văn A"
            />
            <Input
              label="Số điện thoại *"
              value={contactNumber}
              onChangeText={setContactNumber}
              placeholder="0912345678"
              keyboardType="phone-pad"
            />
            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <Input
                  label="Giới tính"
                  value={gender}
                  onChangeText={setGender}
                  placeholder="Nam/Nữ/Khác"
                />
              </View>
              <View style={styles.halfWidth}>
                <Input
                  label="CCCD/CMND"
                  value={nationalIdNo}
                  onChangeText={setNationalIdNo}
                  placeholder="Số CCCD"
                  keyboardType="numeric"
                />
              </View>
            </View>
            <Input
              label="Kinh nghiệm nông nghiệp (năm)"
              value={yearsExperience}
              onChangeText={setYearsExperience}
              placeholder="10"
              keyboardType="numeric"
            />
          </Card>

          {/* Address */}
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Địa chỉ</Text>
            <Input
              label="Tỉnh/Thành phố"
              value={province}
              onChangeText={setProvince}
              placeholder="Đắk Lắk"
            />
            <Input
              label="Quận/Huyện"
              value={district}
              onChangeText={setDistrict}
              placeholder="Cư M'gar"
            />
            <Input
              label="Xã/Phường"
              value={commune}
              onChangeText={setCommune}
              placeholder="Ea Tiêu"
            />
          </Card>

          {/* Cooperative */}
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Hợp tác xã</Text>
            <Input
              label="Tên hợp tác xã"
              value={cooperative}
              onChangeText={setCooperative}
              placeholder="HTX Nông nghiệp..."
            />
          </Card>

          {/* Save Button */}
          <Button
            title={saving ? 'Đang lưu...' : 'Đăng ký nông dân'}
            onPress={handleSave}
            loading={saving}
            fullWidth
            size="lg"
            style={styles.saveButton}
          />

          {!isOnline && (
            <Text style={styles.offlineNote}>
              Dữ liệu sẽ được lưu ngoại tuyến và đồng bộ khi có kết nối mạng.
            </Text>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  keyboardAvoid: { flex: 1 },
  content: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Spacing.lg,
  },
  headerTitle: {
    fontFamily: 'SpaceMono',
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    flex: 1,
  },
  section: { marginBottom: Spacing.md },
  sectionTitle: {
    fontFamily: 'SpaceMono',
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: Spacing.sm,
  },
  row: { flexDirection: 'row', gap: Spacing.sm },
  halfWidth: { flex: 1 },
  saveButton: { marginTop: Spacing.lg },
  offlineNote: {
    fontFamily: 'SpaceMono',
    fontSize: 11,
    color: Colors.warning,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
})
