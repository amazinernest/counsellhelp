// Loading spinner component for async operations

import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { colors, spacing, typography } from '../styles/theme';

interface LoadingSpinnerProps {
    message?: string;
    size?: 'small' | 'large';
    fullScreen?: boolean;
}

export default function LoadingSpinner({
    message,
    size = 'large',
    fullScreen = false,
}: LoadingSpinnerProps) {
    if (fullScreen) {
        return (
            <View style={styles.fullScreen}>
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
    fullScreen: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.background,
    },
    message: {
        marginTop: spacing.md,
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
    },
});
