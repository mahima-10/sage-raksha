/**
 * ABOUTME: Sensor detail — status hero, labeled info table, caretakers, recent alerts, management actions.
 * ABOUTME: Inter typography, elevation-only cards, Oura-style section labels.
 */

import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert as RNAlert } from 'react-native';
import { useSensorStore } from '../../store/sensorStore';
import { useAlertStore } from '../../store/alertStore';
import { useHomeStore } from '../../store/homeStore';
import { theme } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import Button from '../../components/Button';
import AlertHistoryEntry from '../../components/AlertHistoryEntry';
import { ArrowLeft, Edit2, Check } from 'lucide-react-native';
import { formatDistanceToNow } from 'date-fns';
import { MOCK_LINKED_CARETAKERS } from '../../constants/mockData';

export default function SensorDetailScreen({ navigation, route }: any) {
  const { colors } = useTheme();
  const { sensorId } = route.params;
  const { getSensorById, renameSensor, removeSensor } = useSensorStore();
  const { getAlertsBySensorId } = useAlertStore();
  const { getHomeById } = useHomeStore();

  const sensor = getSensorById(sensorId);
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(sensor?.label || '');

  if (!sensor) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={styles.center}>
          <Text style={[styles.body, { color: colors.text }]}>Sensor not found</Text>
          <Button title="Go Back" onPress={() => navigation.goBack()} />
        </View>
      </SafeAreaView>
    );
  }

  const isOnline = sensor.status === 'online';
  const home = getHomeById(sensor.homeId);
  const recentAlerts = getAlertsBySensorId(sensor.id).filter(a => a.state === 'resolved').slice(0, 3);
  const statusColor = isOnline ? colors.success : colors.textMuted;

  const handleSave = () => { if (label.trim().length > 0) { renameSensor(sensor.id, label.trim()); setIsEditing(false); } };

  const handleRemove = () => {
    RNAlert.alert('Remove Sensor', 'This sensor will be unpaired from your home.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => { removeSensor(sensor.id); navigation.goBack(); } },
    ]);
  };

  const handleTestAlert = () => {
    const { useAlertStore: store } = require('../../store/alertStore');
    const alertId = store.getState().triggerAlert(sensor.id, sensor.homeId);
    navigation.navigate('ActiveAlert', { alertId });
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft color={colors.text} size={22} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Sensor Details</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* Hero status block */}
        <View style={[styles.heroBlock, { backgroundColor: colors.surface }]}>
          <View style={[styles.statusRing, { borderColor: statusColor }]}>
            <View style={[styles.statusOrb, { backgroundColor: statusColor }]} />
          </View>
          <Text style={[styles.statusLabel, { color: statusColor }]}>
            {isOnline ? 'Sensor is Online' : 'Sensor is Offline'}
          </Text>
          <Text style={[styles.lastSeen, { color: colors.textSecondary }]}>
            Last contact {formatDistanceToNow(new Date(sensor.lastHeartbeat))} ago
          </Text>
        </View>

        {/* Info table */}
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>SENSOR INFO</Text>
        <View style={[styles.infoCard, { backgroundColor: colors.surface }]}>
          {/* Label row */}
          <View style={styles.infoRow}>
            <View style={styles.infoContent}>
              <Text style={[styles.infoKey, { color: colors.textMuted }]}>LABEL</Text>
              {isEditing ? (
                <TextInput style={[styles.inlineInput, { color: colors.text, borderBottomColor: colors.primary }]}
                  value={label} onChangeText={setLabel} autoFocus onSubmitEditing={handleSave} />
              ) : (
                <Text style={[styles.infoValue, { color: colors.text }]}>{sensor.label}</Text>
              )}
            </View>
            {isEditing
              ? <TouchableOpacity onPress={handleSave}><Check size={18} color={colors.primary} /></TouchableOpacity>
              : <TouchableOpacity onPress={() => setIsEditing(true)}><Edit2 size={15} color={colors.textMuted} /></TouchableOpacity>
            }
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.infoRow}>
            <View style={styles.infoContent}>
              <Text style={[styles.infoKey, { color: colors.textMuted }]}>HARDWARE ID</Text>
              <Text style={[styles.infoValueSub, { color: colors.textSecondary }]}>{sensor.hardwareId}</Text>
            </View>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.infoRow}>
            <View style={styles.infoContent}>
              <Text style={[styles.infoKey, { color: colors.textMuted }]}>HOME</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>{home?.name || '—'}</Text>
            </View>
          </View>
        </View>

        {/* Caretakers */}
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>LINKED CARETAKERS</Text>
        {MOCK_LINKED_CARETAKERS.map(ct => (
          <View key={ct.id} style={[styles.caretakerRow, { backgroundColor: colors.surface }]}>
            <View style={[styles.avatar, { backgroundColor: colors.primaryMuted }]}>
              <Text style={[styles.avatarInitial, { color: colors.primary }]}>{ct.name.charAt(0)}</Text>
            </View>
            <Text style={[styles.caretakerName, { color: colors.text }]}>{ct.name}</Text>
          </View>
        ))}

        {/* Recent alerts */}
        {recentAlerts.length > 0 && (
          <>
            <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>RECENT ALERTS</Text>
            {recentAlerts.map(a => <AlertHistoryEntry key={a.id} alert={a} />)}
          </>
        )}

        <Button title="Test Emergency Alert" onPress={handleTestAlert} style={{ marginBottom: theme.spacing.xl }} />

        <TouchableOpacity style={styles.removeBtn} onPress={handleRemove}>
          <Text style={[styles.removeBtnText, { color: colors.textMuted }]}>Remove Sensor</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: theme.spacing.xl },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: theme.spacing.lg, paddingTop: theme.spacing.md },
  backBtn: { padding: 8, marginLeft: -8 },
  headerTitle: { fontFamily: theme.fonts.semibold, fontSize: theme.typography.size.lg },
  container: { padding: theme.spacing.xl, paddingTop: theme.spacing.md, paddingBottom: theme.spacing.massive },

  heroBlock: { borderRadius: theme.radius.hero, padding: theme.spacing.xxxl, alignItems: 'center', marginBottom: theme.spacing.section, ...theme.shadows.hero },
  statusRing: { width: 100, height: 100, borderRadius: 50, borderWidth: 5, justifyContent: 'center', alignItems: 'center', marginBottom: theme.spacing.lg },
  statusOrb: { width: 50, height: 50, borderRadius: 25 },
  statusLabel: { fontFamily: theme.fonts.bold, fontSize: theme.typography.size.xl, marginBottom: 6 },
  lastSeen: { fontFamily: theme.fonts.regular, fontSize: theme.typography.size.sm },

  sectionLabel: { fontFamily: theme.fonts.medium, fontSize: theme.typography.size.xs, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: theme.spacing.md, marginTop: theme.spacing.xxl },

  infoCard: { borderRadius: theme.radius.md, marginBottom: theme.spacing.xxl, ...theme.shadows.card },
  infoRow: { flexDirection: 'row', alignItems: 'center', padding: theme.spacing.lg },
  infoContent: { flex: 1 },
  infoKey: { fontFamily: theme.fonts.medium, fontSize: theme.typography.size.xs, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 5 },
  infoValue: { fontFamily: theme.fonts.medium, fontSize: theme.typography.size.base },
  infoValueSub: { fontFamily: theme.fonts.regular, fontSize: theme.typography.size.sm },
  inlineInput: { fontFamily: theme.fonts.medium, fontSize: theme.typography.size.base, padding: 0, borderBottomWidth: 1, paddingBottom: 3 },
  divider: { height: 1, marginHorizontal: theme.spacing.lg },

  caretakerRow: { flexDirection: 'row', alignItems: 'center', borderRadius: theme.radius.md, padding: theme.spacing.md, marginBottom: theme.spacing.sm, ...theme.shadows.card },
  avatar: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginRight: theme.spacing.md },
  avatarInitial: { fontFamily: theme.fonts.bold, fontSize: theme.typography.size.base },
  caretakerName: { fontFamily: theme.fonts.medium, fontSize: theme.typography.size.base },

  removeBtn: { padding: theme.spacing.lg, alignItems: 'center' },
  removeBtnText: { fontFamily: theme.fonts.medium, fontSize: theme.typography.size.base, textDecorationLine: 'underline' },
  body: { fontFamily: theme.fonts.regular, fontSize: theme.typography.size.lg, marginBottom: theme.spacing.md },
});
