import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAuthStore } from '@/src/store/useAuthStore';
import { notificationService } from '@/src/services/notification';
import { NetworkMonitor } from '@/src/components/NetworkMonitor';

export default function RootLayout() {
  const { checkAuth, isLoading } = useAuthStore();

  useEffect(() => {
    checkAuth();
    initializeApp();
  }, []);

  const initializeApp = async () => {
    await notificationService.requestPermissions();
    await notificationService.updateLastOpened();
    await notificationService.scheduleInactivityReminder();
  };

  if (isLoading) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NetworkMonitor />
        <StatusBar style="auto" />
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: '#ffffff',
            },
            headerShadowVisible: false,
            headerTitleStyle: {
              fontWeight: '600',
            },
          }}
        >
          <Stack.Screen
            name="(auth)"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="(tabs)"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="course/[id]"
            options={{
              title: 'Course Details',
              presentation: 'card',
            }}
          />
          <Stack.Screen
            name="webview/[url]"
            options={{
              title: 'Course Content',
              presentation: 'modal',
            }}
          />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}