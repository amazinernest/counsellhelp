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
import BuyCreditsScreen from '../screens/main/BuyCreditsScreen';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { colors, typography, spacing, borderRadius } from '../styles/theme';
import { MainTabParamList, MainStackParamList } from '../types';

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<MainStackParamList>();

// Modern tab icon component with label
function TabIcon({ name, focused, label }: { name: string; focused: boolean; label: string }) {
    const icons: Record<string, { icon: string }> = {
        Home: { icon: '🏠' },
        Counselors: { icon: '🔍' },
        Messages: { icon: '💬' },
        Profile: { icon: '👤' },
    };

    const icon = icons[name]?.icon || '•';

    return (
        <View style={[
            tabStyles.tabItem,
            focused && tabStyles.tabItemActive,
        ]}>
            <Text style={[
                tabStyles.tabIcon,
                focused && tabStyles.tabIconActive,
            ]}>
                {icon}
            </Text>
            <Text style={[
                tabStyles.tabLabel,
                focused && tabStyles.tabLabelActive,
            ]}>
                {label}
            </Text>
        </View>
    );
}

// Badge component for message count
function Badge({ count }: { count: number }) {
    if (count <= 0) return null;
    return (
        <View style={tabStyles.badge}>
            <Text style={tabStyles.badgeText}>{count > 9 ? '9+' : count}</Text>
        </View>
    );
}

// Tab navigator with modern design
function MainTabs() {
    const { profile } = useAuth();
    const { unreadCount } = useNotifications();
    const isClient = profile?.role === 'client';

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused }) => {
                    const labelMap: Record<string, string> = {
                        Home: 'Home',
                        Counselors: 'Search',
                        Messages: 'Chats',
                        Profile: 'Profile',
                    };
                    return (
                        <View style={tabStyles.tabIconWrapper}>
                            <TabIcon
                                name={route.name}
                                focused={focused}
                                label={labelMap[route.name] || route.name}
                            />
                            {route.name === 'Messages' && <Badge count={unreadCount} />}
                        </View>
                    );
                },
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textSecondary,
                tabBarStyle: {
                    backgroundColor: colors.surface,
                    borderTopWidth: 0,
                    paddingTop: spacing.sm,
                    paddingBottom: spacing.lg,
                    paddingHorizontal: spacing.sm,
                    height: 85,
                    elevation: 20,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -4 },
                    shadowOpacity: 0.15,
                    shadowRadius: 12,
                },
                tabBarShowLabel: false,
                headerShown: false,
                tabBarHideOnKeyboard: true,
            })}
        >
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    title: 'Home',
                    tabBarAccessibilityLabel: 'Home screen',
                }}
            />
            {isClient && (
                <Tab.Screen
                    name="Counselors"
                    component={CounselorListScreen}
                    options={{
                        title: 'Search',
                        tabBarAccessibilityLabel: 'Search for counselors',
                    }}
                />
            )}
            <Tab.Screen
                name="Messages"
                component={ConversationsScreen}
                options={{
                    title: 'Chats',
                    tabBarAccessibilityLabel: 'Your chat messages',
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    title: 'Profile',
                    tabBarAccessibilityLabel: 'Your profile settings',
                }}
            />
        </Tab.Navigator>
    );
}

// Tab bar specific styles
const tabStyles = StyleSheet.create({
    tabIconWrapper: {
        position: 'relative',
        alignItems: 'center',
    },
    tabItem: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.lg,
        minWidth: 64,
    },
    tabItemActive: {
        backgroundColor: colors.primary + '20',
    },
    tabIcon: {
        fontSize: 22,
        marginBottom: 2,
        opacity: 0.6,
    },
    tabIconActive: {
        opacity: 1,
    },
    tabLabel: {
        fontSize: 11,
        fontWeight: '500' as const,
        color: colors.textSecondary,
        marginTop: 2,
    },
    tabLabelActive: {
        color: colors.primary,
        fontWeight: '600' as const,
    },
    badge: {
        position: 'absolute',
        right: 4,
        top: -4,
        backgroundColor: colors.error,
        borderRadius: 10,
        minWidth: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
        borderWidth: 2,
        borderColor: colors.surface,
    },
    badgeText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '700' as const,
    },
});

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
            <Stack.Screen
                name="BuyCredits"
                component={BuyCreditsScreen}
                options={{ headerShown: false }}
            />
        </Stack.Navigator>
    );
}


