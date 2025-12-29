// Profile screen - view and manage user profile

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import Button from '../../components/Button';
import { colors, spacing, borderRadius, typography, shadows } from '../../styles/theme';
import { CounselorProfile } from '../../types';

export default function ProfileScreen() {
    const navigation = useNavigation<any>();
    const { profile, signOut } = useAuth();
    const [signingOut, setSigningOut] = useState(false);
    const [counselorProfile, setCounselorProfile] = useState<CounselorProfile | null>(null);

    const isClient = profile?.role === 'client';
    const isCounselor = profile?.role === 'counselor';

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
        const confirmed = typeof window !== 'undefined' && window.confirm
            ? window.confirm('Are you sure you want to sign out?')
            : true;

        if (confirmed) {
            setSigningOut(true);
            await signOut();
        }
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* Profile header */}
            <View style={styles.header}>
                {profile?.avatar_url ? (
                    <Image source={{ uri: profile.avatar_url }} style={styles.avatarImage} />
                ) : (
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {profile?.full_name?.charAt(0)?.toUpperCase() || '?'}
                        </Text>
                    </View>
                )}
                <Text style={styles.name}>{profile?.full_name || 'User'}</Text>
                <Text style={styles.email}>{profile?.email}</Text>
                <View style={styles.roleBadge}>
                    <Text style={styles.roleText}>
                        {isClient ? 'Client' : isCounselor ? 'Counselor' : 'User'}
                    </Text>
                </View>

                {/* Edit Profile button for counselors */}
                {isCounselor && (
                    <Button
                        title="Edit Profile"
                        onPress={() => navigation.navigate('EditProfile')}
                        variant="secondary"
                        style={styles.editButton}
                    />
                )}
            </View>

            {/* Counselor specific info */}
            {isCounselor && counselorProfile && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Your Profile</Text>
                    <View style={styles.infoCard}>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Bio</Text>
                        </View>
                        <Text style={styles.bioText}>{counselorProfile.bio || 'Not set'}</Text>
                        <View style={styles.divider} />
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Specialties</Text>
                        </View>
                        <View style={styles.specialtiesRow}>
                            {counselorProfile.specialties?.map((s) => (
                                <View key={s} style={styles.specialtyTag}>
                                    <Text style={styles.specialtyText}>{s.replace('_', ' ')}</Text>
                                </View>
                            ))}
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Experience</Text>
                            <Text style={styles.infoValue}>{counselorProfile.years_experience} years</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Status</Text>
                            <View style={[
                                styles.statusBadge,
                                { backgroundColor: counselorProfile.is_available ? colors.success + '20' : colors.error + '20' }
                            ]}>
                                <Text style={[
                                    styles.statusText,
                                    { color: counselorProfile.is_available ? colors.success : colors.error }
                                ]}>
                                    {counselorProfile.is_available ? 'Available' : 'Unavailable'}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
            )}

            {/* Account info */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Account Information</Text>
                <View style={styles.infoCard}>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Email</Text>
                        <Text style={styles.infoValue}>{profile?.email}</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Role</Text>
                        <Text style={styles.infoValue}>
                            {isClient ? 'Client' : isCounselor ? 'Counselor' : 'Not set'}
                        </Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Member Since</Text>
                        <Text style={styles.infoValue}>
                            {profile?.created_at
                                ? new Date(profile.created_at).toLocaleDateString()
                                : 'Unknown'}
                        </Text>
                    </View>
                </View>
            </View>

            {/* App info */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>About CounselHelp</Text>
                <View style={styles.aboutCard}>
                    <Text style={styles.aboutText}>
                        CounselHelp is a platform connecting students and young adults with professional counselors for guidance on relationships, career, academics, and mental wellbeing.
                    </Text>
                    <Text style={styles.version}>Version 1.0.0</Text>
                </View>
            </View>

            {/* Sign out button */}
            <Button
                title="Sign Out"
                onPress={handleSignOut}
                variant="outline"
                loading={signingOut}
                style={styles.signOutButton}
            />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        padding: spacing.lg,
        paddingBottom: spacing.xxl,
    },
    header: {
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.md,
        ...shadows.md,
    },
    avatarImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: spacing.md,
    },
    avatarText: {
        fontSize: 40,
        fontWeight: typography.weights.bold,
        color: colors.textInverse,
    },
    name: {
        fontSize: typography.sizes.xxl,
        fontWeight: typography.weights.bold,
        color: colors.textPrimary,
        marginBottom: spacing.xs,
    },
    email: {
        fontSize: typography.sizes.md,
        color: colors.textSecondary,
        marginBottom: spacing.md,
    },
    roleBadge: {
        backgroundColor: colors.primary + '20',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.full,
    },
    roleText: {
        fontSize: typography.sizes.sm,
        color: colors.primary,
        fontWeight: typography.weights.medium,
    },
    editButton: {
        marginTop: spacing.md,
    },
    section: {
        marginBottom: spacing.lg,
    },
    sectionTitle: {
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.semibold,
        color: colors.textPrimary,
        marginBottom: spacing.md,
    },
    infoCard: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        ...shadows.sm,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.sm,
    },
    infoLabel: {
        fontSize: typography.sizes.md,
        color: colors.textSecondary,
    },
    infoValue: {
        fontSize: typography.sizes.md,
        color: colors.textPrimary,
        fontWeight: typography.weights.medium,
    },
    bioText: {
        fontSize: typography.sizes.sm,
        color: colors.textPrimary,
        lineHeight: 20,
        paddingBottom: spacing.sm,
    },
    specialtiesRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingVertical: spacing.sm,
    },
    specialtyTag: {
        backgroundColor: colors.primary + '15',
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.sm,
        marginRight: spacing.xs,
        marginBottom: spacing.xs,
    },
    specialtyText: {
        fontSize: typography.sizes.xs,
        color: colors.primary,
        textTransform: 'capitalize',
    },
    statusBadge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.sm,
    },
    statusText: {
        fontSize: typography.sizes.sm,
        fontWeight: typography.weights.medium,
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
    },
    aboutCard: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        ...shadows.sm,
    },
    aboutText: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
        lineHeight: 22,
        marginBottom: spacing.md,
    },
    version: {
        fontSize: typography.sizes.xs,
        color: colors.textLight,
        textAlign: 'center',
    },
    signOutButton: {
        marginTop: spacing.md,
    },
});
