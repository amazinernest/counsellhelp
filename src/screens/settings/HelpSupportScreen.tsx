// Help & Support screen

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Linking,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing, borderRadius, typography } from '../../styles/theme';
import { MainStackParamList } from '../../types';

type HelpSupportScreenProps = {
    navigation: NativeStackNavigationProp<MainStackParamList, 'HelpSupport'>;
};

interface HelpItemProps {
    icon: string;
    title: string;
    subtitle: string;
    onPress: () => void;
}

function HelpItem({ icon, title, subtitle, onPress }: HelpItemProps) {
    return (
        <TouchableOpacity style={styles.helpItem} onPress={onPress}>
            <Text style={styles.helpIcon}>{icon}</Text>
            <View style={styles.helpContent}>
                <Text style={styles.helpTitle}>{title}</Text>
                <Text style={styles.helpSubtitle}>{subtitle}</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
    );
}

export default function HelpSupportScreen({ navigation }: HelpSupportScreenProps) {
    const faqs = [
        {
            id: '1',
            question: 'How do I schedule a session?',
            answer: 'Browse counselors, select one, and choose an available time slot.',
        },
        {
            id: '2',
            question: 'Are my conversations private?',
            answer: 'Yes, all conversations are encrypted and confidential.',
        },
        {
            id: '3',
            question: 'How do I cancel a session?',
            answer: 'You can cancel up to 24 hours before the scheduled time.',
        },
    ];

    function handleEmailSupport() {
        Linking.openURL('mailto:support@counsellhelp.com');
    }

    function handleCallSupport() {
        Linking.openURL('tel:+1234567890');
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
                <Text style={styles.headerTitle}>Help & Support</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.sectionTitle}>CONTACT US</Text>
                <View style={styles.card}>
                    <HelpItem
                        icon="📧"
                        title="Email Support"
                        subtitle="support@counsellhelp.com"
                        onPress={handleEmailSupport}
                    />
                    <View style={styles.divider} />
                    <HelpItem
                        icon="📞"
                        title="Call Support"
                        subtitle="Available 9 AM - 6 PM"
                        onPress={handleCallSupport}
                    />
                </View>

                <Text style={styles.sectionTitle}>FREQUENTLY ASKED QUESTIONS</Text>
                {faqs.map((faq) => (
                    <TouchableOpacity key={faq.id} style={styles.faqCard}>
                        <Text style={styles.faqQuestion}>{faq.question}</Text>
                        <Text style={styles.faqAnswer}>{faq.answer}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
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
    },
    sectionTitle: {
        fontSize: typography.sizes.xs,
        fontWeight: typography.weights.semibold,
        color: colors.textSecondary,
        marginBottom: spacing.sm,
        letterSpacing: 1,
    },
    card: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: 'hidden',
        marginBottom: spacing.lg,
    },
    helpItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
    },
    helpIcon: {
        fontSize: 24,
        marginRight: spacing.md,
    },
    helpContent: {
        flex: 1,
    },
    helpTitle: {
        fontSize: typography.sizes.md,
        fontWeight: typography.weights.medium,
        color: colors.textPrimary,
    },
    helpSubtitle: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
        marginTop: 2,
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
        marginLeft: 56,
    },
    arrow: {
        fontSize: 24,
        color: colors.textSecondary,
    },
    faqCard: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing.md,
        marginBottom: spacing.md,
    },
    faqQuestion: {
        fontSize: typography.sizes.md,
        fontWeight: typography.weights.semibold,
        color: colors.textPrimary,
        marginBottom: spacing.xs,
    },
    faqAnswer: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
        lineHeight: 20,
    },
});
