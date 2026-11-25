import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/screen-header';
import { CategoryBadge, PriorityBadge } from '@/components/task-badges';
import { TaskFormModal } from '@/components/task-form-modal';
import { Colors, Spacing } from '@/constants/theme';
import { useTasks } from '@/hooks/use-tasks';

function TaskCard({ task, onToggle, onEdit, onDelete }) {
  const isOverdue = !task.isCompleted && task.dueDate && new Date(task.dueDate) < new Date();

  function confirmDelete() {
    Alert.alert('Delete Task', `Delete "${task.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => onDelete(task._id) },
    ]);
  }

  return (
    <View style={[styles.taskCard, task.isCompleted && styles.taskCardDone]}>
      <Pressable style={styles.checkArea} onPress={() => onToggle(task._id)}>
        <View style={[styles.checkbox, task.isCompleted && styles.checkboxDone]}>
          {task.isCompleted ? <Text style={styles.checkmark}>✓</Text> : null}
        </View>
      </Pressable>

      <View style={styles.taskBody}>
        <Text
          style={[styles.taskTitle, task.isCompleted && styles.taskTitleDone]}
          numberOfLines={2}>
          {task.title}
        </Text>

        {task.description ? (
          <Text style={styles.taskDesc} numberOfLines={1}>
            {task.description}
          </Text>
        ) : null}

        <View style={styles.badgeRow}>
          <PriorityBadge priority={task.priority} />
          <CategoryBadge category={task.category} />
          {task.dueDate ? (
            <Text style={[styles.dueDate, isOverdue && styles.dueDateOverdue]}>
              {isOverdue ? '⚠ ' : ''}
              {new Date(task.dueDate).toLocaleDateString()}
            </Text>
          ) : null}
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable style={styles.actionBtn} onPress={() => onEdit(task)}>
          <Text style={styles.actionEdit}>Edit</Text>
        </Pressable>
        <Pressable style={styles.actionBtn} onPress={confirmDelete}>
          <Text style={styles.actionDelete}>Del</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function TasksScreen() {
  const { tasks, loading, error, fetchTasks, createTask, updateTask, toggleTask, deleteTask } =
    useTasks();
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  function openCreate() {
    setEditingTask(null);
    setShowForm(true);
  }

  function openEdit(task) {
    setEditingTask(task);
    setShowForm(true);
  }

  async function handleSave(payload) {
    if (editingTask) {
      await updateTask(editingTask._id, payload);
    } else {
      await createTask(payload);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerRow}>
        <ScreenHeader title="Tasks" subtitle={`${tasks.length} total`} />
        <Pressable style={styles.addButton} onPress={openCreate}>
          <Text style={styles.addButtonText}>+ New</Text>
        </Pressable>
      </View>

      {loading ? (
        <ActivityIndicator style={styles.centered} color={Colors.light.primary} size="large" />
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable onPress={fetchTasks} style={styles.retryBtn}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <TaskCard
              task={item}
              onToggle={toggleTask}
              onEdit={openEdit}
              onDelete={deleteTask}
            />
          )}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={fetchTasks} tintColor={Colors.light.primary} />
          }
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>No tasks yet</Text>
              <Text style={styles.emptyBody}>Tap "+ New" to create your first task.</Text>
            </View>
          }
        />
      )}

      <TaskFormModal
        visible={showForm}
        task={editingTask}
        onSave={handleSave}
        onClose={() => setShowForm(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.light.background },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
  },
  addButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: { color: Colors.light.primaryText, fontWeight: '700', fontSize: 14 },
  list: { padding: Spacing.three, gap: 10 },
  taskCard: {
    flexDirection: 'row',
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 10,
    padding: Spacing.two,
    gap: Spacing.two,
  },
  taskCardDone: { opacity: 0.7 },
  checkArea: { paddingTop: 2 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.light.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxDone: { backgroundColor: Colors.light.success, borderColor: Colors.light.success },
  checkmark: { color: '#fff', fontSize: 13, fontWeight: '700' },
  taskBody: { flex: 1 },
  taskTitle: { fontSize: 15, fontWeight: '600', color: Colors.light.text, marginBottom: 3 },
  taskTitleDone: { textDecorationLine: 'line-through', color: Colors.light.textSecondary },
  taskDesc: { fontSize: 13, color: Colors.light.textSecondary, marginBottom: 6 },
  badgeRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', alignItems: 'center' },
  dueDate: { fontSize: 11, color: Colors.light.textSecondary, fontWeight: '600' },
  dueDateOverdue: { color: Colors.light.danger },
  actions: { justifyContent: 'center', gap: 4 },
  actionBtn: { paddingVertical: 3, paddingHorizontal: 6 },
  actionEdit: { fontSize: 12, color: Colors.light.primary, fontWeight: '600' },
  actionDelete: { fontSize: 12, color: Colors.light.danger, fontWeight: '600' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: Colors.light.danger, marginBottom: 10, fontSize: 14 },
  retryBtn: { backgroundColor: Colors.light.primary, paddingHorizontal: 20, paddingVertical: 8, borderRadius: 8 },
  retryText: { color: Colors.light.primaryText, fontWeight: '700' },
  emptyBox: {
    marginTop: 60,
    alignItems: 'center',
  },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: Colors.light.text, marginBottom: 6 },
  emptyBody: { fontSize: 14, color: Colors.light.textSecondary, textAlign: 'center' },
});
