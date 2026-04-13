/**
 * ABOUTME: Settings — iOS-style grouped sections with dark mode toggle, Inter typography.
 * ABOUTME: Elevation-only surfaces, Oura-style group labels.
 */

import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert as RNAlert, Switch } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { useHomeStore } from '../../store/homeStore';
import { theme } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import { ChevronRight } from 'lucide-react-native';

interface RowProps {
  label: string;
  value?: string;
  onPress?: () => void;
  showChevron?: boolean;
  rightNode?: React.ReactNode;
  last?: boolean;
  colors: ReturnType<typeof useTheme>['colors'];
}

function Row({ label, value, onPress, showChevron, rightNode, last, colors }: RowProps) {
  const W = onPress ? TouchableOpacity : View;
  return (
    <>
      <W style={styles.row} onPress={onPress} activeOpacity={0.7}>
        <Text style={[styles.rowLabel, { color: colors.text }]}>{label}</Text>
        <View style={styles.rowRight}>
          {value ? <Text style={[styles.rowValue, { color: colors.textSecondary }]}>{value}</Text> : null}
          {rightNode ?? null}
          {showChevron ? <ChevronRight size={16} color={colors.textMuted} style={{ marginLeft: 4 }} /> : null}
        </View>
      </W>
      {!last && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
    </>
  );
}

export default function SettingsScreen({ navigation }: any) {
  const { colors, colorScheme, toggleColorScheme } = useTheme();
  const { user, logout } = useAuthStore();
  const { getHomeById } = useHomeStore();
  const home = getHomeById(user?.linkedHomeIds[0] || '');

  const handleLogout = () => {
    RNAlert.alert('Log Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: logout },
    ]);
  };

  const handleInvite = () => {
    RNAlert.alert('Invite Code', `Share this code with your caretaker:\n\nRAKSHA-${home?.id.slice(-4).toUpperCase()}`);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        <Text style={[styles.groupLabel, { color: colors.textMuted }]}>PROFILE</Text>
        <View style={[styles.group, { backgroundColor: colors.surface }]}>
          <Row label="Name" value={user?.name} colors={colors} />
          <Row label="Phone" value={`+91 ${user?.phone}`} colors={colors} last />
        </View>

        <Text style={[styles.groupLabel, { color: colors.textMuted }]}>MY HOME</Text>
        <View style={[styles.group, { backgroundColor: colors.surface }]}>
          <Row label="Home Name" value={home?.name} colors={colors} />
          <Row label="Emergency Contacts" showChevron colors={colors}
            onPress={() => navigation.navigate('EmergencyContacts')} />
          <Row label="Invite Caretaker" showChevron colors={colors} onPress={handleInvite} last />
        </View>

        <Text style={[styles.groupLabel, { color: colors.textMuted }]}>APPEARANCE</Text>
        <View style={[styles.group, { backgroundColor: colors.surface }]}>
          <Row label="Dark Mode" colors={colors} last
            rightNode={
              <Switch value={colorScheme === 'dark'} onValueChange={toggleColorScheme}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFFFFF" />
            }
          />
        </View>

        <Text style={[styles.groupLabel, { color: colors.textMuted }]}>APP</Text>
        <View style={[styles.group, { backgroundColor: colors.surface }]}>
          <Row label="Version" value="1.0.0 (Prototype)" colors={colors} last />
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={[styles.logoutText, { color: colors.danger }]}>Log Out</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: { paddingHorizontal: theme.spacing.xl, paddingTop: theme.spacing.lg, paddingBottom: theme.spacing.md },
  title: { fontFamily: theme.fonts.black, fontSize: theme.typography.size.display, letterSpacing: -0.5 },
  container: { padding: theme.spacing.xl, paddingTop: 0, paddingBottom: theme.spacing.massive },
  groupLabel: { fontFamily: theme.fonts.medium, fontSize: theme.typography.size.xs, letterSpacing: 1.2, textTransform: 'uppercase', marginTop: theme.spacing.xxl, marginBottom: theme.spacing.sm, marginLeft: theme.spacing.sm },
  group: { borderRadius: theme.radius.md, overflow: 'hidden', ...theme.shadows.card },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: theme.spacing.lg, paddingHorizontal: theme.spacing.lg },
  rowLabel: { fontFamily: theme.fonts.regular, fontSize: theme.typography.size.base },
  rowRight: { flexDirection: 'row', alignItems: 'center' },
  rowValue: { fontFamily: theme.fonts.regular, fontSize: theme.typography.size.base },
  divider: { height: 1, marginLeft: theme.spacing.lg },
  logoutBtn: { marginTop: theme.spacing.section, padding: theme.spacing.lg, alignItems: 'center' },
  logoutText: { fontFamily: theme.fonts.medium, fontSize: theme.typography.size.base },
});
