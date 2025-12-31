// Main App entry point
// Wraps the app with necessary providers and navigation

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/contexts/AuthContext';
import { NotificationProvider } from './src/contexts/NotificationContext';
import { useNotifications } from './src/contexts/NotificationContext';
import AppNavigator from './src/navigation/AppNavigator';
import NotificationBanner from './src/components/NotificationBanner';
import ErrorBoundary from './src/components/ErrorBoundary';
import { View, StyleSheet } from 'react-native';

// Inner component that can use notifications context
function AppContent() {
  const { currentNotification, dismissNotification } = useNotifications();

  return (
    <View style={styles.container}>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
      {/* In-app notification banner */}
      <NotificationBanner
        notification={currentNotification}
        onDismiss={dismissNotification}
      />
      <StatusBar style="auto" />
    </View>
  );
}

// Main App component with providers and error boundary
export default function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <AuthProvider>
          <NotificationProvider>
            <AppContent />
          </NotificationProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
