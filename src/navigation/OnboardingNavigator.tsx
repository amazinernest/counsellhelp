// Onboarding navigator - handles role selection and onboarding

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import RoleSelectionScreen from '../screens/auth/RoleSelectionScreen';
import CounselorOnboardingScreen from '../screens/onboarding/CounselorOnboardingScreen';
import ClientOnboardingScreen from '../screens/onboarding/ClientOnboardingScreen';
import { useAuth } from '../contexts/AuthContext';
import { colors, typography } from '../styles/theme';

// Define param list for onboarding stack
type OnboardingStackParamList = {
    RoleSelection: undefined;
    CounselorOnboarding: undefined;
    ClientOnboarding: undefined;
};

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export default function OnboardingNavigator() {
    const { profile } = useAuth();

    // Determine initial route based on profile state
    let initialRoute: keyof OnboardingStackParamList = 'RoleSelection';

    if (profile?.role === 'counselor' && !profile?.onboarding_complete) {
        initialRoute = 'CounselorOnboarding';
    } else if (profile?.role === 'client' && !profile?.onboarding_complete) {
        initialRoute = 'ClientOnboarding';
    }

    return (
        <Stack.Navigator
            initialRouteName={initialRoute}
            screenOptions={{
                headerStyle: {
                    backgroundColor: colors.background,
                },
                headerTitleStyle: {
                    fontWeight: typography.weights.semibold,
                    color: colors.textPrimary,
                },
                headerTintColor: colors.primary,
                headerShadowVisible: false,
                headerBackVisible: false,
            }}
        >
            <Stack.Screen
                name="RoleSelection"
                component={RoleSelectionScreen}
                options={{ title: 'Choose Your Role' }}
            />
            <Stack.Screen
                name="CounselorOnboarding"
                component={CounselorOnboardingScreen}
                options={{ title: 'Complete Profile' }}
            />
            <Stack.Screen
                name="ClientOnboarding"
                component={ClientOnboardingScreen}
                options={{ title: 'Get Started' }}
            />
        </Stack.Navigator>
    );
}
