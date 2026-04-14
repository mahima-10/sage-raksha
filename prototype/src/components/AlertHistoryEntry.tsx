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
  const isStillness = alert.alertType === 'stillness';

  // Stillness: amber border; fall: red for real, grey for false alarm.
  const accentColor = isStillness
    ? colors.warning
    : (isReal ? colors.danger : colors.textMuted);

  const typeLabel = isStillness ? 'Stillness' : 'Fall';
  const typeLabelColor = isStillness ? colors.warning : (isReal ? colors.danger : colors.textSecondary);

  return (
    <View style={[
      styles.card,
      { backgroundColor: colors.surface, borderLeftColor: accentColor, borderColor: colors.border }
    ]}>
      <View style={styles.row}>
        <View style={styles.content}>
          <View style={styles.typeRow}>
            <Text style={[styles.typeTag, { color: typeLabelColor }]}>{typeLabel}</Text>
            <Text style={[styles.outcome, { color: isReal ? colors.danger : colors.textSecondary }]}>
              {isReal ? ' · Real Fall' : ' · False Alarm'}
            </Text>
          </View>
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
    borderLeftWidth: 4,
    borderWidth: 1,
    padding: theme.spacing.lg,
    ...theme.shadows.card,
  },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  content: { flex: 1 },
  typeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  typeTag: { fontFamily: theme.fonts.bold, fontSize: theme.typography.size.sm },
  outcome: { fontFamily: theme.fonts.regular, fontSize: theme.typography.size.sm },
  time: { fontFamily: theme.fonts.regular, fontSize: theme.typography.size.sm, marginBottom: 4 },
  notes: { fontFamily: theme.fonts.regular, fontSize: theme.typography.size.sm, fontStyle: 'italic', marginTop: 3 },
});
