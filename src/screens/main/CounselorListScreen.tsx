// Counselor list screen - browse available counselors

import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    RefreshControl,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { supabase } from '../../lib/supabase';
import CounselorCard from '../../components/CounselorCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { colors, spacing, typography } from '../../styles/theme';
import { CounselorProfile, Profile, MainStackParamList } from '../../types';

type CounselorListScreenProps = {
    navigation: NativeStackNavigationProp<MainStackParamList>;
};

export default function CounselorListScreen({ navigation }: CounselorListScreenProps) {
    const [counselors, setCounselors] = useState<(CounselorProfile & { profile: Profile })[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');

    // Fetch counselors from database
    async function fetchCounselors() {
        try {
            // Fetch counselor profiles with joined profile data
            const { data, error } = await supabase
                .from('counselor_profiles')
                .select(`
          *,
          profile:profiles(*)
        `)
                .eq('is_available', true)
                .order('years_experience', { ascending: false });

            if (error) throw error;

            // Transform data to match our type
            const formattedData = data?.map((item: any) => ({
                ...item,
                profile: item.profile,
            })) || [];

            setCounselors(formattedData);
            setError('');
        } catch (err: any) {
            setError(err.message || 'Failed to load counselors');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    // Initial fetch
    useEffect(() => {
        fetchCounselors();
    }, []);

    // Handle pull to refresh
    function handleRefresh() {
        setRefreshing(true);
        fetchCounselors();
    }

    // Navigate to counselor profile
    function handleCounselorPress(counselorId: string) {
        navigation.navigate('CounselorProfile', { counselorId });
    }

    // Render counselor card
    function renderCounselor({ item }: { item: CounselorProfile & { profile: Profile } }) {
        return (
            <CounselorCard
                counselor={item}
                onPress={() => handleCounselorPress(item.id)}
            />
        );
    }

    // Empty state
    function renderEmpty() {
        if (loading) return null;
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>👨‍⚕️</Text>
                <Text style={styles.emptyTitle}>No Counselors Available</Text>
                <Text style={styles.emptyText}>
                    Check back later for available counselors
                </Text>
            </View>
        );
    }

    if (loading) {
        return <LoadingSpinner fullScreen message="Loading counselors..." />;
    }

    return (
        <View style={styles.container}>
            {error ? (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            ) : null}

            <FlatList
                data={counselors}
                keyExtractor={(item) => item.id}
                renderItem={renderCounselor}
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
    errorContainer: {
        backgroundColor: colors.error + '15',
        padding: spacing.md,
        margin: spacing.md,
        borderRadius: 8,
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
