/**
 * ABOUTME: Dashboard alert banner — calm, border-less card with left accent line.
 * ABOUTME: Pulsing icon for active alerts; blue for active, red only for escalated.
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Alert } from '../types';
import { theme } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';
import { AlertCircle, ChevronRight } from 'lucide-react-native';
import { formatDistanceToNow } from 'date-fns';

interface Props {
  alert: Alert;
  onPress: () => void;
}

export default function AlertBanner({ alert, onPress }: Props) {
  const { colors } = useTheme();
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (alert.state === 'active' || alert.state === 'escalated') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 0.4, duration: 800, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      ).start();
    }
    return () => pulse.stopAnimation();
  }, [alert.state]);

  // Use a calm red background for active alerts instead of raw white.
  const isEscalatedOrActive = alert.state === 'active' || alert.state === 'escalated';
  const bgColor = isEscalatedOrActive ? colors.cardLightRed : colors.surface;
  const accentColor = isEscalatedOrActive ? colors.danger : colors.primary;

  return (
    <TouchableOpacity
      style={[
        styles.banner,
        { backgroundColor: bgColor, borderLeftColor: accentColor, borderColor: isEscalatedOrActive ? colors.dangerMuted : colors.border }
      ]}
      onPress={onPress}
      activeOpacity={0.82}
    >
      <Animated.View style={{ opacity: pulse }}>
        <AlertCircle size={20} color={accentColor} />
      </Animated.View>

      <View style={styles.content}>
        <Text style={[styles.title, { color: accentColor }]}>
          {isEscalatedOrActive ? 'Fall Detected' : 'Alert Acknowledged'}
        </Text>
        <Text style={[styles.time, { color: isEscalatedOrActive ? colors.danger : colors.textSecondary }]}>
          {formatDistanceToNow(new Date(alert.triggeredAt))} ago · Tap to respond
        </Text>
      </View>

      <ChevronRight size={17} color={colors.textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: theme.radius.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderLeftWidth: 4,
    borderWidth: 1,
    gap: theme.spacing.md,
    ...theme.shadows.card,
  },
  content: { flex: 1 },
  title: { fontFamily: theme.fonts.semibold, fontSize: theme.typography.size.base, marginBottom: 3 },
  time: { fontFamily: theme.fonts.regular, fontSize: theme.typography.size.sm },
});
