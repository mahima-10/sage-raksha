/**
 * ABOUTME: Dashboard — Oura Ring-inspired hero status ring + sensor list + recent activity.
 * ABOUTME: Hero card is the centerpiece showing home safety status at a glance.
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
import { Shield, ShieldAlert, WifiOff } from 'lucide-react-native';

type SafetyStatus = 'safe' | 'alert' | 'offline';

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
  const offlineCount = sensors.length - onlineCount;

  // Determine hero status
  let heroStatus: SafetyStatus = 'safe';
  if (activeAlerts.length > 0) heroStatus = 'alert';
  else if (offlineCount > 0) heroStatus = 'offline';

  const heroConfig = {
    safe: { color: colors.success, label: 'All Safe', sub: `${onlineCount} sensor${onlineCount !== 1 ? 's' : ''} monitoring`, Icon: Shield },
    alert: { color: colors.danger, label: 'Alert Active', sub: `${activeAlerts.length} alert${activeAlerts.length > 1 ? 's' : ''} need attention`, Icon: ShieldAlert },
    offline: { color: colors.warning, label: '1 Sensor Offline', sub: 'Check your sensor connection', Icon: WifiOff },
  }[heroStatus];

  const HeroIcon = heroConfig.Icon;

  // Recent alert history (last 3 resolved)
  const recentHistory = getAlertsByHomeId(home?.id || '')
    .filter(a => a.state === 'resolved')
    .sort((a, b) => new Date(b.triggeredAt).getTime() - new Date(a.triggeredAt).getTime())
    .slice(0, 3);

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

        {/* ─── Hero Status Ring ─────────────────────────────────────── */}
        <View style={[styles.heroCard, { backgroundColor: colors.surface }]}>
          <View style={[styles.ring, { borderColor: heroConfig.color }]}>
            <HeroIcon size={36} color={heroConfig.color} />
            <Text style={[styles.ringLabel, { color: heroConfig.color }]}>{heroConfig.label}</Text>
          </View>
          <Text style={[styles.heroSub, { color: colors.textSecondary }]}>{heroConfig.sub}</Text>
        </View>

        {/* ─── Active alert banners ──────────────────────────────────── */}
        {activeAlerts.length > 0 && (
          <View style={styles.section}>
            {activeAlerts.map(alert => (
              <AlertBanner key={alert.id} alert={alert}
                onPress={() => navigation.navigate('ActiveAlert', { alertId: alert.id })} />
            ))}
          </View>
        )}

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

  // Hero card
  heroCard: {
    borderRadius: theme.radius.hero,
    padding: theme.spacing.xxxl,
    alignItems: 'center',
    marginBottom: theme.spacing.section,
    ...theme.shadows.hero,
  },
  ring: {
    width: 180, height: 180, borderRadius: 90,
    borderWidth: 7,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: theme.spacing.xl,
    gap: theme.spacing.sm,
  },
  ringLabel: { fontFamily: theme.fonts.bold, fontSize: theme.typography.size.lg, textAlign: 'center' },
  heroSub: { fontFamily: theme.fonts.regular, fontSize: theme.typography.size.sm, textAlign: 'center' },

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
    ...theme.shadows.card,
  },
  emptyTitle: { fontFamily: theme.fonts.semibold, fontSize: theme.typography.size.lg, marginBottom: 6 },
  emptyDesc: { fontFamily: theme.fonts.regular, fontSize: theme.typography.size.base, lineHeight: 22 },
});
