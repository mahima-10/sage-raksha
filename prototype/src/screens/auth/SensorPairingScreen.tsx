/**
 * ABOUTME: Sensor pairing — mock QR scan flow with Inter typography and step indicator.
 * ABOUTME: Dashed camera placeholder, elevation-only surfaces.
 */

import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useSensorStore } from '../../store/sensorStore';
import { useAuthStore } from '../../store/authStore';
import { theme } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import Button from '../../components/Button';
import { QrCode, ArrowLeft, CheckCircle2 } from 'lucide-react-native';

export default function SensorPairingScreen({ navigation, route }: any) {
  const { colors } = useTheme();
  const fromSettings = route.params?.fromSettings;
  const { addSensor } = useSensorStore();
  const { user } = useAuthStore();
  const homeId = user?.linkedHomeIds[0];

  const [step, setStep] = useState<'scan' | 'label'>('scan');
  const [hardwareId, setHardwareId] = useState('');
  const [label, setLabel] = useState('');
  const [loading, setLoading] = useState(false);

  const simulateScan = () => {
    setLoading(true);
    setTimeout(() => {
      setHardwareId(`SEN-${Math.floor(Math.random() * 10000)}`);
      setLoading(false);
      setStep('label');
    }, 1500);
  };

  const handleFinish = () => {
    if (label.trim().length < 2 || !homeId) return;
    addSensor({ id: `s-${Date.now()}`, hardwareId, label: label.trim(), homeId, status: 'online', lastHeartbeat: new Date().toISOString(), createdAt: new Date().toISOString() });
    if (fromSettings) navigation.goBack();
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {fromSettings && (
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft color={colors.text} size={22} />
        </TouchableOpacity>
      )}

      <KeyboardAvoidingView style={styles.kav} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.content}>
          {step === 'scan' ? (
            <>
              <Text style={[styles.step, { color: colors.textMuted }]}>
                {fromSettings ? 'ADD SENSOR' : 'FINAL STEP'}
              </Text>
              <Text style={[styles.title, { color: colors.text }]}>Pair your sensor</Text>
              <Text style={[styles.sub, { color: colors.textSecondary }]}>
                Scan the QR code on the back of your S.A.G.E Raksha sensor.
              </Text>

              <TouchableOpacity
                style={[styles.cameraZone, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border }]}
                onPress={simulateScan} disabled={loading}
              >
                <QrCode size={50} color={loading ? colors.primary : colors.textMuted} />
                <Text style={[styles.scanPrompt, { color: loading ? colors.primary : colors.textMuted }]}>
                  {loading ? 'Scanning...' : 'Tap to Scan (Mock)'}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <CheckCircle2 color={colors.success} size={44} style={{ marginBottom: theme.spacing.lg }} />
              <Text style={[styles.step, { color: colors.textMuted }]}>SENSOR FOUND</Text>
              <Text style={[styles.title, { color: colors.text }]}>Label your sensor</Text>
              <Text style={[styles.sub, { color: colors.textSecondary }]}>
                ID: {hardwareId}{'\n'}Give it a location name.
              </Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border, color: colors.text }]}
                placeholder="e.g. Master Bedroom"
                placeholderTextColor={colors.textMuted}
                value={label} onChangeText={setLabel} autoFocus
              />
              <Button title={fromSettings ? 'Add Sensor →' : 'Complete Setup →'}
                onPress={handleFinish} disabled={label.trim().length < 2} />
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  backBtn: { padding: theme.spacing.lg, marginBottom: -theme.spacing.md },
  kav: { flex: 1 },
  content: { flex: 1, padding: theme.spacing.xl, justifyContent: 'center' },
  step: { fontFamily: theme.fonts.medium, fontSize: theme.typography.size.xs, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: theme.spacing.md },
  title: { fontFamily: theme.fonts.black, fontSize: theme.typography.size.display, letterSpacing: -0.5, marginBottom: theme.spacing.md },
  sub: { fontFamily: theme.fonts.regular, fontSize: theme.typography.size.base, lineHeight: 24, marginBottom: theme.spacing.xxxl },
  cameraZone: { height: 260, borderRadius: theme.radius.lg, borderWidth: 2, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', gap: theme.spacing.md, marginBottom: theme.spacing.xxl },
  scanPrompt: { fontFamily: theme.fonts.medium, fontSize: theme.typography.size.base },
  input: { borderRadius: theme.radius.md, borderWidth: 1, paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.lg, fontFamily: theme.fonts.regular, fontSize: theme.typography.size.lg, marginBottom: theme.spacing.xxxl },
});
