// Home screen - dashboard for clients and counselors

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { supabase } from '../../lib/supabase';
import Button from '../../components/Button';
import { colors, spacing, borderRadius, typography, shadows } from '../../styles/theme';
import { Conversation, CounselorProfile } from '../../types';

export default function HomeScreen({ navigation }: any) {
    const { profile, user } = useAuth();
    const { unreadCount } = useNotifications();
    const [recentConversations, setRecentConversations] = useState<any[]>([]);
    const [counselorProfile, setCounselorProfile] = useState<CounselorProfile | null>(null);
    const [activeClients, setActiveClients] = useState(0);
    const [refreshing, setRefreshing] = useState(false);

    const isClient = profile?.role === 'client';
    const isCounselor = profile?.role === 'counselor';

    // Load dashboard data
    async function loadDashboard() {
        if (!user) return;

        try {
            // Get recent conversations with client/counselor info
            const { data: conversations } = await supabase
                .from('conversations')
                .select(`
                    *,
                    client:profiles!conversations_client_id_fkey(id, full_name, avatar_url),
                    counselor:profiles!conversations_counselor_id_fkey(id, full_name, avatar_url)
                `)
                .or(`client_id.eq.${user.id},counselor_id.eq.${user.id}`)
                .order('last_message_at', { ascending: false })
                .limit(3);

            if (conversations) {
                setRecentConversations(conversations);
                // Count unique clients for counselors
                if (isCounselor) {
                    const clientIds = new Set(conversations.map((c) => c.client_id));
                    setActiveClients(clientIds.size);
                }
            }

            // Load counselor profile if user is counselor
            if (isCounselor) {
                const { data: counselorData } = await supabase
                    .from('counselor_profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (counselorData) {
                    setCounselorProfile(counselorData);
                }
            }
        } catch (err) {
            console.error('Error loading dashboard:', err);
        }
    }

    useEffect(() => {
        loadDashboard();
    }, [user, profile]);

    async function onRefresh() {
        setRefreshing(true);
        await loadDashboard();
        setRefreshing(false);
    }

    // Navigate to chat
    function openChat(conversation: any) {
        const otherUser = isClient ? conversation.counselor : conversation.client;
        navigation.navigate('Chat', {
            conversationId: conversation.id,
            otherUserName: otherUser?.full_name || 'Chat',
        });
    }

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            {/* Welcome section */}
            <View style={styles.welcomeSection}>
                <Text style={styles.greeting}>
                    Hello, {profile?.full_name || 'there'}! 👋
                </Text>
                <Text style={styles.roleLabel}>
                    {isClient ? 'Client' : 'Counselor'}
                </Text>
            </View>

            {/* Quick stats */}
            <View style={styles.statsRow}>
                <View style={[styles.statCard, styles.primaryCard]}>
                    <Text style={styles.statNumber}>{unreadCount}</Text>
                    <Text style={styles.statLabel}>Unread Messages</Text>
                </View>
                <View style={[styles.statCard, styles.secondaryCard]}>
                    <Text style={[styles.statNumber, styles.secondaryText]}>
                        {isCounselor ? activeClients : '🔍'}
                    </Text>
                    <Text style={[styles.statLabel, styles.secondaryText]}>
                        {isCounselor ? 'Active Clients' : 'Find Counselors'}
                    </Text>
                </View>
            </View>

            {/* Counselor availability status */}
            {isCounselor && counselorProfile && (
                <View style={styles.section}>
                    <View style={styles.statusCard}>
                        <View style={styles.statusRow}>
                            <Text style={styles.statusLabel}>Your Status</Text>
                            <View style={[
                                styles.statusBadge,
                                { backgroundColor: counselorProfile.is_available ? colors.success + '20' : colors.error + '20' }
                            ]}>
                                <Text style={[
                                    styles.statusText,
                                    { color: counselorProfile.is_available ? colors.success : colors.error }
                                ]}>
                                    {counselorProfile.is_available ? '🟢 Available' : '🔴 Unavailable'}
                                </Text>
                            </View>
                        </View>
                        <Text style={styles.statusHint}>
                            {counselorProfile.is_available
                                ? 'Clients can find you and send messages'
                                : 'You won\'t appear in the counselor list'}
                        </Text>
                        <Button
                            title="Edit Profile"
                            onPress={() => navigation.navigate('EditProfile')}
                            variant="secondary"
                            style={styles.editButton}
                        />
                    </View>
                </View>
            )}

            {/* Recent conversations */}
            {recentConversations.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        {isCounselor ? 'Recent Clients' : 'Recent Conversations'}
                    </Text>
                    {recentConversations.map((conv) => {
                        const otherUser = isClient ? conv.counselor : conv.client;
                        return (
                            <TouchableOpacity
                                key={conv.id}
                                style={styles.conversationCard}
                                onPress={() => openChat(conv)}
                            >
                                {otherUser?.avatar_url ? (
                                    <Image
                                        source={{ uri: otherUser.avatar_url }}
                                        style={styles.convAvatar}
                                    />
                                ) : (
                                    <View style={styles.convAvatarPlaceholder}>
                                        <Text style={styles.convAvatarText}>
                                            {otherUser?.full_name?.charAt(0) || '?'}
                                        </Text>
                                    </View>
                                )}
                                <View style={styles.convInfo}>
                                    <Text style={styles.convName}>{otherUser?.full_name || 'User'}</Text>
                                    <Text style={styles.convTime}>
                                        {new Date(conv.last_message_at).toLocaleDateString()}
                                    </Text>
                                </View>
                                <Text style={styles.convArrow}>→</Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            )}

            {/* Quick actions */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Quick Actions</Text>

                {isClient && (
                    <Button
                        title="Browse Counselors"
                        onPress={() => navigation.navigate('Counselors')}
                        style={styles.actionButton}
                    />
                )}

                <Button
                    title="View All Messages"
                    onPress={() => navigation.navigate('Messages')}
                    variant="outline"
                    style={styles.actionButton}
                />
            </View>

            {/* Tips section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                    {isClient ? 'Tips for You' : 'Counselor Tips'}
                </Text>
                <View style={styles.tipCard}>
                    <Text style={styles.tipText}>
                        {isClient
                            ? 'Take your time to find a counselor that matches your needs. Review their specialties and experience before reaching out.'
                            : 'Respond to messages promptly to build trust with your clients. Keep your availability status updated in your profile.'}
                    </Text>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        padding: spacing.lg,
        paddingBottom: spacing.xxl,
    },
    welcomeSection: {
        marginBottom: spacing.lg,
    },
    greeting: {
        fontSize: typography.sizes.xxl,
        fontWeight: typography.weights.bold,
        color: colors.textPrimary,
        marginBottom: spacing.xs,
    },
    roleLabel: {
        fontSize: typography.sizes.md,
        color: colors.primary,
        fontWeight: typography.weights.medium,
    },
    statsRow: {
        flexDirection: 'row',
        marginBottom: spacing.lg,
    },
    statCard: {
        flex: 1,
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        alignItems: 'center',
        marginRight: spacing.md,
        ...shadows.sm,
    },
    primaryCard: {
        backgroundColor: colors.primary,
    },
    secondaryCard: {
        backgroundColor: colors.surface,
        marginRight: 0,
    },
    statNumber: {
        fontSize: typography.sizes.xxl,
        fontWeight: typography.weights.bold,
        color: colors.textInverse,
        marginBottom: spacing.xs,
    },
    statLabel: {
        fontSize: typography.sizes.sm,
        color: colors.textInverse,
        opacity: 0.9,
    },
    secondaryText: {
        color: colors.textPrimary,
    },
    section: {
        marginBottom: spacing.lg,
    },
    sectionTitle: {
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.semibold,
        color: colors.textPrimary,
        marginBottom: spacing.md,
    },
    statusCard: {
        backgroundColor: colors.surface,
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        ...shadows.sm,
    },
    statusRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    statusLabel: {
        fontSize: typography.sizes.md,
        fontWeight: typography.weights.medium,
        color: colors.textPrimary,
    },
    statusBadge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.sm,
    },
    statusText: {
        fontSize: typography.sizes.sm,
        fontWeight: typography.weights.medium,
    },
    statusHint: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
        marginBottom: spacing.md,
    },
    editButton: {
        marginTop: spacing.xs,
    },
    conversationCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        padding: spacing.md,
        borderRadius: borderRadius.md,
        marginBottom: spacing.sm,
        ...shadows.sm,
    },
    convAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
    },
    convAvatarPlaceholder: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    convAvatarText: {
        fontSize: 18,
        fontWeight: typography.weights.bold,
        color: colors.textInverse,
    },
    convInfo: {
        flex: 1,
        marginLeft: spacing.md,
    },
    convName: {
        fontSize: typography.sizes.md,
        fontWeight: typography.weights.medium,
        color: colors.textPrimary,
    },
    convTime: {
        fontSize: typography.sizes.xs,
        color: colors.textSecondary,
    },
    convArrow: {
        fontSize: typography.sizes.lg,
        color: colors.textSecondary,
    },
    actionButton: {
        marginBottom: spacing.sm,
    },
    tipCard: {
        backgroundColor: colors.primary + '10',
        padding: spacing.md,
        borderRadius: borderRadius.md,
        borderLeftWidth: 4,
        borderLeftColor: colors.primary,
    },
    tipText: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
        lineHeight: 22,
    },
});
