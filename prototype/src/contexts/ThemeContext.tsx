/**
 * ABOUTME: Theme context — provides light/dark color palettes to all screens and components.
 * ABOUTME: Dark mode uses elevation-only cards (no borders); light mode uses shadow-only cards.
 */

import React, { createContext, useContext } from 'react';
import { useSettingsStore } from '../store/settingsStore';

// ─── Dark palette ─────────────────────────────────────────────────────────────
const darkColors = {
  background: '#0D0F14',
  surface: '#161820',           // subtle elevation above background — no borders needed
  surfaceHighlight: '#1E2230',
  surfaceSubtle: '#252A38',

  text: '#F0F2F5',
  textSecondary: '#8892A8',
  textMuted: '#4E5668',
  textInverse: '#0D0F14',

  primary: '#4B8EF5',
  primaryMuted: '#162040',

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

  border: '#1E2230',
  borderSubtle: '#252A38',

  cardLightGreen: '#06200E',
  cardLightBlue: '#0F172A',
  cardLightRed: '#3A1515',
  cardLightAmber: '#341E08',
  cardLightGrey: '#1E2230',
};

// ─── Light palette ─────────────────────────────────────────────────────────────
const lightColors = {
  background: '#F0F2F5', // soft grey background instead of pure white/slate
  surface: '#FFFFFF',    // pure white cards
  surfaceHighlight: '#F9FAFB',
  surfaceSubtle: '#F3F4F6',

  text: '#111827',
  textSecondary: '#4B5563',
  textMuted: '#9299AE',
  textInverse: '#FFFFFF',

  primary: '#2563EB',
  primaryMuted: '#DBEAFE',

  danger: '#DC2626',
  dangerMuted: '#FEE2E2',
  dangerSurface: '#FEF2F2',

  warning: '#B45309',
  warningMuted: '#FEF3C7',
  warningSurface: '#FFFBEB',

  success: '#16A34A',
  successMuted: '#DCFCE7',

  alertBanner: '#EEF2FE',
  alertBannerAccent: '#2563EB',

  border: '#E8EAED',
  borderSubtle: '#F0F2F5',

  cardLightGreen: '#F0FDF4',
  cardLightBlue: '#EFF6FF',
  cardLightRed: '#FEF2F2',
  cardLightAmber: '#FFFBEB',
  cardLightGrey: '#F9FAFB',
};

export type ThemeColors = typeof darkColors;

interface ThemeContextValue {
  colors: ThemeColors;
  colorScheme: 'dark' | 'light';
  toggleColorScheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  colors: lightColors,
  colorScheme: 'light',
  toggleColorScheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { colorScheme, toggleColorScheme } = useSettingsStore();
  const colors = colorScheme === 'dark' ? darkColors : lightColors;
  return (
    <ThemeContext.Provider value={{ colors, colorScheme, toggleColorScheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
