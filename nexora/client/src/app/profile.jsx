import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/screen-header';
import { Colors, Radii, Shadows, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import {
  getNotificationPermissionStatus,
  requestNotificationPermission,
} from '@/services/notifications';

export default function ProfileScreen() {
  const { user, signOut, updateUserName } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [notifStatus, setNotifStatus] = useState('undetermined');

  useEffect(() => {
    getNotificationPermissionStatus().then(setNotifStatus);
  }, []);

  async function handleSave() {
    setMessage('');
    setError('');
    if (name.trim().length < 2) {
      setError('Name must be at least 2 characters.');
      return;
    }
    setSaving(true);
    try {
      await updateUserName(name.trim());
      setMessage('Profile updated.');
    } catch (err) {
      setError(err.message || 'Could not update profile.');
    } finally {
      setSaving(false);
    }
  }

  async function handleNotifToggle() {
    if (notifStatus === 'granted') {
      Alert.alert(
        'Disable Reminders',
        'To turn off notifications, go to your device Settings → Nexora → Notifications.',
        [
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
      return;
    }
    const granted = await requestNotificationPermission();
    setNotifStatus(granted ? 'granted' : 'denied');
    if (!granted) {
      Alert.alert(
        'Permission Denied',
        'To enable reminders, allow notifications in your device Settings → Nexora → Notifications.',
        [
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
          { text: 'OK', style: 'cancel' },
        ]
      );
    }
  }

  const notifLabel =
    notifStatus === 'granted'
      ? 'Reminders Enabled'
      : notifStatus === 'denied'
      ? 'Reminders Blocked'
      : 'Enable Reminders';

  const notifBtnStyle =
    notifStatus === 'granted' ? styles.notifBtnEnabled : styles.notifBtnDisabled;

  const joinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString()
    : '—';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <ScreenHeader title="Profile" subtitle="Account & preferences" />

        {/* Account details */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Account Details</Text>

          <Text style={styles.metaLabel}>Email</Text>
          <Text style={styles.metaValue}>{user?.email}</Text>

          <Text style={styles.metaLabel}>Member Since</Text>
          <Text style={styles.metaValue}>{joinedDate}</Text>

          <Text style={styles.metaLabel}>Display Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            placeholderTextColor={Colors.light.textSecondary}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          {message ? <Text style={styles.successText}>{message}</Text> : null}

          <Pressable
            style={[styles.primaryButton, saving && styles.disabled]}
            onPress={handleSave}
            disabled={saving}>
            {saving ? (
              <ActivityIndicator color={Colors.light.primaryText} />
            ) : (
              <Text style={styles.primaryButtonText}>Save Changes</Text>
            )}
          </Pressable>
        </View>

        {/* Notifications */}
        {Platform.OS !== 'web' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Reminders</Text>
            <Text style={[styles.metaValue, styles.notifDescription]}>
              Nexora can remind you 1 hour before a task is due. Enable notifications to use this
              feature.
            </Text>
            <Pressable style={[styles.notifBtn, notifBtnStyle]} onPress={handleNotifToggle}>
              <Text
                style={[
                  styles.notifBtnText,
                  notifStatus === 'granted' && styles.notifBtnTextEnabled,
                ]}>
                {notifLabel}
              </Text>
            </Pressable>
          </View>
        )}

        {/* Sign out */}
        <Pressable style={styles.logoutButton} onPress={signOut}>
          <Text style={styles.logoutButtonText}>Sign Out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.light.background },
  content: { padding: Spacing.three, paddingBottom: 104, gap: Spacing.three },
  card: {
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: Radii.lg,
    padding: Spacing.three,
    ...Shadows.card,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: Spacing.two,
    letterSpacing: -0.2,
  },
  metaLabel: { fontSize: 12, fontWeight: '600', color: Colors.light.textMuted, marginTop: Spacing.two, marginBottom: 4 },
  metaValue: { fontSize: 15, color: Colors.light.text },
  input: {
    backgroundColor: Colors.light.surfaceMuted,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: Radii.md,
    paddingHorizontal: 13,
    paddingVertical: 11,
    fontSize: 15,
    color: Colors.light.text,
    marginBottom: Spacing.two,
  },
  errorText: { color: Colors.light.danger, fontSize: 13, fontWeight: '600', marginBottom: Spacing.two },
  successText: { color: Colors.light.success, fontSize: 13, fontWeight: '600', marginBottom: Spacing.two },
  primaryButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: Radii.pill,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: Spacing.one,
    ...Shadows.accent,
  },
  disabled: { opacity: 0.7 },
  primaryButtonText: { color: Colors.light.primaryText, fontSize: 15, fontWeight: '700' },
  notifDescription: { fontSize: 14, color: Colors.light.textSecondary, marginBottom: Spacing.two, lineHeight: 20 },
  notifBtn: {
    borderRadius: Radii.pill,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: Spacing.two,
    borderWidth: 1,
  },
  notifBtnEnabled: {
    backgroundColor: '#F0FDF4',
    borderColor: Colors.light.success,
  },
  notifBtnDisabled: {
    backgroundColor: Colors.light.backgroundElement,
    borderColor: Colors.light.border,
  },
  notifBtnText: { fontSize: 14, fontWeight: '700', color: Colors.light.textSecondary },
  notifBtnTextEnabled: { color: Colors.light.success },
  logoutButton: {
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: '#FECDD3',
    borderRadius: Radii.pill,
    paddingVertical: 13,
    alignItems: 'center',
  },
  logoutButtonText: { color: Colors.light.danger, fontSize: 15, fontWeight: '700' },
});
