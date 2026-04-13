/**
 * ABOUTME: Active alert fullscreen — intentionally dark and urgent regardless of color scheme.
 * ABOUTME: Deep rich red (#DC2626), large pulsing scale animation, Inter type, clean button stack.
 */

import React, { useState, useRef, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking, TextInput, Animated } from 'react-native';
import { useAlertStore } from '../../store/alertStore';
import { useSensorStore } from '../../store/sensorStore';
import { useAuthStore } from '../../store/authStore';
import { useHomeStore } from '../../store/homeStore';
import { theme } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import Button from '../../components/Button';
import { X } from 'lucide-react-native';
import { formatDistanceToNow } from 'date-fns';

// Always-dark palette for the alert screen — intentional exception to theme
const DARK = {
  bg: '#1A0A0A',
  card: '#2A1010',
  text: '#FFFFFF',
  subtext: 'rgba(255,255,255,0.65)',
  muted: 'rgba(255,255,255,0.38)',
  close: 'rgba(255,255,255,0.55)',
  emergencyBg: 'rgba(255,255,255,0.07)',
};

export default function ActiveAlertScreen({ navigation, route }: any) {
  const { colors } = useTheme();
  const { alertId } = route.params;
  const { user } = useAuthStore();
  const { getHomeById } = useHomeStore();
  const { alerts, acknowledgeAlert, resolveAlert } = useAlertStore();
  const { getSensorById } = useSensorStore();

  const alert = alerts.find(a => a.id === alertId);
  const sensor = getSensorById(alert?.sensorId || '');
  const home = getHomeById(alert?.homeId || '');

  const [resolving, setResolving] = useState(false);
  const [notes, setNotes] = useState('');

  // Pulsing scale animation for the orb
  const pulseScale = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    if (!alert || alert.state === 'acknowledged') return;
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulseScale, { toValue: 1.18, duration: 1100, useNativeDriver: true }),
          Animated.timing(pulseScale, { toValue: 1, duration: 1100, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(pulseOpacity, { toValue: 0.3, duration: 1100, useNativeDriver: true }),
          Animated.timing(pulseOpacity, { toValue: 0.7, duration: 1100, useNativeDriver: true }),
        ]),
      ])
    ).start();
    return () => { pulseScale.stopAnimation(); pulseOpacity.stopAnimation(); };
  }, [alert?.state]);

  if (!alert) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.bodyText, { color: colors.text }]}>Alert not found</Text>
        <Button title="Go Back" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  const isActive = alert.state === 'active';
  const isEscalated = alert.state === 'escalated';
  const isAck = alert.state === 'acknowledged';
  const orbColor = isAck ? '#D97706' : '#DC2626';

  const handleAck = () => { if (user) acknowledgeAlert(alert.id, user.id); };
  const handleResolve = (outcome: 'real_fall' | 'false_alarm') => {
    if (user) { resolveAlert(alert.id, user.id, outcome, notes.trim()); navigation.goBack(); }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}>
          <X color={DARK.close} size={26} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* ─── Pulsing orb ────────────────────────── */}
        <View style={styles.orbWrap}>
          {/* Outer glow ring */}
          <Animated.View style={[styles.orbRing, { borderColor: orbColor, transform: [{ scale: pulseScale }], opacity: pulseOpacity }]} />
          {/* Inner solid orb */}
          <View style={[styles.orb, { backgroundColor: orbColor }]} />
        </View>

        {/* ─── Status text ────────────────────────── */}
        <View style={styles.statusText}>
          <Text style={styles.stateLabel}>
            {isEscalated ? 'ESCALATED' : isAck ? 'Acknowledged' : 'FALL DETECTED'}
          </Text>
          <Text style={styles.sensorLine}>{sensor?.label} · {home?.name}</Text>
          <Text style={styles.timeLine}>{formatDistanceToNow(new Date(alert.triggeredAt))} ago</Text>
        </View>

        {/* ─── Actions ────────────────────────────── */}
        {!resolving ? (
          <View style={styles.actions}>
            {(isActive || isEscalated) && (
              <Button title="I'm on it" size="lg" onPress={handleAck} style={styles.fullWidth} />
            )}
            <Button
              title={isAck ? 'Resolve Alert' : 'Dismiss as False Alarm'}
              variant={isAck ? 'primary' : 'secondary'}
              size="lg"
              onPress={isAck ? () => setResolving(true) : () => handleResolve('false_alarm')}
              style={styles.fullWidth}
            />
            <TouchableOpacity style={styles.emergencyBtn} onPress={() => Linking.openURL('tel:112')}>
              <Text style={styles.emergencyText}>📞  Call Emergency Services  (112)</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={[styles.resolveCard, { backgroundColor: DARK.card }]}>
            <Text style={styles.resolveTitle}>What happened?</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="Add notes (optional)..."
              placeholderTextColor={DARK.muted}
              value={notes} onChangeText={setNotes} multiline
            />
            <Button title="It was a real fall" variant="danger" size="lg" onPress={() => handleResolve('real_fall')} style={styles.fullWidth} />
            <View style={{ height: theme.spacing.md }} />
            <Button title="False Alarm" variant="secondary" size="lg" onPress={() => handleResolve('false_alarm')} style={styles.fullWidth} />
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setResolving(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#1A0A0A' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: theme.spacing.xl },
  topBar: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: theme.spacing.xl, paddingTop: theme.spacing.sm, paddingBottom: theme.spacing.lg },

  container: { flexGrow: 1, paddingHorizontal: theme.spacing.xl, paddingBottom: theme.spacing.massive, alignItems: 'center' },

  // Orb
  orbWrap: { justifyContent: 'center', alignItems: 'center', marginTop: theme.spacing.xxl, marginBottom: theme.spacing.xxxl, width: 200, height: 200 },
  orbRing: { position: 'absolute', width: 180, height: 180, borderRadius: 90, borderWidth: 5 },
  orb: { width: 120, height: 120, borderRadius: 60 },

  // Status text
  statusText: { alignItems: 'center', marginBottom: theme.spacing.section, width: '100%' },
  stateLabel: {
    fontFamily: theme.fonts.black, fontSize: theme.typography.size.xxl,
    color: DARK.text, letterSpacing: 0.5, marginBottom: theme.spacing.sm, textAlign: 'center',
  },
  sensorLine: { fontFamily: theme.fonts.regular, fontSize: theme.typography.size.base, color: DARK.subtext, marginBottom: 6 },
  timeLine: { fontFamily: theme.fonts.regular, fontSize: theme.typography.size.sm, color: DARK.muted },

  // Actions
  actions: { width: '100%', gap: theme.spacing.md },
  fullWidth: { width: '100%' },
  emergencyBtn: { backgroundColor: DARK.emergencyBg, borderRadius: theme.radius.md, padding: theme.spacing.lg, alignItems: 'center', marginTop: theme.spacing.sm },
  emergencyText: { fontFamily: theme.fonts.medium, fontSize: theme.typography.size.base, color: DARK.subtext },

  // Resolve card
  resolveCard: { width: '100%', borderRadius: theme.radius.lg, padding: theme.spacing.xxl },
  resolveTitle: { fontFamily: theme.fonts.bold, fontSize: theme.typography.size.xl, color: DARK.text, marginBottom: theme.spacing.lg, textAlign: 'center' },
  notesInput: {
    backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: theme.radius.md,
    padding: theme.spacing.md, color: DARK.text, fontFamily: theme.fonts.regular,
    fontSize: theme.typography.size.base, minHeight: 80, textAlignVertical: 'top',
    marginBottom: theme.spacing.xl, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  cancelBtn: { padding: theme.spacing.lg, alignItems: 'center', marginTop: theme.spacing.sm },
  cancelText: { fontFamily: theme.fonts.regular, fontSize: theme.typography.size.base, color: DARK.muted },
  bodyText: { fontFamily: theme.fonts.regular, fontSize: theme.typography.size.lg, marginBottom: theme.spacing.md },
});
