/**
 * Scan Screen — QR code scanner + NFC tag reader.
 * Allows users to scan QR codes or NFC tags to verify product authenticity.
 */
import React, { useState, useCallback } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  PermissionsAndroid,
  Platform,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera'
import { useNFC } from '@/hooks/useNFC'
import { useSync } from '@/hooks/useSync'
import { verifyQROnline } from '@/lib/api'
import { Card, Button, VerifyResultCard, Badge, Divider } from '@/components/ui'
import { Colors, Spacing } from '@/constants'
import type { QRVerificationResult, NFCScanResult } from '@/types'

type ScanMode = 'qr' | 'nfc' | 'manual'

export default function ScanScreen() {
  const [scanMode, setScanMode] = useState<ScanMode>('qr')
  const [manualCode, setManualCode] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [result, setResult] = useState<QRVerificationResult | null>(null)
  const [cameraPermission, requestCameraPermission] = useCameraPermissions()
  const [scanned, setScanned] = useState(false)
  const nfc = useNFC()
  const { isOnline } = useSync()

  // Handle QR code scan
  const onBarCodeScanned = useCallback(async (scanningResult: BarcodeScanningResult) => {
    if (scanned) return
    setScanned(true)

    const { data } = scanningResult
    if (data) {
      await verifyCode(data)
    }

    // Allow re-scanning after 3 seconds
    setTimeout(() => setScanned(false), 3000)
  }, [scanned])

  // Handle NFC scan
  const handleNFCScan = async () => {
    const scanResult = await nfc.scanAndVerify()
    if (scanResult) {
      setResult(scanResult)
    } else if (nfc.error) {
      Alert.alert('Lỗi NFC', nfc.error)
    }
  }

  // Verify a code (QR or manual)
  const verifyCode = async (code: string) => {
    if (!code.trim()) return
    setVerifying(true)
    setResult(null)

    try {
      const response = await verifyQROnline(code.trim())
      if (response.success && response.data) {
        setResult(response.data)
      } else {
        Alert.alert('Xác minh thất bại', response.error || 'Không tìm thấy mã')
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể xác minh — Kiểm tra kết nối mạng')
    } finally {
      setVerifying(false)
    }
  }

  // Handle manual code submission
  const handleManualVerify = () => {
    if (!manualCode.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập mã truy xuất')
      return
    }
    verifyCode(manualCode.trim())
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Mode Selector */}
        <View style={styles.modeSelector}>
          <TouchableOpacity
            style={[styles.modeButton, scanMode === 'qr' && styles.modeButtonActive]}
            onPress={() => setScanMode('qr')}
          >
            <Ionicons name="qr-code-outline" size={20} color={scanMode === 'qr' ? Colors.background : Colors.textSecondary} />
            <Text style={[styles.modeButtonText, scanMode === 'qr' && styles.modeButtonTextActive]}>Quét QR</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeButton, scanMode === 'nfc' && styles.modeButtonActive]}
            onPress={() => setScanMode('nfc')}
          >
            <Ionicons name="nfc-outline" size={20} color={scanMode === 'nfc' ? Colors.background : Colors.textSecondary} />
            <Text style={[styles.modeButtonText, scanMode === 'nfc' && styles.modeButtonTextActive]}>NFC</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeButton, scanMode === 'manual' && styles.modeButtonActive]}
            onPress={() => setScanMode('manual')}
          >
            <Ionicons name="keypad-outline" size={20} color={scanMode === 'manual' ? Colors.background : Colors.textSecondary} />
            <Text style={[styles.modeButtonText, scanMode === 'manual' && styles.modeButtonTextActive]}>Nhập mã</Text>
          </TouchableOpacity>
        </View>

        {/* Scanner Area */}
        {scanMode === 'qr' && (
          <View style={styles.scannerContainer}>
            {!cameraPermission?.granted ? (
              <Card style={styles.permissionCard}>
                <Ionicons name="camera-outline" size={48} color={Colors.textMuted} />
                <Text style={styles.permissionText}>Cần quyền truy cập camera để quét mã QR</Text>
                <Button title="Cấp quyền Camera" onPress={requestCameraPermission} variant="outline" />
              </Card>
            ) : (
              <View style={styles.cameraContainer}>
                <CameraView
                  style={styles.camera}
                  onBarcodeScanned={onBarCodeScanned}
                  barcodeScannerSettings={{
                    barcodeTypes: ['qr'],
                  }}
                />
                <View style={styles.scanOverlay}>
                  <View style={styles.scanFrame} />
                  <Text style={styles.scanHint}>Đặt mã QR vào khung hình</Text>
                </View>
              </View>
            )}
          </View>
        )}

        {scanMode === 'nfc' && (
          <Card style={styles.nfcCard}>
            <View style={styles.nfcContent}>
              <Ionicons name="radio-outline" size={64} color={nfc.isScanning ? Colors.primary : Colors.textMuted} />
              <Text style={styles.nfcTitle}>
                {nfc.isScanning ? 'Đang quét NFC...' : 'Chạm để quét thẻ NFC'}
              </Text>
              <Text style={styles.nfcSubtitle}>
                Đặt điện thoại gần thẻ NFC trên sản phẩm cà phê
              </Text>
              {!nfc.isSupported && (
                <Badge label="Thiết bị không hỗ trợ NFC" variant="error" size="md" />
              )}
              <Button
                title={nfc.isScanning ? 'Đang quét...' : 'Bắt đầu quét NFC'}
                onPress={handleNFCScan}
                loading={nfc.isScanning}
                disabled={!nfc.isSupported}
                size="lg"
                style={styles.nfcButton}
              />
            </View>
          </Card>
        )}

        {scanMode === 'manual' && (
          <Card style={styles.manualCard}>
            <Text style={styles.manualTitle}>Nhập mã truy xuất</Text>
            <Text style={styles.manualHint}>
              Nhập mã QR hoặc mã NFC được in trên bao bì sản phẩm
            </Text>
            <View style={styles.manualInputRow}>
              <TextInput
                style={styles.manualInput}
                value={manualCode}
                onChangeText={setManualCode}
                placeholder="TB-HAR-xxxx-xxxxxxxxxxxx"
                placeholderTextColor={Colors.textMuted}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Button
                title="Xác minh"
                onPress={handleManualVerify}
                loading={verifying}
                disabled={!manualCode.trim()}
              />
            </View>
          </Card>
        )}

        {/* Verification Result */}
        {verifying && (
          <Card style={styles.verifyingCard}>
            <Text style={styles.verifyingText}>Đang xác minh chuỗi blockchain...</Text>
          </Card>
        )}

        {result && (
          <VerifyResultCard
            isValid={result.signatureValid}
            entityType={result.entityType}
            entityDetails={result.entityDetails}
            chainIntegrity={result.chainIntegrity}
            scanCount={result.scanCount}
          />
        )}

        {/* Recent Scans placeholder */}
        <Card style={styles.recentCard}>
          <Text style={styles.recentTitle}>Lịch sử quét gần đây</Text>
          <Text style={styles.recentEmpty}>Chưa có lượt quét nào</Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  )
}

