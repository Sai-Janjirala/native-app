import { StyleSheet, Text, View } from 'react-native';

import { Colors, Radii } from '@/constants/theme';

export function ScreenHeader({ title, subtitle, accent = Colors.light.primary }) {
  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <View style={[styles.accent, { backgroundColor: accent }]} />
        <Text style={styles.title}>{title}</Text>
      </View>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  accent: {
    width: 4,
    height: 22,
    borderRadius: Radii.pill,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.light.text,
    letterSpacing: -0.6,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: Colors.light.textMuted,
    paddingLeft: 13,
  },
});
