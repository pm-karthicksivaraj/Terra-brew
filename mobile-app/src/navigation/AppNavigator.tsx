import React from 'react';
import { Platform, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Colors, Typography, Spacing } from '../theme/colors';
import { useAuthStore, selectIsAuthenticated, selectIsLoading } from '../stores/authStore';

// Screens
import { LoginScreen } from '../screens/LoginScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { FarmersScreen } from '../screens/FarmersScreen';
import { FarmerDetailScreen } from '../screens/FarmerDetailScreen';
import { ScanScreen } from '../screens/ScanScreen';
import { TraceScreen } from '../screens/TraceScreen';
import { NFCScreen } from '../screens/NFCScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { LoadingScreen } from '../components/LoadingScreen';

// ─── Types ───────────────────────────────────────────────────────────────────
export type AuthStackParamList = {
  Login: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Scan: undefined;
  Farmers: undefined;
  NFC: undefined;
  Profile: undefined;
};

export type MainStackParamList = {
  MainTabs: undefined;
  FarmerDetail: { farmerId: string; farmerName?: string };
  Trace: { batchId?: string };
};

// ─── Navigators ──────────────────────────────────────────────────────────────
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();
const MainStack = createNativeStackNavigator<MainStackParamList>();

// ─── Tab Icons (text-based for zero dependency) ─────────────────────────────
const TAB_ICONS: Record<keyof MainTabParamList, string> = {
  Home: '🏠',
  Scan: '📷',
  Farmers: '👨‍🌾',
  NFC: '📡',
  Profile: '👤',
};

// ─── Bottom Tab Navigator ────────────────────────────────────────────────────
const TabNavigator: React.FC = () => {
  return (
    <MainTab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => {
          const icon = TAB_ICONS[route.name as keyof MainTabParamList] || '●';
          return (
            <React.Fragment>
              <Text
                style={{
                  fontSize: focused ? 24 : 20,
                  opacity: focused ? 1 : 0.6,
                }}
              >
                {icon}
              </Text>
            </React.Fragment>
          );
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textLight,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.borderLight,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          ...Typography.caption,
          fontWeight: '600',
          fontSize: 10,
        },
      })}
    >
      <MainTab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      <MainTab.Screen
        name="Scan"
        component={ScanScreen}
        options={{ tabBarLabel: 'Scan' }}
      />
      <MainTab.Screen
        name="Farmers"
        component={FarmersScreen}
        options={{ tabBarLabel: 'Farmers' }}
      />
      <MainTab.Screen
        name="NFC"
        component={NFCScreen}
        options={{ tabBarLabel: 'NFC' }}
      />
      <MainTab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profile' }}
      />
    </MainTab.Navigator>
  );
};

// ─── Auth Stack ──────────────────────────────────────────────────────────────
const AuthNavigator: React.FC = () => {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
    </AuthStack.Navigator>
  );
};

// ─── Main Stack (Tabs + Detail Screens) ──────────────────────────────────────
const MainNavigator: React.FC = () => {
  return (
    <MainStack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.background },
      }}
    >
      <MainStack.Screen name="MainTabs" component={TabNavigator} />
      <MainStack.Screen
        name="FarmerDetail"
        component={FarmerDetailScreen}
        options={{
          headerShown: true,
          headerTitle: 'Farmer Details',
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: Colors.textInverse,
          headerTitleStyle: { ...Typography.h4, fontWeight: '600' },
        }}
      />
      <MainStack.Screen
        name="Trace"
        component={TraceScreen}
        options={{
          headerShown: true,
          headerTitle: 'Traceability',
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: Colors.textInverse,
          headerTitleStyle: { ...Typography.h4, fontWeight: '600' },
        }}
      />
    </MainStack.Navigator>
  );
};

// ─── Root Navigator ──────────────────────────────────────────────────────────
export const AppNavigator: React.FC = () => {
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const isLoading = useAuthStore(selectIsLoading);

  // Show loading screen while checking auth state
  if (isLoading) {
    return <LoadingScreen message="Checking authentication..." />;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};