// Need TextInput import
import { TextInput } from 'react-native'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  modeSelector: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 4,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Spacing.sm + 2,
    borderRadius: 8,
  },
  modeButtonActive: {
    backgroundColor: Colors.primary,
  },
  modeButtonText: {
    fontFamily: 'SpaceMono',
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  modeButtonTextActive: {
    color: Colors.background,
  },
  scannerContainer: {
    height: 300,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  permissionCard: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 300,
    gap: 12,
  },
  permissionText: {
    fontFamily: 'SpaceMono',
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  scanOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanFrame: {
    width: 200,
    height: 200,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  scanHint: {
    fontFamily: 'SpaceMono',
    fontSize: 12,
    color: Colors.text,
    backgroundColor: Colors.background + 'CC',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 6,
    marginTop: Spacing.md,
  },
  nfcCard: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    marginBottom: Spacing.md,
  },
  nfcContent: {
    alignItems: 'center',
    gap: 12,
  },
  nfcTitle: {
    fontFamily: 'SpaceMono',
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  nfcSubtitle: {
    fontFamily: 'SpaceMono',
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  nfcButton: {
    marginTop: Spacing.md,
    minWidth: 200,
  },
  manualCard: {
    marginBottom: Spacing.md,
  },
  manualTitle: {
    fontFamily: 'SpaceMono',
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  manualHint: {
    fontFamily: 'SpaceMono',
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  manualInputRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  manualInput: {
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
  verifyingCard: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    marginBottom: Spacing.md,
  },
  verifyingText: {
    fontFamily: 'SpaceMono',
    fontSize: 13,
    color: Colors.primary,
  },
  recentCard: {
    paddingVertical: Spacing.lg,
  },
  recentTitle: {
    fontFamily: 'SpaceMono',
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  recentEmpty: {
    fontFamily: 'SpaceMono',
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
  },
})
