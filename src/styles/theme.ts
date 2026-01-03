// Theme configuration - colors, spacing, typography
// Dark theme color palette for a professional counseling app

export const colors = {
    // Primary - vibrant blue for actions
    primary: '#2563EB',
    primaryLight: '#3B82F6',
    primaryDark: '#1D4ED8',

    // Secondary - warm coral for accents
    secondary: '#E76F51',
    secondaryLight: '#F4A261',

    // Dark theme backgrounds
    background: '#0D1B2A',
    backgroundSecondary: '#1B2838',
    surface: '#1B2838',
    surfaceSecondary: '#243447',
    surfaceLight: '#2D3F52',

    // Text colors for dark theme
    textPrimary: '#FFFFFF',
    textSecondary: '#E5E7EB',  // Updated: lighter for better visibility
    textLight: '#D1D5DB',      // Updated: lighter for better visibility
    textInverse: '#FFFFFF',

    // Status
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',

    // Available/Unavailable badges
    available: '#22C55E',
    unavailable: '#6B7280',

    // Borders
    border: '#374151',
    borderLight: '#4B5563',

    // Message bubbles
    messageSent: '#2563EB',
    messageReceived: '#374151',

    // Ratings
    star: '#FBBF24',

    // Tags/Chips
    tagBackground: '#374151',
    tagText: '#F3F4F6',  // Updated: lighter for better visibility
};

export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

export const borderRadius = {
    sm: 4,
    md: 8,
    lg: 16,
    xl: 24,
    full: 9999,
};

export const typography = {
    // Font sizes
    sizes: {
        xs: 12,
        sm: 14,
        md: 16,
        lg: 18,
        xl: 20,
        xxl: 24,
        xxxl: 32,
    },
    // Font weights
    weights: {
        regular: '400' as const,
        medium: '500' as const,
        semibold: '600' as const,
        bold: '700' as const,
    },
};

export const shadows = {
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
        elevation: 2,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 4,
        elevation: 4,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
        elevation: 8,
    },
};

export default {
    colors,
    spacing,
    borderRadius,
    typography,
    shadows,
};
