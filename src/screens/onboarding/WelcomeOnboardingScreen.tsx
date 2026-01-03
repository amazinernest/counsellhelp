// Welcome Onboarding Screen - shown to first-time users

import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    FlatList,
    Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing, borderRadius, typography } from '../../styles/theme';

const { width, height } = Dimensions.get('window');

interface OnboardingSlide {
    id: string;
    emoji: string;
    title: string;
    subtitle: string;
    description: string;
    gradient: string[];
}

const slides: OnboardingSlide[] = [
    {
        id: '1',
        emoji: '💚',
        title: 'Your Mental Health Matters',
        subtitle: 'Welcome to CounsellHelp',
        description: 'A safe space where you can speak freely, be heard, and get the support you deserve. No judgment, just care.',
        gradient: ['#1a472a', '#2d5a3d'],
    },
    {
        id: '2',
        emoji: '🤝',
        title: 'Professional Counselors',
        subtitle: 'Expert Help, Anytime',
        description: 'Connect with verified, experienced counselors who specialize in relationships, career, mental wellbeing, and more.',
        gradient: ['#1e3a5f', '#2d5a8a'],
    },
    {
        id: '3',
        emoji: '🔒',
        title: '100% Confidential',
        subtitle: 'Your Privacy, Protected',
        description: 'All conversations are encrypted and private. What you share stays between you and your counselor. Always.',
        gradient: ['#4a1a5c', '#6b2d7b'],
    },
];

interface Props {
    onComplete: () => void;
}

export default function WelcomeOnboardingScreen({ onComplete }: Props) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);
    const scrollX = useRef(new Animated.Value(0)).current;

    async function handleComplete() {
        await AsyncStorage.setItem('hasSeenOnboarding', 'true');
        onComplete();
    }

    function handleNext() {
        if (currentIndex < slides.length - 1) {
            flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
            setCurrentIndex(currentIndex + 1);
        } else {
            handleComplete();
        }
    }

    function handleSkip() {
        handleComplete();
    }

    function renderSlide({ item, index }: { item: OnboardingSlide; index: number }) {
        return (
            <View style={[styles.slide, { backgroundColor: item.gradient[0] }]}>
                {/* Decorative circles */}
                <View style={[styles.decorCircle1, { backgroundColor: item.gradient[1] }]} />
                <View style={[styles.decorCircle2, { backgroundColor: item.gradient[1] }]} />

                <View style={styles.slideContent}>
                    {/* Emoji icon */}
                    <View style={[styles.emojiContainer, { backgroundColor: item.gradient[1] }]}>
                        <Text style={styles.emoji}>{item.emoji}</Text>
                    </View>

                    {/* Text content */}
                    <Text style={styles.subtitle}>{item.subtitle}</Text>
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.description}>{item.description}</Text>
                </View>
            </View>
        );
    }

    function onViewableItemsChanged({ viewableItems }: any) {
        if (viewableItems.length > 0) {
            setCurrentIndex(viewableItems[0].index || 0);
        }
    }

    const viewabilityConfig = { viewAreaCoveragePercentThreshold: 50 };

    return (
        <View style={styles.container}>
            <FlatList
                ref={flatListRef}
                data={slides}
                renderItem={renderSlide}
                keyExtractor={(item) => item.id}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                    { useNativeDriver: false }
                )}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
            />

            {/* Bottom controls */}
            <View style={styles.controls}>
                {/* Pagination dots */}
                <View style={styles.pagination}>
                    {slides.map((_, index) => {
                        const inputRange = [
                            (index - 1) * width,
                            index * width,
                            (index + 1) * width,
                        ];
                        const dotWidth = scrollX.interpolate({
                            inputRange,
                            outputRange: [8, 24, 8],
                            extrapolate: 'clamp',
                        });
                        const opacity = scrollX.interpolate({
                            inputRange,
                            outputRange: [0.4, 1, 0.4],
                            extrapolate: 'clamp',
                        });

                        return (
                            <Animated.View
                                key={index}
                                style={[
                                    styles.dot,
                                    { width: dotWidth, opacity },
                                ]}
                            />
                        );
                    })}
                </View>

                {/* Buttons */}
                <View style={styles.buttonRow}>
                    {currentIndex < slides.length - 1 ? (
                        <>
                            <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
                                <Text style={styles.skipText}>Skip</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
                                <Text style={styles.nextText}>Next</Text>
                                <Text style={styles.nextArrow}>→</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <TouchableOpacity onPress={handleComplete} style={styles.getStartedButton}>
                            <Text style={styles.getStartedText}>Get Started</Text>
                            <Text style={styles.getStartedEmoji}>🚀</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    slide: {
        width,
        height: height * 0.75,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        position: 'relative',
    },
    decorCircle1: {
        position: 'absolute',
        width: 300,
        height: 300,
        borderRadius: 150,
        top: -100,
        right: -100,
        opacity: 0.3,
    },
    decorCircle2: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
        bottom: -50,
        left: -50,
        opacity: 0.2,
    },
    slideContent: {
        alignItems: 'center',
        paddingHorizontal: spacing.xl,
    },
    emojiContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    emoji: {
        fontSize: 48,
    },
    subtitle: {
        fontSize: typography.sizes.sm,
        color: 'rgba(255,255,255,0.7)',
        fontWeight: typography.weights.medium,
        letterSpacing: 2,
        textTransform: 'uppercase',
        marginBottom: spacing.sm,
    },
    title: {
        fontSize: 32,
        fontWeight: typography.weights.bold,
        color: '#ffffff',
        textAlign: 'center',
        marginBottom: spacing.md,
    },
    description: {
        fontSize: typography.sizes.md,
        color: 'rgba(255,255,255,0.8)',
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: spacing.lg,
    },
    controls: {
        flex: 1,
        backgroundColor: colors.background,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.xl,
        paddingBottom: spacing.xxl,
        justifyContent: 'space-between',
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dot: {
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.primary,
        marginHorizontal: 4,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    skipButton: {
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
    },
    skipText: {
        fontSize: typography.sizes.md,
        color: colors.textSecondary,
        fontWeight: typography.weights.medium,
    },
    nextButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primary,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xl,
        borderRadius: borderRadius.full,
    },
    nextText: {
        fontSize: typography.sizes.md,
        color: colors.textPrimary,
        fontWeight: typography.weights.semibold,
        marginRight: spacing.sm,
    },
    nextArrow: {
        fontSize: 18,
        color: colors.textPrimary,
    },
    getStartedButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.full,
    },
    getStartedText: {
        fontSize: typography.sizes.lg,
        color: colors.textPrimary,
        fontWeight: typography.weights.bold,
        marginRight: spacing.sm,
    },
    getStartedEmoji: {
        fontSize: 20,
    },
});
