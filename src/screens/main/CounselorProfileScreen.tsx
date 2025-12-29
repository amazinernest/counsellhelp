// Counselor profile screen - full counselor details with chat option

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';
import { colors, spacing, borderRadius, typography, shadows } from '../../styles/theme';
import { CounselorProfile, Profile, MainStackParamList, Specialty } from '../../types';

type CounselorProfileScreenProps = {
    navigation: NativeStackNavigationProp<MainStackParamList, 'CounselorProfile'>;
    route: RouteProp<MainStackParamList, 'CounselorProfile'>;
};

// Specialty labels
const specialtyLabels: Record<Specialty, string> = {
    relationship: 'Relationship',
    academic: 'Academic',
    career: 'Career',
    mental_wellbeing: 'Mental Wellbeing',
    family: 'Family',
    stress_management: 'Stress Management',
    personal_development: 'Personal Development',
};

export default function CounselorProfileScreen({
    navigation,
    route,
}: CounselorProfileScreenProps) {
    const { counselorId } = route.params;
    const { user } = useAuth();
    const [counselor, setCounselor] = useState<(CounselorProfile & { profile: Profile }) | null>(null);
    const [loading, setLoading] = useState(true);
    const [startingChat, setStartingChat] = useState(false);
    const [error, setError] = useState('');

    // Fetch counselor details
    useEffect(() => {
        async function fetchCounselor() {
            try {
                const { data, error } = await supabase
                    .from('counselor_profiles')
                    .select(`
            *,
            profile:profiles(*)
          `)
                    .eq('id', counselorId)
                    .single();

                if (error) throw error;
                setCounselor(data);
            } catch (err: any) {
                setError(err.message || 'Failed to load counselor');
            } finally {
                setLoading(false);
            }
        }

        fetchCounselor();
    }, [counselorId]);

    // Start or continue conversation with counselor
    async function handleStartChat() {
        if (!user || !counselor) return;

        setStartingChat(true);

        try {
            // Check if conversation already exists
            const { data: existing } = await supabase
                .from('conversations')
                .select('id')
                .eq('client_id', user.id)
                .eq('counselor_id', counselorId)
                .single();

            if (existing) {
                // Navigate to existing conversation
                navigation.navigate('Chat', {
                    conversationId: existing.id,
                    otherUserName: counselor.profile?.full_name || 'Counselor',
                });
            } else {
                // Create new conversation
                const { data: newConversation, error } = await supabase
                    .from('conversations')
                    .insert({
                        client_id: user.id,
                        counselor_id: counselorId,
                    })
                    .select()
                    .single();

                if (error) throw error;

                // Create notification for counselor
                await supabase.from('notifications').insert({
                    user_id: counselorId,
                    type: 'new_request',
                    title: 'New Counseling Request',
                    body: `${user.email} wants to start a conversation with you`,
                    data: { conversation_id: newConversation.id },
                });

                navigation.navigate('Chat', {
                    conversationId: newConversation.id,
                    otherUserName: counselor.profile?.full_name || 'Counselor',
                });
            }
        } catch (err: any) {
            setError(err.message || 'Failed to start conversation');
        }

        setStartingChat(false);
    }

    if (loading) {
        return <LoadingSpinner fullScreen message="Loading profile..." />;
    }

    if (error || !counselor) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error || 'Counselor not found'}</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* Header with avatar */}
            <View style={styles.header}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                        {counselor.profile?.full_name?.charAt(0)?.toUpperCase() || '?'}
                    </Text>
                </View>
                <Text style={styles.name}>{counselor.profile?.full_name || 'Counselor'}</Text>
                <View
                    style={[
                        styles.availabilityBadge,
                        counselor.is_available ? styles.available : styles.unavailable,
                    ]}
                >
                    <Text style={styles.availabilityText}>
                        {counselor.is_available ? '● Available' : '○ Unavailable'}
                    </Text>
                </View>
            </View>

            {/* Bio section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>About</Text>
                <Text style={styles.bioText}>{counselor.bio || 'No bio available'}</Text>
            </View>

            {/* Specialties */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Specialties</Text>
                <View style={styles.specialties}>
                    {counselor.specialties?.map((specialty, index) => (
                        <View key={index} style={styles.specialtyTag}>
                            <Text style={styles.specialtyText}>
                                {specialtyLabels[specialty] || specialty}
                            </Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* Experience */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Experience</Text>
                <View style={styles.experienceCard}>
                    <Text style={styles.experienceNumber}>{counselor.years_experience}</Text>
                    <Text style={styles.experienceLabel}>
                        {counselor.years_experience === 1 ? 'Year' : 'Years'} of Experience
                    </Text>
                </View>
            </View>

            {/* Start chat button */}
            <Button
                title={counselor.is_available ? 'Start Conversation' : 'Counselor Unavailable'}
                onPress={handleStartChat}
                loading={startingChat}
                disabled={!counselor.is_available}
                style={styles.chatButton}
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
    avatarText: {
        fontSize: 40,
        fontWeight: typography.weights.bold,
        color: colors.textInverse,
    },
    name: {
        fontSize: typography.sizes.xxl,
        fontWeight: typography.weights.bold,
        color: colors.textPrimary,
        marginBottom: spacing.sm,
    },
    availabilityBadge: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.full,
    },
    available: {
        backgroundColor: colors.available + '20',
    },
    unavailable: {
        backgroundColor: colors.unavailable + '20',
    },
    availabilityText: {
        fontSize: typography.sizes.sm,
        fontWeight: typography.weights.medium,
        color: colors.textSecondary,
    },
    section: {
        marginBottom: spacing.lg,
    },
    sectionTitle: {
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.semibold,
        color: colors.textPrimary,
        marginBottom: spacing.sm,
    },
    bioText: {
        fontSize: typography.sizes.md,
        color: colors.textSecondary,
        lineHeight: 24,
    },
    specialties: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    specialtyTag: {
        backgroundColor: colors.primary + '15',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.full,
        marginRight: spacing.sm,
        marginBottom: spacing.sm,
    },
    specialtyText: {
        fontSize: typography.sizes.sm,
        color: colors.primary,
        fontWeight: typography.weights.medium,
    },
    experienceCard: {
        backgroundColor: colors.surface,
        padding: spacing.lg,
        borderRadius: borderRadius.lg,
        alignItems: 'center',
        ...shadows.sm,
    },
    experienceNumber: {
        fontSize: typography.sizes.xxxl,
        fontWeight: typography.weights.bold,
        color: colors.primary,
        marginBottom: spacing.xs,
    },
    experienceLabel: {
        fontSize: typography.sizes.md,
        color: colors.textSecondary,
    },
    chatButton: {
        marginTop: spacing.md,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.lg,
    },
    errorText: {
        color: colors.error,
        fontSize: typography.sizes.md,
        textAlign: 'center',
    },
});
