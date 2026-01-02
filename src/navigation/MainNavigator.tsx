// Main navigator - bottom tabs and nested stacks for authenticated users

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, StyleSheet } from 'react-native';
import HomeScreen from '../screens/main/HomeScreen';
import CounselorListScreen from '../screens/main/CounselorListScreen';
import CounselorProfileScreen from '../screens/main/CounselorProfileScreen';
import ConversationsScreen from '../screens/main/ConversationsScreen';
import ChatScreen from '../screens/main/ChatScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import EditProfileScreen from '../screens/main/EditProfileScreen';
// Settings screens
import PersonalInfoScreen from '../screens/settings/PersonalInfoScreen';
import CommunicationPreferencesScreen from '../screens/settings/CommunicationPreferencesScreen';
import SharedNotesScreen from '../screens/settings/SharedNotesScreen';
import PrivacySecurityScreen from '../screens/settings/PrivacySecurityScreen';
import ChangePasswordScreen from '../screens/settings/ChangePasswordScreen';
import HelpSupportScreen from '../screens/settings/HelpSupportScreen';
import PaymentScreen from '../screens/main/PaymentScreen';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { colors, typography, spacing } from '../styles/theme';
import { MainTabParamList, MainStackParamList } from '../types';

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<MainStackParamList>();

// Tab icon component with modern icons
function TabIcon({ name, focused }: { name: string; focused: boolean }) {
    const icons: Record<string, { active: string; inactive: string }> = {
        Home: { active: '🏠', inactive: '🏠' },
        Counselors: { active: '🔍', inactive: '🔍' },
        Messages: { active: '💬', inactive: '💬' },
        Profile: { active: '👤', inactive: '👤' },
    };

    const icon = icons[name] || { active: '•', inactive: '•' };

    return (
        <View style={styles.tabIconContainer}>
            <Text style={[
                styles.tabIcon,
                focused ? styles.tabIconActive : styles.tabIconInactive
            ]}>
                {focused ? icon.active : icon.inactive}
            </Text>
        </View>
    );
}

// Badge component for message count
function Badge({ count }: { count: number }) {
    if (count <= 0) return null;
    return (
        <View style={styles.badge}>
            <Text style={styles.badgeText}>{count > 9 ? '9+' : count}</Text>
        </View>
    );
}

// Tab navigator
function MainTabs() {
    const { profile } = useAuth();
    const { unreadCount } = useNotifications();
    const isClient = profile?.role === 'client';

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused }) => (
                    <View style={styles.tabIconWrapper}>
                        <TabIcon name={route.name} focused={focused} />
                        {route.name === 'Messages' && <Badge count={unreadCount} />}
                    </View>
                ),
                tabBarActiveTintColor: colors.textPrimary,
                tabBarInactiveTintColor: colors.textSecondary,
                tabBarStyle: {
                    backgroundColor: colors.background,
                    borderTopColor: colors.border,
                    borderTopWidth: 1,
                    paddingTop: spacing.sm,
                    paddingBottom: spacing.md,
                    height: 70,
                },
                tabBarLabelStyle: {
                    fontSize: typography.sizes.xs,
                    fontWeight: typography.weights.medium,
                    marginTop: spacing.xs,
                },
                tabBarShowLabel: false,
                headerStyle: {
                    backgroundColor: colors.background,
                },
                headerTitleStyle: {
                    fontWeight: typography.weights.semibold,
                    color: colors.textPrimary,
                },
                headerShadowVisible: false,
                headerShown: false,
            })}
        >
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{ title: 'Home' }}
            />
            {isClient && (
                <Tab.Screen
                    name="Counselors"
                    component={CounselorListScreen}
                    options={{ title: 'Search' }}
                />
            )}
            <Tab.Screen
                name="Messages"
                component={ConversationsScreen}
                options={{ title: 'Messages' }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{ title: 'Profile' }}
            />
        </Tab.Navigator>
    );
}

// Main stack navigator
export default function MainNavigator() {
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
                headerTintColor: colors.textPrimary,
                headerShadowVisible: false,
                contentStyle: {
                    backgroundColor: colors.background,
                },
            }}
        >
            <Stack.Screen
                name="MainTabs"
                component={MainTabs}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="CounselorProfile"
                component={CounselorProfileScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="Chat"
                component={ChatScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="EditProfile"
                component={EditProfileScreen}
                options={{ headerShown: false }}
            />
            {/* Settings Screens */}
            <Stack.Screen
                name="PersonalInfo"
                component={PersonalInfoScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="CommunicationPreferences"
                component={CommunicationPreferencesScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="SessionHistory"
                component={ConversationsScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="SharedNotes"
                component={SharedNotesScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="PrivacySecurity"
                component={PrivacySecurityScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="ChangePassword"
                component={ChangePasswordScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="HelpSupport"
                component={HelpSupportScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="Payment"
                component={PaymentScreen}
                options={{ headerShown: false }}
            />
        </Stack.Navigator>
    );
}

const styles = StyleSheet.create({
    tabIconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabIconWrapper: {
        position: 'relative',
    },
    tabIcon: {
        fontSize: 24,
    },
    tabIconActive: {
        opacity: 1,
    },
    tabIconInactive: {
        opacity: 0.5,
    },
    badge: {
        position: 'absolute',
        right: -10,
        top: -4,
        backgroundColor: colors.primary,
        borderRadius: 10,
        minWidth: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    badgeText: {
        color: colors.textPrimary,
        fontSize: 10,
        fontWeight: typography.weights.bold,
    },
});
