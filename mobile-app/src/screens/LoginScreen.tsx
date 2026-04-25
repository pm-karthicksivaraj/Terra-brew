import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../theme/colors';
import { login as authLogin, logout as authLogout } from '../services/auth';
import { useAuthStore } from '../stores/authStore';

export const LoginScreen: React.FC = () => {
  // Pre-filled demo credentials
  const [email, setEmail] = useState('admin@metrang-coffee.terrabrew.com');
  const [password, setPassword] = useState('Admin@2024');
  const [tenantSlug, setTenantSlug] = useState('metrang-coffee');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hydrate = useAuthStore((s) => s.hydrate);

  const handleLogin = useCallback(async () => {
    // Validate inputs
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    if (!password.trim()) {
      setError('Password is required');
      return;
    }
    if (!tenantSlug.trim()) {
      setError('Tenant slug is required');
      return;
    }

    setError(null);
    setIsLoading(true);
    Keyboard.dismiss();

    try {
      const result = await authLogin(email.trim(), password, tenantSlug.trim());

      if (result.success && result.user && result.token) {
        // Hydrate the auth store
        hydrate(result.user, result.token, tenantSlug.trim());
      } else {
        setError(result.error || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  }, [email, password, tenantSlug, hydrate]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoEmoji}>☕</Text>
            </View>
            <Text style={styles.appName}>Terra Brew</Text>
            <Text style={styles.appTagline}>Coffee Traceability Platform</Text>
          </View>

          {/* Form Section */}
          <View style={styles.formSection}>
            <Text style={styles.formTitle}>Sign In</Text>

            {/* Error banner */}
            {error && (
              <View style={styles.errorBanner}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Tenant Slug */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Tenant Slug</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.inputPrefix}>terrabrew.com/</Text>
                <TextInput
                  style={styles.inputWithPrefix}
                  value={tenantSlug}
                  onChangeText={setTenantSlug}
                  placeholder="your-tenant"
                  placeholderTextColor={Colors.textMuted}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
              </View>
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor={Colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                placeholderTextColor={Colors.textMuted}
                secureTextEntry
                autoCapitalize="none"
                editable={!isLoading}
              />
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <Text style={styles.loginButtonText}>
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Text>
            </TouchableOpacity>

            {/* Demo credentials hint */}
            <View style={styles.demoHint}>
              <Text style={styles.demoHintTitle}>Demo Credentials</Text>
              <Text style={styles.demoHintText}>
                Email: admin@metrang-coffee.terrabrew.com{'\n'}
                Password: Admin@2024{'\n'}
                Tenant: metrang-coffee
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  logoSection: {
    backgroundColor: Colors.primary,
    paddingTop: Spacing.xxxl,
    paddingBottom: Spacing.xxl,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    ...Shadows.md,
  },
  logoEmoji: {
    fontSize: 40,
  },
  appName: {
    ...Typography.h1,
    color: Colors.textInverse,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  appTagline: {
    ...Typography.bodySmall,
    color: Colors.secondaryLight,
  },
  formSection: {
    flex: 1,
    backgroundColor: Colors.background,
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xl,
    minHeight: 400,
  },
  formTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.xl,
  },
  errorBanner: {
    backgroundColor: Colors.errorLight,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: Colors.error,
  },
  errorText: {
    ...Typography.bodySmall,
    color: Colors.error,
    fontWeight: '500',
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  inputPrefix: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    paddingLeft: Spacing.lg,
    paddingRight: 0,
  },
  inputWithPrefix: {
    flex: 1,
    ...Typography.body,
    color: Colors.text,
    paddingVertical: Spacing.lg,
    paddingRight: Spacing.lg,
    paddingLeft: Spacing.sm,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Typography.body,
    color: Colors.text,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  loginButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    marginTop: Spacing.sm,
    ...Shadows.md,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    ...Typography.button,
    color: Colors.textInverse,
  },
  demoHint: {
    marginTop: Spacing.xl,
    backgroundColor: Colors.surfaceVariant,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    borderLeftWidth: 3,
    borderLeftColor: Colors.secondary,
  },
  demoHintTitle: {
    ...Typography.bodySmall,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: Spacing.sm,
  },
  demoHintText: {
    ...Typography.caption,
    color: Colors.textLight,
    lineHeight: 18,
  },
});
