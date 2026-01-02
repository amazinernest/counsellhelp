// Personal Information screen - edit user details

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { colors, spacing, borderRadius, typography } from '../../styles/theme';
import { MainStackParamList } from '../../types';

type PersonalInfoScreenProps = {
    navigation: NativeStackNavigationProp<MainStackParamList, 'PersonalInfo'>;
};

export default function PersonalInfoScreen({ navigation }: PersonalInfoScreenProps) {
    const { profile, refreshProfile } = useAuth();
    const [fullName, setFullName] = useState(profile?.full_name || '');
    const [email] = useState(profile?.email || '');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSave() {
        if (!profile) return;

        setLoading(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ full_name: fullName })
                .eq('id', profile.id);

            if (error) throw error;

            await refreshProfile();
            Alert.alert('Success', 'Your information has been updated.');
            navigation.goBack();
        } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to update information');
        }
        setLoading(false);
    }

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
                <Text style={styles.headerTitle}>Personal Information</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.sectionDescription}>
                    Manage your personal details and contact information.
                </Text>

                <Input
                    label="Full Name"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChangeText={setFullName}
                    autoCapitalize="words"
                />

                <Input
                    label="Email Address"
                    placeholder="Your email"
                    value={email}
                    editable={false}
                    containerStyle={styles.disabledInput}
                />
                <Text style={styles.helperText}>
                    Email cannot be changed. Contact support if needed.
                </Text>

                <Input
                    label="Phone Number"
                    placeholder="Enter your phone number"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                />

                <Button
                    title="Save Changes"
                    onPress={handleSave}
                    loading={loading}
                    style={styles.saveButton}
                />
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
    disabledInput: {
        opacity: 0.6,
    },
    helperText: {
        fontSize: typography.sizes.xs,
        color: colors.textLight,
        marginTop: -spacing.sm,
        marginBottom: spacing.md,
    },
    saveButton: {
        marginTop: spacing.lg,
    },
});
