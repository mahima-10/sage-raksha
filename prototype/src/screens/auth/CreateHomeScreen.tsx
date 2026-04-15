/**
 * ABOUTME: Create home or join existing home via invite code.
 * ABOUTME: Inter typography, step indicator, clean input styling.
 */

import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useHomeStore } from '../../store/homeStore';
import { useAuthStore } from '../../store/authStore';
import { theme } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import Button from '../../components/Button';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types';
import * as homesApi from '../../api/homes';

type Props = { navigation: NativeStackNavigationProp<AuthStackParamList, 'CreateHome'> };

export default function CreateHomeScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const [homeName, setHomeName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [mode, setMode] = useState<'create' | 'join'>('create');
  const { addHome } = useHomeStore();
  const { addLinkedHome } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const handleCreate = () => {
    if (homeName.trim().length < 2) return;
    setLoading(true);
    setTimeout(() => {
      const homeId = `h-${Date.now()}`;
      addHome({ id: homeId, name: homeName.trim(), createdBy: 'unknown', createdAt: new Date().toISOString() });
      addLinkedHome(homeId);
      setLoading(false);
      navigation.navigate('SensorPairing', { fromSettings: false });
    }, 800);
  };

  const handleJoin = async () => {
    if (inviteCode.trim().length < 4) return;
    setLoading(true);
    try {
      const home = await homesApi.joinHome(inviteCode.trim().toUpperCase());
      addHome(home);
      addLinkedHome(home.id);
      navigation.navigate('SensorPairing', { fromSettings: false });
    } catch (error: any) {
      const detail = error.response?.data?.detail;
      const message = typeof detail === 'string' ? detail : detail?.message || 'Invalid invite code. Please try again.';
      Alert.alert('Join Failed', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView style={styles.kav} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.content}>
          <Text style={[styles.step, { color: colors.textMuted }]}>ALMOST THERE</Text>
          <Text style={[styles.title, { color: colors.text }]}>
            {mode === 'create' ? 'Name your home' : 'Join a home'}
          </Text>
          <Text style={[styles.sub, { color: colors.textSecondary }]}>
            {mode === 'create'
              ? 'Give this home a name so you can identify it easily.'
              : 'Enter the invite code shared by the home owner.'}
          </Text>

          {mode === 'create' ? (
            <TextInput
              style={[styles.input, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border, color: colors.text }]}
              placeholder="e.g. Mom's House, Dad's Flat"
              placeholderTextColor={colors.textMuted}
              value={homeName} onChangeText={setHomeName} autoFocus
            />
          ) : (
            <TextInput
              style={[styles.input, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border, color: colors.text }]}
              placeholder="e.g. RAKSHA-1A2B"
              placeholderTextColor={colors.textMuted}
              value={inviteCode} onChangeText={setInviteCode} autoFocus
              autoCapitalize="characters"
            />
          )}

          <Button
            title={mode === 'create' ? 'Continue →' : 'Join Home →'}
            onPress={mode === 'create' ? handleCreate : handleJoin}
            disabled={mode === 'create' ? homeName.trim().length < 2 : inviteCode.trim().length < 4}
            loading={loading}
          />

          <Button
            title={mode === 'create' ? 'Have an invite code?' : '← Create a new home instead'}
            variant="ghost"
            onPress={() => setMode(mode === 'create' ? 'join' : 'create')}
            style={styles.toggle}
            disabled={loading}
          />
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
  title: { fontFamily: theme.fonts.black, fontSize: theme.typography.size.display, letterSpacing: -0.5, marginBottom: theme.spacing.md },
  sub: { fontFamily: theme.fonts.regular, fontSize: theme.typography.size.base, marginBottom: theme.spacing.xxxl, lineHeight: 24 },
  input: { borderRadius: theme.radius.md, borderWidth: 1, paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.lg, fontFamily: theme.fonts.regular, fontSize: theme.typography.size.lg, marginBottom: theme.spacing.xxxl },
  toggle: { marginTop: theme.spacing.md },
});
