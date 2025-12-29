// Counselor card component for displaying counselor info in lists

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, borderRadius, typography, shadows } from '../styles/theme';
import { CounselorProfile, Profile, Specialty } from '../types';

interface CounselorCardProps {
    counselor: CounselorProfile & { profile: Profile };
    onPress: () => void;
}

// Human-readable specialty labels
const specialtyLabels: Record<Specialty, string> = {
    relationship: 'Relationship',
    academic: 'Academic',
    career: 'Career',
    mental_wellbeing: 'Mental Wellbeing',
    family: 'Family',
    stress_management: 'Stress Management',
    personal_development: 'Personal Development',
};

export default function CounselorCard({ counselor, onPress }: CounselorCardProps) {
    return (
        <TouchableOpacity
            style={styles.card}
            onPress={onPress}
            activeOpacity={0.7}
        >
            {/* Avatar placeholder */}
            <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                    {counselor.profile?.full_name?.charAt(0)?.toUpperCase() || '?'}
                </Text>
            </View>

            <View style={styles.content}>
                {/* Name and availability */}
                <View style={styles.header}>
                    <Text style={styles.name} numberOfLines={1}>
                        {counselor.profile?.full_name || 'Counselor'}
                    </Text>
                    <View
                        style={[
                            styles.availabilityBadge,
                            counselor.is_available ? styles.available : styles.unavailable,
                        ]}
                    >
                        <Text style={styles.availabilityText}>
                            {counselor.is_available ? 'Available' : 'Unavailable'}
                        </Text>
                    </View>
                </View>

                {/* Bio preview */}
                <Text style={styles.bio} numberOfLines={2}>
                    {counselor.bio || 'No bio available'}
                </Text>

                {/* Specialties */}
                <View style={styles.specialties}>
                    {counselor.specialties?.slice(0, 3).map((specialty, index) => (
                        <View key={index} style={styles.specialtyTag}>
                            <Text style={styles.specialtyText}>
                                {specialtyLabels[specialty] || specialty}
                            </Text>
                        </View>
                    ))}
                    {counselor.specialties?.length > 3 && (
                        <Text style={styles.moreText}>+{counselor.specialties.length - 3}</Text>
                    )}
                </View>

                {/* Experience */}
                <Text style={styles.experience}>
                    {counselor.years_experience} {counselor.years_experience === 1 ? 'year' : 'years'} experience
                </Text>
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
        ...shadows.sm,
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: colors.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    avatarText: {
        fontSize: typography.sizes.xl,
        fontWeight: typography.weights.bold,
        color: colors.textInverse,
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
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.semibold,
        color: colors.textPrimary,
        flex: 1,
    },
    availabilityBadge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.full,
        marginLeft: spacing.sm,
    },
    available: {
        backgroundColor: colors.available + '20',
    },
    unavailable: {
        backgroundColor: colors.unavailable + '20',
    },
    availabilityText: {
        fontSize: typography.sizes.xs,
        fontWeight: typography.weights.medium,
    },
    bio: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
        marginBottom: spacing.sm,
        lineHeight: 20,
    },
    specialties: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: spacing.xs,
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
        fontWeight: typography.weights.medium,
    },
    moreText: {
        fontSize: typography.sizes.xs,
        color: colors.textSecondary,
        alignSelf: 'center',
    },
    experience: {
        fontSize: typography.sizes.xs,
        color: colors.textSecondary,
    },
});
