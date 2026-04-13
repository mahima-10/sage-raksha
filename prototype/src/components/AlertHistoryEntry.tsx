/**
 * ABOUTME: Alert history row — left-border color accent distinguishes outcome type.
 * ABOUTME: No full background tint, just an accent border + Inter typography.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Alert } from '../types';
import { theme } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';
import { format } from 'date-fns';

interface Props {
  alert: Alert;
}

export default function AlertHistoryEntry({ alert }: Props) {
  const { colors } = useTheme();
  const isReal = alert.outcome === 'real_fall';
  const accentColor = isReal ? colors.danger : colors.textMuted;

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderLeftColor: accentColor }]}>
      <View style={styles.row}>
        <View style={styles.content}>
          <Text style={[styles.outcome, { color: isReal ? colors.danger : colors.textSecondary }]}>
            {isReal ? 'Real Fall' : 'False Alarm'}
          </Text>
          <Text style={[styles.time, { color: colors.textMuted }]}>
            {format(new Date(alert.triggeredAt), 'MMM d, h:mm a')}
          </Text>
          {alert.notes ? (
            <Text style={[styles.notes, { color: colors.textSecondary }]} numberOfLines={2}>{alert.notes}</Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.sm,
    borderLeftWidth: 3,
    padding: theme.spacing.lg,
    ...theme.shadows.card,
  },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  content: { flex: 1 },
  outcome: { fontFamily: theme.fonts.semibold, fontSize: theme.typography.size.base, marginBottom: 4 },
  time: { fontFamily: theme.fonts.regular, fontSize: theme.typography.size.sm, marginBottom: 4 },
  notes: { fontFamily: theme.fonts.regular, fontSize: theme.typography.size.sm, fontStyle: 'italic', marginTop: 3 },
});
