// Counselor card component for displaying counselor info in lists

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../styles/theme';
import { CounselorProfile, Profile, Specialty } from '../types';

interface CounselorCardProps {
    counselor: CounselorProfile & { profile: Profile };
    onPress: () => void;
}

// Human-readable specialty labels
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
};

export default function CounselorCard({ counselor, onPress }: CounselorCardProps) {
    // Generate random rating for demo
    const rating = (Math.random() * 0.5 + 4.5).toFixed(1);

    // Get avatar color based on name
    const getAvatarColor = (name: string): string => {
        const colors = ['#3B82F6', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B'];
        const index = name.charCodeAt(0) % colors.length;
        return colors[index];
    };

    const avatarColor = getAvatarColor(counselor.profile?.full_name || 'C');

    return (
        <TouchableOpacity
            style={styles.card}
            onPress={onPress}
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
                            {counselor.profile?.full_name?.charAt(0)?.toUpperCase() || '?'}
                        </Text>
                    </View>
                )}
                {/* Status indicator */}
                <View style={[
                    styles.statusIndicator,
                    { backgroundColor: counselor.is_available ? colors.available : colors.warning }
                ]} />
            </View>

            <View style={styles.content}>
                {/* Name and rating */}
                <View style={styles.header}>
                    <Text style={styles.name} numberOfLines={1}>
                        {counselor.profile?.full_name || 'Counselor'}
                    </Text>
                    <View style={styles.ratingContainer}>
                        <Text style={styles.starIcon}>★</Text>
                        <Text style={styles.ratingText}>{rating}</Text>
                    </View>
                </View>

                {/* Title/Bio */}
                <Text style={styles.title} numberOfLines={1}>
                    {counselor.bio || 'Licensed Counselor'}
                </Text>

                {/* Specialties */}
                <View style={styles.tagsContainer}>
                    {counselor.specialties?.slice(0, 2).map((specialty, index) => (
                        <View key={index} style={styles.tag}>
                            <Text style={styles.tagText}>
                                {specialtyLabels[specialty] || specialty}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* Availability & Experience */}
                <View style={styles.footer}>
                    <View style={styles.availabilityContainer}>
                        <View style={[
                            styles.availabilityDot,
                            { backgroundColor: counselor.is_available ? colors.available : colors.warning }
                        ]} />
                        <Text style={[
                            styles.availabilityText,
                            { color: counselor.is_available ? colors.available : colors.textSecondary }
                        ]}>
                            {counselor.is_available ? 'Available Now' : 'Next slot: 2:00 PM'}
                        </Text>
                    </View>
                    <Text style={styles.experience}>
                        {counselor.years_experience} {counselor.years_experience === 1 ? 'yr' : 'yrs'} exp
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.md,
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
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: typography.sizes.xl,
        fontWeight: typography.weights.bold,
        color: colors.textPrimary,
    },
    statusIndicator: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 12,
        height: 12,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: colors.surface,
    },
    content: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.xs,
    },
    name: {
        fontSize: typography.sizes.md,
        fontWeight: typography.weights.semibold,
        color: colors.textPrimary,
        flex: 1,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: spacing.sm,
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
    title: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
        marginBottom: spacing.sm,
    },
    tagsContainer: {
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
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    availabilityContainer: {
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
    experience: {
        fontSize: typography.sizes.xs,
        color: colors.textSecondary,
    },
});
