import { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Colors, Spacing } from '@/constants/theme';

const PRIORITIES = ['low', 'medium', 'high'];
const CATEGORIES = ['personal', 'study', 'work'];

export function TaskFormModal({ visible, task, onSave, onClose }) {
  const isEdit = !!task;
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [priority, setPriority] = useState(task?.priority || 'medium');
  const [category, setCategory] = useState(task?.category || 'personal');
  const [dueDate, setDueDate] = useState(
    task?.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : ''
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSave() {
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }

    let parsedDate = null;
    if (dueDate.trim()) {
      const d = new Date(dueDate.trim());
      if (isNaN(d.getTime())) {
        setError('Invalid date. Use YYYY-MM-DD format.');
        return;
      }
      parsedDate = d.toISOString();
    }

    setError('');
    setSubmitting(true);
    try {
      await onSave({ title: title.trim(), description: description.trim(), priority, category, dueDate: parsedDate });
      onClose();
    } catch (err) {
      setError(err.message || 'Could not save task.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{isEdit ? 'Edit Task' : 'New Task'}</Text>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>Cancel</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="What needs to be done?"
            placeholderTextColor={Colors.light.textSecondary}
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Optional details..."
            placeholderTextColor={Colors.light.textSecondary}
            multiline
            numberOfLines={3}
          />

          <Text style={styles.label}>Priority</Text>
          <View style={styles.pills}>
            {PRIORITIES.map((p) => (
              <Pressable
                key={p}
                style={[styles.pill, priority === p && styles.pillActive]}
                onPress={() => setPriority(p)}>
                <Text style={[styles.pillText, priority === p && styles.pillTextActive]}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>Category</Text>
          <View style={styles.pills}>
            {CATEGORIES.map((c) => (
              <Pressable
                key={c}
                style={[styles.pill, category === c && styles.pillActive]}
                onPress={() => setCategory(c)}>
                <Text style={[styles.pillText, category === c && styles.pillTextActive]}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>Due Date (YYYY-MM-DD)</Text>
          <TextInput
            style={styles.input}
            value={dueDate}
            onChangeText={setDueDate}
            placeholder="e.g. 2025-12-31"
            placeholderTextColor={Colors.light.textSecondary}
            keyboardType={Platform.OS === 'ios' ? 'default' : 'default'}
          />

          <Pressable
            style={[styles.saveButton, submitting && styles.disabled]}
            onPress={handleSave}
            disabled={submitting}>
            {submitting ? (
              <ActivityIndicator color={Colors.light.primaryText} />
            ) : (
              <Text style={styles.saveButtonText}>{isEdit ? 'Save Changes' : 'Create Task'}</Text>
            )}
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
  },
  closeButton: { paddingVertical: 4, paddingHorizontal: 8 },
  closeText: { fontSize: 15, color: Colors.light.primary, fontWeight: '600' },
  form: { padding: Spacing.three, gap: 4 },
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
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: Colors.light.text,
    marginBottom: 4,
  },
  textArea: { minHeight: 72, textAlignVertical: 'top' },
  pills: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.surface,
  },
  pillActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  pillText: { fontSize: 13, fontWeight: '600', color: Colors.light.textSecondary },
  pillTextActive: { color: Colors.light.primaryText },
  saveButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: 8,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: Spacing.three,
  },
  disabled: { opacity: 0.7 },
  saveButtonText: { color: Colors.light.primaryText, fontSize: 15, fontWeight: '700' },
});
