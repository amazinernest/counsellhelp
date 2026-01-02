// Counselor list screen - browse available counselors

import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    RefreshControl,
    TextInput,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { supabase } from '../../lib/supabase';
import CounselorCard from '../../components/CounselorCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { colors, spacing, borderRadius, typography } from '../../styles/theme';
import { CounselorProfile, Profile, MainStackParamList } from '../../types';

type CounselorListScreenProps = {
    navigation: NativeStackNavigationProp<MainStackParamList>;
};

// Filter categories
const filterCategories = [
    { id: 'all', label: 'All' },
    { id: 'anxiety', label: 'Anxiety' },
    { id: 'depression', label: 'Depression' },
    { id: 'relationships', label: 'Relationships' },
    { id: 'stress', label: 'Stress' },
    { id: 'family', label: 'Family' },
    { id: 'career', label: 'Career' },
];

export default function CounselorListScreen({ navigation }: CounselorListScreenProps) {
    const [counselors, setCounselors] = useState<(CounselorProfile & { profile: Profile })[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');

    // Fetch counselors from database
    async function fetchCounselors() {
        try {
            const { data, error } = await supabase
                .from('counselor_profiles')
                .select(`
                    *,
                    profile:profiles(*)
                `)
                .order('is_available', { ascending: false })
                .order('years_experience', { ascending: false });

            if (error) throw error;

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

    // Filter counselors based on search and active filter
    const filteredCounselors = counselors.filter((c) => {
        const matchesSearch = !searchQuery ||
            c.profile?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.bio?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesFilter = activeFilter === 'all' ||
            c.specialties?.some(s => s.toLowerCase().includes(activeFilter.toLowerCase()));

        return matchesSearch && matchesFilter;
    });

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
                <Text style={styles.emptyIcon}>🔍</Text>
                <Text style={styles.emptyTitle}>No Counselors Found</Text>
                <Text style={styles.emptyText}>
                    Try adjusting your search or filters
                </Text>
            </View>
        );
    }

    // Header component
    function renderHeader() {
        return (
            <View>
                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <Text style={styles.searchIcon}>🔍</Text>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search by name or specialty..."
                        placeholderTextColor={colors.textLight}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                {/* Filter Chips */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.filtersContainer}
                    contentContainerStyle={styles.filtersContent}
                >
                    {filterCategories.map((category) => (
                        <TouchableOpacity
                            key={category.id}
                            style={[
                                styles.filterChip,
                                activeFilter === category.id && styles.filterChipActive,
                            ]}
                            onPress={() => setActiveFilter(category.id)}
                        >
                            <Text
                                style={[
                                    styles.filterChipText,
                                    activeFilter === category.id && styles.filterChipTextActive,
                                ]}
                            >
                                {category.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Results count */}
                <View style={styles.resultsHeader}>
                    <Text style={styles.resultsText}>
                        {filteredCounselors.length} counselor{filteredCounselors.length !== 1 ? 's' : ''} found
                    </Text>
                </View>
            </View>
        );
    }

    if (loading) {
        return <LoadingSpinner fullScreen message="Loading counselors..." />;
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Search Counselors</Text>
            </View>

            {error ? (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            ) : null}

            <FlatList
                data={filteredCounselors}
                keyExtractor={(item) => item.id}
                renderItem={renderCounselor}
                ListHeaderComponent={renderHeader}
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
    header: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.xl,
        paddingBottom: spacing.md,
    },
    headerTitle: {
        fontSize: typography.sizes.xxl,
        fontWeight: typography.weights.bold,
        color: colors.textPrimary,
    },
    listContent: {
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.xxl,
        flexGrow: 1,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        marginHorizontal: spacing.sm,
        borderRadius: borderRadius.xl,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: spacing.md,
    },
    searchIcon: {
        fontSize: 16,
        marginRight: spacing.sm,
    },
    searchInput: {
        flex: 1,
        fontSize: typography.sizes.md,
        color: colors.textPrimary,
        paddingVertical: spacing.xs,
    },
    filtersContainer: {
        marginBottom: spacing.md,
    },
    filtersContent: {
        paddingHorizontal: spacing.sm,
    },
    filterChip: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.full,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        marginRight: spacing.sm,
    },
    filterChipActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    filterChipText: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
        fontWeight: typography.weights.medium,
    },
    filterChipTextActive: {
        color: colors.textPrimary,
    },
    resultsHeader: {
        paddingHorizontal: spacing.sm,
        marginBottom: spacing.md,
    },
    resultsText: {
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
        paddingTop: spacing.xxl,
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
