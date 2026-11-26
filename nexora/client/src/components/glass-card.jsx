import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { Platform, StyleSheet, View } from 'react-native';

import { Colors, Spacing } from '@/constants/theme';

const useNativeGlass = Platform.OS === 'ios' && isLiquidGlassAvailable();

export function GlassCard({ children, style, variant = 'default' }) {
  if (variant === 'dark') {
    return <View style={[styles.base, styles.dark, style]}>{children}</View>;
  }

  if (useNativeGlass) {
    return (
      <GlassView
        glassEffectStyle="regular"
        tintColor={variant === 'accent' ? 'rgba(239, 246, 255, 0.78)' : 'rgba(255, 255, 255, 0.78)'}
        style={[styles.base, styles.glassBorder, style]}>
        {children}
      </GlassView>
    );
  }

  return (
    <View
      style={[
        styles.base,
        variant === 'accent' ? styles.accentFallback : styles.defaultFallback,
        style,
      ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 16,
    padding: Spacing.three,
    overflow: 'hidden',
  },
  glassBorder: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.7)',
  },
  defaultFallback: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderWidth: 1,
    borderColor: Colors.light.border,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  accentFallback: {
    backgroundColor: 'rgba(239, 246, 255, 0.92)',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    shadowColor: '#1D4ED8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  dark: {
    backgroundColor: Colors.light.black,
    borderWidth: 1,
    borderColor: '#1E293B',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 12,
    elevation: 4,
  },
});
