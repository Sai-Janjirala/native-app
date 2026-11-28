import { DefaultTheme, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import * as Updates from 'expo-updates';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import AppTabs from '@/components/app-tabs';
import { AuthScreen } from '@/components/auth-screen';
import { Colors } from '@/constants/theme';
import { AuthProvider, useAuth } from '@/context/AuthContext';

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) SplashScreen.hideAsync();
  }, [isLoading]);

  if (isLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  return user ? <AppTabs /> : <AuthScreen />;
}

export default function RootLayout() {
  useEffect(() => {
    // Check for and download latest OTA update on app launch (non-dev only)
    ;(async () => {
      if (__DEV__) return;
      try {
        const hasUpdate = await Updates.checkForUpdateAsync();
        if (hasUpdate) {
          const update = await Updates.fetchUpdateAsync();
          if (update) {
            await Updates.reloadAsync();
          }
        }
      } catch (e) {
        // Silently fail - no update check crash
      }
    })();
  }, []);

  return (
    <View style={styles.loader}>
      <ActivityIndicator size="large" color={Colors.light.primary} />
    </View>
  );
}
