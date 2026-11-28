import { StyleSheet, Text, View } from 'react-native';

const PRIORITY_CONFIG = {
  high:   { label: 'High',   bg: '#FFE4E6', text: '#BE123C' },
  medium: { label: 'Medium', bg: '#FEF3C7', text: '#B45309' },
  low:    { label: 'Low',    bg: '#DCFCE7', text: '#15803D' },
};

const CATEGORY_CONFIG = {
  work:     { label: 'Work',     bg: '#DBEAFE', text: '#1D4ED8' },
  study:    { label: 'Study',    bg: '#EDE9FE', text: '#6D28D9' },
  personal: { label: 'Personal', bg: '#CCFBF1', text: '#0F766E' },
};

export function PriorityBadge({ priority }) {
  const cfg = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.medium;
  return (
    <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
      <Text style={[styles.badgeText, { color: cfg.text }]}>{cfg.label}</Text>
    </View>
  );
}

export function CategoryBadge({ category }) {
  const cfg = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.personal;
  return (
    <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
      <Text style={[styles.badgeText, { color: cfg.text }]}>{cfg.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
});
