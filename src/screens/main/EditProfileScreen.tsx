// Edit Profile screen - for counselors to update their profile

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Switch,
    Image,
    TextInput,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import Button from '../../components/Button';
import Input from '../../components/Input';
import LoadingSpinner from '../../components/LoadingSpinner';
import { colors, spacing, borderRadius, typography, shadows } from '../../styles/theme';
import { Specialty, CounselorProfile, AvailabilityHours, TimeSlot } from '../../types';

// Days of the week
const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
type DayOfWeek = typeof DAYS[number];

const DAY_LABELS: Record<DayOfWeek, string> = {
    monday: 'Mon',
    tuesday: 'Tue',
    wednesday: 'Wed',
    thursday: 'Thu',
    friday: 'Fri',
    saturday: 'Sat',
    sunday: 'Sun',
};

// Default empty availability
const DEFAULT_AVAILABILITY: AvailabilityHours = {
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
    sunday: [],
};
// Available specialty options
const specialtyOptions: { id: Specialty; label: string }[] = [
    { id: 'relationship', label: 'Relationship' },
    { id: 'academic', label: 'Academic' },
    { id: 'career', label: 'Career' },
    { id: 'mental_wellbeing', label: 'Mental Wellbeing' },
    { id: 'family', label: 'Family' },
    { id: 'stress_management', label: 'Stress Management' },
    { id: 'personal_development', label: 'Personal Development' },
];

