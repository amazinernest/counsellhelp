// Counselor onboarding screen - collect professional details

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Switch,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { colors, spacing, borderRadius, typography } from '../../styles/theme';
import { Specialty } from '../../types';

// Available specialty options
const specialtyOptions: { id: Specialty; label: string }[] = [
    { id: 'relationship', label: 'Relationship' },
    { id: 'academic', label: 'Academic' },
    { id: 'career', label: 'Career' },
    { id: 'mental_wellbeing', label: 'Mental Wellbeing' },
    { id: 'family', label: 'Family' },
    { id: 'stress_management', label: 'Stress Management' },
    { id: 'personal_development', label: 'Personal Development' },
];

export default function CounselorOnboardingScreen() {
    const { user, refreshProfile } = useAuth();
    const [fullName, setFullName] = useState('');
    const [bio, setBio] = useState('');
    const [selectedSpecialties, setSelectedSpecialties] = useState<Specialty[]>([]);
    const [yearsExperience, setYearsExperience] = useState('');
    const [isAvailable, setIsAvailable] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Toggle specialty selection
    function toggleSpecialty(specialty: Specialty) {
        setSelectedSpecialties((prev) =>
            prev.includes(specialty)
                ? prev.filter((s) => s !== specialty)
                : [...prev, specialty]
        );
    }

    // Save counselor profile
    async function handleSubmit() {
        // Validation
        if (!fullName.trim()) {
            setError('Please enter your full name');
            return;
        }
        if (!bio.trim()) {
            setError('Please enter your professional bio');
            return;
        }
        if (selectedSpecialties.length === 0) {
            setError('Please select at least one specialty');
            return;
        }
        if (!yearsExperience || isNaN(parseInt(yearsExperience))) {
            setError('Please enter valid years of experience');
            return;
        }

        if (!user) {
            setError('User not found');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Upsert the main profile (creates if not exists, updates if exists)
            const { error: profileError } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    email: user.email,
                    full_name: fullName.trim(),
                    role: 'counselor',
                    onboarding_complete: true,
                });

            if (profileError) throw profileError;

            // Create counselor profile
            const { error: counselorError } = await supabase
                .from('counselor_profiles')
                .upsert({
                    id: user.id,
                    bio: bio.trim(),
                    specialties: selectedSpecialties,
                    years_experience: parseInt(yearsExperience),
                    is_available: isAvailable,
                });

            if (counselorError) throw counselorError;

            // Refresh profile to trigger navigation
            await refreshProfile();
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        }

        setLoading(false);
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Complete Your Profile</Text>
                <Text style={styles.subtitle}>
                    Help clients learn more about your expertise
                </Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
                <Input
                    label="Full Name"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChangeText={setFullName}
                    autoCapitalize="words"
                />

                <Input
                    label="Professional Bio"
                    placeholder="Tell clients about yourself, your approach, and experience..."
                    value={bio}
                    onChangeText={setBio}
                    multiline
                    numberOfLines={4}
                />

                {/* Specialties */}
                <Text style={styles.label}>Areas of Specialty</Text>
                <View style={styles.specialties}>
                    {specialtyOptions.map((specialty) => (
                        <TouchableOpacity
                            key={specialty.id}
                            style={[
                                styles.specialtyTag,
                                selectedSpecialties.includes(specialty.id) &&
                                styles.specialtyTagSelected,
                            ]}
                            onPress={() => toggleSpecialty(specialty.id)}
                            activeOpacity={0.7}
                        >
                            <Text
                                style={[
                                    styles.specialtyText,
                                    selectedSpecialties.includes(specialty.id) &&
                                    styles.specialtyTextSelected,
                                ]}
                            >
                                {specialty.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Input
                    label="Years of Experience"
                    placeholder="e.g., 5"
                    value={yearsExperience}
                    onChangeText={setYearsExperience}
                    keyboardType="number-pad"
                />

                {/* Availability toggle */}
                <View style={styles.toggleRow}>
                    <View style={styles.toggleContent}>
                        <Text style={styles.toggleLabel}>Available for new clients</Text>
                        <Text style={styles.toggleDescription}>
                            Show your profile as available in the counselor list
                        </Text>
                    </View>
                    <Switch
                        value={isAvailable}
                        onValueChange={setIsAvailable}
                        trackColor={{ false: colors.border, true: colors.primaryLight }}
                        thumbColor={isAvailable ? colors.primary : colors.textLight}
                    />
                </View>

                {error ? <Text style={styles.error}>{error}</Text> : null}

                <Button
                    title="Complete Profile"
                    onPress={handleSubmit}
                    loading={loading}
                    style={styles.button}
                />
            </View>
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
        marginBottom: spacing.xl,
        alignItems: 'center',
    },
    title: {
        fontSize: typography.sizes.xxl,
        fontWeight: typography.weights.bold,
        color: colors.textPrimary,
        marginBottom: spacing.sm,
    },
    subtitle: {
        fontSize: typography.sizes.md,
        color: colors.textSecondary,
        textAlign: 'center',
    },
    form: {
        flex: 1,
    },
    label: {
        fontSize: typography.sizes.sm,
        fontWeight: typography.weights.medium,
        color: colors.textSecondary,
        marginBottom: spacing.sm,
    },
    specialties: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: spacing.md,
    },
    specialtyTag: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.full,
        marginRight: spacing.sm,
        marginBottom: spacing.sm,
    },
    specialtyTagSelected: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    specialtyText: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
    },
    specialtyTextSelected: {
        color: colors.textInverse,
        fontWeight: typography.weights.medium,
    },
    toggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.surface,
        padding: spacing.md,
        borderRadius: borderRadius.md,
        marginBottom: spacing.md,
    },
    toggleContent: {
        flex: 1,
        marginRight: spacing.md,
    },
    toggleLabel: {
        fontSize: typography.sizes.md,
        fontWeight: typography.weights.medium,
        color: colors.textPrimary,
        marginBottom: spacing.xs,
    },
    toggleDescription: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
    },
    error: {
        color: colors.error,
        fontSize: typography.sizes.sm,
        marginBottom: spacing.md,
        textAlign: 'center',
    },
    button: {
        marginTop: spacing.md,
    },
});
