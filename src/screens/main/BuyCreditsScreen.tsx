// Buy Credits screen - Purchase credits with Paystack

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Linking,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import {
    PAYSTACK_PUBLIC_KEY,
    formatNairaFromNumber,
    generatePaymentReference,
} from '../../lib/paystack';
import { colors, spacing, borderRadius, typography } from '../../styles/theme';
import { MainStackParamList } from '../../types';

type BuyCreditsScreenProps = {
    navigation: NativeStackNavigationProp<MainStackParamList, 'BuyCredits'>;
};

// Credit packages
const creditPackages = [
    { credits: 500, price: 1000, popular: false },
    { credits: 1000, price: 1800, popular: true, savings: '10%' },
    { credits: 2500, price: 4000, popular: false, savings: '20%' },
];

export default function BuyCreditsScreen({ navigation }: BuyCreditsScreenProps) {
    const { user, profile, refreshProfile } = useAuth();

    const [loading, setLoading] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState(creditPackages[0]);

    // Handle credit purchase
    async function handlePurchase() {
        if (!user || !profile) {
            Alert.alert('Error', 'Please log in to continue');
            return;
        }

        setLoading(true);

        try {
            const reference = generatePaymentReference();
            const amountInKobo = selectedPackage.price * 100;

            // Create Paystack checkout URL
            const paystackUrl = `https://checkout.paystack.com/${PAYSTACK_PUBLIC_KEY}` +
                `?email=${encodeURIComponent(profile.email || 'customer@example.com')}` +
                `&amount=${amountInKobo}` +
                `&ref=${reference}`;

            // Open browser for payment
            await Linking.openURL(paystackUrl);

            // Wait a moment then show verification dialog
            setTimeout(() => {
                setLoading(false);
                Alert.alert(
                    'Complete Payment',
                    'After completing payment in your browser, tap "I\'ve Paid" to add your credits.',
                    [
                        {
                            text: 'Cancel',
                            style: 'cancel',
                        },
                        {
                            text: "I've Paid",
                            onPress: () => addCredits(selectedPackage.credits, amountInKobo, reference),
                        },
                    ]
                );
            }, 1000);
        } catch (err: any) {
            console.error('Payment error:', err);
            Alert.alert('Error', err.message || 'Failed to open payment page');
            setLoading(false);
        }
    }

    // Add credits after payment
    async function addCredits(credits: number, amountKobo: number, reference: string) {
        setLoading(true);
        try {
            // Update user's credits
            const newCredits = (profile?.credits || 0) + credits;

            const { error: updateError } = await supabase
                .from('profiles')
                .update({ credits: newCredits })
                .eq('id', user!.id);

            if (updateError) throw updateError;

            // Record the transaction (optional)
            try {
                await supabase.from('credit_transactions').insert({
                    user_id: user!.id,
                    amount: credits,
                    type: 'purchase',
                    description: `Purchased ${credits} credits`,
                    payment_reference: reference,
                    paystack_reference: reference,
                    naira_amount: amountKobo,
                });
            } catch (e) {
                console.log('credit_transactions table may not exist:', e);
            }

            // Refresh profile to get updated credits
            await refreshProfile();

            setLoading(false);

            Alert.alert(
                'Success! 🎉',
                `You've received ${credits.toLocaleString()} credits!`,
                [{ text: 'Great!', onPress: () => navigation.goBack() }]
            );
        } catch (err: any) {
            console.error('Credits update error:', err);
            setLoading(false);
            Alert.alert('Error', 'Failed to add credits. Please contact support if payment was made.');
        }
    }

    // Calculate remaining time
    const remainingMinutes = Math.floor((profile?.credits || 0) / (500 / 120));
    const hours = Math.floor(remainingMinutes / 60);
    const mins = remainingMinutes % 60;
    const timeDisplay = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.backIcon}>‹</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Buy Credits</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Current Balance */}
                <View style={styles.balanceCard}>
                    <Text style={styles.balanceLabel}>Current Balance</Text>
                    <View style={styles.balanceRow}>
                        <Text style={styles.balanceIcon}>🪙</Text>
                        <Text style={styles.balanceValue}>
                            {(profile?.credits || 0).toLocaleString()}
                        </Text>
                    </View>
                    <Text style={styles.timeRemaining}>
                        ≈ {timeDisplay} of chat time remaining
                    </Text>
                </View>

                {/* Credit Rate Info */}
                <View style={styles.infoCard}>
                    <Text style={styles.infoIcon}>💡</Text>
                    <Text style={styles.infoText}>
                        500 credits = 2 hours of chat with counselors
                    </Text>
                </View>

                {/* Packages */}
                <Text style={styles.sectionTitle}>Choose a Package</Text>

                {creditPackages.map((pkg) => (
                    <TouchableOpacity
                        key={pkg.credits}
                        style={[
                            styles.packageCard,
                            selectedPackage.credits === pkg.credits && styles.packageCardSelected,
                        ]}
                        onPress={() => setSelectedPackage(pkg)}
                        activeOpacity={0.7}
                    >
                        {pkg.popular && (
                            <View style={styles.popularBadge}>
                                <Text style={styles.popularText}>POPULAR</Text>
                            </View>
                        )}
                        <View style={styles.packageLeft}>
                            <Text style={styles.packageCredits}>
                                🪙 {pkg.credits.toLocaleString()} Credits
                            </Text>
                            {pkg.savings && (
                                <Text style={styles.savingsText}>Save {pkg.savings}</Text>
                            )}
                        </View>
                        <View style={styles.packageRight}>
                            <Text style={styles.packagePrice}>
                                {formatNairaFromNumber(pkg.price)}
                            </Text>
                            <View style={[
                                styles.radioOuter,
                                selectedPackage.credits === pkg.credits && styles.radioOuterSelected,
                            ]}>
                                {selectedPackage.credits === pkg.credits && (
                                    <View style={styles.radioInner} />
                                )}
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}

                {/* Payment Methods */}
                <View style={styles.paymentInfo}>
                    <Text style={styles.paymentText}>
                        Pay securely via Paystack
                    </Text>
                    <View style={styles.paymentIcons}>
                        <Text style={styles.paymentIcon}>💳</Text>
                        <Text style={styles.paymentIcon}>🏦</Text>
                        <Text style={styles.paymentIcon}>📱</Text>
                    </View>
                </View>
            </ScrollView>

            {/* Buy Button */}
            <View style={styles.bottomContainer}>
                <TouchableOpacity
                    style={[styles.buyButton, loading && styles.buyButtonDisabled]}
                    onPress={handlePurchase}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color={colors.textPrimary} />
                    ) : (
                        <>
                            <Text style={styles.buyButtonText}>
                                Buy {selectedPackage.credits.toLocaleString()} Credits
                            </Text>
                            <Text style={styles.buyButtonPrice}>
                                {formatNairaFromNumber(selectedPackage.price)}
                            </Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingTop: spacing.xl,
        paddingBottom: spacing.md,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backIcon: {
        fontSize: 32,
        color: colors.textPrimary,
    },
    headerTitle: {
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.semibold,
        color: colors.textPrimary,
    },
    headerSpacer: {
        width: 40,
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: spacing.lg,
        paddingBottom: spacing.xxl,
    },
    balanceCard: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.primary,
        marginBottom: spacing.md,
    },
    balanceLabel: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
        marginBottom: spacing.sm,
    },
    balanceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    balanceIcon: {
        fontSize: 28,
        marginRight: spacing.sm,
    },
    balanceValue: {
        fontSize: typography.sizes.xxxl,
        fontWeight: typography.weights.bold,
        color: colors.primary,
    },
    timeRemaining: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
    },
    infoCard: {
        backgroundColor: colors.surfaceSecondary,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    infoIcon: {
        fontSize: 20,
        marginRight: spacing.sm,
    },
    infoText: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
        flex: 1,
    },
    sectionTitle: {
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.semibold,
        color: colors.textPrimary,
        marginBottom: spacing.md,
    },
    packageCard: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: spacing.sm,
        position: 'relative',
    },
    packageCardSelected: {
        borderColor: colors.primary,
        borderWidth: 2,
    },
    popularBadge: {
        position: 'absolute',
        top: -10,
        right: spacing.md,
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.sm,
    },
    popularText: {
        fontSize: typography.sizes.xs,
        fontWeight: typography.weights.bold,
        color: colors.textPrimary,
    },
    packageLeft: {
        flex: 1,
    },
    packageCredits: {
        fontSize: typography.sizes.md,
        fontWeight: typography.weights.semibold,
        color: colors.textPrimary,
    },
    savingsText: {
        fontSize: typography.sizes.sm,
        color: colors.success,
        marginTop: spacing.xs,
    },
    packageRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    packagePrice: {
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.bold,
        color: colors.textPrimary,
        marginRight: spacing.md,
    },
    radioOuter: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: colors.border,
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioOuterSelected: {
        borderColor: colors.primary,
    },
    radioInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: colors.primary,
    },
    paymentInfo: {
        alignItems: 'center',
        marginTop: spacing.lg,
    },
    paymentText: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
        marginBottom: spacing.sm,
    },
    paymentIcons: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    paymentIcon: {
        fontSize: 24,
    },
    bottomContainer: {
        padding: spacing.lg,
        paddingBottom: spacing.xl,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    buyButton: {
        backgroundColor: colors.primary,
        borderRadius: borderRadius.lg,
        paddingVertical: spacing.md,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: spacing.sm,
    },
    buyButtonDisabled: {
        opacity: 0.7,
    },
    buyButtonText: {
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.bold,
        color: colors.textPrimary,
    },
    buyButtonPrice: {
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.bold,
        color: colors.textPrimary,
        opacity: 0.8,
    },
});
