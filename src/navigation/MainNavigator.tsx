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
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { colors, typography } from '../styles/theme';
import { MainTabParamList, MainStackParamList } from '../types';

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<MainStackParamList>();

// Tab icon component
function TabIcon({ name, focused }: { name: string; focused: boolean }) {
    const icons: Record<string, string> = {
        Home: '🏠',
        Counselors: '👨‍⚕️',
        Messages: '💬',
        Profile: '👤',
    };

    return (
        <Text style={{ fontSize: 24, opacity: focused ? 1 : 0.5 }}>
            {icons[name] || '•'}
        </Text>
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
                    <View>
                        <TabIcon name={route.name} focused={focused} />
                        {route.name === 'Messages' && <Badge count={unreadCount} />}
                    </View>
                ),
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textSecondary,
                tabBarStyle: {
                    backgroundColor: colors.surface,
                    borderTopColor: colors.border,
                },
                tabBarLabelStyle: {
                    fontSize: typography.sizes.xs,
                    fontWeight: typography.weights.medium,
                },
                headerStyle: {
                    backgroundColor: colors.background,
                },
                headerTitleStyle: {
                    fontWeight: typography.weights.semibold,
                    color: colors.textPrimary,
                },
                headerShadowVisible: false,
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
                    options={{ title: 'Counselors' }}
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
                headerTintColor: colors.primary,
                headerShadowVisible: false,
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
                options={{ title: 'Counselor Profile' }}
            />
            <Stack.Screen
                name="Chat"
                component={ChatScreen}
                options={{ title: 'Chat' }}
            />
            <Stack.Screen
                name="EditProfile"
                component={EditProfileScreen}
                options={{ title: 'Edit Profile' }}
            />
        </Stack.Navigator>
    );
}

const styles = StyleSheet.create({
    badge: {
        position: 'absolute',
        right: -8,
        top: -4,
        backgroundColor: colors.error,
        borderRadius: 10,
        minWidth: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    badgeText: {
        color: colors.textInverse,
        fontSize: 10,
        fontWeight: typography.weights.bold,
    },
});
