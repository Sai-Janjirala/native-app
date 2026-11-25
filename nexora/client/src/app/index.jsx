import { useCallback, useEffect, useState } from 'react';
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
import { ScreenHeader } from '@/components/screen-header';
import { Colors, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { taskApi } from '@/services/taskApi';

function StatCard({ label, value, accent }) {
  return (
    <View style={[styles.statCard, accent && { borderLeftColor: accent, borderLeftWidth: 3 }]}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function HomeScreen() {
  const { user, token } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const data = await taskApi.getDashboard(token);
      setStats(data);
    } catch (err) {
      setError(err.message || 'Could not load dashboard.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchStats} tintColor={Colors.light.primary} />
        }>
        <ScreenHeader
          title={`${greeting()}, ${user?.name?.split(' ')[0] || 'there'} 👋`}
          subtitle="Here's your productivity overview"
        />

        {loading ? (
          <ActivityIndicator color={Colors.light.primary} style={{ marginTop: 40 }} />
        ) : error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable onPress={fetchStats} style={styles.retryBtn}>
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          </View>
        ) : stats ? (
          <>
            <View style={styles.completionCard}>
              <Text style={styles.completionLabel}>Overall Completion</Text>
              <Text style={styles.completionValue}>{stats.completionRate}%</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${stats.completionRate}%` }]} />
              </View>
            </View>

            <View style={styles.statsGrid}>
              <StatCard label="Total" value={stats.total} />
              <StatCard label="Completed" value={stats.completed} accent={Colors.light.success} />
              <StatCard label="Pending" value={stats.pending} accent={Colors.light.warning} />
              <StatCard label="Today" value={stats.todayTasks} accent={Colors.light.primary} />
              <StatCard label="Overdue" value={stats.overdue} accent={Colors.light.danger} />
            </View>
          </>
        ) : null}

        {/* Focus Timer always visible */}
        <FocusTimer />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.light.background },
  content: { padding: Spacing.three, gap: Spacing.three },
  completionCard: {
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 10,
    padding: Spacing.three,
  },
  completionLabel: { fontSize: 13, fontWeight: '600', color: Colors.light.textSecondary, marginBottom: 4 },
  completionValue: { fontSize: 36, fontWeight: '700', color: Colors.light.primary, marginBottom: 10 },
  progressBar: {
    height: 8,
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: Colors.light.primary, borderRadius: 4 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCard: {
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 10,
    padding: Spacing.three,
    flex: 1,
    minWidth: '45%',
  },
  statValue: { fontSize: 26, fontWeight: '700', color: Colors.light.text, marginBottom: 2 },
  statLabel: { fontSize: 12, fontWeight: '600', color: Colors.light.textSecondary },
  errorBox: { alignItems: 'center', marginTop: 40 },
  errorText: { color: Colors.light.danger, marginBottom: 12, fontSize: 14 },
  retryBtn: { backgroundColor: Colors.light.primary, paddingHorizontal: 20, paddingVertical: 8, borderRadius: 8 },
  retryText: { color: Colors.light.primaryText, fontWeight: '700' },
});
