// Loading spinner component with dark theme

import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, spacing, typography } from '../styles/theme';

interface LoadingSpinnerProps {
    fullScreen?: boolean;
    message?: string;
    size?: 'small' | 'large';
}

export default function LoadingSpinner({
    fullScreen = false,
    message,
    size = 'large',
}: LoadingSpinnerProps) {
    if (fullScreen) {
        return (
            <View style={styles.fullScreenContainer}>
                <ActivityIndicator size={size} color={colors.primary} />
                {message && <Text style={styles.message}>{message}</Text>}
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ActivityIndicator size={size} color={colors.primary} />
            {message && <Text style={styles.message}>{message}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: spacing.lg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    fullScreenContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.background,
    },
    message: {
        marginTop: spacing.md,
        fontSize: typography.sizes.md,
        color: colors.textSecondary,
        textAlign: 'center',
    },
});
