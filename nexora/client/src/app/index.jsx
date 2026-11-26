import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FocusTimer } from '@/components/focus-timer';
import { GlassCard } from '@/components/glass-card';
import { Icon } from '@/components/icon';
import { ScreenHeader } from '@/components/screen-header';
import { Colors, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { taskApi } from '@/services/taskApi';
import { formatDueLabel, formatLongDate, isOverdue, startOfDay } from '@/utils/dates';

function pickUpcoming(tasks) {
  return tasks
    .filter((task) => !task.isCompleted)
    .sort((a, b) => {
      const aDue = a.dueDate ? startOfDay(new Date(a.dueDate)).getTime() : Number.POSITIVE_INFINITY;
      const bDue = b.dueDate ? startOfDay(new Date(b.dueDate)).getTime() : Number.POSITIVE_INFINITY;
      if (aDue !== bDue) return aDue - bDue;
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    })
    .slice(0, 4);
}

function Metric({ label, value, tone }) {
  return (
    <GlassCard style={styles.metric}>
      <Text style={[styles.metricValue, tone && { color: tone }]}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </GlassCard>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { user, token } = useAuth();
  const [stats, setStats] = useState(null);
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const hasLoaded = useRef(false);
  const requestId = useRef(0);

  const load = useCallback(async (mode = 'initial') => {
    if (!token) return;

    const id = ++requestId.current;
    if (mode === 'refresh') setRefreshing(true);
    else if (!hasLoaded.current) setLoading(true);

    try {
      const [dashboard, all] = await Promise.all([
        taskApi.getDashboard(token),
        taskApi.getAll(token),
      ]);
      if (requestId.current !== id) return;
      setStats(dashboard);
      setUpcoming(pickUpcoming(all.tasks || []));
      setError('');
      hasLoaded.current = true;
    } catch (err) {
      if (requestId.current !== id) return;
      setError(err.message || 'Could not load your tasks.');
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

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.name?.split(' ')[0] || 'there';

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
        <ScreenHeader title={`${greeting}, ${firstName}`} subtitle={formatLongDate(new Date())} />

        {loading && !stats ? (
          <ActivityIndicator color={Colors.light.primary} style={styles.loader} />
        ) : null}

        {error && !stats ? (
          <GlassCard style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable onPress={() => load('initial')} style={styles.retryBtn}>
              <Text style={styles.retryText}>Try again</Text>
            </Pressable>
          </GlassCard>
        ) : null}

        {error && stats ? <Text style={styles.inlineError}>{error}</Text> : null}

        {stats ? (
          <>
            <GlassCard variant="dark" style={styles.summary}>
              <View style={styles.summaryTop}>
                <Text style={styles.summaryValue}>{stats.completionRate}%</Text>
                <Text style={styles.summaryLabel}>completed</Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${stats.completionRate}%` }]} />
              </View>
              <Text style={styles.summaryMeta}>
                {stats.completed} done · {stats.pending} open · {stats.total} total
              </Text>
            </GlassCard>

            <View style={styles.quickRow}>
              <Pressable
                style={styles.primaryAction}
                onPress={() => router.push({ pathname: '/tasks', params: { create: '1' } })}>
                <Icon ios="plus" android="add" size={18} color="#FFFFFF" />
                <Text style={styles.primaryActionText}>New Task</Text>
              </Pressable>
              <Pressable
                style={styles.secondaryAction}
                onPress={() => router.push('/calendar')}>
                <Icon ios="calendar" android="calendar_month" size={18} color={Colors.light.black} />
                <Text style={styles.secondaryActionText}>Calendar</Text>
              </Pressable>
            </View>

            <View style={styles.metricRow}>
              <Metric label="Due today" value={stats.todayTasks} tone={Colors.light.primary} />
              <Metric
                label="Overdue"
                value={stats.overdue}
                tone={stats.overdue > 0 ? Colors.light.danger : Colors.light.text}
              />
            </View>

            {stats.total === 0 ? (
              <GlassCard variant="accent" style={styles.guideCard}>
                <Text style={styles.guideTitle}>Getting started with Nexora</Text>
                <Text style={styles.guideStep}>1. Tap New Task to add something you need to do.</Text>
                <Text style={styles.guideStep}>2. Pick a priority and due date so nothing slips.</Text>
                <Text style={styles.guideStep}>3. Check off tasks and track your progress here.</Text>
                <Pressable
                  style={styles.guideBtn}
                  onPress={() => router.push({ pathname: '/tasks', params: { create: '1' } })}>
                  <Text style={styles.guideBtnText}>Create your first task</Text>
                </Pressable>
              </GlassCard>
            ) : (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Up next</Text>
                  <Pressable onPress={() => router.push('/tasks')} hitSlop={8}>
                    <Text style={styles.sectionLink}>All tasks</Text>
                  </Pressable>
                </View>

                {upcoming.length === 0 ? (
                  <GlassCard>
                    <Text style={styles.emptyLine}>All caught up! No open tasks right now.</Text>
                  </GlassCard>
                ) : (
                  upcoming.map((task) => {
                    const overdue = isOverdue(task);
                    const meta = [
                      task.category.charAt(0).toUpperCase() + task.category.slice(1),
                      task.priority.charAt(0).toUpperCase() + task.priority.slice(1),
                      task.dueDate ? formatDueLabel(task.dueDate) : 'No date',
                    ].join(' · ');

                    return (
                      <Pressable key={task._id} onPress={() => router.push('/tasks')}>
                        <GlassCard style={styles.upcomingRow}>
                          <View style={[styles.upcomingMark, overdue && styles.upcomingMarkOverdue]} />
                          <View style={styles.upcomingBody}>
                            <Text style={styles.upcomingTitle} numberOfLines={1}>
                              {task.title}
                            </Text>
                            <Text style={[styles.upcomingMeta, overdue && styles.overdueText]}>
                              {meta}
                            </Text>
                          </View>
                        </GlassCard>
                      </Pressable>
                    );
                  })
                )}
              </View>
            )}
          </>
        ) : null}

        <FocusTimer />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: Colors.light.background },
  content: { padding: Spacing.three, paddingBottom: Spacing.five, gap: Spacing.three },
  loader: { marginTop: 32 },
  summary: { padding: Spacing.three + 2 },
  summaryTop: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  summaryValue: { fontSize: 36, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.8 },
  summaryLabel: { fontSize: 15, color: '#94A3B8', fontWeight: '600' },
  progressBar: {
    height: 7,
    backgroundColor: '#1E293B',
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 14,
  },
  progressFill: { height: '100%', backgroundColor: '#3B82F6', borderRadius: 4 },
  summaryMeta: { marginTop: 10, fontSize: 13, color: '#CBD5E1', fontWeight: '500' },
  quickRow: { flexDirection: 'row', gap: 10 },
  primaryAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    paddingVertical: 12,
  },
  primaryActionText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  secondaryAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 12,
    paddingVertical: 12,
  },
  secondaryActionText: { color: Colors.light.black, fontSize: 14, fontWeight: '700' },
  metricRow: { flexDirection: 'row', gap: 10 },
  metric: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: Spacing.three,
  },
  metricValue: { fontSize: 24, fontWeight: '700', color: Colors.light.text },
  metricLabel: { marginTop: 2, fontSize: 13, color: Colors.light.textSecondary, fontWeight: '600' },
  guideCard: { gap: 6 },
  guideTitle: { fontSize: 16, fontWeight: '700', color: Colors.light.black, marginBottom: 4 },
  guideStep: { fontSize: 13, lineHeight: 20, color: Colors.light.textSecondary },
  guideBtn: {
    marginTop: 8,
    backgroundColor: Colors.light.primary,
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
  },
  guideBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  section: { gap: 8 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.light.text },
  sectionLink: { fontSize: 14, fontWeight: '600', color: Colors.light.primary },
  emptyLine: { fontSize: 14, color: Colors.light.textSecondary },
  upcomingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  upcomingMark: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.light.primary },
  upcomingMarkOverdue: { backgroundColor: Colors.light.danger },
  upcomingBody: { flex: 1, gap: 2 },
  upcomingTitle: { fontSize: 15, fontWeight: '600', color: Colors.light.text },
  upcomingMeta: { fontSize: 12, color: Colors.light.textSecondary },
  overdueText: { color: Colors.light.danger },
  errorBox: { alignItems: 'center', marginTop: 20 },
  errorText: { color: Colors.light.danger, marginBottom: 12, fontSize: 14, textAlign: 'center' },
  inlineError: { color: Colors.light.danger, fontSize: 13 },
  retryBtn: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryText: { color: Colors.light.primaryText, fontWeight: '700' },
});
