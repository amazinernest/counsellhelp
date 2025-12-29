// Reusable Input component with label and error state

import React from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TextInputProps,
    ViewStyle,
} from 'react-native';
import { colors, spacing, borderRadius, typography } from '../styles/theme';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    containerStyle?: ViewStyle;
}

export default function Input({
    label,
    error,
    containerStyle,
    style,
    ...props
}: InputProps) {
    return (
        <View style={[styles.container, containerStyle]}>
            {label && <Text style={styles.label}>{label}</Text>}
            <TextInput
                style={[
                    styles.input,
                    error && styles.inputError,
                    props.multiline && styles.multiline,
                    style,
                ]}
                placeholderTextColor={colors.textLight}
                {...props}
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.md,
    },
    label: {
        fontSize: typography.sizes.sm,
        fontWeight: typography.weights.medium,
        color: colors.textSecondary,
        marginBottom: spacing.xs,
    },
    input: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.md,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        fontSize: typography.sizes.md,
        color: colors.textPrimary,
    },
    inputError: {
        borderColor: colors.error,
    },
    multiline: {
        minHeight: 100,
        textAlignVertical: 'top',
    },
    errorText: {
        fontSize: typography.sizes.xs,
        color: colors.error,
        marginTop: spacing.xs,
    },
});
