import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Colors, Typography, Spacing } from '../theme/colors';

interface LoadingScreenProps {
  message?: string;
  fullScreen?: boolean;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'Loading...',
  fullScreen = true,
}) => {
  if (fullScreen) {
    return (
      <View style={styles.fullScreen}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>☕</Text>
          <Text style={styles.logoName}>Terra Brew</Text>
        </View>
        <ActivityIndicator
          size="large"
          color={Colors.primary}
          style={styles.spinner}
        />
        <Text style={styles.message}>{message}</Text>
      </View>
    );
  }

  return (
    <View style={styles.inline}>
      <ActivityIndicator size="small" color={Colors.primary} />
      <Text style={styles.inlineMessage}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xxl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  logoText: {
    fontSize: 64,
    marginBottom: Spacing.sm,
  },
  logoName: {
    ...Typography.h2,
    color: Colors.primary,
    fontWeight: '700',
  },
  spinner: {
    marginBottom: Spacing.lg,
  },
  message: {
    ...Typography.bodySmall,
    color: Colors.textLight,
    textAlign: 'center',
  },
  inline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  inlineMessage: {
    ...Typography.bodySmall,
    color: Colors.textLight,
  },
});
