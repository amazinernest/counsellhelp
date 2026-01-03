// Chat screen - real-time messaging interface

import React, { useEffect, useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Image,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import { colors, spacing, borderRadius, typography } from '../../styles/theme';
import { Message, MainStackParamList } from '../../types';

type ChatScreenProps = {
    navigation: NativeStackNavigationProp<MainStackParamList, 'Chat'>;
    route: RouteProp<MainStackParamList, 'Chat'>;
};

// Format timestamp to readable time
function formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Format date for separator
function formatDate(dateString: string): string {
    const date = new Date(dateString);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();

    if (isToday) {
        return `Today, ${formatTime(dateString)}`;
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ', ' + formatTime(dateString);
}

export default function ChatScreen({ navigation, route }: ChatScreenProps) {
    const { conversationId, otherUserName } = route.params;
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const flatListRef = useRef<FlatList>(null);

    // Hide default header and use custom
    useEffect(() => {
        navigation.setOptions({
            headerShown: false,
        });
    }, [navigation]);

    // Fetch messages
    async function fetchMessages() {
        try {
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .eq('conversation_id', conversationId)
                .order('created_at', { ascending: true });

            if (error) throw error;
            setMessages(data || []);
        } catch (err) {
            console.error('Error fetching messages:', err);
        } finally {
            setLoading(false);
        }
    }

    // Initial fetch
    useEffect(() => {
        fetchMessages();
    }, [conversationId]);

    // Subscribe to new messages
    useEffect(() => {
        const channel = supabase
            .channel(`chat:${conversationId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `conversation_id=eq.${conversationId}`,
                },
                (payload) => {
                    const newMsg = payload.new as Message;
                    setMessages((prev) => [...prev, newMsg]);
                    setIsTyping(false);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [conversationId]);

    // Scroll to bottom when messages change
    useEffect(() => {
        if (messages.length > 0) {
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [messages]);

    // Send message
    async function handleSend() {
        if (!newMessage.trim() || !user) return;

        const messageContent = newMessage.trim();
        setNewMessage('');
        setSending(true);

        try {
            // Insert message
            const { error: messageError } = await supabase.from('messages').insert({
                conversation_id: conversationId,
                sender_id: user.id,
                content: messageContent,
            });

            if (messageError) throw messageError;

            // Update conversation last_message_at
            await supabase
                .from('conversations')
                .update({ last_message_at: new Date().toISOString() })
                .eq('id', conversationId);

            // Simulate typing indicator
            setTimeout(() => setIsTyping(true), 1000);
            setTimeout(() => setIsTyping(false), 3000);

            // Get conversation to find recipient
            const { data: conversation } = await supabase
                .from('conversations')
                .select('client_id, counselor_id')
                .eq('id', conversationId)
                .single();

            if (conversation) {
                const recipientId =
                    conversation.client_id === user.id
                        ? conversation.counselor_id
                        : conversation.client_id;

                await supabase.from('notifications').insert({
                    user_id: recipientId,
                    type: 'new_message',
                    title: 'New Message',
                    body: messageContent.substring(0, 50) + (messageContent.length > 50 ? '...' : ''),
                    data: { conversation_id: conversationId },
                });
            }
        } catch (err) {
            console.error('Error sending message:', err);
            setNewMessage(messageContent);
        }

        setSending(false);
    }

    // Render message item
    function renderMessage({ item, index }: { item: Message; index: number }) {
        const isOwnMessage = item.sender_id === user?.id;
        const showDateSeparator = index === 0 ||
            new Date(item.created_at).toDateString() !== new Date(messages[index - 1].created_at).toDateString();

        return (
            <View>
                {/* Date Separator */}
                {showDateSeparator && (
                    <View style={styles.dateSeparator}>
                        <View style={styles.dateSeparatorLine} />
                        <Text style={styles.dateSeparatorText}>{formatDate(item.created_at)}</Text>
                        <View style={styles.dateSeparatorLine} />
                    </View>
                )}

                {/* Sender name for received messages */}
                {!isOwnMessage && (
                    <Text style={styles.senderName}>{otherUserName}</Text>
                )}

                {/* Message Bubble */}
                <View style={[
                    styles.messageRow,
                    isOwnMessage ? styles.messageRowOwn : styles.messageRowOther,
                ]}>
                    {/* Avatar for received messages */}
                    {!isOwnMessage && (
                        <View style={styles.messageAvatar}>
                            <Text style={styles.messageAvatarText}>
                                {otherUserName.charAt(0)}
                            </Text>
                        </View>
                    )}

                    <View style={[
                        styles.messageBubble,
                        isOwnMessage ? styles.messageBubbleOwn : styles.messageBubbleOther,
                    ]}>
                        <Text style={[
                            styles.messageText,
                            isOwnMessage ? styles.messageTextOwn : styles.messageTextOther,
                        ]}>
                            {item.content}
                        </Text>
                    </View>

                    {/* Avatar for sent messages */}
                    {isOwnMessage && (
                        <View style={[styles.messageAvatar, styles.messageAvatarOwn]}>
                            <Text style={styles.messageAvatarText}>👤</Text>
                        </View>
                    )}
                </View>

                {/* Time */}
                <Text style={[
                    styles.messageTime,
                    isOwnMessage ? styles.messageTimeOwn : styles.messageTimeOther,
                ]}>
                    {formatTime(item.created_at)}
                </Text>
            </View>
        );
    }

    if (loading) {
        return <LoadingSpinner fullScreen message="Loading messages..." />;
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={0}
        >
            {/* Custom Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>

                <View style={styles.headerAvatar}>
                    <Text style={styles.headerAvatarText}>
                        {otherUserName.charAt(0)}
                    </Text>
                    <View style={styles.onlineIndicator} />
                </View>

                <View style={styles.headerInfo}>
                    <Text style={styles.headerName}>{otherUserName}</Text>
                    <Text style={styles.headerStatus}>Active now</Text>
                </View>

                <TouchableOpacity style={styles.moreButton}>
                    <Text style={styles.moreIcon}>⋮</Text>
                </TouchableOpacity>
            </View>

            {/* Confidentiality Banner */}
            <View style={styles.confidentialityBanner}>
                <Text style={styles.confidentialityIcon}>🔒</Text>
                <Text style={styles.confidentialityText}>
                    This conversation is private and confidential. Your messages are encrypted and only visible to you and your counselor.
                </Text>
            </View>

            {/* Messages list */}
            <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={(item) => item.id}
                renderItem={renderMessage}
                contentContainerStyle={styles.messagesList}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>
                            Start the conversation by sending a message
                        </Text>
                    </View>
                }
            />

            {/* Typing Indicator */}
            {isTyping && (
                <View style={styles.typingContainer}>
                    <View style={styles.typingAvatar}>
                        <Text style={styles.typingAvatarText}>
                            {otherUserName.charAt(0)}
                        </Text>
                    </View>
                    <View style={styles.typingBubble}>
                        <View style={styles.typingDots}>
                            <View style={[styles.typingDot, styles.typingDot1]} />
                            <View style={[styles.typingDot, styles.typingDot2]} />
                            <View style={[styles.typingDot, styles.typingDot3]} />
                        </View>
                    </View>
                </View>
            )}

            {/* Input area */}
            <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                    <TextInput
                        style={styles.input}
                        placeholder="Type your message here..."
                        placeholderTextColor={colors.textLight}
                        value={newMessage}
                        onChangeText={setNewMessage}
                        multiline
                        maxLength={1000}
                    />
                    <TouchableOpacity style={styles.emojiButton}>
                        <Text style={styles.emojiIcon}>😊</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={[
                        styles.sendButton,
                        (!newMessage.trim() || sending) && styles.sendButtonDisabled,
                    ]}
                    onPress={handleSend}
                    disabled={!newMessage.trim() || sending}
                >
                    <Text style={styles.sendIcon}>➤</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingTop: spacing.xl,
        paddingBottom: spacing.md,
        backgroundColor: colors.background,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    confidentialityBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1a3a2a',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: '#2d5a3d',
    },
    confidentialityIcon: {
        fontSize: 14,
        marginRight: spacing.sm,
    },
    confidentialityText: {
        flex: 1,
        fontSize: 11,
        color: '#8fe3a8',
        lineHeight: 14,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backIcon: {
        fontSize: 24,
        color: colors.textPrimary,
    },
    headerAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.surfaceSecondary,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: spacing.sm,
        position: 'relative',
    },
    headerAvatarText: {
        fontSize: 18,
        fontWeight: typography.weights.bold,
        color: colors.textPrimary,
    },
    onlineIndicator: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: colors.success,
        borderWidth: 2,
        borderColor: colors.background,
    },
    headerInfo: {
        flex: 1,
        marginLeft: spacing.md,
    },
    headerName: {
        fontSize: typography.sizes.md,
        fontWeight: typography.weights.semibold,
        color: colors.textPrimary,
    },
    headerStatus: {
        fontSize: typography.sizes.sm,
        color: colors.success,
    },
    moreButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    moreIcon: {
        fontSize: 24,
        color: colors.textPrimary,
    },
    messagesList: {
        flexGrow: 1,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.md,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing.xl,
        paddingTop: spacing.xxl,
    },
    emptyText: {
        fontSize: typography.sizes.md,
        color: colors.textSecondary,
        textAlign: 'center',
    },
    dateSeparator: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: spacing.lg,
    },
    dateSeparatorLine: {
        flex: 1,
        height: 1,
        backgroundColor: colors.border,
    },
    dateSeparatorText: {
        fontSize: typography.sizes.xs,
        color: colors.textSecondary,
        paddingHorizontal: spacing.md,
        backgroundColor: colors.surface,
        borderRadius: borderRadius.full,
        paddingVertical: spacing.xs,
        overflow: 'hidden',
    },
    senderName: {
        fontSize: typography.sizes.xs,
        color: colors.textSecondary,
        marginLeft: 52,
        marginBottom: spacing.xs,
    },
    messageRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        marginBottom: spacing.xs,
    },
    messageRowOwn: {
        justifyContent: 'flex-end',
    },
    messageRowOther: {
        justifyContent: 'flex-start',
    },
    messageAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.surfaceSecondary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.sm,
    },
    messageAvatarOwn: {
        marginRight: 0,
        marginLeft: spacing.sm,
        backgroundColor: colors.surfaceLight,
    },
    messageAvatarText: {
        fontSize: 14,
        color: colors.textPrimary,
    },
    messageBubble: {
        maxWidth: '70%',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.lg,
    },
    messageBubbleOwn: {
        backgroundColor: colors.messageSent,
        borderBottomRightRadius: spacing.xs,
    },
    messageBubbleOther: {
        backgroundColor: colors.messageReceived,
        borderBottomLeftRadius: spacing.xs,
    },
    messageText: {
        fontSize: typography.sizes.md,
        lineHeight: 22,
    },
    messageTextOwn: {
        color: colors.textPrimary,
    },
    messageTextOther: {
        color: colors.textPrimary,
    },
    messageTime: {
        fontSize: typography.sizes.xs,
        color: colors.textSecondary,
        marginTop: spacing.xs,
        marginBottom: spacing.md,
    },
    messageTimeOwn: {
        textAlign: 'right',
        marginRight: 44,
    },
    messageTimeOther: {
        textAlign: 'left',
        marginLeft: 44,
    },
    typingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        marginBottom: spacing.sm,
    },
    typingAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.surfaceSecondary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.sm,
    },
    typingAvatarText: {
        fontSize: 14,
        color: colors.textPrimary,
    },
    typingBubble: {
        backgroundColor: colors.messageReceived,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.lg,
        borderBottomLeftRadius: spacing.xs,
    },
    typingDots: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    typingDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.textSecondary,
        marginHorizontal: 2,
    },
    typingDot1: {
        opacity: 0.4,
    },
    typingDot2: {
        opacity: 0.6,
    },
    typingDot3: {
        opacity: 0.8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        padding: spacing.md,
        backgroundColor: colors.surface,
        borderTopWidth: 0,
    },
    attachButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.surfaceSecondary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.sm,
    },
    attachIcon: {
        fontSize: 20,
        color: colors.textSecondary,
    },
    inputWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surfaceSecondary,
        borderRadius: borderRadius.xl,
        paddingHorizontal: spacing.md,
        minHeight: 44,
    },
    input: {
        flex: 1,
        fontSize: typography.sizes.md,
        color: colors.textPrimary,
        paddingVertical: spacing.sm,
        maxHeight: 100,
        outlineStyle: 'none' as any,
    },
    emojiButton: {
        padding: spacing.xs,
    },
    emojiIcon: {
        fontSize: 20,
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: spacing.sm,
    },
    sendButtonDisabled: {
        opacity: 0.5,
    },
    sendIcon: {
        fontSize: 18,
        color: colors.textPrimary,
    },
});
