import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GlassCard } from '@/components/glass-card';
import { Icon } from '@/components/icon';
import { ScreenHeader } from '@/components/screen-header';
import { CategoryBadge, PriorityBadge } from '@/components/task-badges';
import { Colors, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { syncTaskReminder } from '@/services/notifications';
import { taskApi } from '@/services/taskApi';
import { formatWeekRange, getWeekDays, isOverdue, isSameDay } from '@/utils/dates';

function toInputDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function TaskRow({ task, onToggle }) {
  const overdue = isOverdue(task);

  return (
    <Pressable onPress={() => onToggle(task)}>
      <GlassCard style={[styles.taskRow, task.isCompleted && styles.taskRowDone]}>
        <View style={[styles.checkbox, task.isCompleted && styles.checkboxDone]}>
          {task.isCompleted ? <Icon ios="checkmark" android="check" size={12} color="#FFFFFF" /> : null}
        </View>
        <View style={styles.taskRowBody}>
          <Text style={[styles.taskRowTitle, task.isCompleted && styles.taskRowTitleDone]} numberOfLines={1}>
            {task.title}
          </Text>
          <View style={styles.badgeRow}>
            <PriorityBadge priority={task.priority} />
            <CategoryBadge category={task.category} />
            {overdue ? <Text style={styles.overdueTag}>Overdue</Text> : null}
          </View>
        </View>
      </GlassCard>
    </Pressable>
  );
}

export default function CalendarScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [weekOffset, setWeekOffset] = useState(0);
  const hasLoaded = useRef(false);
  const requestId = useRef(0);

  const load = useCallback(async (mode = 'initial') => {
    if (!token) return;
    const id = ++requestId.current;
    if (mode === 'refresh') setRefreshing(true);
    else if (!hasLoaded.current) setLoading(true);

    try {
      const data = await taskApi.getAll(token);
      if (requestId.current !== id) return;
      setTasks(data.tasks || []);
      setError('');
      hasLoaded.current = true;
    } catch (err) {
      if (requestId.current !== id) return;
      setError(err.message || 'Could not load tasks.');
    } finally {
      if (requestId.current === id) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      load(hasLoaded.current ? 'silent' : 'initial');
    }, [load])
  );

  const weekDays = getWeekDays(weekOffset);
  const today = new Date();

  function changeWeek(delta) {
    const next = weekOffset + delta;
    const days = getWeekDays(next);
    setWeekOffset(next);
    if (!days.some((day) => isSameDay(day, selectedDate))) {
      setSelectedDate(days.find((day) => isSameDay(day, today)) || days[0]);
    }
  }

  function goToday() {
    setWeekOffset(0);
    setSelectedDate(new Date());
  }

  async function toggleTask(task) {
    try {
      const data = await taskApi.toggle(token, task._id);
      setTasks((prev) => prev.map((item) => (item._id === task._id ? data.task : item)));
      await syncTaskReminder(data.task);
    } catch (err) {
      Alert.alert('Could not update task', err.message || 'Try again.');
    }
  }

  const tasksForDay = tasks.filter(
    (task) => task.dueDate && isSameDay(new Date(task.dueDate), selectedDate)
  );
  const dayDone = tasksForDay.filter((task) => task.isCompleted).length;
  const dayRate = tasksForDay.length > 0 ? Math.round((dayDone / tasksForDay.length) * 100) : 0;

  const overdueTasks = tasks.filter(
    (task) => isOverdue(task) && !(task.dueDate && isSameDay(new Date(task.dueDate), selectedDate))
  );
  const noDateTasks = tasks.filter((task) => !task.dueDate);
  const showingToday = isSameDay(selectedDate, today);

  const dayHeading = showingToday
    ? 'Today'
    : selectedDate.toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
      });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => load('refresh')}
            tintColor={Colors.light.primary}
          />
        }>
        <View style={styles.headerRow}>
          <ScreenHeader title="Calendar" subtitle="Plan your week at a glance" />
          {!showingToday ? (
            <Pressable style={styles.todayPill} onPress={goToday}>
              <Text style={styles.todayPillText}>Today</Text>
            </Pressable>
          ) : null}
        </View>

        <GlassCard style={styles.weekCard}>
          <View style={styles.weekNav}>
            <Pressable style={styles.navArrow} onPress={() => changeWeek(-1)} hitSlop={8} accessibilityLabel="Previous week">
              <Icon ios="chevron.left" android="chevron_left" size={18} color={Colors.light.text} />
            </Pressable>
            <Text style={styles.weekLabel}>{formatWeekRange(weekDays)}</Text>
            <Pressable style={styles.navArrow} onPress={() => changeWeek(1)} hitSlop={8} accessibilityLabel="Next week">
              <Icon ios="chevron.right" android="chevron_right" size={18} color={Colors.light.text} />
            </Pressable>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.weekStrip}>
            {weekDays.map((day) => {
              const selected = isSameDay(day, selectedDate);
              const isToday = isSameDay(day, today);
              const count = tasks.filter((task) => task.dueDate && isSameDay(new Date(task.dueDate), day)).length;

              return (
                <Pressable
                  key={day.toISOString()}
                  style={[
                    styles.dayChip,
                    isToday && !selected && styles.dayChipToday,
                    selected && styles.dayChipSelected,
                  ]}
                  onPress={() => setSelectedDate(day)}>
                  <Text style={[styles.dayName, selected && styles.dayTextSelected]}>
                    {day.toLocaleDateString(undefined, { weekday: 'short' })}
                  </Text>
                  <Text
                    style={[
                      styles.dayNum,
                      selected && styles.dayTextSelected,
                      isToday && !selected && styles.todayNum,
                    ]}>
                    {day.getDate()}
                  </Text>
                  <View
                    style={[
                      styles.countPill,
                      count === 0 && styles.countPillEmpty,
                      selected && count > 0 && styles.countPillSelected,
                    ]}>
                    <Text
                      style={[
                        styles.countText,
                        count === 0 && styles.countTextEmpty,
                        selected && styles.countTextSelected,
                      ]}>
                      {count > 0 ? count : '·'}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        </GlassCard>

        {loading && tasks.length === 0 ? (
          <ActivityIndicator color={Colors.light.primary} style={styles.loader} />
        ) : error && tasks.length === 0 ? (
          <GlassCard style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable onPress={() => load('initial')} style={styles.retryBtn}>
              <Text style={styles.retryText}>Try again</Text>
            </Pressable>
          </GlassCard>
        ) : (
          <>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <GlassCard variant="accent" style={styles.daySummary}>
              <View style={styles.daySummaryTop}>
                <View>
                  <Text style={styles.daySummaryTitle}>{dayHeading}</Text>
                  <Text style={styles.daySummaryMeta}>
                    {tasksForDay.length === 0
                      ? 'No tasks scheduled yet'
                      : `${dayDone} of ${tasksForDay.length} done (${dayRate}%)`}
                  </Text>
                </View>
                <Pressable
                  style={styles.addDayBtn}
                  onPress={() =>
                    router.push({
                      pathname: '/tasks',
                      params: { create: '1', date: toInputDate(selectedDate) },
                    })
                  }>
                  <Icon ios="plus" android="add" size={16} color="#FFFFFF" />
                  <Text style={styles.addDayText}>Add</Text>
                </Pressable>
              </View>
              {tasksForDay.length > 0 ? (
                <View style={styles.dayProgressTrack}>
                  <View style={[styles.dayProgressFill, { width: `${dayRate}%` }]} />
                </View>
              ) : null}
            </GlassCard>

            <View style={styles.section}>
              {tasksForDay.length === 0 ? (
                <GlassCard>
                  <Text style={styles.emptyText}>
                    Tap + Add above to schedule a task for {dayHeading}.
                  </Text>
                </GlassCard>
              ) : (
                tasksForDay.map((task) => <TaskRow key={task._id} task={task} onToggle={toggleTask} />)
              )}
            </View>

            {overdueTasks.length > 0 ? (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, styles.dangerTitle]}>
                  Overdue ({overdueTasks.length})
                </Text>
                {overdueTasks.map((task) => (
                  <TaskRow key={task._id} task={task} onToggle={toggleTask} />
                ))}
              </View>
            ) : null}

            {noDateTasks.length > 0 ? (
              <View style={styles.section}>
                <Text style={styles.mutedTitle}>No due date ({noDateTasks.length})</Text>
                {noDateTasks.map((task) => (
                  <TaskRow key={task._id} task={task} onToggle={toggleTask} />
                ))}
              </View>
            ) : null}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: Colors.light.background },
  content: { padding: Spacing.three, paddingBottom: 104, gap: Spacing.three },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  todayPill: {
    backgroundColor: Colors.light.black,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  todayPillText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  weekCard: { padding: Spacing.two + 4, gap: Spacing.two },
  weekNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  navArrow: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: Colors.light.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekLabel: { fontSize: 14, fontWeight: '700', color: Colors.light.text },
  weekStrip: { flexGrow: 0 },
  dayChip: {
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 6,
    borderRadius: 12,
    marginRight: 8,
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.border,
    width: 50,
  },
  dayChipToday: {
    borderColor: Colors.light.black,
    borderWidth: 1.5,
  },
  dayChipSelected: { backgroundColor: Colors.light.primary, borderColor: Colors.light.primary },
  dayName: { fontSize: 11, fontWeight: '600', color: Colors.light.textSecondary, marginBottom: 2 },
  dayNum: { fontSize: 16, fontWeight: '700', color: Colors.light.text },
  dayTextSelected: { color: Colors.light.primaryText },
  todayNum: { color: Colors.light.primary },
  countPill: {
    marginTop: 5,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 5,
    backgroundColor: Colors.light.backgroundElement,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countPillEmpty: { backgroundColor: 'transparent' },
  countPillSelected: { backgroundColor: 'rgba(255, 255, 255, 0.22)' },
  countText: { fontSize: 10, fontWeight: '700', color: Colors.light.primary },
  countTextEmpty: { color: Colors.light.textSecondary },
  countTextSelected: { color: '#FFFFFF' },
  daySummary: { gap: 10 },
  daySummaryTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  daySummaryTitle: { fontSize: 17, fontWeight: '700', color: Colors.light.black },
  daySummaryMeta: { fontSize: 13, color: Colors.light.textSecondary, marginTop: 2 },
  addDayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  addDayText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  dayProgressTrack: {
    height: 6,
    backgroundColor: '#DBEAFE',
    borderRadius: 3,
    overflow: 'hidden',
  },
  dayProgressFill: { height: '100%', backgroundColor: Colors.light.primary, borderRadius: 3 },
  section: { gap: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.light.text },
  dangerTitle: { color: Colors.light.danger },
  mutedTitle: { fontSize: 15, fontWeight: '700', color: Colors.light.textSecondary },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 12,
  },
  taskRowDone: { opacity: 0.65 },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#C5CAD3',
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxDone: { backgroundColor: Colors.light.success, borderColor: Colors.light.success },
  taskRowBody: { flex: 1, gap: 6 },
  taskRowTitle: { fontSize: 15, fontWeight: '600', color: Colors.light.text },
  taskRowTitleDone: { textDecorationLine: 'line-through', color: Colors.light.textSecondary },
  badgeRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', alignItems: 'center' },
  overdueTag: { fontSize: 11, fontWeight: '700', color: Colors.light.danger },
  emptyText: { color: Colors.light.textSecondary, fontSize: 14 },
  loader: { marginTop: 24 },
  errorBox: { alignItems: 'center', gap: 12 },
  errorText: { color: Colors.light.danger, fontSize: 14, textAlign: 'center' },
  retryBtn: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryText: { color: Colors.light.primaryText, fontWeight: '700' },
});
