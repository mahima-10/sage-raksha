/**
 * ABOUTME: Contact card — avatar initial, name/relationship row, soft delete icon.
 * ABOUTME: Inter typography, elevation-only float card.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { EmergencyContact } from '../types';
import { theme } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';
import { Trash2 } from 'lucide-react-native';

interface Props {
  contact: EmergencyContact;
  onEdit: () => void;
  onDelete: () => void;
}

export default function ContactCard({ contact, onDelete }: Props) {
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <View style={[styles.avatar, { backgroundColor: colors.primaryMuted }]}>
        <Text style={[styles.avatarText, { color: colors.primary }]}>{contact.name.charAt(0).toUpperCase()}</Text>
      </View>
      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.text }]}>{contact.name}</Text>
        <Text style={[styles.meta, { color: colors.textSecondary }]}>{contact.relationship} · {contact.phone}</Text>
      </View>
      <TouchableOpacity onPress={onDelete} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Trash2 size={16} color={colors.textMuted} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: theme.radius.md, padding: theme.spacing.lg,
    marginBottom: theme.spacing.sm, ...theme.shadows.card,
  },
  avatar: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: theme.spacing.md },
  avatarText: { fontFamily: theme.fonts.bold, fontSize: theme.typography.size.base },
  info: { flex: 1 },
  name: { fontFamily: theme.fonts.semibold, fontSize: theme.typography.size.base, marginBottom: 3 },
  meta: { fontFamily: theme.fonts.regular, fontSize: theme.typography.size.sm },
});
