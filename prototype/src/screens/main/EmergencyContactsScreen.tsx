/**
 * ABOUTME: Emergency contacts — home-contextual list with Inter typography, elevation cards.
 * ABOUTME: Oura-style section header, clean add form.
 */

import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { useHomeStore } from '../../store/homeStore';
import { useContactStore } from '../../store/contactStore';
import { theme } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import Button from '../../components/Button';
import ContactCard from '../../components/ContactCard';
import { ArrowLeft } from 'lucide-react-native';

export default function EmergencyContactsScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { user } = useAuthStore();
  const { getHomeById } = useHomeStore();
  const home = getHomeById(user?.linkedHomeIds[0] || '');
  const { getContactsByHomeId, removeContact, addContact } = useContactStore();
  const contacts = getContactsByHomeId(home?.id || '');

  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relationship, setRelationship] = useState('');

  const handleSave = () => {
    if (name && phone && relationship && home?.id) {
      addContact({ id: `c-${Date.now()}`, homeId: home.id, name, phone, relationship, createdAt: new Date().toISOString() });
      setIsAdding(false); setName(''); setPhone(''); setRelationship('');
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft color={colors.text} size={22} />
        </TouchableOpacity>
        <View style={styles.titleBlock}>
          <Text style={[styles.title, { color: colors.text }]}>Emergency Contacts</Text>
          {home?.name ? <Text style={[styles.homeTag, { color: colors.textMuted }]}>{home.name}</Text> : null}
        </View>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={[styles.helper, { color: colors.textSecondary }]}>
          These contacts receive an SMS if no caretaker acknowledges an alert within the escalation window.
        </Text>

        {contacts.length > 0 && (
          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>CONTACTS</Text>
        )}

        {contacts.map(c => (
          <ContactCard key={c.id} contact={c} onEdit={() => {}} onDelete={() => removeContact(c.id)} />
        ))}

        {contacts.length === 0 && !isAdding && (
          <View style={styles.empty}>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No contacts yet</Text>
            <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>Add a contact to be notified during escalations.</Text>
          </View>
        )}

        {!isAdding ? (
          <Button title="+ Add Contact" variant="outline" onPress={() => setIsAdding(true)} style={styles.addBtn} />
        ) : (
          <View style={[styles.addForm, { backgroundColor: colors.surface }]}>
            <Text style={[styles.formTitle, { color: colors.text }]}>New Contact</Text>
            {[
              { val: name, set: setName, label: 'Full Name', kb: 'default' as const },
              { val: phone, set: setPhone, label: 'Phone number', kb: 'phone-pad' as const },
              { val: relationship, set: setRelationship, label: 'Relationship', kb: 'default' as const },
            ].map(({ val, set, label, kb }) => (
              <View key={label} style={styles.inputWrap}>
                <Text style={[styles.inputLabel, { color: colors.textMuted }]}>{label.toUpperCase()}</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surfaceHighlight, color: colors.text, borderColor: colors.border }]}
                  placeholder={label} placeholderTextColor={colors.textMuted}
                  value={val} onChangeText={set} keyboardType={kb}
                />
              </View>
            ))}
            <View style={styles.formActions}>
              <View style={{ flex: 1, marginRight: theme.spacing.sm }}>
                <Button title="Cancel" variant="secondary" onPress={() => setIsAdding(false)} />
              </View>
              <View style={{ flex: 1 }}>
                <Button title="Save" onPress={handleSave} disabled={!name || !phone || !relationship} />
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.md, paddingBottom: theme.spacing.md },
  backBtn: { padding: 8, marginLeft: -8 },
  titleBlock: { flex: 1, alignItems: 'center' },
  title: { fontFamily: theme.fonts.semibold, fontSize: theme.typography.size.lg },
  homeTag: { fontFamily: theme.fonts.regular, fontSize: theme.typography.size.sm, marginTop: 2 },
  container: { padding: theme.spacing.xl, paddingTop: theme.spacing.md, paddingBottom: theme.spacing.massive },
  helper: { fontFamily: theme.fonts.regular, fontSize: theme.typography.size.sm, lineHeight: 20, marginBottom: theme.spacing.xxl },
  sectionLabel: { fontFamily: theme.fonts.medium, fontSize: theme.typography.size.xs, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: theme.spacing.md },
  empty: { paddingVertical: theme.spacing.xxxl },
  emptyTitle: { fontFamily: theme.fonts.semibold, fontSize: theme.typography.size.lg, marginBottom: 6 },
  emptyDesc: { fontFamily: theme.fonts.regular, fontSize: theme.typography.size.base, lineHeight: 22 },
  addBtn: { marginTop: theme.spacing.lg },
  addForm: { borderRadius: theme.radius.lg, padding: theme.spacing.xl, marginTop: theme.spacing.lg, ...theme.shadows.card },
  formTitle: { fontFamily: theme.fonts.bold, fontSize: theme.typography.size.lg, marginBottom: theme.spacing.xl },
  inputWrap: { marginBottom: theme.spacing.md },
  inputLabel: { fontFamily: theme.fonts.medium, fontSize: theme.typography.size.xs, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 6 },
  input: { borderRadius: theme.radius.sm, paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.md, fontFamily: theme.fonts.regular, fontSize: theme.typography.size.base, borderWidth: 1 },
  formActions: { flexDirection: 'row', marginTop: theme.spacing.md },
});
