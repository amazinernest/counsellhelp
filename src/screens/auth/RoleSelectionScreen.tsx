// Role selection screen - choose between Client and Counselor

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import Button from '../../components/Button';
import { colors, spacing, borderRadius, typography, shadows } from '../../styles/theme';
import { UserRole } from '../../types';

export default function RoleSelectionScreen() {
    const navigation = useNavigation<any>();
    const { user, refreshProfile } = useAuth();
    const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Role options with descriptions
    const roles = [
        {
            id: 'client' as UserRole,
            title: 'Client',
            description: 'I am looking for guidance and support from a counselor',
            icon: '👤',
        },
        {
            id: 'counselor' as UserRole,
            title: 'Counselor',
            description: 'I am a professional counselor ready to help others',
            icon: '👨‍⚕️',
        },
    ];

    // Save selected role to database
    async function handleContinue() {
        if (!selectedRole) {
            setError('Please select a role');
            return;
        }

        if (!user) {
            setError('User not found. Please try logging in again.');
            return;
        }

        setLoading(true);
        setError('');

        // Update or create the profile with the selected role
        const { error: updateError } = await supabase
            .from('profiles')
            .upsert({
                id: user.id,
                email: user.email,
                role: selectedRole,
                onboarding_complete: false,
            });

        if (updateError) {
            setError(updateError.message);
            setLoading(false);
            return;
        }

        // Refresh the profile in context
        await refreshProfile();

        // Navigate to the appropriate onboarding screen
        // Using reset to replace the stack so user can't go back
        navigation.reset({
            index: 0,
            routes: [{
                name: selectedRole === 'counselor'
                    ? 'CounselorOnboarding'
                    : 'ClientOnboarding'
            }],
        });

        setLoading(false);
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Choose Your Role</Text>
                <Text style={styles.subtitle}>
                    How would you like to use CounselHelp?
                </Text>
            </View>

            {/* Role options */}
            <View style={styles.options}>
                {roles.map((role) => (
                    <TouchableOpacity
                        key={role.id}
                        style={[
                            styles.option,
                            selectedRole === role.id && styles.optionSelected,
                        ]}
                        onPress={() => setSelectedRole(role.id)}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.optionIcon}>{role.icon}</Text>
                        <View style={styles.optionContent}>
                            <Text
                                style={[
                                    styles.optionTitle,
                                    selectedRole === role.id && styles.optionTitleSelected,
                                ]}
                            >
                                {role.title}
                            </Text>
                            <Text style={styles.optionDescription}>{role.description}</Text>
                        </View>
                        <View
                            style={[
                                styles.radio,
                                selectedRole === role.id && styles.radioSelected,
                            ]}
                        >
                            {selectedRole === role.id && <View style={styles.radioInner} />}
                        </View>
                    </TouchableOpacity>
                ))}
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            {/* Continue button */}
            <Button
                title="Continue"
                onPress={handleContinue}
                loading={loading}
                disabled={!selectedRole}
                style={styles.button}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        padding: spacing.lg,
        justifyContent: 'center',
    },
    header: {
        marginBottom: spacing.xl,
        alignItems: 'center',
    },
    title: {
        fontSize: typography.sizes.xxxl,
        fontWeight: typography.weights.bold,
        color: colors.textPrimary,
        marginBottom: spacing.sm,
    },
    subtitle: {
        fontSize: typography.sizes.md,
        color: colors.textSecondary,
        textAlign: 'center',
    },
    options: {
        marginBottom: spacing.xl,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.md,
        borderWidth: 2,
        borderColor: colors.border,
        ...shadows.sm,
    },
    optionSelected: {
        borderColor: colors.primary,
        backgroundColor: colors.primary + '08',
    },
    optionIcon: {
        fontSize: 32,
        marginRight: spacing.md,
    },
    optionContent: {
        flex: 1,
    },
    optionTitle: {
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.semibold,
        color: colors.textPrimary,
        marginBottom: spacing.xs,
    },
    optionTitleSelected: {
        color: colors.primary,
    },
    optionDescription: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
        lineHeight: 20,
    },
    radio: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: colors.border,
        marginLeft: spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioSelected: {
        borderColor: colors.primary,
    },
    radioInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: colors.primary,
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
