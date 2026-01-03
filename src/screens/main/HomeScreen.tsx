// Home screen - Find Support dashboard for clients

import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    RefreshControl,
    TextInput,
    Animated,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { colors, spacing, borderRadius, typography, shadows } from '../../styles/theme';
import { CounselorProfile, Profile } from '../../types';
import CreditBadge from '../../components/CreditBadge';

// Extended counselor type with additional fields
interface ExtendedCounselor extends CounselorProfile {
    profile: Profile;
    rating?: number;
    nextSlot?: string;
}

// Filter categories
const filterCategories = [
    { id: 'all', label: 'All' },
    { id: 'anxiety', label: 'Anxiety' },
    { id: 'depression', label: 'Depression' },
    { id: 'relationships', label: 'Relationships' },
    { id: 'stress', label: 'Stress' },
    { id: 'family', label: 'Family' },
    { id: 'career', label: 'Career' },
];

// Specialty labels map
const specialtyLabels: Record<string, string> = {
    relationship: 'Relationships',
    academic: 'Academic',
    career: 'Career',
    mental_wellbeing: 'CBT',
    family: 'Family',
    stress_management: 'Stress',
    personal_development: 'Personal Development',
    anxiety: 'Anxiety',
    depression: 'Depression',
    trauma: 'Trauma',
    medication: 'Medication',
    sleep: 'Sleep',
};

