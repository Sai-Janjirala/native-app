import { StyleSheet, Text, View } from 'react-native';

const PRIORITY_CONFIG = {
  high:   { label: 'High',   bg: '#FEE2E2', text: '#B91C1C' },
  medium: { label: 'Medium', bg: '#FEF9C3', text: '#92400E' },
  low:    { label: 'Low',    bg: '#DCFCE7', text: '#15803D' },
};

const CATEGORY_CONFIG = {
  work:     { label: 'Work',     bg: '#EFF6FF', text: '#1D4ED8' },
  study:    { label: 'Study',    bg: '#E0E7FF', text: '#1E3A8A' },
  personal: { label: 'Personal', bg: '#F1F5F9', text: '#0A0A0A' },
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
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
