/**
 * ABOUTME: Sensor card — left border status accent, elevation-only (no card borders).
 * ABOUTME: Inter typography, floats above background via shadow.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Sensor } from '../types';
import { theme } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';
import { Wifi, WifiOff } from 'lucide-react-native';
import { formatDistanceToNow } from 'date-fns';

interface Props {
  sensor: Sensor;
  onPress?: () => void;
  alertCount?: number;
}

export default function SensorCard({ sensor, onPress, alertCount }: Props) {
  const { colors } = useTheme();
  const isOnline = sensor.status === 'online';
  const statusColor = isOnline ? colors.success : colors.textMuted;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderLeftColor: statusColor, borderColor: colors.border }
      ]}
      onPress={onPress}
      activeOpacity={0.82}
    >
      <View style={styles.row}>
        <View style={[styles.iconBox, { backgroundColor: isOnline ? colors.successMuted : colors.surfaceHighlight }]}>
          {isOnline
            ? <Wifi size={17} color={colors.success} />
            : <WifiOff size={17} color={colors.textMuted} />
          }
        </View>

        <View style={styles.info}>
          <Text style={[styles.label, { color: colors.text }]}>{sensor.label}</Text>
          <Text style={[styles.sub, { color: colors.textSecondary }]}>
            {isOnline ? `Active · ${formatDistanceToNow(new Date(sensor.lastHeartbeat))} ago` : 'Offline'}
          </Text>
        </View>

        {alertCount !== undefined && alertCount > 0 && (
          <View style={[styles.badge, { backgroundColor: colors.danger }]}>
            <Text style={styles.badgeText}>{alertCount}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.sm,
    borderLeftWidth: 4,
    borderWidth: 1,
    paddingVertical: theme.spacing.lg,
    paddingRight: theme.spacing.lg,
    paddingLeft: theme.spacing.md,
    ...theme.shadows.card,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  iconBox: {
    width: 38, height: 38, borderRadius: theme.radius.sm,
    justifyContent: 'center', alignItems: 'center', marginRight: theme.spacing.md,
  },
  info: { flex: 1 },
  label: { fontFamily: theme.fonts.semibold, fontSize: theme.typography.size.base, marginBottom: 3 },
  sub: { fontFamily: theme.fonts.regular, fontSize: theme.typography.size.sm },
  badge: {
    borderRadius: theme.radius.full, minWidth: 22, height: 22,
    justifyContent: 'center', alignItems: 'center', paddingHorizontal: 6,
  },
  badgeText: { fontFamily: theme.fonts.bold, color: '#fff', fontSize: theme.typography.size.xs },
});