export default function HomeScreen({ navigation }: any) {
    const { profile, user } = useAuth();
    const [counselors, setCounselors] = useState<ExtendedCounselor[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');

    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    // Trigger fade-in animation on mount
    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    // Sample counselor data to match the design
    const sampleCounselors: ExtendedCounselor[] = [
        {
            id: '1',
            bio: 'Clinical Psychologist',
            specialties: ['mental_wellbeing', 'anxiety'] as any,
            years_experience: 12,
            is_available: true,
            rating: 4.9,
            profile: {
                id: '1',
                email: 'sarah@example.com',
                full_name: 'Dr. Sarah Jenkins',
                role: 'counselor',
                created_at: '',
                onboarding_complete: true,
                avatar_url: null,
                credits: 0,
            },
        },
        {
            id: '2',
            bio: 'Licensed Therapist',
            specialties: ['depression', 'trauma'] as any,
            years_experience: 8,
            is_available: false,
            rating: 4.8,
            nextSlot: '2:00 PM',
            profile: {
                id: '2',
                email: 'michael@example.com',
                full_name: 'Dr. Michael Chen',
                role: 'counselor',
                created_at: '',
                onboarding_complete: true,
                avatar_url: null,
                credits: 0,
            },
        },
        {
            id: '3',
            bio: 'Family Counsellor',
            specialties: ['relationship', 'family'] as any,
            years_experience: 15,
            is_available: true,
            rating: 5.0,
            profile: {
                id: '3',
                email: 'emily@example.com',
                full_name: 'Dr. Emily White',
                role: 'counselor',
                created_at: '',
                onboarding_complete: true,
                avatar_url: null,
                credits: 0,
            },
        },
        {
            id: '4',
            bio: 'Psychiatrist',
            specialties: ['medication', 'sleep'] as any,
            years_experience: 10,
            is_available: false,
            rating: 4.7,
            nextSlot: 'Tomorrow',
            profile: {
                id: '4',
                email: 'david@example.com',
                full_name: 'Dr. David Ross',
                role: 'counselor',
                created_at: '',
                onboarding_complete: true,
                avatar_url: null,
                credits: 0,
            },
        },
    ];

    // Load counselors
    async function loadCounselors() {
        try {
            const { data } = await supabase
                .from('counselor_profiles')
                .select(`
                    *,
                    profile:profiles(*)
                `)
                .order('is_available', { ascending: false });

            if (data && data.length > 0) {
                // Add random ratings to real data
                const withRatings = data.map((c: any) => ({
                    ...c,
                    rating: (Math.random() * 0.5 + 4.5).toFixed(1),
                    nextSlot: c.is_available ? null : '2:00 PM',
                }));
                setCounselors(withRatings);
            } else {
                setCounselors(sampleCounselors);
            }
        } catch (err) {
            console.error('Error loading counselors:', err);
            setCounselors(sampleCounselors);
        }
    }

    useEffect(() => {
        loadCounselors();
    }, [user]);

    async function onRefresh() {
        setRefreshing(true);
        await loadCounselors();
        setRefreshing(false);
    }

    // Navigate to counselor profile
    function openCounselorProfile(counselorId: string) {
        navigation.navigate('CounselorProfile', { counselorId });
    }

    // Start or continue chat with counselor
    async function startChat(counselor: ExtendedCounselor) {
        if (!user) return;

        try {
            // Check if client has a paid session with this counselor
            const { data: paidSession } = await supabase
                .from('sessions')
                .select('id, conversation_id')
                .eq('client_id', user.id)
                .eq('counselor_id', counselor.id)
                .eq('status', 'paid')
                .single();

            if (paidSession && paidSession.conversation_id) {
                // Already paid, go directly to chat
                navigation.navigate('Chat', {
                    conversationId: paidSession.conversation_id,
                    otherUserName: counselor.profile?.full_name || 'Counselor',
                });
            } else {
                // No paid session, navigate to payment
                navigation.navigate('Payment', {
                    counselorId: counselor.id,
                    counselorName: counselor.profile?.full_name || 'Counselor',
                });
            }
        } catch (err) {
            // If error (no session found), navigate to payment
            navigation.navigate('Payment', {
                counselorId: counselor.id,
                counselorName: counselor.profile?.full_name || 'Counselor',
            });
        }
    }

    // Get avatar colors based on name
    function getAvatarColor(name: string): string {
        const colors = ['#3B82F6', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B'];
        const index = name.charCodeAt(0) % colors.length;
        return colors[index];
    }

    // Render counselor card
    function renderCounselorCard(counselor: ExtendedCounselor) {
        const avatarColor = getAvatarColor(counselor.profile?.full_name || 'C');

        return (
            <TouchableOpacity
                key={counselor.id}
                style={styles.counselorCard}
                onPress={() => openCounselorProfile(counselor.id)}
                activeOpacity={0.7}
            >
                {/* Avatar */}
                <View style={[styles.avatarContainer, { borderColor: avatarColor }]}>
                    {counselor.profile?.avatar_url ? (
                        <Image
                            source={{ uri: counselor.profile.avatar_url }}
                            style={styles.avatar}
                        />
                    ) : (
                        <View style={[styles.avatarPlaceholder, { backgroundColor: avatarColor }]}>
                            <Text style={styles.avatarText}>
                                {counselor.profile?.full_name?.charAt(0) || 'C'}
                            </Text>
                        </View>
                    )}
                    {/* Online indicator */}
                    <View style={[
                        styles.onlineIndicator,
                        { backgroundColor: counselor.is_available ? colors.available : colors.warning }
                    ]} />
                </View>

                {/* Info */}
                <View style={styles.counselorInfo}>
                    <View style={styles.nameRow}>
                        <Text style={styles.counselorName}>
                            {counselor.profile?.full_name || 'Counselor'}
                        </Text>
                        <View style={styles.ratingContainer}>
                            <Text style={styles.starIcon}>★</Text>
                            <Text style={styles.ratingText}>{counselor.rating}</Text>
                        </View>
                    </View>
                    <Text style={styles.counselorTitle}>{counselor.bio}</Text>

                    {/* Tags */}
                    <View style={styles.tagsRow}>
                        {counselor.specialties?.slice(0, 2).map((specialty, index) => (
                            <View key={index} style={styles.tag}>
                                <Text style={styles.tagText}>
                                    {specialtyLabels[specialty] || specialty}
                                </Text>
                            </View>
                        ))}
                    </View>

                    {/* Availability & Action */}
                    <View style={styles.availabilityRow}>
                        <View style={styles.availabilityInfo}>
                            <View style={[
                                styles.availabilityDot,
                                { backgroundColor: counselor.is_available ? colors.available : colors.warning }
                            ]} />
                            <Text style={[
                                styles.availabilityText,
                                { color: counselor.is_available ? colors.available : colors.textSecondary }
                            ]}>
                                {counselor.is_available
                                    ? 'Available Now'
                                    : `Next slot: ${counselor.nextSlot || 'Tomorrow'}`}
                            </Text>
                        </View>

                        {counselor.is_available ? (
                            <TouchableOpacity
                                style={styles.chatButton}
                                onPress={(e) => {
                                    e.stopPropagation();
                                    startChat(counselor);
                                }}
                            >
                                <Text style={styles.chatButtonText}>Chat</Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity
                                style={styles.profileButton}
                                onPress={(e) => {
                                    e.stopPropagation();
                                    openCounselorProfile(counselor.id);
                                }}
                            >
                                <Text style={styles.profileButtonText}>Profile</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.content}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={colors.primary}
                    />
                }
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Find Support</Text>
                    <View style={styles.headerRight}>
                        <CreditBadge credits={profile?.credits ?? 0} />
                        <TouchableOpacity
                            style={styles.headerAvatar}
                            onPress={() => navigation.navigate('Profile')}
                        >
                            {profile?.avatar_url ? (
                                <Image
                                    source={{ uri: profile.avatar_url }}
                                    style={styles.headerAvatarImage}
                                />
                            ) : (
                                <View style={styles.headerAvatarPlaceholder}>
                                    <Text style={styles.headerAvatarText}>
                                        {profile?.full_name?.charAt(0) || '👤'}
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Greeting */}
                <Animated.View
                    style={[
                        styles.greetingSection,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }]
                        }
                    ]}
                >
                    <Text style={styles.greeting}>
                        Hello, {profile?.full_name?.split(' ')[0] || 'there'}.
                    </Text>
                    <Text style={styles.subtitle}>
                        Who would you like to speak with today?
                    </Text>
                </Animated.View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <Text style={styles.searchIcon}>🔍</Text>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search by name or specialty..."
                        placeholderTextColor={colors.textLight}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                {/* Filter Chips */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.filtersContainer}
                    contentContainerStyle={styles.filtersContent}
                >
                    {filterCategories.map((category) => (
                        <TouchableOpacity
                            key={category.id}
                            style={[
                                styles.filterChip,
                                activeFilter === category.id && styles.filterChipActive,
                            ]}
                            onPress={() => setActiveFilter(category.id)}
                        >
                            <Text
                                style={[
                                    styles.filterChipText,
                                    activeFilter === category.id && styles.filterChipTextActive,
                                ]}
                            >
                                {category.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Recommended Section */}
                <Animated.View style={{ opacity: fadeAnim }}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Recommended</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Counselors')}>
                            <Text style={styles.viewAllText}>View all</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Counselor Cards */}
                    {counselors.map(renderCounselorCard)}
                </Animated.View>
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
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.xl,
        paddingBottom: spacing.md,
    },
    headerTitle: {
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.semibold,
        color: colors.textPrimary,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        overflow: 'hidden',
    },
    headerAvatarImage: {
        width: 40,
        height: 40,
    },
    headerAvatarPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.surfaceSecondary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerAvatarText: {
        fontSize: 18,
        color: colors.textPrimary,
    },
    greetingSection: {
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.lg,
    },
    greeting: {
        fontSize: typography.sizes.xxl,
        fontWeight: typography.weights.bold,
        color: colors.textPrimary,
        marginBottom: spacing.xs,
    },
    subtitle: {
        fontSize: typography.sizes.md,
        color: colors.textSecondary,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        marginHorizontal: spacing.lg,
        borderRadius: borderRadius.xl,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderWidth: 1,
        borderColor: colors.border,
    },
    searchIcon: {
        fontSize: 16,
        marginRight: spacing.sm,
    },
    searchInput: {
        flex: 1,
        fontSize: typography.sizes.md,
        color: colors.textPrimary,
        paddingVertical: spacing.xs,
    },
    filtersContainer: {
        marginTop: spacing.lg,
        marginBottom: spacing.md,
    },
    filtersContent: {
        paddingHorizontal: spacing.lg,
    },
    filterChip: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.full,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        marginRight: spacing.sm,
    },
    filterChipActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    filterChipText: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
        fontWeight: typography.weights.medium,
    },
    filterChipTextActive: {
        color: colors.textPrimary,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        marginTop: spacing.md,
        marginBottom: spacing.md,
    },
    sectionTitle: {
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.semibold,
        color: colors.textPrimary,
    },
    viewAllText: {
        fontSize: typography.sizes.sm,
        color: colors.primary,
        fontWeight: typography.weights.medium,
    },
    counselorCard: {
        flexDirection: 'row',
        backgroundColor: colors.surface,
        marginHorizontal: spacing.lg,
        marginBottom: spacing.md,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    avatarContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
        position: 'relative',
    },
    avatar: {
        width: 52,
        height: 52,
        borderRadius: 26,
    },
    avatarPlaceholder: {
        width: 52,
        height: 52,
        borderRadius: 26,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: typography.sizes.xl,
        fontWeight: typography.weights.bold,
        color: colors.textPrimary,
    },
    onlineIndicator: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 12,
        height: 12,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: colors.surface,
    },
    counselorInfo: {
        flex: 1,
    },
    nameRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    counselorName: {
        fontSize: typography.sizes.md,
        fontWeight: typography.weights.semibold,
        color: colors.textPrimary,
        flex: 1,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    starIcon: {
        fontSize: 14,
        color: colors.star,
        marginRight: 2,
    },
    ratingText: {
        fontSize: typography.sizes.sm,
        color: colors.textPrimary,
        fontWeight: typography.weights.medium,
    },
    counselorTitle: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
        marginBottom: spacing.sm,
    },
    tagsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: spacing.sm,
    },
    tag: {
        backgroundColor: colors.tagBackground,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.sm,
        marginRight: spacing.xs,
    },
    tagText: {
        fontSize: typography.sizes.xs,
        color: colors.tagText,
        fontWeight: typography.weights.medium,
    },
    availabilityRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    availabilityInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    availabilityDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: spacing.xs,
    },
    availabilityText: {
        fontSize: typography.sizes.sm,
    },
    chatButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.md,
    },
    chatButtonText: {
        fontSize: typography.sizes.sm,
        color: colors.textPrimary,
        fontWeight: typography.weights.semibold,
    },
    profileButton: {
        backgroundColor: 'transparent',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    profileButtonText: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
        fontWeight: typography.weights.medium,
    },
});
