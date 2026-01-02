// Shared Notes screen - view notes shared by counselors

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing, borderRadius, typography } from '../../styles/theme';
import { MainStackParamList } from '../../types';

type SharedNotesScreenProps = {
    navigation: NativeStackNavigationProp<MainStackParamList, 'SharedNotes'>;
};

export default function SharedNotesScreen({ navigation }: SharedNotesScreenProps) {
    // Sample notes data
    const notes = [
        {
            id: '1',
            counselor: 'Dr. Sarah Jenkins',
            date: 'Dec 28, 2025',
            title: 'Session Summary - Anxiety Management',
            preview: 'Today we discussed breathing techniques and grounding exercises...',
        },
        {
            id: '2',
            counselor: 'Dr. Sarah Jenkins',
            date: 'Dec 21, 2025',
            title: 'Progress Review',
            preview: 'Great progress on identifying triggers. Continue practicing...',
        },
    ];

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
                <Text style={styles.headerTitle}>Shared Notes</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.sectionDescription}>
                    Notes and summaries shared by your counselors after sessions.
                </Text>

                {notes.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyIcon}>📋</Text>
                        <Text style={styles.emptyTitle}>No Notes Yet</Text>
                        <Text style={styles.emptyText}>
                            Notes from your counselors will appear here after sessions.
                        </Text>
                    </View>
                ) : (
                    notes.map((note) => (
                        <TouchableOpacity key={note.id} style={styles.noteCard}>
                            <View style={styles.noteHeader}>
                                <Text style={styles.noteTitle}>{note.title}</Text>
                                <Text style={styles.noteDate}>{note.date}</Text>
                            </View>
                            <Text style={styles.noteCounselor}>{note.counselor}</Text>
                            <Text style={styles.notePreview} numberOfLines={2}>
                                {note.preview}
                            </Text>
                        </TouchableOpacity>
                    ))
                )}
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
    emptyState: {
        alignItems: 'center',
        paddingVertical: spacing.xxl,
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
    noteCard: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing.md,
        marginBottom: spacing.md,
    },
    noteHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.xs,
    },
    noteTitle: {
        fontSize: typography.sizes.md,
        fontWeight: typography.weights.semibold,
        color: colors.textPrimary,
        flex: 1,
    },
    noteDate: {
        fontSize: typography.sizes.xs,
        color: colors.textSecondary,
        marginLeft: spacing.sm,
    },
    noteCounselor: {
        fontSize: typography.sizes.sm,
        color: colors.primary,
        marginBottom: spacing.sm,
    },
    notePreview: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
        lineHeight: 20,
    },
});
