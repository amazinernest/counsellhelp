// In-app notification banner component

import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, borderRadius, typography, shadows } from '../styles/theme';
import { Notification } from '../types';

interface NotificationBannerProps {
    notification: Notification | null;
    onPress?: () => void;
    onDismiss?: () => void;
}

export default function NotificationBanner({
    notification,
    onPress,
    onDismiss,
}: NotificationBannerProps) {
    const slideAnim = useRef(new Animated.Value(-100)).current;

    useEffect(() => {
        if (notification) {
            // Slide in
            Animated.spring(slideAnim, {
                toValue: 0,
                useNativeDriver: true,
                tension: 50,
                friction: 8,
            }).start();

            // Auto dismiss after 4 seconds
            const timer = setTimeout(() => {
                Animated.timing(slideAnim, {
                    toValue: -100,
                    duration: 300,
                    useNativeDriver: true,
                }).start(() => onDismiss?.());
            }, 4000);

            return () => clearTimeout(timer);
        }
    }, [notification, slideAnim, onDismiss]);

    if (!notification) return null;

    return (
        <Animated.View
            style={[
                styles.container,
                { transform: [{ translateY: slideAnim }] },
            ]}
        >
            <TouchableOpacity
                style={styles.content}
                onPress={onPress}
                activeOpacity={0.9}
            >
                <Text style={styles.title} numberOfLines={1}>
                    {notification.title}
                </Text>
                <Text style={styles.body} numberOfLines={2}>
                    {notification.body}
                </Text>
            </TouchableOpacity>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 50,
        left: spacing.md,
        right: spacing.md,
        zIndex: 1000,
        ...shadows.lg,
    },
    content: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        borderLeftWidth: 4,
        borderLeftColor: colors.primary,
    },
    title: {
        fontSize: typography.sizes.md,
        fontWeight: typography.weights.semibold,
        color: colors.textPrimary,
        marginBottom: spacing.xs,
    },
    body: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
        lineHeight: 20,
    },
});
