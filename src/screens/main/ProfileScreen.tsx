// Profile & Settings screen - view and manage user profile

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { colors, spacing, borderRadius, typography } from '../../styles/theme';
import { CounselorProfile } from '../../types';

// Menu item component
interface MenuItemProps {
    icon: string;
    iconBgColor: string;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    showArrow?: boolean;
    rightElement?: React.ReactNode;
}

function MenuItem({ icon, iconBgColor, title, subtitle, onPress, showArrow = true, rightElement }: MenuItemProps) {
    return (
        <TouchableOpacity
            style={styles.menuItem}
            onPress={onPress}
            activeOpacity={onPress ? 0.7 : 1}
        >
            <View style={[styles.menuIconContainer, { backgroundColor: iconBgColor }]}>
                <Text style={styles.menuIcon}>{icon}</Text>
            </View>
            <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>{title}</Text>
                {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
            </View>
            {rightElement ? rightElement : showArrow && (
                <Text style={styles.menuArrow}>›</Text>
            )}
        </TouchableOpacity>
    );
}

export default function ProfileScreen() {
    const navigation = useNavigation<any>();
    const { profile, signOut } = useAuth();
    const [signingOut, setSigningOut] = useState(false);
    const [counselorProfile, setCounselorProfile] = useState<CounselorProfile | null>(null);
    const [pushNotifications, setPushNotifications] = useState(true);
    const [emailUpdates, setEmailUpdates] = useState(false);

    const isClient = profile?.role === 'client';
    const isCounselor = profile?.role === 'counselor';

    // Generate client ID
    const clientId = profile?.id ? `#${profile.id.substring(0, 5).toUpperCase()}` : '#00000';

    // Get member year
    const memberYear = profile?.created_at
        ? new Date(profile.created_at).getFullYear()
        : new Date().getFullYear();

    // Load counselor profile if user is counselor
    useEffect(() => {
        async function loadCounselorProfile() {
            if (!profile || profile.role !== 'counselor') return;

            const { data } = await supabase
                .from('counselor_profiles')
                .select('*')
                .eq('id', profile.id)
                .single();

            if (data) {
                setCounselorProfile(data);
            }
        }

        loadCounselorProfile();
    }, [profile]);

    // Handle sign out
    async function handleSignOut() {
        setSigningOut(true);
        await signOut();
    }

    // Get avatar color
    function getAvatarColor(name: string): string {
        const colorOptions = ['#3B82F6', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B'];
        const index = name.charCodeAt(0) % colorOptions.length;
        return colorOptions[index];
    }

    const avatarColor = getAvatarColor(profile?.full_name || 'U');

    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.backIcon}>‹</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Profile & Settings</Text>
                    {isCounselor && (
                        <TouchableOpacity
                            style={styles.editButton}
                            onPress={() => navigation.navigate('EditProfile')}
                        >
                            <Text style={styles.editButtonText}>Edit</Text>
                        </TouchableOpacity>
                    )}
                    {!isCounselor && <View style={styles.headerSpacer} />}
                </View>

                {/* Profile Avatar */}
                <View style={styles.profileSection}>
                    <View style={styles.avatarWrapper}>
                        <View style={[styles.avatarContainer, { borderColor: avatarColor }]}>
                            {profile?.avatar_url ? (
                                <Image source={{ uri: profile.avatar_url }} style={styles.avatarImage} />
                            ) : (
                                <View style={[styles.avatarPlaceholder, { backgroundColor: avatarColor }]}>
                                    <Text style={styles.avatarText}>
                                        {profile?.full_name?.charAt(0)?.toUpperCase() || '?'}
                                    </Text>
                                </View>
                            )}
                        </View>
                        <TouchableOpacity style={styles.cameraButton}>
                            <Text style={styles.cameraIcon}>📷</Text>
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.profileName}>{profile?.full_name || 'User'}</Text>
                    <Text style={styles.profileMeta}>
                        {isClient ? 'Client ID' : 'Counselor ID'}: {clientId} • Member since {memberYear}
                    </Text>
                </View>

                {/* My Profile Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>MY PROFILE</Text>
                    <View style={styles.menuCard}>
                        <MenuItem
                            icon="👤"
                            iconBgColor="#3B82F6"
                            title="Personal Information"
                            subtitle="Name, email, phone number"
                            onPress={() => navigation.navigate('PersonalInfo')}
                        />
                        <View style={styles.menuDivider} />
                        <MenuItem
                            icon="💬"
                            iconBgColor="#1B2838"
                            title="Communication Preferences"
                            subtitle="Video call, chat, audio"
                            onPress={() => navigation.navigate('CommunicationPreferences')}
                        />
                    </View>
                </View>

                {/* Therapy Journey Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>THERAPY JOURNEY</Text>
                    <View style={styles.menuCard}>
                        <MenuItem
                            icon="🕒"
                            iconBgColor="#8B5CF6"
                            title="Session History"
                            onPress={() => navigation.navigate('SessionHistory')}
                        />
                        <View style={styles.menuDivider} />
                        <MenuItem
                            icon="📋"
                            iconBgColor="#3B82F6"
                            title="Shared Notes"
                            onPress={() => navigation.navigate('SharedNotes')}
                        />
                    </View>
                </View>

                {/* App Settings Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>APP SETTINGS</Text>
                    <View style={styles.menuCard}>
                        <MenuItem
                            icon="🔔"
                            iconBgColor="#F59E0B"
                            title="Push Notifications"
                            showArrow={false}
                            rightElement={
                                <Switch
                                    value={pushNotifications}
                                    onValueChange={setPushNotifications}
                                    trackColor={{ false: colors.border, true: colors.primary }}
                                    thumbColor={colors.textPrimary}
                                />
                            }
                        />
                        <View style={styles.menuDivider} />
                        <MenuItem
                            icon="✉️"
                            iconBgColor="#3B82F6"
                            title="Email Updates"
                            showArrow={false}
                            rightElement={
                                <Switch
                                    value={emailUpdates}
                                    onValueChange={setEmailUpdates}
                                    trackColor={{ false: colors.border, true: colors.primary }}
                                    thumbColor={colors.textPrimary}
                                />
                            }
                        />
                        <View style={styles.menuDivider} />
                        <MenuItem
                            icon="🛡️"
                            iconBgColor="#10B981"
                            title="Privacy & Security"
                            onPress={() => navigation.navigate('PrivacySecurity')}
                        />
                    </View>
                </View>

                {/* Account Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>ACCOUNT</Text>
                    <View style={styles.menuCard}>
                        <MenuItem
                            icon="🔒"
                            iconBgColor="#6B7280"
                            title="Change Password"
                            onPress={() => navigation.navigate('ChangePassword')}
                        />
                        <View style={styles.menuDivider} />
                        <MenuItem
                            icon="❓"
                            iconBgColor="#6B7280"
                            title="Help & Support"
                            onPress={() => navigation.navigate('HelpSupport')}
                        />
                        <View style={styles.menuDivider} />
                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={handleSignOut}
                            disabled={signingOut}
                        >
                            <View style={[styles.menuIconContainer, { backgroundColor: '#EF4444' }]}>
                                <Text style={styles.menuIcon}>🚪</Text>
                            </View>
                            <View style={styles.menuContent}>
                                <Text style={styles.logoutText}>
                                    {signingOut ? 'Logging Out...' : 'Log Out'}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* App Version */}
                <Text style={styles.versionText}>App Version 2.4.1 (Build 202)</Text>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollView: {
        flex: 1,
    },
    content: {
        paddingBottom: spacing.xxl,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingTop: spacing.xl,
        paddingBottom: spacing.md,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backIcon: {
        fontSize: 32,
        color: colors.textPrimary,
        fontWeight: typography.weights.regular,
    },
    headerTitle: {
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.semibold,
        color: colors.textPrimary,
    },
    editButton: {
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
    },
    editButtonText: {
        fontSize: typography.sizes.md,
        color: colors.primary,
        fontWeight: typography.weights.medium,
    },
    headerSpacer: {
        width: 40,
    },
    profileSection: {
        alignItems: 'center',
        paddingVertical: spacing.lg,
    },
    avatarWrapper: {
        position: 'relative',
        marginBottom: spacing.md,
    },
    avatarContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 3,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.surface,
    },
    avatarImage: {
        width: 94,
        height: 94,
        borderRadius: 47,
    },
    avatarPlaceholder: {
        width: 94,
        height: 94,
        borderRadius: 47,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: 40,
        fontWeight: typography.weights.bold,
        color: colors.textPrimary,
    },
    cameraButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: colors.background,
    },
    cameraIcon: {
        fontSize: 14,
    },
    profileName: {
        fontSize: typography.sizes.xxl,
        fontWeight: typography.weights.bold,
        color: colors.textPrimary,
        marginBottom: spacing.xs,
    },
    profileMeta: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
    },
    section: {
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.lg,
    },
    sectionTitle: {
        fontSize: typography.sizes.xs,
        fontWeight: typography.weights.semibold,
        color: colors.textSecondary,
        marginBottom: spacing.sm,
        letterSpacing: 1,
    },
    menuCard: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: 'hidden',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
    },
    menuIconContainer: {
        width: 40,
        height: 40,
        borderRadius: borderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    menuIcon: {
        fontSize: 18,
    },
    menuContent: {
        flex: 1,
    },
    menuTitle: {
        fontSize: typography.sizes.md,
        fontWeight: typography.weights.medium,
        color: colors.textPrimary,
    },
    menuSubtitle: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
        marginTop: 2,
    },
    menuArrow: {
        fontSize: 24,
        color: colors.textSecondary,
    },
    menuDivider: {
        height: 1,
        backgroundColor: colors.border,
        marginLeft: 68,
    },
    logoutText: {
        fontSize: typography.sizes.md,
        fontWeight: typography.weights.medium,
        color: colors.error,
    },
    versionText: {
        fontSize: typography.sizes.xs,
        color: colors.textLight,
        textAlign: 'center',
        marginTop: spacing.lg,
        marginBottom: spacing.xl,
    },
});
