/**
 * ABOUTME: Phone auth — OTP entry with Inter typography, clean input styling.
 * ABOUTME: No card borders, elevation-only surfaces.
 */

import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { theme } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import Button from '../../components/Button';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types';

type Props = { navigation: NativeStackNavigationProp<AuthStackParamList, 'PhoneAuth'> };

export default function PhoneAuthScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();

  const handleSendOtp = () => {
    if (phone.length < 10) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); setStep('otp'); }, 1000);
  };

  const handleVerify = () => {
    if (otp.length < 4) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); login(phone, otp); navigation.navigate('CreateHome'); }, 1000);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView style={styles.kav} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.content}>
          <Text style={[styles.step, { color: colors.textMuted }]}>
            {step === 'phone' ? 'STEP 1 OF 2' : 'STEP 2 OF 2'}
          </Text>
          <Text style={[styles.title, { color: colors.text }]}>
            {step === 'phone' ? 'Enter your\nmobile number' : 'Enter the\nOTP'}
          </Text>
          <Text style={[styles.sub, { color: colors.textSecondary }]}>
            {step === 'phone' ? 'We\'ll send you a one-time code.' : `Code sent to +91 ${phone}`}
          </Text>

          {step === 'phone' ? (
            <View style={[styles.phoneBox, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border }]}>
              <Text style={[styles.prefix, { color: colors.text }]}>+91</Text>
              <View style={[styles.vDivider, { backgroundColor: colors.border }]} />
              <TextInput style={[styles.phoneInput, { color: colors.text }]}
                placeholder="98765 43210" placeholderTextColor={colors.textMuted}
                keyboardType="phone-pad" maxLength={10} value={phone} onChangeText={setPhone} autoFocus />
            </View>
          ) : (
            <TextInput
              style={[styles.otpInput, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border, color: colors.text }]}
              placeholder="0 0 0 0" placeholderTextColor={colors.textMuted}
              keyboardType="number-pad" maxLength={4} value={otp} onChangeText={setOtp} autoFocus />
          )}

          <Button title={step === 'phone' ? 'Send OTP →' : 'Verify & Continue →'}
            onPress={step === 'phone' ? handleSendOtp : handleVerify}
            disabled={step === 'phone' ? phone.length < 10 : otp.length < 4}
            loading={loading} style={styles.cta} />

          {step === 'otp' && (
            <Button title="← Edit number" variant="ghost" onPress={() => setStep('phone')} />
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  kav: { flex: 1 },
  content: { flex: 1, padding: theme.spacing.xl, justifyContent: 'center' },
  step: { fontFamily: theme.fonts.medium, fontSize: theme.typography.size.xs, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: theme.spacing.md },
  title: { fontFamily: theme.fonts.black, fontSize: theme.typography.size.display, letterSpacing: -0.5, lineHeight: 40, marginBottom: theme.spacing.md },
  sub: { fontFamily: theme.fonts.regular, fontSize: theme.typography.size.base, marginBottom: theme.spacing.xxxl, lineHeight: 24 },
  phoneBox: { flexDirection: 'row', alignItems: 'center', borderRadius: theme.radius.md, borderWidth: 1, paddingHorizontal: theme.spacing.lg, marginBottom: theme.spacing.xxl, overflow: 'hidden' },
  prefix: { fontFamily: theme.fonts.semibold, fontSize: theme.typography.size.lg, paddingVertical: theme.spacing.lg, marginRight: theme.spacing.md },
  vDivider: { width: 1, height: 24, marginRight: theme.spacing.md },
  phoneInput: { flex: 1, fontFamily: theme.fonts.regular, fontSize: theme.typography.size.lg, paddingVertical: theme.spacing.lg },
  otpInput: { textAlign: 'center', fontFamily: theme.fonts.black, fontSize: theme.typography.size.hero, letterSpacing: 12, paddingVertical: theme.spacing.xl, borderRadius: theme.radius.md, borderWidth: 1, marginBottom: theme.spacing.xxl },
  cta: { marginBottom: theme.spacing.md },
});
