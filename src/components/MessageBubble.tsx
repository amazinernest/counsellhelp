// Message bubble component for chat interface

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../styles/theme';
import { Message } from '../types';

interface MessageBubbleProps {
    message: Message;
    isOwnMessage: boolean;
}

// Format timestamp to readable time
function formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function MessageBubble({ message, isOwnMessage }: MessageBubbleProps) {
    return (
        <View
            style={[
                styles.container,
                isOwnMessage ? styles.ownContainer : styles.otherContainer,
            ]}
        >
            <View
                style={[
                    styles.bubble,
                    isOwnMessage ? styles.ownBubble : styles.otherBubble,
                ]}
            >
                <Text
                    style={[
                        styles.content,
                        isOwnMessage ? styles.ownContent : styles.otherContent,
                    ]}
                >
                    {message.content}
                </Text>
                <Text
                    style={[
                        styles.time,
                        isOwnMessage ? styles.ownTime : styles.otherTime,
                    ]}
                >
                    {formatTime(message.created_at)}
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginVertical: spacing.xs,
        paddingHorizontal: spacing.md,
    },
    ownContainer: {
        alignItems: 'flex-end',
    },
    otherContainer: {
        alignItems: 'flex-start',
    },
    bubble: {
        maxWidth: '80%',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.lg,
    },
    ownBubble: {
        backgroundColor: colors.messageSent,
        borderBottomRightRadius: spacing.xs,
    },
    otherBubble: {
        backgroundColor: colors.messageReceived,
        borderBottomLeftRadius: spacing.xs,
    },
    content: {
        fontSize: typography.sizes.md,
        lineHeight: 22,
    },
    ownContent: {
        color: colors.textInverse,
    },
    otherContent: {
        color: colors.textPrimary,
    },
    time: {
        fontSize: typography.sizes.xs,
        marginTop: spacing.xs,
        alignSelf: 'flex-end',
    },
    ownTime: {
        color: colors.textInverse + 'CC',
    },
    otherTime: {
        color: colors.textSecondary,
    },
});
