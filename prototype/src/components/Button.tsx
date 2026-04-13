/**
 * ABOUTME: Reusable button — Inter Bold labels, crisper radius, all variants.
 * ABOUTME: Consumes active theme colors for light/dark mode support.
 */

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { theme } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';

type Variant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

export default function Button({
  title, onPress, variant = 'primary', size = 'md',
  disabled = false, loading = false, style,
}: ButtonProps) {
  const { colors } = useTheme();
  const isDisabled = disabled || loading;

  const bgColor: Record<Variant, string> = {
    primary: colors.primary,
    secondary: colors.surfaceHighlight,
    outline: 'transparent',
    danger: colors.danger,
    ghost: 'transparent',
  };

  const textColor: Record<Variant, string> = {
    primary: '#fff',
    secondary: colors.text,
    outline: colors.textSecondary,
    danger: '#fff',
    ghost: colors.primary,
  };

  const sizeStyle = {
    sm: { paddingVertical: 9, paddingHorizontal: 16 },
    md: { paddingVertical: 15, paddingHorizontal: 20 },
    lg: { paddingVertical: 19, paddingHorizontal: 24 },
  }[size];

  const textSize = {
    sm: theme.typography.size.sm,
    md: theme.typography.size.base,
    lg: theme.typography.size.lg,
  }[size];

  return (
    <TouchableOpacity
      style={[
        styles.base,
        { backgroundColor: bgColor[variant] },
        variant === 'outline' && { borderWidth: 1.5, borderColor: colors.border },
        sizeStyle,
        isDisabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.78}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' || variant === 'ghost' ? colors.primary : '#fff'} size="small" />
      ) : (
        <Text style={[styles.label, { color: textColor[variant], fontSize: textSize }]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: { opacity: 0.38 },
  label: { fontFamily: theme.fonts.semibold, letterSpacing: 0.1 },
});
