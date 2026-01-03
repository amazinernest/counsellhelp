// Reusable Button component with primary/secondary variants

import React, { useRef } from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
    ViewStyle,
    TextStyle,
    Animated,
} from 'react-native';
import { colors, spacing, borderRadius, typography } from '../styles/theme';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline';
    loading?: boolean;
    disabled?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
}

export default function Button({
    title,
    onPress,
    variant = 'primary',
    loading = false,
    disabled = false,
    style,
    textStyle,
}: ButtonProps) {
    const isDisabled = disabled || loading;
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.95,
            useNativeDriver: true,
            speed: 50,
            bounciness: 4,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            speed: 50,
            bounciness: 4,
        }).start();
    };

    return (
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity
                style={[
                    styles.button,
                    styles[variant],
                    isDisabled && styles.disabled,
                    style,
                ]}
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={isDisabled}
                activeOpacity={0.9}
            >
                {loading ? (
                    <ActivityIndicator
                        color={variant === 'outline' ? colors.primary : colors.textPrimary}
                    />
                ) : (
                    <Text
                        style={[
                            styles.text,
                            styles[`${variant}Text`],
                            isDisabled && styles.disabledText,
                            textStyle,
                        ]}
                    >
                        {title}
                    </Text>
                )}
            </TouchableOpacity>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    button: {
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        borderRadius: borderRadius.lg,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 48,
    },
    primary: {
        backgroundColor: colors.primary,
    },
    secondary: {
        backgroundColor: colors.surfaceSecondary,
        borderWidth: 1,
        borderColor: colors.border,
    },
    outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: colors.border,
    },
    disabled: {
        opacity: 0.6,
    },
    text: {
        fontSize: typography.sizes.md,
        fontWeight: typography.weights.semibold,
    },
    primaryText: {
        color: colors.textPrimary,
    },
    secondaryText: {
        color: colors.textPrimary,
    },
    outlineText: {
        color: colors.textSecondary,
    },
    disabledText: {
        opacity: 0.8,
    },
});
