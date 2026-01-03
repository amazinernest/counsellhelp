// Counselor profile screen - full counselor details with chat option

import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import { colors, spacing, borderRadius, typography, shadows } from '../../styles/theme';
import { CounselorProfile, Profile, MainStackParamList, Specialty } from '../../types';

type CounselorProfileScreenProps = {
    navigation: NativeStackNavigationProp<MainStackParamList, 'CounselorProfile'>;
    route: RouteProp<MainStackParamList, 'CounselorProfile'>;
};

// Specialty labels
const specialtyLabels: Record<string, string> = {
    relationship: 'Relationship Issues',
    academic: 'Academic',
    career: 'Career',
    mental_wellbeing: 'CBT',
    family: 'Family',
    stress_management: 'Work Stress',
    personal_development: 'Personal Development',
    anxiety: 'Anxiety',
    depression: 'Depression',
};

// Sample availability dates
const availabilityDates = [
    { day: 'Today', date: 12, month: 'Mon', selected: true },
    { day: 'Tue', date: 13, month: 'Tue', selected: false },
    { day: 'Wed', date: 14, month: 'Wed', selected: false },
    { day: 'Thu', date: 15, month: 'Thu', selected: false },
    { day: 'Fri', date: 16, month: 'Fri', selected: false },
];

