/**
 * ABOUTME: Active alert fullscreen — light airy aesthetic replacing the forced dark mode.
 * ABOUTME: Light red tinted background, rich danger text, clean stacked actions.
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
import { X, ShieldAlert, CheckCircle2 } from 'lucide-react-native';
import { formatDistanceToNow } from 'date-fns';

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

  // Pulsing animation for the ring
  const pulseScale = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!alert || alert.state === 'acknowledged') return;
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulseScale, { toValue: 1.1, duration: 1000, useNativeDriver: true }),
          Animated.timing(pulseScale, { toValue: 1, duration: 1000, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(pulseOpacity, { toValue: 0.5, duration: 1000, useNativeDriver: true }),
          Animated.timing(pulseOpacity, { toValue: 1, duration: 1000, useNativeDriver: true }),
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
  
  // Clean alert styling config
  const mainBg = isAck ? colors.cardLightAmber : colors.cardLightRed;
  const accentColor = isAck ? colors.warning : colors.danger;
  const Icon = isAck ? CheckCircle2 : ShieldAlert;

  const handleAck = () => { if (user) acknowledgeAlert(alert.id, user.id); };
  const handleResolve = (outcome: 'real_fall' | 'false_alarm') => {
    if (user) { resolveAlert(alert.id, user.id, outcome, notes.trim()); navigation.goBack(); }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: mainBg }]}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}>
          <X color={accentColor} size={26} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Animated Hero Icon */}
        <Animated.View style={[styles.iconWrap, { transform: [{ scale: pulseScale }], opacity: pulseOpacity }]}>
          <View style={[styles.iconRing, { backgroundColor: 'transparent', borderColor: accentColor }]}>
            <Icon size={52} color={accentColor} />
          </View>
        </Animated.View>

        {/* Status text */}
        <View style={styles.statusText}>
          <Text style={[styles.stateLabel, { color: accentColor }]}>
            {isEscalated ? 'ESCALATED' : isAck ? 'ACKNOWLEDGED' : 'FALL DETECTED'}
          </Text>
          <Text style={[styles.sensorLine, { color: accentColor, opacity: 0.8 }]}>{sensor?.label} · {home?.name}</Text>
          <Text style={[styles.timeLine, { color: accentColor, opacity: 0.6 }]}>{formatDistanceToNow(new Date(alert.triggeredAt))} ago</Text>
        </View>

        {/* Actions */}
        {!resolving ? (
          <View style={styles.actions}>
            {(isActive || isEscalated) && (
              <Button title="I'm on it" size="lg" onPress={handleAck} style={styles.fullWidth} variant="danger" />
            )}
            <Button
              title={isAck ? 'Resolve Alert' : 'Dismiss as False Alarm'}
              variant={isAck ? 'primary' : 'outline'}
              size="lg"
              onPress={isAck ? () => setResolving(true) : () => handleResolve('false_alarm')}
              style={styles.fullWidth}
            />
            <TouchableOpacity style={styles.emergencyBtn} onPress={() => Linking.openURL('tel:112')}>
              <Text style={[styles.emergencyText, { color: accentColor }]}>📞  Call Emergency Services  (112)</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={[styles.resolveCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.resolveTitle, { color: colors.text }]}>What happened?</Text>
            <TextInput
              style={[styles.notesInput, { backgroundColor: colors.surfaceHighlight, color: colors.text, borderColor: colors.border }]}
              placeholder="Add notes (optional)..."
              placeholderTextColor={colors.textMuted}
              value={notes} onChangeText={setNotes} multiline
            />
            <Button title="It was a real fall" variant="danger" size="lg" onPress={() => handleResolve('real_fall')} style={styles.fullWidth} />
            <View style={{ height: theme.spacing.md }} />
            <Button title="False Alarm" variant="secondary" size="lg" onPress={() => handleResolve('false_alarm')} style={styles.fullWidth} />
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setResolving(false)}>
              <Text style={[styles.cancelText, { color: colors.textMuted }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: theme.spacing.xl },
  topBar: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: theme.spacing.xl, paddingTop: theme.spacing.sm, paddingBottom: theme.spacing.lg },
  container: { flexGrow: 1, paddingHorizontal: theme.spacing.xl, paddingBottom: theme.spacing.massive, alignItems: 'center' },

  iconWrap: { justifyContent: 'center', alignItems: 'center', marginTop: theme.spacing.section, marginBottom: theme.spacing.xxxl },
  iconRing: { width: 120, height: 120, borderRadius: 60, borderWidth: 4, justifyContent: 'center', alignItems: 'center' },

  statusText: { alignItems: 'center', marginBottom: theme.spacing.section, width: '100%' },
  stateLabel: { fontFamily: theme.fonts.black, fontSize: theme.typography.size.xxl, letterSpacing: 0.5, marginBottom: theme.spacing.sm, textAlign: 'center' },
  sensorLine: { fontFamily: theme.fonts.medium, fontSize: theme.typography.size.base, marginBottom: 4 },
  timeLine: { fontFamily: theme.fonts.medium, fontSize: theme.typography.size.sm },

  actions: { width: '100%', gap: theme.spacing.md },
  fullWidth: { width: '100%' },
  emergencyBtn: { borderRadius: theme.radius.md, padding: theme.spacing.lg, alignItems: 'center', marginTop: theme.spacing.sm },
  emergencyText: { fontFamily: theme.fonts.semibold, fontSize: theme.typography.size.base },

  resolveCard: { width: '100%', borderRadius: theme.radius.lg, padding: theme.spacing.xxl, borderWidth: 1 },
  resolveTitle: { fontFamily: theme.fonts.bold, fontSize: theme.typography.size.xl, marginBottom: theme.spacing.lg, textAlign: 'center' },
  notesInput: { borderRadius: theme.radius.md, padding: theme.spacing.md, fontFamily: theme.fonts.regular, fontSize: theme.typography.size.base, minHeight: 80, textAlignVertical: 'top', marginBottom: theme.spacing.xl, borderWidth: 1 },
  cancelBtn: { padding: theme.spacing.lg, alignItems: 'center', marginTop: theme.spacing.sm },
  cancelText: { fontFamily: theme.fonts.regular, fontSize: theme.typography.size.base },
  bodyText: { fontFamily: theme.fonts.regular, fontSize: theme.typography.size.lg, marginBottom: theme.spacing.md },
});
