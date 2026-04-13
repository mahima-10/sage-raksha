/**
 * ABOUTME: Design tokens for SAGE Raksha — Oura Ring x Apple Health aesthetic.
 * ABOUTME: Premium health-tech, crisper corners, Inter font, elevation-only cards.
 */

export const theme = {
  colors: {
    // Backgrounds
    background: '#0D0F14',
    surface: '#161820',
    surfaceHighlight: '#1E2230',
    surfaceSubtle: '#252A38',

    // Text
    text: '#F0F2F5',
    textSecondary: '#8892A8',
    textMuted: '#4E5668',
    textInverse: '#0D0F14',

    // Brand
    primary: '#4B8EF5',
    primaryMuted: '#162040',

    // Status
    danger: '#DC2626',
    dangerMuted: '#2A1010',
    dangerSurface: '#3A1515',

    warning: '#D97706',
    warningMuted: '#2A1A05',
    warningSurface: '#341E08',

    success: '#34C759',
    successMuted: '#08200F',

    alertBanner: '#151B2E',
    alertBannerAccent: '#4B8EF5',

    border: '#1E2230',          // only used for inputs / dividers, NOT cards
    borderSubtle: '#252A38',
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    section: 40,   // between major sections
    huge: 48,
    massive: 64,
  },

  radius: {
    xs: 4,
    sm: 8,
    md: 14,        // card radius (12-14px)
    lg: 16,
    hero: 24,      // hero blocks, status rings
    full: 9999,
  },

  typography: {
    size: {
      xs: 11,
      sm: 13,
      base: 15,
      lg: 17,
      xl: 20,
      xxl: 24,
      xxxl: 30,
      display: 34,
      hero: 48,
    },
    // Keep weight for fallback; prefer fonts.* for fontFamily
    weight: {
      regular: 'normal' as const,
      medium: '500' as const,
      semibold: '600' as const,
      bold: 'bold' as const,
    },
  },

  // Inter font family names — loaded in App.tsx
  fonts: {
    regular: 'Inter-Regular',
    medium: 'Inter-Medium',
    semibold: 'Inter-SemiBold',
    bold: 'Inter-Bold',
    black: 'Inter-Black',
  },

  shadows: {
    // Health dashboard styling — subtle or no shadow, relies on 1px border.
    card: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.03,
      shadowRadius: 2,
      elevation: 0,
    },
    hero: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.35,
      shadowRadius: 20,
      elevation: 8,
    },
    lifted: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.4,
      shadowRadius: 28,
      elevation: 12,
    },
  },
};