const timeSlots = ['4:00 PM', '4:30 PM', '5:15 PM'];

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
    const [selectedDate, setSelectedDate] = useState(0);
    const [isFavorite, setIsFavorite] = useState(false);

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

    // Start or continue conversation with counselor (credits-based, no upfront payment)
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
                // Go to existing conversation
                navigation.navigate('Chat', {
                    conversationId: existing.id,
                    otherUserName: counselor.profile?.full_name || 'Counselor',
                });
            } else {
                // Create new conversation
                const { data: newConvo, error: createError } = await supabase
                    .from('conversations')
                    .insert({
                        client_id: user.id,
                        counselor_id: counselorId,
                    })
                    .select()
                    .single();

                if (createError) throw createError;

                navigation.navigate('Chat', {
                    conversationId: newConvo.id,
                    otherUserName: counselor.profile?.full_name || 'Counselor',
                });
            }
        } catch (err: any) {
            console.error('Error starting chat:', err);
            Alert.alert('Error', 'Failed to start chat. Please try again.');
        }

        setStartingChat(false);
    }

    // Configure header
    useEffect(() => {
        navigation.setOptions({
            headerShown: false,
        });
    }, [navigation]);

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

    // Generate random stats for demo
    const stats = {
        years: counselor.years_experience || 12,
        sessions: '2k+',
        replyTime: '~1hr',
        rating: 4.9,
        reviews: 120,
    };

    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Custom Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.backIcon}>←</Text>
                    </TouchableOpacity>
                    <View style={styles.headerActions}>
                        <TouchableOpacity
                            style={styles.headerActionButton}
                            onPress={() => setIsFavorite(!isFavorite)}
                        >
                            <Text style={[styles.headerActionIcon, isFavorite && styles.favoriteActive]}>
                                {isFavorite ? '♥' : '♡'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Profile Image */}
                <View style={styles.profileImageContainer}>
                    {counselor.profile?.avatar_url ? (
                        <Image
                            source={{ uri: counselor.profile.avatar_url }}
                            style={styles.profileImage}
                        />
                    ) : (
                        <View style={styles.profileImagePlaceholder}>
                            <Text style={styles.profileImageText}>
                                {counselor.profile?.full_name?.charAt(0) || '?'}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Name and Title */}
                <View style={styles.nameSection}>
                    <View style={styles.nameRow}>
                        <Text style={styles.name}>{counselor.profile?.full_name || 'Counselor'}</Text>
                        <Text style={styles.verifiedBadge}>✓</Text>
                    </View>
                    <Text style={styles.title}>Licensed Clinical Psychologist</Text>
                    <View style={styles.ratingRow}>
                        <Text style={styles.star}>★</Text>
                        <Text style={styles.ratingValue}>{stats.rating}</Text>
                        <Text style={styles.reviewCount}>({stats.reviews} reviews)</Text>
                    </View>
                </View>

                {/* Stats Row */}
                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{stats.years}+</Text>
                        <Text style={styles.statLabel}>Years Exp.</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{stats.sessions}</Text>
                        <Text style={styles.statLabel}>Sessions</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValueHighlight}>{stats.replyTime}</Text>
                        <Text style={styles.statLabel}>Avg. Reply</Text>
                    </View>
                </View>

                {/* About Me Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionIcon}>👤</Text>
                        <Text style={styles.sectionTitle}>About Me</Text>
                    </View>
                    <Text style={styles.aboutText}>
                        {counselor.bio || 'I specialize in anxiety and depression management using a warm, evidence-based approach. My goal is to create a safe space where you feel heard and understood. My methodology is rooted in cognitive behavioral therapy (CBT) and mindfulness techniques to help you regain control.'}
                    </Text>
                </View>

                {/* Expertise Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionIcon}>🎯</Text>
                        <Text style={styles.sectionTitle}>Expertise</Text>
                    </View>
                    <View style={styles.expertiseTags}>
                        {(counselor.specialties || ['anxiety', 'depression', 'mental_wellbeing', 'stress_management', 'relationship']).map((specialty, index) => (
                            <View key={index} style={styles.expertiseTag}>
                                <Text style={styles.expertiseTagText}>
                                    {specialtyLabels[specialty] || specialty}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Availability Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionIcon}>📅</Text>
                        <Text style={styles.sectionTitle}>Availability</Text>
                        <Text style={styles.nextAvailable}>Next: Today, 4:00 PM</Text>
                    </View>

                    {/* Date Picker */}
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.datePickerContainer}
                    >
                        {availabilityDates.map((date, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.dateItem,
                                    selectedDate === index && styles.dateItemSelected,
                                ]}
                                onPress={() => setSelectedDate(index)}
                            >
                                <Text style={[
                                    styles.dateDay,
                                    selectedDate === index && styles.dateDaySelected,
                                ]}>
                                    {date.day === 'Today' ? 'Today' : date.month}
                                </Text>
                                <Text style={[
                                    styles.dateNumber,
                                    selectedDate === index && styles.dateNumberSelected,
                                ]}>
                                    {date.date}
                                </Text>
                                <Text style={[
                                    styles.dateMonth,
                                    selectedDate === index && styles.dateMonthSelected,
                                ]}>
                                    {date.day === 'Today' ? 'Mon' : ''}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* Time Slots */}
                    <View style={styles.timeSlotsContainer}>
                        {timeSlots.map((time, index) => (
                            <TouchableOpacity key={index} style={styles.timeSlot}>
                                <Text style={styles.timeSlotText}>{time}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Recent Review Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionIcon}>💬</Text>
                        <Text style={styles.sectionTitle}>Recent Review</Text>
                    </View>
                    <View style={styles.reviewCard}>
                        <View style={styles.reviewHeader}>
                            <View style={styles.reviewStars}>
                                {[1, 2, 3, 4, 5].map((_, i) => (
                                    <Text key={i} style={styles.reviewStar}>★</Text>
                                ))}
                            </View>
                            <Text style={styles.reviewDate}>2 days ago</Text>
                        </View>
                        <Text style={styles.reviewText}>
                            "Sarah is incredibly understanding. I felt better after just one session."
                        </Text>
                    </View>
                </View>

                {/* Spacer for bottom button */}
                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Fixed Bottom Button */}
            <View style={styles.bottomContainer}>
                <TouchableOpacity
                    style={[styles.startChatButton, startingChat && styles.startChatButtonDisabled]}
                    onPress={handleStartChat}
                    disabled={startingChat}
                >
                    <Text style={styles.chatIcon}>💬</Text>
                    <Text style={styles.startChatText}>
                        {startingChat ? 'Loading...' : 'Start Chat'}
                    </Text>
                </TouchableOpacity>
            </View>
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
        paddingBottom: spacing.lg,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
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
        fontSize: 24,
        color: colors.textPrimary,
    },
    headerActions: {
        flexDirection: 'row',
    },
    headerActionButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: spacing.sm,
    },
    headerActionIcon: {
        fontSize: 20,
        color: colors.textPrimary,
    },
    favoriteActive: {
        color: colors.error,
    },
    profileImageContainer: {
        alignItems: 'center',
        marginTop: spacing.md,
        marginBottom: spacing.lg,
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 3,
        borderColor: colors.border,
    },
    profileImagePlaceholder: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: colors.surfaceSecondary,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: colors.border,
    },
    profileImageText: {
        fontSize: 48,
        fontWeight: typography.weights.bold,
        color: colors.textPrimary,
    },
    nameSection: {
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    name: {
        fontSize: typography.sizes.xxl,
        fontWeight: typography.weights.bold,
        color: colors.textPrimary,
    },
    verifiedBadge: {
        fontSize: 16,
        color: colors.primary,
        marginLeft: spacing.xs,
        backgroundColor: colors.primary + '20',
        borderRadius: 10,
        width: 20,
        height: 20,
        textAlign: 'center',
        lineHeight: 20,
    },
    title: {
        fontSize: typography.sizes.md,
        color: colors.textSecondary,
        marginBottom: spacing.sm,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    star: {
        fontSize: 16,
        color: colors.star,
        marginRight: spacing.xs,
    },
    ratingValue: {
        fontSize: typography.sizes.md,
        color: colors.star,
        fontWeight: typography.weights.semibold,
        marginRight: spacing.xs,
    },
    reviewCount: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
    },
    statsContainer: {
        flexDirection: 'row',
        backgroundColor: colors.surface,
        marginHorizontal: spacing.lg,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        marginBottom: spacing.lg,
        borderWidth: 1,
        borderColor: colors.border,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statDivider: {
        width: 1,
        backgroundColor: colors.border,
    },
    statValue: {
        fontSize: typography.sizes.xl,
        fontWeight: typography.weights.bold,
        color: colors.textPrimary,
        marginBottom: spacing.xs,
    },
    statValueHighlight: {
        fontSize: typography.sizes.xl,
        fontWeight: typography.weights.bold,
        color: colors.primary,
        marginBottom: spacing.xs,
    },
    statLabel: {
        fontSize: typography.sizes.xs,
        color: colors.textSecondary,
    },
    section: {
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.lg,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    sectionIcon: {
        fontSize: 16,
        marginRight: spacing.sm,
    },
    sectionTitle: {
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.semibold,
        color: colors.textPrimary,
        flex: 1,
    },
    nextAvailable: {
        fontSize: typography.sizes.sm,
        color: colors.success,
    },
    aboutText: {
        fontSize: typography.sizes.md,
        color: colors.textSecondary,
        lineHeight: 24,
        marginBottom: spacing.sm,
    },
    readMoreText: {
        fontSize: typography.sizes.sm,
        color: colors.primary,
    },
    expertiseTags: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    expertiseTag: {
        backgroundColor: colors.tagBackground,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.full,
        marginRight: spacing.sm,
        marginBottom: spacing.sm,
        borderWidth: 1,
        borderColor: colors.border,
    },
    expertiseTagText: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
    },
    datePickerContainer: {
        marginBottom: spacing.md,
    },
    dateItem: {
        width: 60,
        paddingVertical: spacing.md,
        alignItems: 'center',
        borderRadius: borderRadius.lg,
        marginRight: spacing.sm,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
    },
    dateItemSelected: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    dateDay: {
        fontSize: typography.sizes.xs,
        color: colors.textSecondary,
        marginBottom: spacing.xs,
    },
    dateDaySelected: {
        color: colors.textPrimary,
    },
    dateNumber: {
        fontSize: typography.sizes.xl,
        fontWeight: typography.weights.bold,
        color: colors.textPrimary,
    },
    dateNumberSelected: {
        color: colors.textPrimary,
    },
    dateMonth: {
        fontSize: typography.sizes.xs,
        color: colors.textSecondary,
        marginTop: spacing.xs,
    },
    dateMonthSelected: {
        color: colors.textPrimary,
    },
    timeSlotsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    timeSlot: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.full,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        marginRight: spacing.sm,
        marginBottom: spacing.sm,
    },
    timeSlotText: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
    },
    reviewCard: {
        backgroundColor: colors.surface,
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        borderColor: colors.border,
    },
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    reviewStars: {
        flexDirection: 'row',
    },
    reviewStar: {
        fontSize: 14,
        color: colors.star,
        marginRight: 2,
    },
    reviewDate: {
        fontSize: typography.sizes.xs,
        color: colors.textSecondary,
    },
    reviewText: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
        fontStyle: 'italic',
        lineHeight: 20,
    },
    bottomContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: colors.background,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        paddingBottom: spacing.xl,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    startChatButton: {
        flexDirection: 'row',
        backgroundColor: colors.primary,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.lg,
        justifyContent: 'center',
        alignItems: 'center',
    },
    startChatButtonDisabled: {
        opacity: 0.7,
    },
    chatIcon: {
        fontSize: 18,
        marginRight: spacing.sm,
    },
    startChatText: {
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.semibold,
        color: colors.textPrimary,
    },
    priceText: {
        fontSize: typography.sizes.sm,
        color: colors.textPrimary,
        opacity: 0.8,
        marginLeft: spacing.sm,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.lg,
        backgroundColor: colors.background,
    },
    errorText: {
        color: colors.error,
        fontSize: typography.sizes.md,
        textAlign: 'center',
    },
});
