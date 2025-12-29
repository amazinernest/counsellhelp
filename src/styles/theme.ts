// Theme configuration - colors, spacing, typography
// Calming color palette suitable for a counseling app

export const colors = {
    // Primary - calming teal/blue
    primary: '#2A9D8F',
    primaryLight: '#40B4A7',
    primaryDark: '#1E7A70',

    // Secondary - warm coral for accents
    secondary: '#E76F51',
    secondaryLight: '#F4A261',

    // Neutrals
    background: '#F8F9FA',
    surface: '#FFFFFF',
    surfaceSecondary: '#F1F3F5',

    // Text
    textPrimary: '#212529',
    textSecondary: '#6C757D',
    textLight: '#ADB5BD',
    textInverse: '#FFFFFF',

    // Status
    success: '#40C057',
    warning: '#FD7E14',
    error: '#FA5252',
    info: '#339AF0',

    // Available/Unavailable badges
    available: '#40C057',
    unavailable: '#ADB5BD',

    // Borders
    border: '#DEE2E6',
    borderLight: '#E9ECEF',

    // Message bubbles
    messageSent: '#2A9D8F',
    messageReceived: '#E9ECEF',
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
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 4,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
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
