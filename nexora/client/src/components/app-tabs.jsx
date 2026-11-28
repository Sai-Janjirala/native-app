import { Tabs } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icon';
import { Colors, Radii, Shadows } from '@/constants/theme';

const TAB_META = {
  index: {
    label: 'Home',
    ios: 'house.fill',
    android: 'home',
    accent: '#3B82F6',
    soft: 'rgba(59, 130, 246, 0.16)',
  },
  tasks: {
    label: 'Tasks',
    ios: 'checklist',
    android: 'checklist',
    accent: '#8B5CF6',
    soft: 'rgba(139, 92, 246, 0.16)',
  },
  calendar: {
    label: 'Calendar',
    ios: 'calendar',
    android: 'calendar_month',
    accent: '#0EA5E9',
    soft: 'rgba(14, 165, 233, 0.16)',
  },
  analytics: {
    label: 'Analytics',
    ios: 'chart.bar.fill',
    android: 'bar_chart',
    accent: '#14B8A6',
    soft: 'rgba(20, 184, 166, 0.16)',
  },
  profile: {
    label: 'Profile',
    ios: 'person.fill',
    android: 'person',
    accent: '#F43F5E',
    soft: 'rgba(244, 63, 94, 0.16)',
  },
};

function FloatingTabBar({ state, navigation }) {
  const insets = useSafeAreaInsets();
  const activeMeta = TAB_META[state.routes[state.index]?.name];
  const glowColor = activeMeta?.accent || Colors.light.primary;

  return (
    <View
      style={[styles.wrapper, { bottom: Math.max(insets.bottom, 12) + 8 }]}
      pointerEvents="box-none">
      <View style={[styles.glow, { backgroundColor: glowColor }]} pointerEvents="none" />
      <View style={styles.dock}>
        <View style={styles.topHighlight} pointerEvents="none" />
        {state.routes.map((route, index) => {
          const meta = TAB_META[route.name];
          if (!meta) return null;

          const focused = state.index === index;

          function onPress() {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          }

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              accessibilityRole="button"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={meta.label}
              style={({ pressed }) => [
                styles.tab,
                focused && styles.tabActive,
                pressed && styles.tabPressed,
              ]}>
              <View
                style={[
                  styles.iconWrap,
                  focused && {
                    backgroundColor: meta.soft,
                    borderColor: meta.accent,
                    shadowColor: meta.accent,
                  },
                  focused && styles.iconWrapActive,
                ]}>
                <Icon
                  ios={meta.ios}
                  android={meta.android}
                  size={20}
                  color={focused ? meta.accent : '#7C8BA5'}
                />
              </View>
              <Text
                style={[styles.label, focused && { color: meta.accent }]}
                numberOfLines={1}>
                {meta.label}
              </Text>
              <View style={[styles.dot, focused && { backgroundColor: meta.accent }]} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function AppTabs() {
  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="tasks" options={{ title: 'Tasks' }} />
      <Tabs.Screen name="calendar" options={{ title: 'Calendar' }} />
      <Tabs.Screen name="analytics" options={{ title: 'Analytics' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  glow: {
    position: 'absolute',
    bottom: 4,
    width: 240,
    height: 44,
    borderRadius: 22,
    opacity: 0.18,
  },
  dock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: Colors.light.dock,
    borderRadius: Radii.xl + 4,
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.light.dockBorder,
    ...Shadows.floating,
  },
  topHighlight: {
    position: 'absolute',
    top: 1,
    left: 22,
    right: 22,
    height: 1,
    borderRadius: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
  },
  tab: {
    width: 62,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingTop: 5,
    paddingBottom: 3,
    borderRadius: Radii.lg,
  },
  tabActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  tabPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.95 }],
  },
  iconWrap: {
    width: 40,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  iconWrapActive: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.32,
    shadowRadius: 10,
    elevation: 6,
  },
  label: {
    color: '#7C8BA5',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'transparent',
  },
});
