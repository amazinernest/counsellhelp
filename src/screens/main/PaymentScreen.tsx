// Payment screen - Paystack checkout for booking sessions

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { PaystackProvider, usePaystack, PaystackProps } from 'react-native-paystack-webview';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import {
    PAYSTACK_PUBLIC_KEY,
    SESSION_PRICE_KOBO,
    SESSION_PRICE_NAIRA,
    COMMISSION_KOBO,
    COUNSELOR_PAYOUT_KOBO,
    formatNairaFromNumber,
    generatePaymentReference,
} from '../../lib/paystack';
import { colors, spacing, borderRadius, typography } from '../../styles/theme';
import { MainStackParamList } from '../../types';

type PaymentScreenProps = {
    navigation: NativeStackNavigationProp<MainStackParamList, 'Payment'>;
    route: RouteProp<MainStackParamList, 'Payment'>;
};

// Payment content component (uses Paystack hook)
function PaymentContent({ navigation, route }: PaymentScreenProps) {
    const { counselorId, counselorName } = route.params;
    const { user, profile } = useAuth();
    const { popup } = usePaystack();

    const [loading, setLoading] = useState(false);

    // Create session and initiate payment
    async function handlePayNow() {
        if (!user || !profile) {
            Alert.alert('Error', 'Please log in to continue');
            return;
        }

        setLoading(true);

        try {
            // Generate unique payment reference
            const reference = generatePaymentReference();

            // Create pending session in database
            const { data: session, error } = await supabase
                .from('sessions')
                .insert({
                    client_id: user.id,
                    counselor_id: counselorId,
                    amount: SESSION_PRICE_KOBO,
                    commission: COMMISSION_KOBO,
                    counselor_payout: COUNSELOR_PAYOUT_KOBO,
                    payment_reference: reference,
                    status: 'pending',
                })
                .select()
                .single();

            if (error) throw error;

            // Start Paystack payment
            popup.newTransaction({
                email: profile.email || 'customer@example.com',
                amount: SESSION_PRICE_NAIRA,
                reference,
                onSuccess: (response: PaystackProps.PaystackTransactionResponse) => {
                    handlePaymentSuccess(response, session.id);
                },
                onCancel: () => {
                    handlePaymentCancel(session.id);
                },
            });
        } catch (err: any) {
            console.error('Payment init error:', err);
            Alert.alert('Error', err.message || 'Failed to initiate payment');
            setLoading(false);
        }
    }

    // Handle successful payment
    async function handlePaymentSuccess(
        response: PaystackProps.PaystackTransactionResponse,
        currentSessionId: string
    ) {
        console.log('Payment success:', response);

        try {
            // Update session status to paid
            const { error: updateError } = await supabase
                .from('sessions')
                .update({
                    status: 'paid',
                    paystack_reference: response.reference,
                    paid_at: new Date().toISOString(),
                })
                .eq('id', currentSessionId);

            if (updateError) throw updateError;

            // Create or get conversation
            let conversationId: string;

            const { data: existingConvo } = await supabase
                .from('conversations')
                .select('id')
                .eq('client_id', user!.id)
                .eq('counselor_id', counselorId)
                .single();

            if (existingConvo) {
                conversationId = existingConvo.id;
            } else {
                const { data: newConvo, error: convoError } = await supabase
                    .from('conversations')
                    .insert({
                        client_id: user!.id,
                        counselor_id: counselorId,
                    })
                    .select()
                    .single();

                if (convoError) throw convoError;
                conversationId = newConvo.id;
            }

            // Update session with conversation ID
            await supabase
                .from('sessions')
                .update({ conversation_id: conversationId })
                .eq('id', currentSessionId);

            // Record counselor earnings
            await supabase.from('counselor_earnings').insert({
                counselor_id: counselorId,
                session_id: currentSessionId,
                amount: COUNSELOR_PAYOUT_KOBO,
                status: 'pending',
            });

            // Record platform earnings
            await supabase.from('platform_earnings').insert({
                session_id: currentSessionId,
                amount: COMMISSION_KOBO,
            });

            // Create notification for counselor
            await supabase.from('notifications').insert({
                user_id: counselorId,
                type: 'new_request',
                title: 'New Paid Session',
                body: `${profile?.full_name || 'A client'} has booked a session with you`,
                data: { conversation_id: conversationId },
            });

            setLoading(false);

            // Show success and navigate to chat
            Alert.alert(
                'Payment Successful! 🎉',
                `You can now start chatting with ${counselorName}.`,
                [
                    {
                        text: 'Start Chat',
                        onPress: () => {
                            navigation.replace('Chat', {
                                conversationId,
                                otherUserName: counselorName,
                            });
                        },
                    },
                ]
            );
        } catch (err: any) {
            console.error('Post-payment error:', err);
            setLoading(false);
            Alert.alert(
                'Payment Received',
                'Your payment was successful but there was an issue setting up the chat. Please contact support.',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
        }
    }

    // Handle payment cancellation
    async function handlePaymentCancel(currentSessionId: string) {
        console.log('Payment cancelled');
        setLoading(false);

        // Delete pending session
        if (currentSessionId) {
            await supabase.from('sessions').delete().eq('id', currentSessionId);
        }

        Alert.alert('Payment Cancelled', 'Your payment was cancelled.');
    }

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
                <Text style={styles.headerTitle}>Book Session</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Session Info Card */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Session with</Text>
                    <Text style={styles.counselorName}>{counselorName}</Text>

                    <View style={styles.divider} />

                    <View style={styles.priceRow}>
                        <Text style={styles.priceLabel}>Session Fee</Text>
                        <Text style={styles.priceValue}>{formatNairaFromNumber(SESSION_PRICE_NAIRA)}</Text>
                    </View>
                </View>

                {/* What You Get */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>What's Included</Text>
                    <View style={styles.featureRow}>
                        <Text style={styles.featureIcon}>💬</Text>
                        <Text style={styles.featureText}>Unlimited text messaging</Text>
                    </View>
                    <View style={styles.featureRow}>
                        <Text style={styles.featureIcon}>🔒</Text>
                        <Text style={styles.featureText}>Private & secure conversation</Text>
                    </View>
                    <View style={styles.featureRow}>
                        <Text style={styles.featureIcon}>⏰</Text>
                        <Text style={styles.featureText}>Response within 24 hours</Text>
                    </View>
                    <View style={styles.featureRow}>
                        <Text style={styles.featureIcon}>📋</Text>
                        <Text style={styles.featureText}>Session notes shared after</Text>
                    </View>
                </View>

                {/* Payment Methods */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Payment Methods</Text>
                    <Text style={styles.paymentNote}>
                        Pay securely with card, bank transfer, or USSD via Paystack
                    </Text>
                    <View style={styles.paymentIcons}>
                        <Text style={styles.paymentIcon}>💳</Text>
                        <Text style={styles.paymentIcon}>🏦</Text>
                        <Text style={styles.paymentIcon}>📱</Text>
                    </View>
                </View>

                {/* Total */}
                <View style={styles.totalCard}>
                    <Text style={styles.totalLabel}>Total</Text>
                    <Text style={styles.totalValue}>{formatNairaFromNumber(SESSION_PRICE_NAIRA)}</Text>
                </View>
            </ScrollView>

            {/* Pay Button */}
            <View style={styles.bottomContainer}>
                <TouchableOpacity
                    style={[styles.payButton, loading && styles.payButtonDisabled]}
                    onPress={handlePayNow}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color={colors.textPrimary} />
                    ) : (
                        <>
                            <Text style={styles.payButtonText}>Pay {formatNairaFromNumber(SESSION_PRICE_NAIRA)}</Text>
                            <Text style={styles.payButtonIcon}>→</Text>
                        </>
                    )}
                </TouchableOpacity>
                <Text style={styles.secureText}>🔒 Secured by Paystack</Text>
            </View>
        </View>
    );
}

