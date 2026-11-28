import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GlassCard } from '@/components/glass-card';
import { Colors, Radii, Spacing } from '@/constants/theme';

const MODES = {
  focus: { label: 'Focus', duration: 25 * 60, color: Colors.light.indigo },
  break: { label: 'Break', duration: 5 * 60, color: Colors.light.teal },
};

function pad(value) {
  return String(value).padStart(2, '0');
}

export function FocusTimer() {
  const [mode, setMode] = useState('focus');
  const [secondsLeft, setSecondsLeft] = useState(MODES.focus.duration);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const finishedRef = useRef(false);

  const current = MODES[mode];
  const progress = 1 - secondsLeft / current.duration;
  const finished = secondsLeft === 0;

  useEffect(() => {
    if (!running) return undefined;

    const id = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          if (!finishedRef.current) {
            finishedRef.current = true;
            if (mode === 'focus') setSessions((count) => count + 1);
            setRunning(false);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [running, mode]);

  function switchMode(nextMode) {
    finishedRef.current = false;
    setRunning(false);
    setMode(nextMode);
    setSecondsLeft(MODES[nextMode].duration);
  }

  function reset() {
    finishedRef.current = false;
    setRunning(false);
    setSecondsLeft(current.duration);
  }

  function onPrimary() {
    if (finished) {
      switchMode(mode === 'focus' ? 'break' : 'focus');
      finishedRef.current = false;
      setRunning(true);
      return;
    }
    setRunning((value) => !value);
  }

  const primaryLabel = finished
    ? mode === 'focus'
      ? 'Start break'
      : 'Start focus'
    : running
      ? 'Pause'
      : 'Start';

  return (
    <GlassCard>
      <View style={styles.headerRow}>
        <Text style={styles.cardTitle}>Focus Timer</Text>
        <Text style={styles.cardHint}>25m focus · 5m break</Text>
      </View>

      <View style={styles.pills}>
        {Object.entries(MODES).map(([key, value]) => {
          const selected = mode === key;
          return (
            <Pressable
              key={key}
              style={[styles.pill, selected && { backgroundColor: value.color, borderColor: value.color }]}
              onPress={() => switchMode(key)}>
              <Text style={[styles.pillText, selected && styles.pillTextActive]}>{value.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={[styles.timerRing, { borderColor: current.color }]}>
        <Text style={[styles.timerText, { color: current.color }]}>
          {pad(Math.floor(secondsLeft / 60))}:{pad(secondsLeft % 60)}
        </Text>
        <Text style={styles.timerLabel}>{finished ? 'Done' : current.label}</Text>
      </View>

      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            { width: `${Math.round(progress * 100)}%`, backgroundColor: current.color },
          ]}
        />
      </View>

      <View style={styles.controls}>
        <Pressable style={styles.secondaryBtn} onPress={reset}>
          <Text style={styles.secondaryBtnText}>Reset</Text>
        </Pressable>
        <Pressable style={[styles.primaryBtn, { backgroundColor: current.color }]} onPress={onPrimary}>
          <Text style={styles.primaryBtnText}>{primaryLabel}</Text>
        </Pressable>
      </View>

      {sessions > 0 ? (
        <Text style={styles.sessionsText}>
          {sessions} focus {sessions === 1 ? 'session' : 'sessions'} completed
        </Text>
      ) : null}
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.text,
  },
  cardHint: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.textSecondary,
  },
  pills: { flexDirection: 'row', gap: 8, marginBottom: Spacing.three },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: Radii.pill,
    borderWidth: 1,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.surfaceMuted,
  },
  pillText: { fontSize: 13, fontWeight: '600', color: Colors.light.textSecondary },
  pillTextActive: { color: '#fff' },
  timerRing: {
    alignSelf: 'center',
    width: 152,
    height: 152,
    borderRadius: 76,
    borderWidth: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.three,
    backgroundColor: Colors.light.surfaceMuted,
  },
  timerText: { fontSize: 42, fontWeight: '800', fontVariant: ['tabular-nums'], letterSpacing: -1 },
  timerLabel: { fontSize: 13, color: Colors.light.textMuted, fontWeight: '600', marginTop: 2 },
  progressTrack: {
    height: 8,
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: Radii.pill,
    overflow: 'hidden',
    marginBottom: Spacing.three,
  },
  progressFill: { height: '100%', borderRadius: Radii.pill },
  controls: { flexDirection: 'row', gap: 10 },
  primaryBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: Radii.pill,
    alignItems: 'center',
  },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  secondaryBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: Radii.pill,
    alignItems: 'center',
    backgroundColor: Colors.light.surfaceMuted,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  secondaryBtnText: { color: Colors.light.text, fontWeight: '600', fontSize: 15 },
  sessionsText: {
    marginTop: Spacing.two,
    fontSize: 13,
    color: Colors.light.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
  },
});
