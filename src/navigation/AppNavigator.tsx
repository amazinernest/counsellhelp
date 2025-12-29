// Root navigator - routes based on auth and onboarding state

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import AuthNavigator from './AuthNavigator';
import OnboardingNavigator from './OnboardingNavigator';
import MainNavigator from './MainNavigator';
import LoadingSpinner from '../components/LoadingSpinner';
import { RootStackParamList } from '../types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
    const { session, profile, loading } = useAuth();

    // Show loading while checking auth state
    if (loading) {
        return <LoadingSpinner fullScreen message="Loading..." />;
    }

    // Determine which navigator to show
    const isAuthenticated = !!session;
    const hasRole = !!profile?.role;
    const hasCompletedOnboarding = !!profile?.onboarding_complete;

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {!isAuthenticated ? (
                // Not logged in - show auth screens
                <Stack.Screen name="Auth" component={AuthNavigator} />
            ) : !hasRole || !hasCompletedOnboarding ? (
                // Logged in but needs onboarding
                <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
            ) : (
                // Fully authenticated and onboarded
                <Stack.Screen name="Main" component={MainNavigator} />
            )}
        </Stack.Navigator>
    );
}
