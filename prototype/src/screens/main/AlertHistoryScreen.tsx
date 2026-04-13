/**
 * ABOUTME: Alert history — 2-column stats (light red/light grey) with compact white entries.
 * ABOUTME: Inter typography, Oura-style section labels.
 */

import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { useAlertStore } from '../../store/alertStore';
import { theme } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import AlertHistoryEntry from '../../components/AlertHistoryEntry';

export default function AlertHistoryScreen() {
  const { colors } = useTheme();
  const { user } = useAuthStore();
  const { getAlertsByHomeId } = useAlertStore();

  const resolved = getAlertsByHomeId(user?.linkedHomeIds[0] || '')
    .filter(a => a.state === 'resolved')
    .sort((a, b) => new Date(b.triggeredAt).getTime() - new Date(a.triggeredAt).getTime());

  const realFalls = resolved.filter(a => a.outcome === 'real_fall').length;
  const falseAlarms = resolved.filter(a => a.outcome === 'false_alarm').length;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>History</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* Stats grid */}
        {resolved.length > 0 && (
          <View style={styles.grid}>
            <View style={[styles.gridCard, { backgroundColor: colors.cardLightRed }]}>
              <Text style={[styles.gridLabel, { color: colors.textMuted }]}>REAL FALLS</Text>
              <Text style={[styles.gridValue, { color: colors.danger }]}>{realFalls}</Text>
            </View>
            <View style={[styles.gridCard, { backgroundColor: colors.cardLightGrey }]}>
              <Text style={[styles.gridLabel, { color: colors.textMuted }]}>FALSE ALARMS</Text>
              <Text style={[styles.gridValue, { color: colors.text }]}>{falseAlarms}</Text>
            </View>
          </View>
        )}

        {resolved.length > 0 && (
          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>ALL EVENTS</Text>
        )}

        {resolved.map(alert => <AlertHistoryEntry key={alert.id} alert={alert} />)}

        {resolved.length === 0 && (
          <View style={styles.empty}>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No history yet</Text>
            <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>Resolved alerts will appear here.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: { paddingHorizontal: theme.spacing.xl, paddingTop: theme.spacing.lg, paddingBottom: theme.spacing.md },
  title: { fontFamily: theme.fonts.black, fontSize: theme.typography.size.display, letterSpacing: -0.5 },
  container: { padding: theme.spacing.xl, paddingTop: theme.spacing.md, paddingBottom: theme.spacing.massive },

  grid: { flexDirection: 'row', gap: theme.spacing.md, marginBottom: theme.spacing.section },
  gridCard: {
    flex: 1,
    borderRadius: theme.radius.md,
    padding: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
  },
  gridLabel: { fontFamily: theme.fonts.medium, fontSize: 11, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 6 },
  gridValue: { fontFamily: theme.fonts.bold, fontSize: theme.typography.size.xxxl, letterSpacing: -0.5 },

  sectionLabel: { fontFamily: theme.fonts.medium, fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: theme.spacing.md },

  empty: { paddingTop: theme.spacing.massive, alignItems: 'center' },
  emptyTitle: { fontFamily: theme.fonts.semibold, fontSize: theme.typography.size.lg, marginBottom: 6 },
  emptyDesc: { fontFamily: theme.fonts.regular, fontSize: theme.typography.size.base },
});
