import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#0B1220',
    textMuted: '#64748B',
    background: '#F1F5F9',
    backgroundAlt: '#E9EFF7',
    surface: '#FFFFFF',
    surfaceMuted: '#F8FAFC',
    backgroundElement: '#EFF6FF',
    backgroundSelected: '#DBEAFE',
    textSecondary: '#475569',
    border: '#E2E8F0',
    borderStrong: '#CBD5E1',
    primary: '#2563EB',
    primarySoft: '#DBEAFE',
    primaryDark: '#1D4ED8',
    primaryText: '#FFFFFF',
    indigo: '#4F46E5',
    violet: '#7C3AED',
    sky: '#0EA5E9',
    teal: '#0D9488',
    amber: '#D97706',
    rose: '#E11D48',
    black: '#0A0A0A',
    dock: '#0B1220',
    dockBorder: 'rgba(148, 163, 184, 0.18)',
    success: '#16A34A',
    warning: '#D97706',
    danger: '#DC2626',
  },
  dark: {
    text: '#F8FAFC',
    background: '#0F172A',
    surface: '#1E293B',
    backgroundElement: '#1E293B',
    backgroundSelected: '#334155',
    textSecondary: '#94A3B8',
    border: '#334155',
    primary: '#3B82F6',
    primaryText: '#FFFFFF',
    success: '#22C55E',
    warning: '#F59E0B',
    danger: '#EF4444',
  },
};

export const Radii = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  pill: 999,
};

export const Shadows = {
  card: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 3,
  },
  soft: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  accent: {
    shadowColor: '#1D4ED8',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 6,
  },
  floating: {
    shadowColor: '#020617',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.4,
    shadowRadius: 32,
    elevation: 22,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
};

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
