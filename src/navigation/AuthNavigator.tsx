// Auth navigator - handles login, signup, and role selection flow

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/auth/LoginScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';
import RoleSelectionScreen from '../screens/auth/RoleSelectionScreen';
import { AuthStackParamList } from '../types';
import { colors, typography } from '../styles/theme';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthNavigator() {
    return (
        <Stack.Navigator
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
            }}
        >
            <Stack.Screen
                name="Login"
                component={LoginScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="SignUp"
                component={SignUpScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="RoleSelection"
                component={RoleSelectionScreen}
                options={{
                    title: 'Choose Role',
                    headerBackVisible: false,
                }}
            />
        </Stack.Navigator>
    );
}
