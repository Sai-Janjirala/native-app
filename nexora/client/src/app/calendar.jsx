import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/screen-header';
import { CategoryBadge, PriorityBadge } from '@/components/task-badges';
import { Colors, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { taskApi } from '@/services/taskApi';

function getWeekDays() {
  const days = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
    days.push(d);
  }
  return days;
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatDate(d) {
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function TaskRow({ task }) {
  const isOverdue =
    !task.isCompleted && task.dueDate && new Date(task.dueDate) < new Date();

  return (
    <View style={[styles.taskRow, task.isCompleted && styles.taskRowDone]}>
      <View style={[styles.completedDot, task.isCompleted && styles.completedDotFilled]} />
      <View style={styles.taskRowBody}>
        <Text
          style={[styles.taskRowTitle, task.isCompleted && styles.taskRowTitleDone]}
          numberOfLines={1}>
          {task.title}
        </Text>
        <View style={styles.badgeRow}>
          <PriorityBadge priority={task.priority} />
          <CategoryBadge category={task.category} />
          {isOverdue && <Text style={styles.overdueTag}>Overdue</Text>}
        </View>
      </View>
    </View>
  );
}

export default function CalendarScreen() {
  const { token } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const weekDays = getWeekDays();

  const fetchTasks = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const data = await taskApi.getAll(token);
      setTasks(data.tasks || []);
    } catch (err) {
      setError(err.message || 'Could not load tasks.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const selectedDay = new Date(
    selectedDate.getFullYear(),
    selectedDate.getMonth(),
    selectedDate.getDate()
  );

  const tasksForDay = tasks.filter((t) => {
    if (!t.dueDate) return false;
    return isSameDay(new Date(t.dueDate), selectedDay);
  });

  const overdueTasks = tasks.filter(
    (t) => !t.isCompleted && t.dueDate && new Date(t.dueDate) < new Date() &&
      !isSameDay(new Date(t.dueDate), new Date())
  );

  const noDateTasks = tasks.filter((t) => !t.dueDate);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchTasks} tintColor={Colors.light.primary} />
        }>
        <ScreenHeader title="Calendar" subtitle="Tasks by due date" />

        {/* Week strip */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.weekStrip}>
          {weekDays.map((day) => {
            const isSelected = isSameDay(day, selectedDate);
            const isToday = isSameDay(day, new Date());
            const count = tasks.filter(
              (t) => t.dueDate && isSameDay(new Date(t.dueDate), day)
            ).length;

            return (
              <Pressable
                key={day.toISOString()}
                style={[styles.dayChip, isSelected && styles.dayChipSelected]}
                onPress={() => setSelectedDate(day)}>
                <Text style={[styles.dayName, isSelected && styles.dayTextSelected]}>
                  {day.toLocaleDateString('en-US', { weekday: 'short' })}
                </Text>
                <Text style={[styles.dayNum, isSelected && styles.dayTextSelected, isToday && !isSelected && styles.todayNum]}>
                  {day.getDate()}
                </Text>
                {count > 0 && (
                  <View style={[styles.dayDot, isSelected && styles.dayDotSelected]} />
                )}
              </Pressable>
            );
          })}
        </ScrollView>

        {loading ? (
          <ActivityIndicator color={Colors.light.primary} style={{ marginTop: 30 }} />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <>
            {/* Selected day tasks */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {isSameDay(selectedDate, new Date()) ? "Today's Tasks" : formatDate(selectedDate)}
              </Text>
              {tasksForDay.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyText}>No tasks due on this day.</Text>
                </View>
              ) : (
                tasksForDay.map((t) => <TaskRow key={t._id} task={t} />)
              )}
            </View>

            {/* Overdue */}
            {overdueTasks.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: Colors.light.danger }]}>
                  ⚠ Overdue ({overdueTasks.length})
                </Text>
                {overdueTasks.map((t) => <TaskRow key={t._id} task={t} />)}
              </View>
            )}

            {/* No due date */}
            {noDateTasks.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: Colors.light.textSecondary }]}>
                  No Due Date ({noDateTasks.length})
                </Text>
                {noDateTasks.map((t) => <TaskRow key={t._id} task={t} />)}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.light.background },
  content: { padding: Spacing.three, gap: Spacing.three },
  weekStrip: { marginBottom: 4, flexGrow: 0 },
  dayChip: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginRight: 8,
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
    minWidth: 54,
  },
  dayChipSelected: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  dayName: { fontSize: 11, fontWeight: '600', color: Colors.light.textSecondary, marginBottom: 2 },
  dayNum: { fontSize: 17, fontWeight: '700', color: Colors.light.text },
  dayTextSelected: { color: Colors.light.primaryText },
  todayNum: { color: Colors.light.primary },
  dayDot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: Colors.light.primary, marginTop: 4,
  },
  dayDotSelected: { backgroundColor: '#fff' },
  section: { gap: 8 },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 2,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 8,
    padding: 10,
  },
  taskRowDone: { opacity: 0.6 },
  completedDot: {
    width: 10, height: 10, borderRadius: 5,
    borderWidth: 2, borderColor: Colors.light.border,
    marginTop: 3,
  },
  completedDotFilled: { backgroundColor: Colors.light.success, borderColor: Colors.light.success },
  taskRowBody: { flex: 1, gap: 4 },
  taskRowTitle: { fontSize: 14, fontWeight: '600', color: Colors.light.text },
  taskRowTitleDone: { textDecorationLine: 'line-through', color: Colors.light.textSecondary },
  badgeRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', alignItems: 'center' },
  overdueTag: {
    fontSize: 11, fontWeight: '700', color: Colors.light.danger,
    backgroundColor: '#FEE2E2', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5,
  },
  emptyCard: {
    backgroundColor: Colors.light.surface,
    borderWidth: 1, borderColor: Colors.light.border,
    borderRadius: 8, padding: Spacing.three, alignItems: 'center',
  },
  emptyText: { color: Colors.light.textSecondary, fontSize: 14 },
  errorText: { color: Colors.light.danger, textAlign: 'center', marginTop: 20 },
});
