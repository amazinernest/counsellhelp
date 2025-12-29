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
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import MessageBubble from '../../components/MessageBubble';
import LoadingSpinner from '../../components/LoadingSpinner';
import { colors, spacing, borderRadius, typography } from '../../styles/theme';
import { Message, MainStackParamList } from '../../types';

type ChatScreenProps = {
    navigation: NativeStackNavigationProp<MainStackParamList, 'Chat'>;
    route: RouteProp<MainStackParamList, 'Chat'>;
};

export default function ChatScreen({ navigation, route }: ChatScreenProps) {
    const { conversationId, otherUserName } = route.params;
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const flatListRef = useRef<FlatList>(null);

    // Set header title
    useEffect(() => {
        navigation.setOptions({
            title: otherUserName,
        });
    }, [navigation, otherUserName]);

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

            // Get conversation to find recipient
            const { data: conversation } = await supabase
                .from('conversations')
                .select('client_id, counselor_id')
                .eq('id', conversationId)
                .single();

            if (conversation) {
                // Determine recipient
                const recipientId =
                    conversation.client_id === user.id
                        ? conversation.counselor_id
                        : conversation.client_id;

                // Create notification for recipient
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
            setNewMessage(messageContent); // Restore message on error
        }

        setSending(false);
    }

    // Render message
    function renderMessage({ item }: { item: Message }) {
        return (
            <MessageBubble
                message={item}
                isOwnMessage={item.sender_id === user?.id}
            />
        );
    }

    if (loading) {
        return <LoadingSpinner fullScreen message="Loading messages..." />;
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={90}
        >
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

            {/* Input area */}
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Type a message..."
                    placeholderTextColor={colors.textLight}
                    value={newMessage}
                    onChangeText={setNewMessage}
                    multiline
                    maxLength={1000}
                />
                <TouchableOpacity
                    style={[
                        styles.sendButton,
                        (!newMessage.trim() || sending) && styles.sendButtonDisabled,
                    ]}
                    onPress={handleSend}
                    disabled={!newMessage.trim() || sending}
                >
                    <Text style={styles.sendButtonText}>Send</Text>
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
    messagesList: {
        flexGrow: 1,
        paddingVertical: spacing.md,
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
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        padding: spacing.md,
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    input: {
        flex: 1,
        backgroundColor: colors.background,
        borderRadius: borderRadius.lg,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        fontSize: typography.sizes.md,
        color: colors.textPrimary,
        maxHeight: 100,
        marginRight: spacing.sm,
    },
    sendButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.lg,
        justifyContent: 'center',
    },
    sendButtonDisabled: {
        opacity: 0.5,
    },
    sendButtonText: {
        color: colors.textInverse,
        fontSize: typography.sizes.md,
        fontWeight: typography.weights.semibold,
    },
});
