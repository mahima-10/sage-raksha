/**
 * ABOUTME: Mode selection — app entry screen with Inter Black branding, elevation cards.
 * ABOUTME: Oura/Apple Health premium aesthetic for first impression.
 */

import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { theme } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import { Shield, Building2, ChevronRight, Activity } from 'lucide-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types';

type Props = { navigation: NativeStackNavigationProp<AuthStackParamList, 'ModeSelection'> };

export default function ModeSelectionScreen({ navigation }: Props) {
  const { colors, colorScheme } = useTheme();
  const { setMode } = useAuthStore();

  const handleSelectMode = (mode: 'independent' | 'facility') => {
    setMode(mode);
    navigation.navigate('PhoneAuth');
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
      <View style={styles.container}>
        {/* Logo */}
        <View style={styles.logoSection}>
          <View style={[styles.logoRing, { borderColor: colors.primary }]}>
            <Activity color={colors.primary} size={34} />
          </View>
          <Text style={[styles.appName, { color: colors.text }]}>S.A.G.E Raksha</Text>
          <Text style={[styles.appTagline, { color: colors.textSecondary }]}>Smart Alert Guard for Elderly</Text>
        </View>

        {/* Mode cards */}
        <Text style={[styles.prompt, { color: colors.textSecondary }]}>CHOOSE YOUR SETUP</Text>

        <TouchableOpacity style={[styles.modeCard, { backgroundColor: colors.surface }]}
          onPress={() => handleSelectMode('independent')} activeOpacity={0.82}>
          <View style={[styles.modeIcon, { backgroundColor: colors.primaryMuted }]}>
            <Shield color={colors.primary} size={26} />
          </View>
          <View style={styles.modeText}>
            <Text style={[styles.modeTitle, { color: colors.text }]}>Independent Home</Text>
            <Text style={[styles.modeDesc, { color: colors.textSecondary }]}>
              Monitor your elderly parents. Best for families.
            </Text>
          </View>
          <ChevronRight color={colors.textMuted} size={22} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.modeCard, { backgroundColor: colors.surface, opacity: 0.45 }]} disabled>
          <View style={[styles.modeIcon, { backgroundColor: colors.surfaceHighlight }]}>
            <Building2 color={colors.textMuted} size={26} />
          </View>
          <View style={styles.modeText}>
            <Text style={[styles.modeTitle, { color: colors.text }]}>Facility Mode</Text>
            <Text style={[styles.modeDesc, { color: colors.textSecondary }]}>For care homes with multiple rooms — Coming Soon</Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1, padding: theme.spacing.xl, justifyContent: 'center' },
  logoSection: { alignItems: 'center', marginBottom: theme.spacing.massive },
  logoRing: { width: 80, height: 80, borderRadius: 40, borderWidth: 3, justifyContent: 'center', alignItems: 'center', marginBottom: theme.spacing.lg },
  appName: { fontFamily: theme.fonts.black, fontSize: theme.typography.size.display, letterSpacing: -1, marginBottom: theme.spacing.xs, textAlign: 'center' },
  appTagline: { fontFamily: theme.fonts.regular, fontSize: theme.typography.size.base, textAlign: 'center' },
  prompt: { fontFamily: theme.fonts.medium, fontSize: theme.typography.size.xs, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: theme.spacing.lg },
  modeCard: { borderRadius: theme.radius.md, padding: theme.spacing.lg, marginBottom: theme.spacing.md, flexDirection: 'row', alignItems: 'center', ...theme.shadows.card },
  modeIcon: { width: 52, height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center', marginRight: theme.spacing.md },
  modeText: { flex: 1, marginRight: theme.spacing.md },
  modeTitle: { fontFamily: theme.fonts.semibold, fontSize: theme.typography.size.lg, marginBottom: 4 },
  modeDesc: { fontFamily: theme.fonts.regular, fontSize: theme.typography.size.sm, lineHeight: 19 },
});