// Main component wrapped with PaystackProvider
export default function PaymentScreen(props: PaymentScreenProps) {
    const { profile } = useAuth();

    return (
        <PaystackProvider
            publicKey={PAYSTACK_PUBLIC_KEY}
            currency="NGN"
        >
            <PaymentContent {...props} />
        </PaystackProvider>
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
    card: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing.lg,
        marginBottom: spacing.md,
    },
    cardTitle: {
        fontSize: typography.sizes.sm,
        fontWeight: typography.weights.semibold,
        color: colors.textSecondary,
        marginBottom: spacing.sm,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    counselorName: {
        fontSize: typography.sizes.xl,
        fontWeight: typography.weights.bold,
        color: colors.textPrimary,
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
        marginVertical: spacing.md,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    priceLabel: {
        fontSize: typography.sizes.md,
        color: colors.textSecondary,
    },
    priceValue: {
        fontSize: typography.sizes.xl,
        fontWeight: typography.weights.bold,
        color: colors.primary,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    featureIcon: {
        fontSize: 20,
        marginRight: spacing.md,
    },
    featureText: {
        fontSize: typography.sizes.md,
        color: colors.textPrimary,
    },
    paymentNote: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
        marginBottom: spacing.md,
    },
    paymentIcons: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    paymentIcon: {
        fontSize: 28,
    },
    totalCard: {
        backgroundColor: colors.surfaceSecondary,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    totalLabel: {
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.semibold,
        color: colors.textPrimary,
    },
    totalValue: {
        fontSize: typography.sizes.xxl,
        fontWeight: typography.weights.bold,
        color: colors.available,
    },
    bottomContainer: {
        padding: spacing.lg,
        paddingBottom: spacing.xl,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    payButton: {
        backgroundColor: colors.primary,
        borderRadius: borderRadius.lg,
        paddingVertical: spacing.md,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: spacing.sm,
    },
    payButtonDisabled: {
        opacity: 0.7,
    },
    payButtonText: {
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.bold,
        color: colors.textPrimary,
    },
    payButtonIcon: {
        fontSize: typography.sizes.lg,
        color: colors.textPrimary,
    },
    secureText: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
        textAlign: 'center',
        marginTop: spacing.sm,
    },
});
