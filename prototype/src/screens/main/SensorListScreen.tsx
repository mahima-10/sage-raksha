/**
 * ABOUTME: Sensor list — clean vertical list with add sensor CTA.
 * ABOUTME: Inter typography, Oura-style section labels.
 */

import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { useSensorStore } from '../../store/sensorStore';
import { theme } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import SensorCard from '../../components/SensorCard';
import Button from '../../components/Button';

export default function SensorListScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { user } = useAuthStore();
  const { getSensorsByHomeId } = useSensorStore();
  const sensors = getSensorsByHomeId(user?.linkedHomeIds[0] || '');

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Sensors</Text>
        <Text style={[styles.count, { color: colors.textSecondary }]}>
          {sensors.filter(s => s.status === 'online').length}/{sensors.length} online
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={[styles.sectionLabel, { color: colors.textMuted, marginTop: theme.spacing.sm }]}>ALL SENSORS</Text>
        {sensors.map(sensor => (
          <SensorCard key={sensor.id} sensor={sensor}
            onPress={() => navigation.navigate('SensorDetail', { sensorId: sensor.id })} />
        ))}
        {sensors.length === 0 && (
          <View style={styles.empty}>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No sensors paired</Text>
            <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>Pair your first sensor to begin monitoring.</Text>
          </View>
        )}
        <Button title="+ Add Sensor" variant="outline"
          onPress={() => navigation.navigate('SensorPairing', { fromSettings: true })}
          style={styles.addBtn} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingHorizontal: theme.spacing.xl, paddingTop: theme.spacing.lg, paddingBottom: theme.spacing.md },
  title: { fontFamily: theme.fonts.black, fontSize: theme.typography.size.display, letterSpacing: -0.5 },
  count: { fontFamily: theme.fonts.regular, fontSize: theme.typography.size.sm, paddingBottom: 6 },
  container: { padding: theme.spacing.xl, paddingTop: theme.spacing.md, paddingBottom: theme.spacing.massive },
  sectionLabel: { fontFamily: theme.fonts.medium, fontSize: theme.typography.size.xs, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: theme.spacing.md },
  empty: { paddingVertical: theme.spacing.xxxl },
  emptyTitle: { fontFamily: theme.fonts.semibold, fontSize: theme.typography.size.lg, marginBottom: 6 },
  emptyDesc: { fontFamily: theme.fonts.regular, fontSize: theme.typography.size.base, lineHeight: 22, marginBottom: theme.spacing.xl },
  addBtn: { marginTop: theme.spacing.lg },
});
