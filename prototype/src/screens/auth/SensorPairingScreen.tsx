/**
 * ABOUTME: Sensor pairing — real QR scan flow using expo-camera.
 * ABOUTME: Clean, airy health-tech aesthetic with permissions handling.
 */

import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Alert as RNAlert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useSensorStore } from '../../store/sensorStore';
import { useAuthStore } from '../../store/authStore';
import { theme } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import Button from '../../components/Button';
import { ArrowLeft, CheckCircle2 } from 'lucide-react-native';
import * as sensorsApi from '../../api/sensors';

export default function SensorPairingScreen({ navigation, route }: any) {
  const { colors } = useTheme();
  const fromSettings = route.params?.fromSettings;
  const { addSensor } = useSensorStore();
  const { user } = useAuthStore();
  const homeId = user?.linkedHomeIds[0];

  const [permission, requestPermission] = useCameraPermissions();

  const [step, setStep] = useState<'scan' | 'manual' | 'label' | 'done'>('scan');
  const [hardwareId, setHardwareId] = useState('');
  const [manualId, setManualId] = useState('');
  const [label, setLabel] = useState('');
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');

  const handleFinish = async () => {
    if (label.trim().length < 2 || !homeId) return;
    setLoading(true);
    try {
      const result = await sensorsApi.createSensor(homeId, hardwareId, label.trim());
      addSensor({
        id: result.id,
        hardwareId: result.hardwareId,
        label: result.label,
        homeId: result.homeId,
        status: result.status,
        lastHeartbeat: result.lastHeartbeat,
        createdAt: result.createdAt,
      });
      setApiKey(result.apiKey);
      setStep('done');
    } catch (error: any) {
      const detail = error.response?.data?.detail;
      const message = typeof detail === 'string' ? detail : detail?.message || 'Failed to pair sensor.';
      RNAlert.alert('Pairing Failed', message);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = () => {
    if (manualId.trim().length < 3) return;
    setHardwareId(manualId.trim());
    setStep('label');
  };

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    setHardwareId(data);
    setStep('label');
  };

  const TopBar = () => fromSettings ? (
    <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
      <ArrowLeft color={colors.text} size={22} />
    </TouchableOpacity>
  ) : null;

  if (!permission) {
    return <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <TopBar />
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.text, textAlign: 'center' }]}>Camera Access</Text>
          <Text style={[styles.sub, { color: colors.textSecondary, textAlign: 'center', marginBottom: theme.spacing.xxxl }]}>
            We need your permission to use your camera to scan the QR code on your sensor.
          </Text>
          <Button title="Grant Permission" onPress={requestPermission} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <TopBar />

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

              <View style={[styles.cameraZone, { borderColor: colors.primary }]}>
                <CameraView
                  style={StyleSheet.absoluteFillObject}
                  barcodeScannerSettings={{
                    barcodeTypes: ['qr'],
                  }}
                  onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                />
                <View style={[styles.aimer, { borderColor: colors.primary }]} />
              </View>
              <Button title="Enter ID Manually" variant="ghost" onPress={() => setStep('manual')} />
            </>
          ) : step === 'manual' ? (
            <>
              <Text style={[styles.step, { color: colors.textMuted }]}>MANUAL ENTRY</Text>
              <Text style={[styles.title, { color: colors.text }]}>Enter sensor ID</Text>
              <Text style={[styles.sub, { color: colors.textSecondary }]}>
                Type the hardware ID printed on your sensor.
              </Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border, color: colors.text }]}
                placeholder="e.g. SEN-ABC123"
                placeholderTextColor={colors.textMuted}
                value={manualId} onChangeText={setManualId} autoFocus
                autoCapitalize="characters"
              />
              <Button title="Continue →" onPress={handleManualSubmit} disabled={manualId.trim().length < 3} />
              <Button title="← Scan QR Instead" variant="ghost" style={{ marginTop: theme.spacing.md }} onPress={() => setStep('scan')} />
            </>
          ) : step === 'label' ? (
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
                onPress={handleFinish} disabled={label.trim().length < 2} loading={loading} />
              <Button title="Scan Again" variant="ghost" style={{ marginTop: theme.spacing.md }} onPress={() => {
                setScanned(false);
                setHardwareId('');
                setStep('scan');
              }} />
            </>
          ) : (
            <>
              <CheckCircle2 color={colors.success} size={44} style={{ marginBottom: theme.spacing.lg }} />
              <Text style={[styles.step, { color: colors.textMuted }]}>SENSOR PAIRED</Text>
              <Text style={[styles.title, { color: colors.text }]}>Save this API key</Text>
              <Text style={[styles.sub, { color: colors.textSecondary }]}>
                Copy this key and set it in your ESP32 firmware. It won't be shown again.
              </Text>
              <Text selectable style={[styles.apiKey, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border, color: colors.text }]}>
                {apiKey}
              </Text>
              <Button title={fromSettings ? 'Done' : 'Finish Setup →'} style={{ marginTop: theme.spacing.xxl }}
                onPress={() => { if (fromSettings) navigation.goBack(); }} />
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
  cameraZone: { 
    height: 300, 
    borderRadius: theme.radius.lg, 
    overflow: 'hidden', 
    borderWidth: 2, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: theme.spacing.xxxl 
  },
  aimer: { width: 180, height: 180, borderWidth: 2, borderStyle: 'dashed', borderRadius: theme.radius.md, backgroundColor: 'rgba(255,255,255,0.1)' },
  input: { borderRadius: theme.radius.md, borderWidth: 1, paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.lg, fontFamily: theme.fonts.regular, fontSize: theme.typography.size.lg, marginBottom: theme.spacing.xxl },
  apiKey: { fontFamily: theme.fonts.semibold, fontSize: theme.typography.size.base, borderRadius: theme.radius.md, borderWidth: 1, padding: theme.spacing.lg, textAlign: 'center', letterSpacing: 0.5 },
});
