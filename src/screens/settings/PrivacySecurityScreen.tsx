// Privacy & Security screen

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

type PrivacySecurityScreenProps = {
    navigation: NativeStackNavigationProp<MainStackParamList, 'PrivacySecurity'>;
};

export default function PrivacySecurityScreen({ navigation }: PrivacySecurityScreenProps) {
    const [biometric, setBiometric] = useState(false);
    const [hideProfile, setHideProfile] = useState(false);
    const [analytics, setAnalytics] = useState(true);

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
                <Text style={styles.headerTitle}>Privacy & Security</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.sectionTitle}>SECURITY</Text>
                <View style={styles.card}>
                    <View style={styles.settingItem}>
                        <View style={styles.settingContent}>
                            <Text style={styles.settingIcon}>🔐</Text>
                            <View style={styles.settingText}>
                                <Text style={styles.settingTitle}>Biometric Login</Text>
                                <Text style={styles.settingSubtitle}>Use Face ID or fingerprint</Text>
                            </View>
                        </View>
                        <Switch
                            value={biometric}
                            onValueChange={setBiometric}
                            trackColor={{ false: colors.border, true: colors.primary }}
                            thumbColor={colors.textPrimary}
                        />
                    </View>
                    <View style={styles.divider} />
                    <TouchableOpacity
                        style={styles.settingItem}
                        onPress={() => navigation.navigate('ChangePassword')}
                    >
                        <View style={styles.settingContent}>
                            <Text style={styles.settingIcon}>🔑</Text>
                            <View style={styles.settingText}>
                                <Text style={styles.settingTitle}>Change Password</Text>
                                <Text style={styles.settingSubtitle}>Update your password</Text>
                            </View>
                        </View>
                        <Text style={styles.arrow}>›</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.sectionTitle}>PRIVACY</Text>
                <View style={styles.card}>
                    <View style={styles.settingItem}>
                        <View style={styles.settingContent}>
                            <Text style={styles.settingIcon}>👁️</Text>
                            <View style={styles.settingText}>
                                <Text style={styles.settingTitle}>Hide Profile from Search</Text>
                                <Text style={styles.settingSubtitle}>Only visible to connected counselors</Text>
                            </View>
                        </View>
                        <Switch
                            value={hideProfile}
                            onValueChange={setHideProfile}
                            trackColor={{ false: colors.border, true: colors.primary }}
                            thumbColor={colors.textPrimary}
                        />
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.settingItem}>
                        <View style={styles.settingContent}>
                            <Text style={styles.settingIcon}>📊</Text>
                            <View style={styles.settingText}>
                                <Text style={styles.settingTitle}>Usage Analytics</Text>
                                <Text style={styles.settingSubtitle}>Help improve the app</Text>
                            </View>
                        </View>
                        <Switch
                            value={analytics}
                            onValueChange={setAnalytics}
                            trackColor={{ false: colors.border, true: colors.primary }}
                            thumbColor={colors.textPrimary}
                        />
                    </View>
                </View>

                <Text style={styles.sectionTitle}>DATA</Text>
                <View style={styles.card}>
                    <TouchableOpacity style={styles.settingItem}>
                        <View style={styles.settingContent}>
                            <Text style={styles.settingIcon}>📥</Text>
                            <View style={styles.settingText}>
                                <Text style={styles.settingTitle}>Download My Data</Text>
                                <Text style={styles.settingSubtitle}>Get a copy of your data</Text>
                            </View>
                        </View>
                        <Text style={styles.arrow}>›</Text>
                    </TouchableOpacity>
                    <View style={styles.divider} />
                    <TouchableOpacity style={styles.settingItem}>
                        <View style={styles.settingContent}>
                            <Text style={styles.settingIcon}>🗑️</Text>
                            <View style={styles.settingText}>
                                <Text style={[styles.settingTitle, { color: colors.error }]}>Delete Account</Text>
                                <Text style={styles.settingSubtitle}>Permanently delete your account</Text>
                            </View>
                        </View>
                        <Text style={styles.arrow}>›</Text>
                    </TouchableOpacity>
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
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: spacing.md,
    },
    settingContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    settingIcon: {
        fontSize: 24,
        marginRight: spacing.md,
    },
    settingText: {
        flex: 1,
    },
    settingTitle: {
        fontSize: typography.sizes.md,
        fontWeight: typography.weights.medium,
        color: colors.textPrimary,
    },
    settingSubtitle: {
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
});
