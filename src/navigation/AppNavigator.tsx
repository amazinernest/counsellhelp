// Root navigator - routes based on auth and onboarding state

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import AuthNavigator from './AuthNavigator';
import OnboardingNavigator from './OnboardingNavigator';
import MainNavigator from './MainNavigator';
import LoadingSpinner from '../components/LoadingSpinner';
import { RootStackParamList } from '../types';

import AsyncStorage from '@react-native-async-storage/async-storage';
import WelcomeOnboardingScreen from '../screens/onboarding/WelcomeOnboardingScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
    const { session, profile, loading } = useAuth();
    const [isFirstLaunch, setIsFirstLaunch] = React.useState<boolean | null>(null);

    // Check if it's the first launch
    React.useEffect(() => {
        async function checkFirstLaunch() {
            try {
                const hasSeen = await AsyncStorage.getItem('hasSeenOnboarding');
                setIsFirstLaunch(hasSeen !== 'true');
            } catch (e) {
                setIsFirstLaunch(false); // Default to false on error to avoid getting stuck
            }
        }
        checkFirstLaunch();
    }, []);

    // Show loading while checking auth state or first launch
    if (loading || isFirstLaunch === null) {
        return <LoadingSpinner fullScreen message="Loading..." />;
    }

    // Determine which navigator to show
    const isAuthenticated = !!session;
    const hasRole = !!profile?.role;
    const hasCompletedOnboarding = !!profile?.onboarding_complete;

    function handleOnboardingComplete() {
        setIsFirstLaunch(false);
    }

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {isFirstLaunch ? (
                // First time user - show welcome onboarding
                <Stack.Screen name="Welcome">
                    {(props) => <WelcomeOnboardingScreen {...props} onComplete={handleOnboardingComplete} />}
                </Stack.Screen>
            ) : !isAuthenticated ? (
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
