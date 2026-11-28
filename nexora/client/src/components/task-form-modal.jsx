import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, Radii, Shadows, Spacing } from '@/constants/theme';
import { addDaysInput, parseDueDateInput, toDateInput } from '@/utils/dates';

const PRIORITIES = ['low', 'medium', 'high'];
const CATEGORIES = ['personal', 'study', 'work'];
const DATE_SHORTCUTS = [
  { label: 'Today', value: () => addDaysInput(0) },
  { label: 'Tomorrow', value: () => addDaysInput(1) },
  { label: 'Next week', value: () => addDaysInput(7) },
];

function labelFor(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function TaskFormModal({ visible, task, initialDate = '', onSave, onClose }) {
  const isEdit = !!task;
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [priority, setPriority] = useState(task?.priority || 'medium');
  const [category, setCategory] = useState(task?.category || 'personal');
  const [dueDate, setDueDate] = useState(task?.dueDate ? toDateInput(task.dueDate) : initialDate);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSave() {
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }

    const parsed = parseDueDateInput(dueDate);
    if (parsed.error) {
      setError(parsed.error);
      return;
    }

    setError('');
    setSubmitting(true);
    try {
      await onSave({
        title: title.trim(),
        description: description.trim(),
        priority,
        category,
        dueDate: parsed.iso,
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Could not save task.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.modalContainer} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{isEdit ? 'Edit task' : 'New task'}</Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <Text style={styles.closeText}>Cancel</Text>
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Task title"
              placeholderTextColor={Colors.light.textSecondary}
              maxLength={200}
            />

            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Optional"
              placeholderTextColor={Colors.light.textSecondary}
              multiline
              maxLength={1000}
            />

            <Text style={styles.label}>Priority</Text>
            <View style={styles.pills}>
              {PRIORITIES.map((item) => (
                <Pressable
                  key={item}
                  style={[styles.pill, priority === item && styles.pillActive]}
                  onPress={() => setPriority(item)}>
                  <Text style={[styles.pillText, priority === item && styles.pillTextActive]}>
                    {labelFor(item)}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.label}>Category</Text>
            <View style={styles.pills}>
              {CATEGORIES.map((item) => (
                <Pressable
                  key={item}
                  style={[styles.pill, category === item && styles.pillActive]}
                  onPress={() => setCategory(item)}>
                  <Text style={[styles.pillText, category === item && styles.pillTextActive]}>
                    {labelFor(item)}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.label}>Due date</Text>
            <View style={styles.pills}>
              {DATE_SHORTCUTS.map((shortcut) => {
                const value = shortcut.value();
                const selected = dueDate === value;
                return (
                  <Pressable
                    key={shortcut.label}
                    style={[styles.pill, selected && styles.pillActive]}
                    onPress={() => setDueDate(selected ? '' : value)}>
                    <Text style={[styles.pillText, selected && styles.pillTextActive]}>{shortcut.label}</Text>
                  </Pressable>
                );
              })}
            </View>
            <TextInput
              style={styles.input}
              value={dueDate}
              onChangeText={setDueDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={Colors.light.textSecondary}
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={10}
            />

            <Pressable
              style={[styles.saveButton, submitting && styles.disabled]}
              onPress={handleSave}
              disabled={submitting}>
              {submitting ? (
                <ActivityIndicator color={Colors.light.primaryText} />
              ) : (
                <Text style={styles.saveButtonText}>{isEdit ? 'Save changes' : 'Create task'}</Text>
              )}
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  modalContainer: { flex: 1, backgroundColor: Colors.light.background },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
    backgroundColor: Colors.light.surface,
  },
  modalTitle: { fontSize: 17, fontWeight: '700', color: Colors.light.text },
  closeText: { fontSize: 15, color: Colors.light.primary, fontWeight: '600' },
  form: { padding: Spacing.three, paddingBottom: Spacing.five },
  errorBox: {
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    padding: Spacing.two,
    marginBottom: Spacing.two,
  },
  errorText: { color: Colors.light.danger, fontSize: 13, fontWeight: '600' },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 6,
    marginTop: Spacing.two,
  },
  input: {
    backgroundColor: Colors.light.surfaceMuted,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: Radii.md,
    paddingHorizontal: 13,
    paddingVertical: 11,
    fontSize: 15,
    color: Colors.light.text,
  },
  textArea: { minHeight: 84, textAlignVertical: 'top' },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radii.pill,
    borderWidth: 1,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.surface,
  },
  pillActive: { backgroundColor: Colors.light.primary, borderColor: Colors.light.primary },
  pillText: { fontSize: 13, fontWeight: '600', color: Colors.light.textSecondary },
  pillTextActive: { color: Colors.light.primaryText },
  saveButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: Radii.pill,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: Spacing.four,
    ...Shadows.accent,
  },
  disabled: { opacity: 0.7 },
  saveButtonText: { color: Colors.light.primaryText, fontSize: 15, fontWeight: '700' },
});
