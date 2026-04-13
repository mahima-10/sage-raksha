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

export default function SensorPairingScreen({ navigation, route }: any) {
  const { colors } = useTheme();
  const fromSettings = route.params?.fromSettings;
  const { addSensor } = useSensorStore();
  const { user } = useAuthStore();
  const homeId = user?.linkedHomeIds[0];

  const [permission, requestPermission] = useCameraPermissions();

  const [step, setStep] = useState<'scan' | 'label'>('scan');
  const [hardwareId, setHardwareId] = useState('');
  const [label, setLabel] = useState('');
  const [scanned, setScanned] = useState(false);

  const handleFinish = () => {
    if (label.trim().length < 2 || !homeId) return;
    addSensor({ 
      id: `s-${Date.now()}`, 
      hardwareId, 
      label: label.trim(), 
      homeId, 
      status: 'online', 
      lastHeartbeat: new Date().toISOString(), 
      createdAt: new Date().toISOString() 
    });
    if (fromSettings) navigation.goBack();
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
                {/* Aiming guide overlay */}
                <View style={[styles.aimer, { borderColor: colors.primary }]} />
              </View>
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
              <Button title="Scan Again" variant="ghost" style={{ marginTop: theme.spacing.md }} onPress={() => {
                setScanned(false);
                setHardwareId('');
                setStep('scan');
              }} />
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
});
