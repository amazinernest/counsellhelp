// Credit badge component - displays user's credit balance in header

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, borderRadius, typography } from '../styles/theme';

interface CreditBadgeProps {
    credits: number;
}

export default function CreditBadge({ credits }: CreditBadgeProps) {
    const navigation = useNavigation<any>();

    // Determine color based on credit level
    const getBadgeColor = () => {
        if (credits <= 0) return colors.error;
        if (credits < 100) return colors.warning;
        return colors.success;
    };

    const badgeColor = getBadgeColor();

    return (
        <TouchableOpacity
            style={[styles.container, { borderColor: badgeColor }]}
            onPress={() => navigation.navigate('BuyCredits')}
            activeOpacity={0.7}
        >
            <Text style={styles.coinIcon}>🪙</Text>
            <Text style={[styles.creditText, { color: badgeColor }]}>
                {credits.toLocaleString()}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.full,
        borderWidth: 1,
        marginRight: spacing.sm,
    },
    coinIcon: {
        fontSize: 14,
        marginRight: spacing.xs,
    },
    creditText: {
        fontSize: typography.sizes.sm,
        fontWeight: typography.weights.semibold,
    },
});
