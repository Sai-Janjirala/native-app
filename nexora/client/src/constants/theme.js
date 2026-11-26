import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#0A0A0A',
    background: '#F8FAFC',
    surface: '#FFFFFF',
    backgroundElement: '#EFF6FF',
    backgroundSelected: '#DBEAFE',
    textSecondary: '#475569',
    border: '#E2E8F0',
    primary: '#2563EB',
    primaryDark: '#1D4ED8',
    primaryText: '#FFFFFF',
    black: '#0A0A0A',
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
