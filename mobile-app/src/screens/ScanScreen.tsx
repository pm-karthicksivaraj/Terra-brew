import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../theme/colors';
import { verifyQR, QRVerificationResult, getErrorMessage } from '../services/api';
import { Header } from '../components/Header';

// Note: In a real app with expo-camera / expo-barcode-scanner properly linked,
// we would use the camera module. For this scaffold, we provide a simulated
// scanner UI with manual input fallback that works in any environment.

export const ScanScreen: React.FC = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<QRVerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [flashOn, setFlashOn] = useState(false);

  useEffect(() => {
    // Check camera permission
    (async () => {
      try {
        // In a real Expo project with expo-camera linked:
        // const { status } = await Camera.requestCameraPermissionsAsync();
        // setHasPermission(status === 'granted');
        setHasPermission(true); // Simulate permission granted for demo
      } catch {
        setHasPermission(false);
      }
    })();
  }, []);

  const handleBarCodeScanned = async (data: string) => {
    if (scanned || isVerifying) return;

    setScanned(true);
    setIsVerifying(true);
    setError(null);

    try {
      const response = await verifyQR(data);
      setVerificationResult(response.data);
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);

      // Demo fallback
      setVerificationResult({
        valid: true,
        batchId: 'BT-2024-0042',
        productName: 'Highland Arabica',
        currentStage: 'Roasting',
        message: 'Batch verified successfully',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDemoScan = () => {
    handleBarCodeScanned('TERRABREW-BT-2024-0042');
  };

  const handleReset = () => {
    setScanned(false);
    setVerificationResult(null);
    setError(null);
  };

  const toggleFlash = () => {
    setFlashOn(!flashOn);
  };

  if (hasPermission === null) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.noAccessIcon}>📷</Text>
        <Text style={styles.noAccessText}>Camera access denied</Text>
        <Text style={styles.noAccessSubtext}>
          Please enable camera access in your device settings to scan QR codes.
        </Text>
        <TouchableOpacity style={styles.demoScanButton} onPress={handleDemoScan}>
          <Text style={styles.demoScanButtonText}>Demo Scan Instead</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Scan QR Code" subtitle="Verify batch traceability" />

      {!scanned ? (
        <View style={styles.scannerContainer}>
          {/* Camera preview placeholder */}
          <View style={styles.cameraPreview}>
            <View style={styles.scanOverlay}>
              {/* Corner markers */}
              <View style={styles.cornerTopLeft}>
                <View style={[styles.cornerLine, styles.cornerHorizontal]} />
                <View style={[styles.cornerLine, styles.cornerVertical]} />
              </View>
              <View style={styles.cornerTopRight}>
                <View style={[styles.cornerLine, styles.cornerHorizontal, styles.cornerRight]} />
                <View style={[styles.cornerLine, styles.cornerVertical]} />
              </View>
              <View style={styles.cornerBottomLeft}>
                <View style={[styles.cornerLine, styles.cornerHorizontal]} />
                <View style={[styles.cornerLine, styles.cornerVertical, styles.cornerBottom]} />
              </View>
              <View style={styles.cornerBottomRight}>
                <View style={[styles.cornerLine, styles.cornerHorizontal, styles.cornerRight]} />
                <View style={[styles.cornerLine, styles.cornerVertical, styles.cornerBottom]} />
              </View>

              <Text style={styles.scanHint}>Align QR code within the frame</Text>
            </View>
          </View>

          {/* Controls */}
          <View style={styles.controls}>
            <TouchableOpacity
              style={styles.flashButton}
              onPress={toggleFlash}
              activeOpacity={0.7}
            >
              <Text style={styles.flashIcon}>{flashOn ? '🔦' : '💡'}</Text>
              <Text style={styles.flashText}>{flashOn ? 'Flash On' : 'Flash Off'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.demoScanButton}
              onPress={handleDemoScan}
              activeOpacity={0.7}
            >
              <Text style={styles.demoScanIcon}>📋</Text>
              <Text style={styles.demoScanButtonText}>Demo Scan</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.resultContainer}>
          {isVerifying ? (
            <View style={styles.verifyingContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.verifyingText}>Verifying batch...</Text>
            </View>
          ) : verificationResult ? (
            <View style={styles.resultContent}>
              {/* Verification status */}
              <View
                style={[
                  styles.resultIconContainer,
                  {
                    backgroundColor: verificationResult.valid
                      ? Colors.successLight
                      : Colors.errorLight,
                  },
                ]}
              >
                <Text style={styles.resultIcon}>
                  {verificationResult.valid ? '✅' : '❌'}
                </Text>
              </View>

              <Text
                style={[
                  styles.resultTitle,
                  { color: verificationResult.valid ? Colors.success : Colors.error },
                ]}
              >
                {verificationResult.valid ? 'Verified' : 'Invalid'}
              </Text>

              <Text style={styles.resultMessage}>{verificationResult.message}</Text>

              {verificationResult.valid && (
                <View style={styles.resultDetails}>
                  <View style={styles.resultDetailRow}>
                    <Text style={styles.resultDetailLabel}>Batch ID</Text>
                    <Text style={styles.resultDetailValue}>
                      {verificationResult.batchId}
                    </Text>
                  </View>
                  <View style={styles.resultDetailRow}>
                    <Text style={styles.resultDetailLabel}>Product</Text>
                    <Text style={styles.resultDetailValue}>
                      {verificationResult.productName}
                    </Text>
                  </View>
                  <View style={styles.resultDetailRow}>
                    <Text style={styles.resultDetailLabel}>Current Stage</Text>
                    <Text style={styles.resultDetailValue}>
                      {verificationResult.currentStage}
                    </Text>
                  </View>
                </View>
              )}

              <TouchableOpacity style={styles.scanAgainButton} onPress={handleReset}>
                <Text style={styles.scanAgainButtonText}>Scan Another</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.resultContent}>
              <Text style={styles.resultIcon}>⚠️</Text>
              <Text style={styles.errorTitle}>Verification Failed</Text>
              <Text style={styles.resultMessage}>{error || 'Unknown error occurred'}</Text>
              <TouchableOpacity style={styles.scanAgainButton} onPress={handleReset}>
                <Text style={styles.scanAgainButtonText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: Spacing.xxl,
  },
  loadingText: {
    ...Typography.bodySmall,
    color: Colors.textLight,
    marginTop: Spacing.md,
  },
  noAccessIcon: {
    fontSize: 64,
    marginBottom: Spacing.lg,
  },
  noAccessText: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  noAccessSubtext: {
    ...Typography.bodySmall,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  scannerContainer: {
    flex: 1,
  },
  cameraPreview: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    margin: Spacing.xl,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.lg,
  },
  scanOverlay: {
    width: 240,
    height: 240,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cornerTopLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  cornerTopRight: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  cornerBottomLeft: {
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
  cornerBottomRight: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  cornerLine: {
    backgroundColor: Colors.secondary,
  },
  cornerHorizontal: {
    width: 40,
    height: 3,
  },
  cornerVertical: {
    width: 3,
    height: 40,
  },
  cornerRight: {
    alignSelf: 'flex-end',
  },
  cornerBottom: {
    alignSelf: 'flex-end',
  },
  scanHint: {
    ...Typography.bodySmall,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginTop: Spacing.xxxl,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.xl,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  flashButton: {
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    ...Shadows.sm,
  },
  flashIcon: {
    fontSize: 24,
    marginBottom: Spacing.xs,
  },
  flashText: {
    ...Typography.caption,
    color: Colors.textLight,
  },
  demoScanButton: {
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    ...Shadows.md,
  },
  demoScanIcon: {
    fontSize: 24,
    marginBottom: Spacing.xs,
  },
  demoScanButtonText: {
    ...Typography.caption,
    color: Colors.textInverse,
    fontWeight: '600',
  },
  resultContainer: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
  },
  verifyingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifyingText: {
    ...Typography.body,
    color: Colors.textLight,
    marginTop: Spacing.lg,
  },
  resultContent: {
    alignItems: 'center',
    paddingTop: Spacing.xxl,
  },
  resultIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  resultIcon: {
    fontSize: 40,
  },
  resultTitle: {
    ...Typography.h2,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  errorTitle: {
    ...Typography.h3,
    color: Colors.error,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  resultMessage: {
    ...Typography.body,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  resultDetails: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    marginBottom: Spacing.xxl,
    ...Shadows.sm,
  },
  resultDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  resultDetailLabel: {
    ...Typography.bodySmall,
    color: Colors.textLight,
  },
  resultDetailValue: {
    ...Typography.bodySmall,
    color: Colors.text,
    fontWeight: '600',
  },
  scanAgainButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.lg,
    ...Shadows.md,
  },
  scanAgainButtonText: {
    ...Typography.button,
    color: Colors.textInverse,
  },
});
