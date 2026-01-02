// Communication Preferences screen

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Switch,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing, borderRadius, typography } from '../../styles/theme';
import { MainStackParamList } from '../../types';

type CommunicationPreferencesScreenProps = {
    navigation: NativeStackNavigationProp<MainStackParamList, 'CommunicationPreferences'>;
};

interface PreferenceItemProps {
    icon: string;
    title: string;
    subtitle: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
}

function PreferenceItem({ icon, title, subtitle, value, onValueChange }: PreferenceItemProps) {
    return (
        <View style={styles.preferenceItem}>
            <Text style={styles.preferenceIcon}>{icon}</Text>
            <View style={styles.preferenceContent}>
                <Text style={styles.preferenceTitle}>{title}</Text>
                <Text style={styles.preferenceSubtitle}>{subtitle}</Text>
            </View>
            <Switch
                value={value}
                onValueChange={onValueChange}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.textPrimary}
            />
        </View>
    );
}

export default function CommunicationPreferencesScreen({ navigation }: CommunicationPreferencesScreenProps) {
    const [videoCall, setVideoCall] = useState(true);
    const [audioCall, setAudioCall] = useState(true);
    const [textChat, setTextChat] = useState(true);
    const [availability, setAvailability] = useState(false);

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
                <Text style={styles.headerTitle}>Communication Preferences</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.sectionDescription}>
                    Choose how you prefer to communicate with counselors.
                </Text>

                <View style={styles.card}>
                    <PreferenceItem
                        icon="📹"
                        title="Video Calls"
                        subtitle="Allow video sessions with counselors"
                        value={videoCall}
                        onValueChange={setVideoCall}
                    />
                    <View style={styles.divider} />
                    <PreferenceItem
                        icon="📞"
                        title="Audio Calls"
                        subtitle="Allow voice-only sessions"
                        value={audioCall}
                        onValueChange={setAudioCall}
                    />
                    <View style={styles.divider} />
                    <PreferenceItem
                        icon="💬"
                        title="Text Chat"
                        subtitle="Allow text messaging sessions"
                        value={textChat}
                        onValueChange={setTextChat}
                    />
                </View>

                <Text style={styles.sectionTitle}>AVAILABILITY</Text>
                <View style={styles.card}>
                    <PreferenceItem
                        icon="🌙"
                        title="Available After Hours"
                        subtitle="Allow contacts outside regular hours"
                        value={availability}
                        onValueChange={setAvailability}
                    />
                </View>
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
    sectionDescription: {
        fontSize: typography.sizes.md,
        color: colors.textSecondary,
        marginBottom: spacing.lg,
    },
    sectionTitle: {
        fontSize: typography.sizes.xs,
        fontWeight: typography.weights.semibold,
        color: colors.textSecondary,
        marginTop: spacing.lg,
        marginBottom: spacing.sm,
        letterSpacing: 1,
    },
    card: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: 'hidden',
    },
    preferenceItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
    },
    preferenceIcon: {
        fontSize: 24,
        marginRight: spacing.md,
    },
    preferenceContent: {
        flex: 1,
    },
    preferenceTitle: {
        fontSize: typography.sizes.md,
        fontWeight: typography.weights.medium,
        color: colors.textPrimary,
    },
    preferenceSubtitle: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
        marginTop: 2,
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
        marginLeft: 56,
    },
});
