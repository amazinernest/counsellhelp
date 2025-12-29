// Client onboarding screen - basic profile setup

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { colors, spacing, borderRadius, typography } from '../../styles/theme';

// Predefined areas of concern
const concernOptions = [
    'Relationship',
    'Academic',
    'Career',
    'Mental Wellbeing',
    'Family',
    'Stress',
    'Self-esteem',
    'Other',
];

export default function ClientOnboardingScreen() {
    const { user, refreshProfile } = useAuth();
    const [fullName, setFullName] = useState('');
    const [selectedConcern, setSelectedConcern] = useState('');
    const [customConcern, setCustomConcern] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Save client profile
    async function handleSubmit() {
        console.log('handleSubmit called');

        if (!fullName.trim()) {
            setError('Please enter your name');
            return;
        }

        const concern = selectedConcern === 'Other' ? customConcern : selectedConcern;
        if (!concern.trim()) {
            setError('Please select or enter your area of concern');
            return;
        }

        if (!user) {
            setError('User not found');
            console.log('No user found in context');
            return;
        }

        console.log('Submitting for user:', user.id);
        setLoading(true);
        setError('');

        try {
            // Upsert the main profile (creates if not exists, updates if exists)
            console.log('Upserting profile...');
            const { error: profileError } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    email: user.email,
                    full_name: fullName.trim(),
                    role: 'client',
                    onboarding_complete: true,
                });

            if (profileError) {
                console.error('Profile upsert error:', profileError);
                throw profileError;
            }
            console.log('Profile upserted successfully');

            // Create client profile
            console.log('Creating client profile...');
            const { error: clientError } = await supabase
                .from('client_profiles')
                .upsert({
                    id: user.id,
                    area_of_concern: concern.trim(),
                });

            if (clientError) {
                console.error('Client profile error:', clientError);
                throw clientError;
            }
            console.log('Client profile created successfully');

            // Refresh profile to trigger navigation
            console.log('Refreshing profile...');
            await refreshProfile();
            console.log('Profile refreshed');
        } catch (err: any) {
            console.error('Error during onboarding:', err);
            setError(err.message || 'An error occurred');
        }

        setLoading(false);
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Tell Us About Yourself</Text>
                <Text style={styles.subtitle}>
                    This helps us connect you with the right counselor
                </Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
                <Input
                    label="Your Name"
                    placeholder="What should we call you?"
                    value={fullName}
                    onChangeText={setFullName}
                    autoCapitalize="words"
                />

                {/* Area of concern */}
                <Text style={styles.label}>What would you like help with?</Text>
                <View style={styles.concerns}>
                    {concernOptions.map((concern) => (
                        <TouchableOpacity
                            key={concern}
                            style={[
                                styles.concernTag,
                                selectedConcern === concern && styles.concernTagSelected,
                            ]}
                            onPress={() => setSelectedConcern(concern)}
                            activeOpacity={0.7}
                        >
                            <Text
                                style={[
                                    styles.concernText,
                                    selectedConcern === concern && styles.concernTextSelected,
                                ]}
                            >
                                {concern}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Custom concern input */}
                {selectedConcern === 'Other' && (
                    <Input
                        label="Please specify"
                        placeholder="What's on your mind?"
                        value={customConcern}
                        onChangeText={setCustomConcern}
                    />
                )}

                {error ? <Text style={styles.error}>{error}</Text> : null}

                <Button
                    title="Get Started"
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
        flexGrow: 1,
        justifyContent: 'center',
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
    concerns: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: spacing.md,
    },
    concernTag: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.full,
        marginRight: spacing.sm,
        marginBottom: spacing.sm,
    },
    concernTagSelected: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    concernText: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
    },
    concernTextSelected: {
        color: colors.textInverse,
        fontWeight: typography.weights.medium,
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
