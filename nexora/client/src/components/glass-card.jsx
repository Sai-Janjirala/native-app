import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { Platform, StyleSheet, View } from 'react-native';

import { Colors, Radii, Shadows, Spacing } from '@/constants/theme';

const useNativeGlass = Platform.OS === 'ios' && isLiquidGlassAvailable();

export function GlassCard({ children, style, variant = 'default' }) {
  if (variant === 'dark') {
    return (
      <View style={[styles.base, styles.dark, style]}>
        <View style={styles.darkHighlight} pointerEvents="none" />
        {children}
      </View>
    );
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
    borderRadius: Radii.lg,
    padding: Spacing.three,
    overflow: 'hidden',
  },
  glassBorder: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.7)',
  },
  defaultFallback: {
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderWidth: 1,
    borderColor: Colors.light.border,
    ...Shadows.card,
  },
  accentFallback: {
    backgroundColor: 'rgba(239, 246, 255, 0.96)',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    ...Shadows.accent,
    shadowOpacity: 0.1,
  },
  dark: {
    backgroundColor: Colors.light.dock,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
    ...Shadows.floating,
  },
  darkHighlight: {
    position: 'absolute',
    top: 1,
    left: 20,
    right: 20,
    height: 1,
    borderRadius: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
  },
});
