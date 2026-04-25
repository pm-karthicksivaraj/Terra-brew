/**
 * Login Screen — Mobile JWT authentication.
 * Tenant-specific login with email/password/tenantSlug.
 */
import React, { useState } from 'react'
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuthStore } from '@/lib/auth'
import { Button, Input } from '@/components/ui'
import { Colors, Spacing } from '@/constants'

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [tenantSlug, setTenantSlug] = useState('metrang-coffee')
  const [showPassword, setShowPassword] = useState(false)

  const login = useAuthStore(s => s.login)
  const isLoading = useAuthStore(s => s.isLoading)

  const handleLogin = async () => {
    if (!email.trim() || !password.trim() || !tenantSlug.trim()) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin')
      return
    }

    const result = await login({ email: email.trim(), password, tenantSlug: tenantSlug.trim() })

    if (!result.success) {
      Alert.alert('Đăng nhập thất bại', result.error || 'Kiểm tra lại thông tin đăng nhập')
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo & Branding */}
          <View style={styles.brandSection}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoEmoji}>☕</Text>
            </View>
            <Text style={styles.appName}>Terra Brew</Text>
            <Text style={styles.tagline}>Nền tảng Truy xuất Nguồn gốc Cà phê</Text>
          </View>

          {/* Login Form */}
          <View style={styles.formSection}>
            <Text style={styles.formTitle}>Đăng nhập</Text>

            <Input
              label="Mã đối tác (Tenant Slug)"
              value={tenantSlug}
              onChangeText={setTenantSlug}
              placeholder="ví dụ: metrang-coffee"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="email@metrang.vn"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Input
              label="Mật khẩu"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />

            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.showPassword}
            >
              <Text style={styles.showPasswordText}>
                {showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              </Text>
            </TouchableOpacity>

            <Button
              title="Đăng nhập"
              onPress={handleLogin}
              loading={isLoading}
              fullWidth
              size="lg"
              style={styles.loginButton}
            />

            <Text style={styles.demoHint}>
              Demo: admin@metrang.vn / password123
            </Text>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Terra Brew v1.0 — Bảo mật AES-256-GCM + HMAC-SHA256
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
  },
  brandSection: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  logoEmoji: {
    fontSize: 40,
  },
  appName: {
    fontFamily: 'SpaceMono',
    fontSize: 28,
    fontWeight: '700',
    color: Colors.primary,
  },
  tagline: {
    fontFamily: 'SpaceMono',
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  formSection: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  formTitle: {
    fontFamily: 'SpaceMono',
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.lg,
  },
  showPassword: {
    alignSelf: 'flex-end',
    marginBottom: Spacing.md,
  },
  showPasswordText: {
    fontFamily: 'SpaceMono',
    fontSize: 12,
    color: Colors.primary,
  },
  loginButton: {
    marginTop: Spacing.sm,
  },
  demoHint: {
    fontFamily: 'SpaceMono',
    fontSize: 10,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
  footer: {
    marginTop: 'auto',
    paddingTop: Spacing.xl,
    alignItems: 'center',
  },
  footerText: {
    fontFamily: 'SpaceMono',
    fontSize: 10,
    color: Colors.textMuted,
  },
})
