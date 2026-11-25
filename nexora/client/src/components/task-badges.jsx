import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/theme';

const PRIORITY_CONFIG = {
  high:   { label: 'High',   bg: '#FEE2E2', text: '#B91C1C' },
  medium: { label: 'Medium', bg: '#FEF9C3', text: '#92400E' },
  low:    { label: 'Low',    bg: '#DCFCE7', text: '#15803D' },
};

const CATEGORY_CONFIG = {
  work:     { label: 'Work',     bg: '#EFF6FF', text: '#1D4ED8' },
  study:    { label: 'Study',    bg: '#F5F3FF', text: '#7C3AED' },
  personal: { label: 'Personal', bg: '#F0FDF4', text: '#166534' },
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
