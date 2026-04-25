import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import { Colors } from './src/theme/colors';
import { AppNavigator } from './src/navigation/AppNavigator';
import { useAuthStore } from './src/stores/authStore';
import { getToken, getUser, getTenantSlug } from './src/services/auth';

export default function App() {
  const hydrate = useAuthStore((s) => s.hydrate);
  const setLoading = useAuthStore((s) => s.setLoading);

  // Check for existing auth state on app launch
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = await getToken();
        const user = await getUser();
        const tenantSlug = await getTenantSlug();

        if (token && user) {
          hydrate(user, token, tenantSlug || '');
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.warn('Failed to restore auth state:', error);
        setLoading(false);
      }
    };

    initializeAuth();
  }, [hydrate, setLoading]);

  return (
    <SafeAreaProvider>
      <PaperProvider>
        <View style={styles.container}>
          <StatusBar style="light" backgroundColor={Colors.primary} />
          <AppNavigator />
        </View>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});
