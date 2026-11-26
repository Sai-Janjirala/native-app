import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
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

import { Icon } from '@/components/icon';
import { ScreenHeader } from '@/components/screen-header';
import { CategoryBadge, PriorityBadge } from '@/components/task-badges';
import { TaskFormModal } from '@/components/task-form-modal';
import { Colors, Spacing } from '@/constants/theme';
import { useTasks } from '@/hooks/use-tasks';
import { formatDueLabel, isOverdue } from '@/utils/dates';

const FILTERS = [
  { id: 'open', label: 'Open' },
  { id: 'done', label: 'Done' },
  { id: 'all', label: 'All' },
];

function sortTasks(tasks, filter) {
  const copy = [...tasks];
  if (filter === 'done') {
    return copy.sort(
      (a, b) => new Date(b.completedAt || 0).getTime() - new Date(a.completedAt || 0).getTime()
    );
  }

  return copy.sort((a, b) => {
    if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
    const aTime = a.dueDate ? new Date(a.dueDate).getTime() : Number.POSITIVE_INFINITY;
    const bTime = b.dueDate ? new Date(b.dueDate).getTime() : Number.POSITIVE_INFINITY;
    if (aTime !== bTime) return aTime - bTime;
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  });
}

function TaskCard({ task, onToggle, onEdit, onDelete }) {
  const overdue = isOverdue(task);

  function confirmDelete() {
    Alert.alert('Delete task', `Delete "${task.title}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => onDelete(task._id) },
    ]);
  }

  return (
    <View style={[styles.taskCard, task.isCompleted && styles.taskCardDone]}>
      <Pressable
        style={styles.checkArea}
        onPress={() => onToggle(task._id)}
        hitSlop={6}
        accessibilityLabel={task.isCompleted ? 'Mark as open' : 'Mark as done'}>
        <View style={[styles.checkbox, task.isCompleted && styles.checkboxDone]}>
          {task.isCompleted ? (
            <Icon ios="checkmark" android="check" size={14} color="#FFFFFF" />
          ) : null}
        </View>
      </Pressable>

      <View style={styles.taskBody}>
        <Text style={[styles.taskTitle, task.isCompleted && styles.taskTitleDone]} numberOfLines={2}>
          {task.title}
        </Text>
        {task.description ? (
          <Text style={styles.taskDesc} numberOfLines={2}>
            {task.description}
          </Text>
        ) : null}
        <View style={styles.badgeRow}>
          <PriorityBadge priority={task.priority} />
          <CategoryBadge category={task.category} />
          {task.dueDate ? (
            <Text style={[styles.dueDate, overdue && styles.dueDateOverdue]}>
              {formatDueLabel(task.dueDate)}
            </Text>
          ) : null}
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable
          style={styles.actionBtn}
          onPress={() => onEdit(task)}
          hitSlop={6}
          accessibilityLabel="Edit task">
          <Icon ios="pencil" android="edit" size={16} color={Colors.light.primary} />
        </Pressable>
        <Pressable
          style={styles.actionBtn}
          onPress={confirmDelete}
          hitSlop={6}
          accessibilityLabel="Delete task">
          <Icon ios="trash" android="delete" size={16} color={Colors.light.danger} />
        </Pressable>
      </View>
    </View>
  );
}

export default function TasksScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { tasks, loading, refreshing, error, fetchTasks, createTask, updateTask, toggleTask, deleteTask } =
    useTasks();
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filter, setFilter] = useState('open');

  const isCreateParam = params.create === '1';
  const modalVisible = showForm || isCreateParam;

  function closeModal() {
    setShowForm(false);
    if (isCreateParam) {
      router.setParams({ create: undefined });
    }
  }

  const visibleTasks = useMemo(() => {
    const filtered =
      filter === 'all'
        ? tasks
        : tasks.filter((task) => (filter === 'done' ? task.isCompleted : !task.isCompleted));
    return sortTasks(filtered, filter);
  }, [tasks, filter]);

  const openCount = tasks.filter((task) => !task.isCompleted).length;
  const doneCount = tasks.length - openCount;
  const filterCounts = { open: openCount, done: doneCount, all: tasks.length };

  function openCreate() {
    setEditingTask(null);
    setShowForm(true);
  }

  function openEdit(task) {
    setEditingTask(task);
    setShowForm(true);
  }

  async function handleSave(payload) {
    if (editingTask) await updateTask(editingTask._id, payload);
    else await createTask(payload);
  }

  const emptyCopy =
    filter === 'done'
      ? 'Completed tasks will show up here.'
      : filter === 'all'
        ? 'Tap New to add your first task.'
        : 'Nothing open right now.';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.headerRow}>
        <View style={styles.headerText}>
          <ScreenHeader title="Tasks" subtitle={`${openCount} open · ${tasks.length} total`} />
        </View>
        <Pressable style={styles.addButton} onPress={openCreate}>
          <Text style={styles.addButtonText}>+ New Task</Text>
        </Pressable>
      </View>

      <View style={styles.filters}>
        {FILTERS.map((item) => {
          const selected = filter === item.id;
          return (
            <Pressable
              key={item.id}
              style={[styles.filter, selected && styles.filterSelected]}
              onPress={() => setFilter(item.id)}>
              <Text style={[styles.filterText, selected && styles.filterTextSelected]}>
                {item.label} ({filterCounts[item.id]})
              </Text>
            </Pressable>
          );
        })}
      </View>

      {loading && tasks.length === 0 ? (
        <ActivityIndicator style={styles.centered} color={Colors.light.primary} size="large" />
      ) : error && tasks.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable onPress={() => fetchTasks({ mode: 'initial' })} style={styles.retryBtn}>
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          style={styles.list}
          data={visibleTasks}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <TaskCard task={item} onToggle={toggleTask} onEdit={openEdit} onDelete={deleteTask} />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchTasks({ mode: 'refresh' })}
              tintColor={Colors.light.primary}
            />
          }
          ListHeaderComponent={
            error ? <Text style={styles.inlineError}>{error}</Text> : null
          }
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>{filter === 'open' ? 'No open tasks' : 'No tasks'}</Text>
              <Text style={styles.emptyBody}>{emptyCopy}</Text>
              {filter !== 'done' ? (
                <Pressable style={styles.emptyActionBtn} onPress={openCreate}>
                  <Text style={styles.addButtonText}>+ Create Task</Text>
                </Pressable>
              ) : null}
            </View>
          }
        />
      )}

      {modalVisible ? (
        <TaskFormModal
          key={isCreateParam ? 'new-quick' : editingTask?._id || 'new'}
          visible
          task={isCreateParam ? null : editingTask}
          onSave={handleSave}
          onClose={closeModal}
        />
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.light.background },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    gap: 12,
  },
  headerText: { flex: 1 },
  addButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: { color: Colors.light.primaryText, fontWeight: '700', fontSize: 14 },
  filters: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
  },
  filter: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.light.backgroundElement,
  },
  filterSelected: { backgroundColor: Colors.light.primary },
  filterText: { fontSize: 13, fontWeight: '600', color: Colors.light.textSecondary },
  filterTextSelected: { color: Colors.light.primaryText },
  list: { flex: 1 },
  listContent: { padding: Spacing.three, gap: 10, paddingBottom: Spacing.five },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  taskCardDone: { opacity: 0.72 },
  checkArea: { paddingTop: 1 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#C5CAD3',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.surface,
  },
  checkboxDone: { backgroundColor: Colors.light.success, borderColor: Colors.light.success },
  taskBody: { flex: 1, gap: 4 },
  taskTitle: { fontSize: 15, fontWeight: '600', color: Colors.light.text },
  taskTitleDone: { textDecorationLine: 'line-through', color: Colors.light.textSecondary },
  taskDesc: { fontSize: 13, lineHeight: 18, color: Colors.light.textSecondary },
  badgeRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', alignItems: 'center', marginTop: 2 },
  dueDate: { fontSize: 12, color: Colors.light.textSecondary, fontWeight: '600' },
  dueDateOverdue: { color: Colors.light.danger },
  actions: { gap: 12, paddingTop: 2 },
  actionBtn: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.three },
  errorText: { color: Colors.light.danger, marginBottom: 10, fontSize: 14, textAlign: 'center' },
  inlineError: { color: Colors.light.danger, fontSize: 13, marginBottom: 8 },
  retryBtn: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryText: { color: Colors.light.primaryText, fontWeight: '700' },
  emptyBox: { marginTop: 48, alignItems: 'center', paddingHorizontal: Spacing.four, gap: 10 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: Colors.light.text },
  emptyBody: { fontSize: 14, color: Colors.light.textSecondary, textAlign: 'center', lineHeight: 20 },
  emptyActionBtn: {
    marginTop: 4,
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },
});
