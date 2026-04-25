import React from 'react';
import { View, Text, StyleSheet, StatusBar, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing } from '../theme/colors';
import { useAuthStore, selectTenantName } from '../stores/authStore';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showTenant?: boolean;
  rightAction?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  title = 'Terra Brew',
  subtitle,
  showTenant = true,
  rightAction,
}) => {
  const tenantName = useAuthStore(selectTenantName);

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{title}</Text>
            {(subtitle || (showTenant && tenantName)) && (
              <Text style={styles.subtitle}>
                {subtitle || tenantName}
              </Text>
            )}
          </View>
          {rightAction && (
            <View style={styles.rightAction}>
              {rightAction}
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: Colors.primary,
  },
  container: {
    backgroundColor: Colors.primary,
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    ...Platform.select({
      ios: {
        paddingTop: 8,
      },
      android: {
        paddingTop: StatusBar.currentHeight ? 8 : Spacing.md,
      },
    }),
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    ...Typography.h2,
    color: Colors.textInverse,
    fontFamily: 'System',
  },
  subtitle: {
    ...Typography.caption,
    color: Colors.secondaryLight,
    marginTop: 2,
  },
  rightAction: {
    marginLeft: Spacing.md,
  },
});
