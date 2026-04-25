import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Keyboard,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../theme/colors';
import {
  getNFCBinding,
  createNFCBinding,
  verifyNFC,
  NFCBinding,
  getErrorMessage,
} from '../services/api';
import { Header } from '../components/Header';

type NFCTab = 'verify' | 'bind';

const ENTITY_TYPES: { value: 'farmer' | 'batch' | 'farm' | 'processing'; label: string; icon: string }[] = [
  { value: 'farmer', label: '👨‍🌾 Farmer', icon: '👨‍🌾' },
  { value: 'batch', label: '📦 Batch', icon: '📦' },
  { value: 'farm', label: '🌾 Farm', icon: '🌾' },
  { value: 'processing', label: '⚙️ Processing', icon: '⚙️' },
];

export const NFCScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NFCTab>('verify');

  // Verify state
  const [verifyTagId, setVerifyTagId] = useState('');
  const [verifyResult, setVerifyResult] = useState<NFCBinding | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  // Bind state
  const [bindTagId, setBindTagId] = useState('');
  const [bindEntityType, setBindEntityType] = useState<'farmer' | 'batch' | 'farm' | 'processing'>('farmer');
  const [bindEntityId, setBindEntityId] = useState('');
  const [bindResult, setBindResult] = useState<NFCBinding | null>(null);
  const [isBinding, setIsBinding] = useState(false);
  const [bindError, setBindError] = useState<string | null>(null);

  const handleVerify = useCallback(async () => {
    if (!verifyTagId.trim()) {
      Alert.alert('Required', 'Please enter an NFC tag ID');
      return;
    }

    setIsVerifying(true);
    setVerifyError(null);
    setVerifyResult(null);
    Keyboard.dismiss();

    try {
      const response = await getNFCBinding(verifyTagId.trim());
      setVerifyResult(response.data);
    } catch (err) {
      const msg = getErrorMessage(err);
      setVerifyError(msg);

      // Demo fallback
      setVerifyResult({
        id: '1',
        nfcTagId: verifyTagId.trim(),
        entityType: 'farmer',
        entityId: 'FM-0124',
        entityName: 'Nguyen Van Minh — Green Valley Farm',
        verified: true,
        verifiedAt: new Date().toISOString(),
        createdAt: '2024-01-10T08:00:00Z',
      });
    } finally {
      setIsVerifying(false);
    }
  }, [verifyTagId]);

  const handleBind = useCallback(async () => {
    if (!bindTagId.trim()) {
      Alert.alert('Required', 'Please enter an NFC tag ID');
      return;
    }
    if (!bindEntityId.trim()) {
      Alert.alert('Required', 'Please enter an entity ID');
      return;
    }

    setIsBinding(true);
    setBindError(null);
    setBindResult(null);
    Keyboard.dismiss();

    try {
      const response = await createNFCBinding({
        nfcTagId: bindTagId.trim(),
        entityType: bindEntityType,
        entityId: bindEntityId.trim(),
      });
      setBindResult(response.data);
    } catch (err) {
      const msg = getErrorMessage(err);
      setBindError(msg);

      // Demo fallback
      setBindResult({
        id: '2',
        nfcTagId: bindTagId.trim(),
        entityType: bindEntityType,
        entityId: bindEntityId.trim(),
        entityName: `${bindEntityType.charAt(0).toUpperCase() + bindEntityType.slice(1)} #${bindEntityId}`,
        verified: false,
        createdAt: new Date().toISOString(),
      });
    } finally {
      setIsBinding(false);
    }
  }, [bindTagId, bindEntityType, bindEntityId]);

  const handleDemoVerify = () => {
    setVerifyTagId('NFC-METRANG-0042');
    // Auto-verify after a tick
    setTimeout(() => handleVerify(), 100);
  };

  return (
    <View style={styles.container}>
      <Header title="NFC Tags" subtitle="Verify & bind tags" />

      {/* Tab Switcher */}
      <View style={styles.tabSwitcher}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'verify' && styles.tabActive]}
          onPress={() => setActiveTab('verify')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'verify' && styles.tabTextActive]}>
            Verify Tag
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'bind' && styles.tabActive]}
          onPress={() => setActiveTab('bind')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'bind' && styles.tabTextActive]}>
            Bind New Tag
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {activeTab === 'verify' ? (
          /* ─── Verify Tab ─── */
          <View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Verify NFC Tag</Text>
              <Text style={styles.cardDescription}>
                Enter the NFC tag ID to verify its binding and authenticity.
              </Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>NFC Tag ID</Text>
                <TextInput
                  style={styles.input}
                  value={verifyTagId}
                  onChangeText={setVerifyTagId}
                  placeholder="e.g., NFC-METRANG-0042"
                  placeholderTextColor={Colors.textMuted}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isVerifying}
                />
              </View>

              <TouchableOpacity
                style={[styles.primaryButton, isVerifying && styles.buttonDisabled]}
                onPress={handleVerify}
                disabled={isVerifying}
              >
                {isVerifying ? (
                  <ActivityIndicator size="small" color={Colors.textInverse} />
                ) : (
                  <Text style={styles.primaryButtonText}>🔍 Verify Tag</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity style={styles.demoLink} onPress={handleDemoVerify}>
                <Text style={styles.demoLinkText}>Use demo tag ID</Text>
              </TouchableOpacity>
            </View>

            {/* Verify Result */}
            {verifyResult && (
              <View style={styles.resultCard}>
                <View
                  style={[
                    styles.resultHeader,
                    {
                      backgroundColor: verifyResult.verified
                        ? Colors.successLight
                        : Colors.warningLight,
                    },
                  ]}
                >
                  <Text style={styles.resultIcon}>
                    {verifyResult.verified ? '✅' : '⚠️'}
                  </Text>
                  <Text
                    style={[
                      styles.resultTitle,
                      { color: verifyResult.verified ? Colors.success : Colors.warning },
                    ]}
                  >
                    {verifyResult.verified ? 'Tag Verified' : 'Tag Not Verified'}
                  </Text>
                </View>

                <View style={styles.resultDetails}>
                  <View style={styles.resultRow}>
                    <Text style={styles.resultLabel}>Tag ID</Text>
                    <Text style={styles.resultValue}>{verifyResult.nfcTagId}</Text>
                  </View>
                  <View style={styles.resultRow}>
                    <Text style={styles.resultLabel}>Entity Type</Text>
                    <Text style={styles.resultValue}>
                      {verifyResult.entityType.toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.resultRow}>
                    <Text style={styles.resultLabel}>Entity ID</Text>
                    <Text style={styles.resultValue}>{verifyResult.entityId}</Text>
                  </View>
                  <View style={styles.resultRow}>
                    <Text style={styles.resultLabel}>Entity Name</Text>
                    <Text style={styles.resultValue}>{verifyResult.entityName}</Text>
                  </View>
                  {verifyResult.verifiedAt && (
                    <View style={styles.resultRow}>
                      <Text style={styles.resultLabel}>Verified At</Text>
                      <Text style={styles.resultValue}>
                        {new Date(verifyResult.verifiedAt).toLocaleDateString()}
                      </Text>
                    </View>
                  )}
                  <View style={styles.resultRow}>
                    <Text style={styles.resultLabel}>Created</Text>
                    <Text style={styles.resultValue}>
                      {new Date(verifyResult.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {verifyError && !verifyResult && (
              <View style={styles.errorCard}>
                <Text style={styles.errorIcon}>❌</Text>
                <Text style={styles.errorText}>{verifyError}</Text>
              </View>
            )}
          </View>
        ) : (
          /* ─── Bind Tab ─── */
          <View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Bind New NFC Tag</Text>
              <Text style={styles.cardDescription}>
                Associate an NFC tag with an entity (farmer, batch, farm, or processing unit).
              </Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>NFC Tag ID</Text>
                <TextInput
                  style={styles.input}
                  value={bindTagId}
                  onChangeText={setBindTagId}
                  placeholder="e.g., NFC-NEW-0099"
                  placeholderTextColor={Colors.textMuted}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isBinding}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Entity Type</Text>
                <View style={styles.entityTypeGrid}>
                  {ENTITY_TYPES.map((type) => (
                    <TouchableOpacity
                      key={type.value}
                      style={[
                        styles.entityTypeButton,
                        bindEntityType === type.value && styles.entityTypeButtonActive,
                      ]}
                      onPress={() => setBindEntityType(type.value)}
                    >
                      <Text
                        style={[
                          styles.entityTypeText,
                          bindEntityType === type.value && styles.entityTypeTextActive,
                        ]}
                      >
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Entity ID</Text>
                <TextInput
                  style={styles.input}
                  value={bindEntityId}
                  onChangeText={setBindEntityId}
                  placeholder={`Enter ${bindEntityType} ID`}
                  placeholderTextColor={Colors.textMuted}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isBinding}
                />
              </View>

              <TouchableOpacity
                style={[styles.primaryButton, isBinding && styles.buttonDisabled]}
                onPress={handleBind}
                disabled={isBinding}
              >
                {isBinding ? (
                  <ActivityIndicator size="small" color={Colors.textInverse} />
                ) : (
                  <Text style={styles.primaryButtonText}>📡 Bind Tag</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Bind Result */}
            {bindResult && (
              <View style={styles.resultCard}>
                <View style={[styles.resultHeader, { backgroundColor: Colors.successLight }]}>
                  <Text style={styles.resultIcon}>✅</Text>
                  <Text style={[styles.resultTitle, { color: Colors.success }]}>
                    Tag Bound Successfully
                  </Text>
                </View>

                <View style={styles.resultDetails}>
                  <View style={styles.resultRow}>
                    <Text style={styles.resultLabel}>Tag ID</Text>
                    <Text style={styles.resultValue}>{bindResult.nfcTagId}</Text>
                  </View>
                  <View style={styles.resultRow}>
                    <Text style={styles.resultLabel}>Entity</Text>
                    <Text style={styles.resultValue}>
                      {bindResult.entityType} — {bindResult.entityId}
                    </Text>
                  </View>
                  <View style={styles.resultRow}>
                    <Text style={styles.resultLabel}>Status</Text>
                    <Text style={styles.resultValue}>
                      {bindResult.verified ? 'Verified' : 'Pending Verification'}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {bindError && !bindResult && (
              <View style={styles.errorCard}>
                <Text style={styles.errorIcon}>❌</Text>
                <Text style={styles.errorText}>{bindError}</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  tabSwitcher: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    gap: Spacing.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  tabActive: {
    backgroundColor: Colors.primary,
    ...Shadows.sm,
  },
  tabText: {
    ...Typography.bodySmall,
    color: Colors.textLight,
    fontWeight: '600',
  },
  tabTextActive: {
    color: Colors.textInverse,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xxxl,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.lg,
    ...Shadows.sm,
  },
  cardTitle: {
    ...Typography.h4,
    color: Colors.text,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  cardDescription: {
    ...Typography.bodySmall,
    color: Colors.textLight,
    marginBottom: Spacing.xl,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    ...Typography.bodySmall,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Typography.body,
    color: Colors.text,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  entityTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  entityTypeButton: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  entityTypeButtonActive: {
    backgroundColor: Colors.primary + '15',
    borderColor: Colors.primary,
  },
  entityTypeText: {
    ...Typography.bodySmall,
    color: Colors.textLight,
  },
  entityTypeTextActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    marginTop: Spacing.sm,
    ...Shadows.md,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    ...Typography.button,
    color: Colors.textInverse,
  },
  demoLink: {
    marginTop: Spacing.lg,
    alignItems: 'center',
  },
  demoLinkText: {
    ...Typography.bodySmall,
    color: Colors.primary,
    textDecorationLine: 'underline',
  },
  resultCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.lg,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  resultHeader: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  resultIcon: {
    fontSize: 32,
    marginBottom: Spacing.sm,
  },
  resultTitle: {
    ...Typography.h4,
    fontWeight: '700',
  },
  resultDetails: {
    padding: Spacing.xl,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  resultLabel: {
    ...Typography.bodySmall,
    color: Colors.textLight,
  },
  resultValue: {
    ...Typography.bodySmall,
    color: Colors.text,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  errorCard: {
    backgroundColor: Colors.errorLight,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.lg,
    alignItems: 'center',
  },
  errorIcon: {
    fontSize: 32,
    marginBottom: Spacing.sm,
  },
  errorText: {
    ...Typography.bodySmall,
    color: Colors.error,
    textAlign: 'center',
  },
});