export default function EditProfileScreen({ navigation }: any) {
    const { user, profile, refreshProfile } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Form state
    const [fullName, setFullName] = useState('');
    const [bio, setBio] = useState('');
    const [selectedSpecialties, setSelectedSpecialties] = useState<Specialty[]>([]);
    const [yearsExperience, setYearsExperience] = useState('');
    const [isAvailable, setIsAvailable] = useState(true);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [availabilityHours, setAvailabilityHours] = useState<AvailabilityHours>(DEFAULT_AVAILABILITY);

    // Load existing profile data
    useEffect(() => {
        async function loadProfile() {
            if (!user) return;

            try {
                // Get counselor profile
                const { data: counselorData } = await supabase
                    .from('counselor_profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (counselorData) {
                    setBio(counselorData.bio || '');
                    setSelectedSpecialties(counselorData.specialties || []);
                    setYearsExperience(counselorData.years_experience?.toString() || '');
                    setIsAvailable(counselorData.is_available ?? true);
                    setAvailabilityHours(counselorData.availability_hours || DEFAULT_AVAILABILITY);
                }

                // Set profile data
                if (profile) {
                    setFullName(profile.full_name || '');
                    setAvatarUrl(profile.avatar_url);
                }
            } catch (err) {
                console.error('Error loading profile:', err);
            } finally {
                setLoading(false);
            }
        }

        loadProfile();
    }, [user, profile]);

    // Toggle specialty selection
    function toggleSpecialty(specialty: Specialty) {
        setSelectedSpecialties((prev) =>
            prev.includes(specialty)
                ? prev.filter((s) => s !== specialty)
                : [...prev, specialty]
        );
    }

    // Toggle day availability
    function toggleDayAvailability(day: DayOfWeek) {
        setAvailabilityHours((prev) => ({
            ...prev,
            [day]: prev[day].length > 0
                ? [] // Turn off - remove slots
                : [{ start: '09:00', end: '17:00' }] // Turn on - add default 9-5
        }));
    }

    // Update time for a day
    function updateDayTime(day: DayOfWeek, field: 'start' | 'end', value: string) {
        setAvailabilityHours((prev) => ({
            ...prev,
            [day]: prev[day].length > 0
                ? [{ ...prev[day][0], [field]: value }]
                : [{ start: '09:00', end: '17:00', [field]: value }]
        }));
    }

    // Pick image from gallery
    async function pickImage() {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.5,
            });

            if (!result.canceled && result.assets[0]) {
                await uploadAvatar(result.assets[0].uri);
            }
        } catch (err) {
            console.error('Error picking image:', err);
            setError('Failed to pick image');
        }
    }

    // Upload avatar to Supabase Storage
    async function uploadAvatar(uri: string) {
        if (!user) return;

        try {
            // For web, we need to fetch the file differently
            const response = await fetch(uri);
            const blob = await response.blob();

            const fileExt = uri.split('.').pop() || 'jpg';
            const fileName = `${user.id}/avatar.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(fileName, blob, { upsert: true });

            if (uploadError) throw uploadError;

            // Get public URL
            const { data } = supabase.storage
                .from('avatars')
                .getPublicUrl(fileName);

            // Update profile with avatar URL
            await supabase
                .from('profiles')
                .update({ avatar_url: data.publicUrl })
                .eq('id', user.id);

            setAvatarUrl(data.publicUrl);
            setSuccess('Avatar updated!');
        } catch (err: any) {
            console.error('Error uploading avatar:', err);
            setError(err.message || 'Failed to upload avatar');
        }
    }

    // Save profile changes
    async function handleSave() {
        if (!fullName.trim()) {
            setError('Please enter your name');
            return;
        }
        if (!bio.trim()) {
            setError('Please enter your bio');
            return;
        }
        if (selectedSpecialties.length === 0) {
            setError('Please select at least one specialty');
            return;
        }

        if (!user) return;

        setSaving(true);
        setError('');
        setSuccess('');

        try {
            // Update profiles table
            const { error: profileError } = await supabase
                .from('profiles')
                .update({ full_name: fullName.trim() })
                .eq('id', user.id);

            if (profileError) throw profileError;

            // Update counselor_profiles table
            const { error: counselorError } = await supabase
                .from('counselor_profiles')
                .upsert({
                    id: user.id,
                    bio: bio.trim(),
                    specialties: selectedSpecialties,
                    years_experience: parseInt(yearsExperience) || 0,
                    is_available: isAvailable,
                    availability_hours: availabilityHours,
                });

            if (counselorError) throw counselorError;

            await refreshProfile();
            setSuccess('Profile saved successfully!');

            // Navigate back after short delay
            setTimeout(() => {
                navigation.goBack();
            }, 1000);
        } catch (err: any) {
            setError(err.message || 'Failed to save profile');
        }

        setSaving(false);
    }

    if (loading) {
        return <LoadingSpinner fullScreen message="Loading profile..." />;
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* Avatar section */}
            <View style={styles.avatarSection}>
                <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
                    {avatarUrl ? (
                        <Image source={{ uri: avatarUrl }} style={styles.avatar} />
                    ) : (
                        <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarText}>
                                {fullName?.charAt(0)?.toUpperCase() || '?'}
                            </Text>
                        </View>
                    )}
                    <View style={styles.editBadge}>
                        <Text style={styles.editBadgeText}>📷</Text>
                    </View>
                </TouchableOpacity>
                <Text style={styles.avatarHint}>Tap to change photo</Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
                <Input
                    label="Full Name"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChangeText={setFullName}
                    autoCapitalize="words"
                />

                <Input
                    label="Professional Bio"
                    placeholder="Tell clients about yourself..."
                    value={bio}
                    onChangeText={setBio}
                    multiline
                    numberOfLines={4}
                />

                {/* Specialties */}
                <Text style={styles.label}>Areas of Specialty</Text>
                <View style={styles.specialties}>
                    {specialtyOptions.map((specialty) => (
                        <TouchableOpacity
                            key={specialty.id}
                            style={[
                                styles.specialtyTag,
                                selectedSpecialties.includes(specialty.id) &&
                                styles.specialtyTagSelected,
                            ]}
                            onPress={() => toggleSpecialty(specialty.id)}
                            activeOpacity={0.7}
                        >
                            <Text
                                style={[
                                    styles.specialtyText,
                                    selectedSpecialties.includes(specialty.id) &&
                                    styles.specialtyTextSelected,
                                ]}
                            >
                                {specialty.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Input
                    label="Years of Experience"
                    placeholder="e.g., 5"
                    value={yearsExperience}
                    onChangeText={setYearsExperience}
                    keyboardType="number-pad"
                />

                {/* Availability Hours */}
                <Text style={styles.label}>Availability Hours</Text>
                <Text style={styles.availabilityHint}>
                    Set the days and times you're available for sessions
                </Text>
                <View style={styles.availabilityContainer}>
                    {DAYS.map((day) => {
                        const daySlots = availabilityHours[day];
                        const isEnabled = daySlots.length > 0;
                        const startTime = isEnabled ? daySlots[0].start : '09:00';
                        const endTime = isEnabled ? daySlots[0].end : '17:00';

                        return (
                            <View key={day} style={styles.dayRow}>
                                <TouchableOpacity
                                    style={[
                                        styles.dayToggle,
                                        isEnabled && styles.dayToggleActive,
                                    ]}
                                    onPress={() => toggleDayAvailability(day)}
                                >
                                    <Text style={[
                                        styles.dayText,
                                        isEnabled && styles.dayTextActive,
                                    ]}>
                                        {DAY_LABELS[day]}
                                    </Text>
                                </TouchableOpacity>
                                {isEnabled && (
                                    <View style={styles.timeInputs}>
                                        <TextInput
                                            style={styles.timeInput}
                                            value={startTime}
                                            onChangeText={(v) => updateDayTime(day, 'start', v)}
                                            placeholder="09:00"
                                            placeholderTextColor={colors.textLight}
                                        />
                                        <Text style={styles.timeSeparator}>to</Text>
                                        <TextInput
                                            style={styles.timeInput}
                                            value={endTime}
                                            onChangeText={(v) => updateDayTime(day, 'end', v)}
                                            placeholder="17:00"
                                            placeholderTextColor={colors.textLight}
                                        />
                                    </View>
                                )}
                            </View>
                        );
                    })}
                </View>

                {/* Availability toggle */}
                <View style={styles.toggleRow}>
                    <View style={styles.toggleContent}>
                        <Text style={styles.toggleLabel}>Available for new clients</Text>
                        <Text style={styles.toggleDescription}>
                            Show your profile in the counselor list
                        </Text>
                    </View>
                    <Switch
                        value={isAvailable}
                        onValueChange={setIsAvailable}
                        trackColor={{ false: colors.border, true: colors.primaryLight }}
                        thumbColor={isAvailable ? colors.primary : colors.textLight}
                    />
                </View>

                {error ? <Text style={styles.error}>{error}</Text> : null}
                {success ? <Text style={styles.success}>{success}</Text> : null}

                <Button
                    title="Save Changes"
                    onPress={handleSave}
                    loading={saving}
                    style={styles.button}
                />
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
    avatarSection: {
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
    },
    avatarPlaceholder: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        ...shadows.md,
    },
    avatarText: {
        fontSize: 48,
        fontWeight: typography.weights.bold,
        color: colors.textInverse,
    },
    editBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: colors.surface,
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        ...shadows.sm,
    },
    editBadgeText: {
        fontSize: 18,
    },
    avatarHint: {
        marginTop: spacing.sm,
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
    },
    form: {
        flex: 1,
    },
    label: {
        fontSize: typography.sizes.sm,
        fontWeight: typography.weights.medium,
        color: colors.textSecondary,
        marginBottom: spacing.sm,
    },
    specialties: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: spacing.md,
    },
    specialtyTag: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.full,
        marginRight: spacing.sm,
        marginBottom: spacing.sm,
    },
    specialtyTagSelected: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    specialtyText: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
    },
    specialtyTextSelected: {
        color: colors.textInverse,
        fontWeight: typography.weights.medium,
    },
    toggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.surface,
        padding: spacing.md,
        borderRadius: borderRadius.md,
        marginBottom: spacing.md,
    },
    toggleContent: {
        flex: 1,
        marginRight: spacing.md,
    },
    toggleLabel: {
        fontSize: typography.sizes.md,
        fontWeight: typography.weights.medium,
        color: colors.textPrimary,
        marginBottom: spacing.xs,
    },
    toggleDescription: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
    },
    error: {
        color: colors.error,
        fontSize: typography.sizes.sm,
        marginBottom: spacing.md,
        textAlign: 'center',
    },
    success: {
        color: colors.success,
        fontSize: typography.sizes.sm,
        marginBottom: spacing.md,
        textAlign: 'center',
    },
    button: {
        marginTop: spacing.md,
    },
});
