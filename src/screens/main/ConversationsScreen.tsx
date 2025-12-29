// Conversations screen - list of active chat threads

import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import { colors, spacing, borderRadius, typography, shadows } from '../../styles/theme';
import { Conversation, MainStackParamList } from '../../types';

type ConversationsScreenProps = {
    navigation: NativeStackNavigationProp<MainStackParamList>;
};

// Format timestamp to readable format
function formatTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
}

export default function ConversationsScreen({ navigation }: ConversationsScreenProps) {
    const { user, profile } = useAuth();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');

    const isClient = profile?.role === 'client';

    // Fetch conversations
    async function fetchConversations() {
        if (!user) return;

        try {
            const query = supabase
                .from('conversations')
                .select(`
          *,
          client:profiles!conversations_client_id_fkey(*),
          counselor:profiles!conversations_counselor_id_fkey(*)
        `)
                .order('last_message_at', { ascending: false, nullsFirst: false });

            // Filter by role
            if (isClient) {
                query.eq('client_id', user.id);
            } else {
                query.eq('counselor_id', user.id);
            }

            const { data, error } = await query;

            if (error) throw error;
            setConversations(data || []);
            setError('');
        } catch (err: any) {
            setError(err.message || 'Failed to load conversations');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    // Initial fetch
    useEffect(() => {
        fetchConversations();
    }, [user, profile]);

    // Subscribe to conversation updates
    useEffect(() => {
        if (!user) return;

        const channel = supabase
            .channel('conversations')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'conversations',
                    filter: isClient
                        ? `client_id=eq.${user.id}`
                        : `counselor_id=eq.${user.id}`,
                },
                () => {
                    fetchConversations();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, isClient]);

    // Handle refresh
    function handleRefresh() {
        setRefreshing(true);
        fetchConversations();
    }

    // Navigate to chat
    function handleConversationPress(conversation: Conversation) {
        const otherUser = isClient ? conversation.counselor : conversation.client;
        navigation.navigate('Chat', {
            conversationId: conversation.id,
            otherUserName: otherUser?.full_name || 'User',
        });
    }

    // Render conversation item
    function renderConversation({ item }: { item: Conversation }) {
        const otherUser = isClient ? item.counselor : item.client;

        return (
            <TouchableOpacity
                style={styles.conversationCard}
                onPress={() => handleConversationPress(item)}
                activeOpacity={0.7}
            >
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                        {otherUser?.full_name?.charAt(0)?.toUpperCase() || '?'}
                    </Text>
                </View>
                <View style={styles.conversationContent}>
                    <View style={styles.conversationHeader}>
                        <Text style={styles.conversationName} numberOfLines={1}>
                            {otherUser?.full_name || 'User'}
                        </Text>
                        <Text style={styles.conversationTime}>
                            {item.last_message_at
                                ? formatTime(item.last_message_at)
                                : formatTime(item.created_at)}
                        </Text>
                    </View>
                    <Text style={styles.conversationPreview} numberOfLines={1}>
                        Tap to view conversation
                    </Text>
                </View>
            </TouchableOpacity>
        );
    }

    // Empty state
    function renderEmpty() {
        if (loading) return null;
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>💬</Text>
                <Text style={styles.emptyTitle}>No Conversations Yet</Text>
                <Text style={styles.emptyText}>
                    {isClient
                        ? 'Browse counselors and start a conversation'
                        : 'Wait for clients to reach out to you'}
                </Text>
            </View>
        );
    }

    if (loading) {
        return <LoadingSpinner fullScreen message="Loading messages..." />;
    }

    return (
        <View style={styles.container}>
            {error ? (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            ) : null}

            <FlatList
                data={conversations}
                keyExtractor={(item) => item.id}
                renderItem={renderConversation}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={renderEmpty}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        tintColor={colors.primary}
                        colors={[colors.primary]}
                    />
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    listContent: {
        padding: spacing.md,
        flexGrow: 1,
    },
    conversationCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.sm,
        ...shadows.sm,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: colors.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    avatarText: {
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.bold,
        color: colors.textInverse,
    },
    conversationContent: {
        flex: 1,
    },
    conversationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    conversationName: {
        fontSize: typography.sizes.md,
        fontWeight: typography.weights.semibold,
        color: colors.textPrimary,
        flex: 1,
    },
    conversationTime: {
        fontSize: typography.sizes.xs,
        color: colors.textSecondary,
        marginLeft: spacing.sm,
    },
    conversationPreview: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
    },
    errorContainer: {
        backgroundColor: colors.error + '15',
        padding: spacing.md,
        margin: spacing.md,
        borderRadius: borderRadius.md,
    },
    errorText: {
        color: colors.error,
        fontSize: typography.sizes.sm,
        textAlign: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing.xl,
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: spacing.md,
    },
    emptyTitle: {
        fontSize: typography.sizes.xl,
        fontWeight: typography.weights.semibold,
        color: colors.textPrimary,
        marginBottom: spacing.sm,
    },
    emptyText: {
        fontSize: typography.sizes.md,
        color: colors.textSecondary,
        textAlign: 'center',
    },
});
