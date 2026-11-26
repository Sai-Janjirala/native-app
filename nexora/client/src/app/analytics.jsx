import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
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

import { ScreenHeader } from '@/components/screen-header';
import { Colors, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { taskApi } from '@/services/taskApi';

function BarChart({ data, maxValue }) {
  const max = maxValue || Math.max(...data.map((d) => d.value), 1);
  return (
    <View style={bar.container}>
      {data.map((item, i) => (
        <View key={i} style={bar.col}>
          <Text style={bar.valueLabel}>{item.value > 0 ? item.value : ''}</Text>
          <View style={bar.track}>
            {item.value > 0 ? (
              <View
                style={[
                  bar.fill,
                  {
                    height: `${Math.max(8, Math.round((item.value / max) * 100))}%`,
                    backgroundColor: item.color || Colors.light.primary,
                  },
                ]}
              />
            ) : null}
          </View>
          <Text style={bar.label} numberOfLines={1}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

function GroupCard({ title, rows }) {
  const ACCENTS = {
    High: Colors.light.danger,
    Medium: Colors.light.warning,
    Low: Colors.light.success,
    Work: '#1D4ED8',
    Study: '#7C3AED',
    Personal: Colors.light.success,
  };

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      {rows.map((row) => {
        const pct = row.total > 0 ? Math.round((row.completed / row.total) * 100) : 0;
        const accent = ACCENTS[row.label] || Colors.light.primary;
        return (
          <View key={row.label} style={styles.groupRow}>
            <View style={styles.groupRowTop}>
              <View style={styles.groupLabel}>
                <View style={[styles.groupDot, { backgroundColor: accent }]} />
                <Text style={styles.groupLabelText}>{row.label}</Text>
              </View>
              <Text style={styles.groupStat}>
                {row.completed}/{row.total} · {pct}%
              </Text>
            </View>
            <View style={styles.miniProgress}>
              <View style={[styles.miniProgressFill, { width: `${pct}%`, backgroundColor: accent }]} />
            </View>
          </View>
        );
      })}
    </View>
  );
}

export default function AnalyticsScreen() {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalytics = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const result = await taskApi.getAnalytics(token);
      setData(result);
    } catch (err) {
      setError(err.message || 'Could not load analytics.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      fetchAnalytics();
    }, [fetchAnalytics])
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchAnalytics} tintColor={Colors.light.primary} />
        }>
        <ScreenHeader title="Analytics" subtitle="Your 7-day productivity summary" />

        {loading ? (
          <ActivityIndicator color={Colors.light.primary} style={{ marginTop: 40 }} />
        ) : error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable onPress={fetchAnalytics} style={styles.retryBtn}>
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          </View>
        ) : data ? (
          <>
            {/* Weekly chart */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Tasks Completed — Last 7 Days</Text>
              <BarChart
                data={data.weekly.map((d) => ({
                  label: d.label.split(',')[0],
                  value: d.completed,
                  color: Colors.light.primary,
                }))}
              />
              <View style={styles.chartLegend}>
                <View style={[styles.legendDot, { backgroundColor: Colors.light.primary }]} />
                <Text style={styles.legendText}>Completed</Text>
              </View>
            </View>

            {/* Weekly details table */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Daily Breakdown</Text>
              {data.weekly.map((day, i) => (
                <View
                  key={i}
                  style={[styles.tableRow, i < data.weekly.length - 1 && styles.tableRowBorder]}>
                  <Text style={styles.tableLabel} numberOfLines={1}>{day.label}</Text>
                  <Text style={styles.tableVal}>
                    {day.completed} done · {day.created} added
                  </Text>
                </View>
              ))}
            </View>

            {/* By priority */}
            <GroupCard title="By Priority" rows={data.byPriority} />

            {/* By category */}
            <GroupCard title="By Category" rows={data.byCategory} />

            {/* Recent completed */}
            {data.recentCompleted.length > 0 && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Recently Completed</Text>
                {data.recentCompleted.map((t) => (
                  <View key={t._id} style={styles.recentRow}>
                    <Text style={styles.recentTitle} numberOfLines={1}>✓ {t.title}</Text>
                    <Text style={styles.recentMeta}>
                      {t.category} · {t.priority} ·{' '}
                      {t.completedAt
                        ? new Date(t.completedAt).toLocaleDateString()
                        : '—'}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const bar = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
    height: 120,
    marginTop: Spacing.two,
  },
  col: { flex: 1, alignItems: 'center', height: '100%', justifyContent: 'flex-end' },
  track: {
    width: '70%',
    height: 90,
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: 4,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  fill: { width: '100%', borderRadius: 4, minHeight: 4 },
  valueLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.light.textSecondary,
    marginBottom: 2,
    minHeight: 14,
  },
  label: {
    fontSize: 10,
    color: Colors.light.textSecondary,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
});

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.light.background },
  content: { padding: Spacing.three, paddingBottom: 104, gap: Spacing.three },
  card: {
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 10,
    padding: Spacing.three,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: Spacing.two,
  },
  chartLegend: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 12, color: Colors.light.textSecondary, fontWeight: '600' },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  tableRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  tableLabel: { fontSize: 13, color: Colors.light.text, fontWeight: '600', flex: 1 },
  tableVal: { fontSize: 13, color: Colors.light.textSecondary },
  groupRow: { marginBottom: Spacing.two },
  groupRowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  groupLabel: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  groupDot: { width: 10, height: 10, borderRadius: 5 },
  groupLabelText: { fontSize: 13, fontWeight: '600', color: Colors.light.text },
  groupStat: { fontSize: 12, color: Colors.light.textSecondary, fontWeight: '600' },
  miniProgress: {
    height: 6,
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: 3,
    overflow: 'hidden',
  },
  miniProgressFill: { height: '100%', borderRadius: 3 },
  recentRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  recentTitle: { fontSize: 14, fontWeight: '600', color: Colors.light.text, marginBottom: 2 },
  recentMeta: { fontSize: 12, color: Colors.light.textSecondary },
  errorBox: { alignItems: 'center', marginTop: 40 },
  errorText: { color: Colors.light.danger, marginBottom: 12, fontSize: 14 },
  retryBtn: { backgroundColor: Colors.light.primary, paddingHorizontal: 20, paddingVertical: 8, borderRadius: 8 },
  retryText: { color: Colors.light.primaryText, fontWeight: '700' },
});
