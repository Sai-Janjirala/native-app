import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Spacing } from '@/constants/theme';

const MODES = {
  focus: { label: 'Focus', duration: 25 * 60, color: Colors.light.primary },
  break: { label: 'Short Break', duration: 5 * 60, color: Colors.light.success },
};

function pad(n) {
  return String(n).padStart(2, '0');
}

export function FocusTimer() {
  const [mode, setMode] = useState('focus');
  const [secondsLeft, setSecondsLeft] = useState(MODES.focus.duration);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const intervalRef = useRef(null);

  const current = MODES[mode];
  const totalSeconds = current.duration;
  const progress = 1 - secondsLeft / totalSeconds;
  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            if (mode === 'focus') setSessions((s) => s + 1);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, mode]);

  function switchMode(newMode) {
    clearInterval(intervalRef.current);
    setRunning(false);
    setMode(newMode);
    setSecondsLeft(MODES[newMode].duration);
  }

  function reset() {
    clearInterval(intervalRef.current);
    setRunning(false);
    setSecondsLeft(current.duration);
  }

  // Simple arc using a colored border trick
  const circumference = 220;
  const arcFill = Math.round(progress * circumference);

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Focus Timer</Text>

      {/* Mode pills */}
      <View style={styles.pills}>
        {Object.entries(MODES).map(([key, val]) => (
          <Pressable
            key={key}
            style={[styles.pill, mode === key && { backgroundColor: val.color, borderColor: val.color }]}
            onPress={() => switchMode(key)}>
            <Text style={[styles.pillText, mode === key && styles.pillTextActive]}>
              {val.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Timer display */}
      <View style={[styles.timerRing, { borderColor: current.color }]}>
        <Text style={[styles.timerText, { color: current.color }]}>
          {pad(mins)}:{pad(secs)}
        </Text>
        <Text style={styles.timerLabel}>{current.label}</Text>
      </View>

      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            { width: `${Math.round(progress * 100)}%`, backgroundColor: current.color },
          ]}
        />
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <Pressable style={styles.secondaryBtn} onPress={reset}>
          <Text style={styles.secondaryBtnText}>Reset</Text>
        </Pressable>
        <Pressable
          style={[styles.primaryBtn, { backgroundColor: current.color }]}
          onPress={() => setRunning((r) => !r)}>
          <Text style={styles.primaryBtnText}>{running ? 'Pause' : 'Start'}</Text>
        </Pressable>
      </View>

      {sessions > 0 && (
        <Text style={styles.sessionsText}>
          {sessions} focus session{sessions !== 1 ? 's' : ''} completed today
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
  pills: { flexDirection: 'row', gap: 8, marginBottom: Spacing.three },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.surface,
  },
  pillText: { fontSize: 13, fontWeight: '600', color: Colors.light.textSecondary },
  pillTextActive: { color: '#fff' },
  timerRing: {
    alignSelf: 'center',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  timerText: { fontSize: 42, fontWeight: '700', letterSpacing: 2 },
  timerLabel: { fontSize: 13, color: Colors.light.textSecondary, fontWeight: '600', marginTop: 4 },
  progressTrack: {
    height: 6,
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: Spacing.three,
  },
  progressFill: { height: '100%', borderRadius: 3 },
  controls: { flexDirection: 'row', gap: 10 },
  primaryBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  secondaryBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: Colors.light.backgroundElement,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  secondaryBtnText: { color: Colors.light.text, fontWeight: '600', fontSize: 15 },
  sessionsText: {
    marginTop: Spacing.two,
    fontSize: 13,
    color: Colors.light.success,
    fontWeight: '600',
    textAlign: 'center',
  },
});
