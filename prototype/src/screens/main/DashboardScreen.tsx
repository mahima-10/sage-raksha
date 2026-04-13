/**
 * ABOUTME: Dashboard — Oura Ring-inspired 2-column metrics grid + sensor list + recent activity.
 * ABOUTME: Clean, airy health dashboard aesthetic using soft colored cards.
 */

import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { useAlertStore } from '../../store/alertStore';
import { useSensorStore } from '../../store/sensorStore';
import { useHomeStore } from '../../store/homeStore';
import { theme } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import SensorCard from '../../components/SensorCard';
import AlertBanner from '../../components/AlertBanner';
import AlertHistoryEntry from '../../components/AlertHistoryEntry';
import Button from '../../components/Button';
import { formatDistanceToNow } from 'date-fns';

export default function DashboardScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { user } = useAuthStore();
  const { getHomeById } = useHomeStore();
  const home = getHomeById(user?.linkedHomeIds[0] || '');

  const { getActiveAlerts, getEscalatedAlerts, getAcknowledgedAlerts, getAlertsBySensorId, getAlertsByHomeId } = useAlertStore();
  const { getSensorsByHomeId } = useSensorStore();

  const activeAlerts = [...getEscalatedAlerts(), ...getActiveAlerts(), ...getAcknowledgedAlerts()];
  const sensors = getSensorsByHomeId(home?.id || '');
  const onlineCount = sensors.filter(s => s.status === 'online').length;

  // Recent alert history (last 3 resolved)
  const allHistory = getAlertsByHomeId(home?.id || '').filter(a => a.state === 'resolved');
  const recentHistory = [...allHistory]
    .sort((a, b) => new Date(b.triggeredAt).getTime() - new Date(a.triggeredAt).getTime())
    .slice(0, 3);

  // Stats calculation
  const today = new Date().toISOString().split('T')[0];
  const allAlerts = [...activeAlerts, ...allHistory];
  const alertsToday = allAlerts.filter(a => a.triggeredAt.startsWith(today)).length;
  
  const lastAlert = [...allAlerts].sort((a, b) => new Date(b.triggeredAt).getTime() - new Date(a.triggeredAt).getTime())[0];
  const lastAlertTime = lastAlert ? formatDistanceToNow(new Date(lastAlert.triggeredAt), { addSuffix: true }) : '--';
  
  // Mock average response until we have real data measuring trigger -> ack times
  const avgResponse = allHistory.length > 0 ? '45s' : '--';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* Greeting */}
        <View style={styles.greeting}>
          <Text style={[styles.homeName, { color: colors.text }]}>{home?.name || 'Your Home'}</Text>
          <Text style={[styles.greetingSub, { color: colors.textSecondary }]}>
            {user?.name?.split(' ')[0] || 'Caretaker'}
          </Text>
        </View>

        {/* ─── Active alert banners (Top priority) ──────────────────── */}
        {activeAlerts.length > 0 && (
          <View style={styles.activeAlertsBlock}>
            {activeAlerts.map(alert => (
              <AlertBanner key={alert.id} alert={alert}
                onPress={() => navigation.navigate('ActiveAlert', { alertId: alert.id })} />
            ))}
          </View>
        )}

        {/* ─── Metrics Grid ─────────────────────────────────────────── */}
        <View style={styles.grid}>
          <View style={styles.gridRow}>
            {/* Card 1: Sensors Online */}
            <View style={[styles.gridCard, { backgroundColor: colors.cardLightGreen, borderLeftWidth: 3, borderLeftColor: colors.success }]}>
              <Text style={[styles.gridLabel, { color: colors.textMuted }]}>SENSORS ONLINE</Text>
              <Text style={[styles.gridValue, { color: colors.success }]}>{onlineCount}/{sensors.length}</Text>
            </View>
            
            {/* Card 2: Alerts Today */}
            <View style={[styles.gridCard, { backgroundColor: colors.cardLightBlue }]}>
              <Text style={[styles.gridLabel, { color: colors.textMuted }]}>ALERTS TODAY</Text>
              <Text style={[styles.gridValue, { color: colors.text }]}>{alertsToday}</Text>
            </View>
          </View>
          
          <View style={styles.gridRow}>
            {/* Card 3: Last Alert */}
            <View style={[styles.gridCard, { backgroundColor: colors.cardLightAmber }]}>
              <Text style={[styles.gridLabel, { color: colors.textMuted }]}>LAST ALERT</Text>
              <Text style={[styles.gridValueTime, { color: colors.text }]}>{lastAlertTime}</Text>
            </View>
            
            {/* Card 4: Avg Response */}
            <View style={[styles.gridCard, { backgroundColor: colors.cardLightGrey }]}>
              <Text style={[styles.gridLabel, { color: colors.textMuted }]}>AVG RESPONSE</Text>
              <Text style={[styles.gridValue, { color: colors.text }]}>{avgResponse}</Text>
            </View>
          </View>
        </View>

        {/* ─── Sensors ──────────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>SENSORS</Text>
          {sensors.map(sensor => {
            const alerts = getAlertsBySensorId(sensor.id).filter(a => a.state === 'active' || a.state === 'escalated');
            return (
              <SensorCard key={sensor.id} sensor={sensor} alertCount={alerts.length}
                onPress={() => navigation.navigate('SensorsTab', { screen: 'SensorDetail', params: { sensorId: sensor.id } })} />
            );
          })}
          {sensors.length === 0 && (
            <View style={[styles.emptyBlock, { backgroundColor: colors.surface }]}>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No sensors yet</Text>
              <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>Pair your first sensor to start monitoring.</Text>
              <Button title="Add Sensor" size="sm" style={{ marginTop: theme.spacing.lg }}
                onPress={() => navigation.navigate('SensorsTab', { screen: 'SensorPairing', params: { fromSettings: true } })} />
            </View>
          )}
        </View>

        {/* ─── Recent Activity ──────────────────────────────────────── */}
        {recentHistory.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>RECENT ACTIVITY</Text>
            {recentHistory.map(alert => <AlertHistoryEntry key={alert.id} alert={alert} />)}
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { padding: theme.spacing.xl, paddingBottom: theme.spacing.massive },

  greeting: { marginBottom: theme.spacing.xxl },
  homeName: { fontFamily: theme.fonts.black, fontSize: theme.typography.size.display, letterSpacing: -1, marginBottom: 4 },
  greetingSub: { fontFamily: theme.fonts.regular, fontSize: theme.typography.size.base },

  activeAlertsBlock: {
    marginBottom: theme.spacing.xxl,
  },

  // Grid
  grid: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing.section,
  },
  gridRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  gridCard: {
    flex: 1,
    borderRadius: theme.radius.md,
    padding: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)', // ultra subtle border to define edge
  },
  gridLabel: { 
    fontFamily: theme.fonts.medium, 
    fontSize: 11, // clean muted 11-12px
    letterSpacing: 0.8, 
    textTransform: 'uppercase', 
    marginBottom: 6,
  },
  gridValue: { 
    fontFamily: theme.fonts.bold, 
    fontSize: theme.typography.size.xxxl, 
    letterSpacing: -0.5,
  },
  gridValueTime: {
    fontFamily: theme.fonts.bold, 
    fontSize: theme.typography.size.xl, 
    letterSpacing: -0.3,
  },

  section: { marginBottom: theme.spacing.section },
  sectionLabel: {
    fontFamily: theme.fonts.medium,
    fontSize: theme.typography.size.xs,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: theme.spacing.md,
  },

  emptyBlock: {
    borderRadius: theme.radius.lg,
    padding: theme.spacing.xxl,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  emptyTitle: { fontFamily: theme.fonts.semibold, fontSize: theme.typography.size.lg, marginBottom: 6 },
  emptyDesc: { fontFamily: theme.fonts.regular, fontSize: theme.typography.size.base, lineHeight: 22 },
});
