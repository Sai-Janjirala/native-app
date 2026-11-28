import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon } from '@/components/icon';
import { Colors, Radii, Shadows, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';

export function AuthScreen() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  const isRegister = mode === 'register';

  function switchMode(nextMode) {
    if (nextMode === mode) {
      return;
    }
    setError('');
    setShowPassword(false);
    setMode(nextMode);
  }

  async function handleSubmit() {
    setError('');

    const cleanEmail = email.trim().toLowerCase();

    if (isRegister && name.trim().length < 2) {
      setError('Enter your name (at least 2 characters).');
      return;
    }
    if (!cleanEmail || !password) {
      setError('Email and password are required.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError('Enter a valid email address.');
      return;
    }
    if (isRegister && password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setSubmitting(true);
    try {
      if (isRegister) {
        await signUp(name.trim(), cleanEmail, password);
      } else {
        await signIn(cleanEmail, password);
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.heroBanner}>
            <View style={styles.heroGlow} pointerEvents="none" />
            <View style={styles.heroGlowSoft} pointerEvents="none" />
            <View style={styles.logo}>
              <Text style={styles.logoText}>N</Text>
            </View>
            <Text style={styles.brand}>Nexora</Text>
            <Text style={styles.tagline}>
              {isRegister
                ? 'Create your account and keep every task in one place.'
                : 'Welcome back. Your tasks are waiting.'}
            </Text>
          </View>

          <View style={styles.card}>
            <View style={styles.segment}>
              <Pressable
                style={[styles.segmentButton, !isRegister && styles.segmentActive]}
                onPress={() => switchMode('login')}
                accessibilityRole="button"
                accessibilityState={{ selected: !isRegister }}>
                <Text style={[styles.segmentText, !isRegister && styles.segmentTextActive]}>
                  Sign In
                </Text>
              </Pressable>
              <Pressable
                style={[styles.segmentButton, isRegister && styles.segmentActive]}
                onPress={() => switchMode('register')}
                accessibilityRole="button"
                accessibilityState={{ selected: isRegister }}>
                <Text style={[styles.segmentText, isRegister && styles.segmentTextActive]}>
                  Sign Up
                </Text>
              </Pressable>
            </View>

            <View style={styles.formHeader}>
              <View style={styles.titleRow}>
                <View style={styles.titleAccent} />
                <Text style={styles.cardTitle}>
                  {isRegister ? 'Create your account' : 'Sign in to Nexora'}
                </Text>
              </View>
              <Text style={styles.cardSubtitle}>
                {isRegister
                  ? 'It only takes a few seconds.'
                  : 'Enter your email and password to continue.'}
              </Text>
            </View>

            {error ? (
              <View style={styles.errorBox}>
                <Icon ios="exclamationmark.circle.fill" android="error" size={16} color={Colors.light.danger} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {isRegister ? (
              <View style={styles.field}>
                <Text style={styles.label}>Full name</Text>
                <View style={styles.inputWrap}>
                  <View style={styles.inputIcon} pointerEvents="none">
                    <Icon ios="person.fill" android="person" size={17} color={Colors.light.textMuted} />
                  </View>
                  <TextInput
                    ref={nameRef}
                    style={[styles.input, styles.inputWithIcon]}
                    placeholder="e.g. Alex Morgan"
                    placeholderTextColor={Colors.light.textMuted}
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                    autoComplete="name"
                    returnKeyType="next"
                    blurOnSubmit={false}
                    editable={!submitting}
                    maxLength={60}
                    onSubmitEditing={() => emailRef.current?.focus()}
                  />
                </View>
              </View>
            ) : null}

            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputWrap}>
                <View style={styles.inputIcon} pointerEvents="none">
                  <Icon ios="envelope.fill" android="mail" size={17} color={Colors.light.textMuted} />
                </View>
                <TextInput
                  ref={emailRef}
                  style={[styles.input, styles.inputWithIcon]}
                  placeholder="you@example.com"
                  placeholderTextColor={Colors.light.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  textContentType="username"
                  returnKeyType="next"
                  blurOnSubmit={false}
                  editable={!submitting}
                  onSubmitEditing={() => passwordRef.current?.focus()}
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrap}>
                <View style={styles.inputIcon} pointerEvents="none">
                  <Icon ios="lock.fill" android="lock" size={17} color={Colors.light.textMuted} />
                </View>
                <TextInput
                  ref={passwordRef}
                  style={[styles.input, styles.inputWithIcon, styles.passwordInput]}
                  placeholder={isRegister ? 'At least 6 characters' : 'Your password'}
                  placeholderTextColor={Colors.light.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete={isRegister ? 'new-password' : 'current-password'}
                  textContentType={isRegister ? 'newPassword' : 'password'}
                  returnKeyType="go"
                  editable={!submitting}
                  onSubmitEditing={handleSubmit}
                />
                <Pressable
                  style={styles.visibilityButton}
                  onPress={() => setShowPassword((visible) => !visible)}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}>
                  <Icon
                    ios={showPassword ? 'eye.slash.fill' : 'eye.fill'}
                    android={showPassword ? 'visibility_off' : 'visibility'}
                    size={18}
                    color={Colors.light.primary}
                  />
                </Pressable>
              </View>
              <Text style={styles.hint}>
                {isRegister
                  ? 'Use at least 6 characters.'
                  : 'Use the password you created when you signed up.'}
              </Text>
            </View>

            <Pressable
              style={[styles.primaryButton, submitting && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={submitting}
              accessibilityRole="button">
              <View style={styles.buttonContent}>
                {submitting ? (
                  <ActivityIndicator color={Colors.light.primaryText} size="small" />
                ) : null}
                <Text style={styles.primaryButtonText}>
                  {submitting
                    ? isRegister
                      ? 'Creating account...'
                      : 'Signing in...'
                    : isRegister
                      ? 'Create Account'
                      : 'Sign In'}
                </Text>
              </View>
            </Pressable>

            <Pressable
              style={styles.switchButton}
              onPress={() => switchMode(isRegister ? 'login' : 'register')}
              disabled={submitting}
              accessibilityRole="button">
              <Text style={styles.switchText}>
                {isRegister ? 'Already have an account? ' : 'New to Nexora? '}
                <Text style={styles.switchLink}>
                  {isRegister ? 'Sign In' : 'Create Account'}
                </Text>
              </Text>
            </Pressable>
          </View>

          <Text style={styles.footerNote}>Stay organized. One task at a time.</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.three,
    paddingVertical: Spacing.four,
  },
  heroBanner: {
    backgroundColor: Colors.light.dock,
    borderRadius: Radii.xl,
    paddingVertical: Spacing.four,
    paddingHorizontal: Spacing.three,
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
    ...Shadows.floating,
  },
  heroGlow: {
    position: 'absolute',
    top: -80,
    right: -50,
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: Colors.light.primary,
    opacity: 0.35,
  },
  heroGlowSoft: {
    position: 'absolute',
    bottom: -90,
    left: -60,
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: Colors.light.indigo,
    opacity: 0.22,
  },
  logo: {
    width: 62,
    height: 62,
    borderRadius: Radii.lg,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    ...Shadows.accent,
  },
  logoText: {
    color: Colors.light.primaryText,
    fontSize: 30,
    fontWeight: '800',
  },
  brand: {
    fontSize: 34,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.8,
  },
  tagline: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 8,
    lineHeight: 20,
    textAlign: 'center',
    maxWidth: 280,
  },
  card: {
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: Radii.xl,
    padding: Spacing.three,
    marginTop: Spacing.three,
    ...Shadows.card,
  },
  segment: {
    flexDirection: 'row',
    backgroundColor: Colors.light.backgroundAlt,
    borderRadius: Radii.pill,
    padding: 4,
    marginBottom: Spacing.four,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: Radii.pill,
    alignItems: 'center',
  },
  segmentActive: {
    backgroundColor: Colors.light.surface,
    ...Shadows.soft,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.textSecondary,
  },
  segmentTextActive: {
    color: Colors.light.primary,
    fontWeight: '700',
  },
  formHeader: {
    marginBottom: Spacing.three,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  titleAccent: {
    width: 4,
    height: 20,
    borderRadius: Radii.pill,
    backgroundColor: Colors.light.primary,
  },
  cardTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: Colors.light.text,
    letterSpacing: -0.3,
  },
  cardSubtitle: {
    fontSize: 13,
    color: Colors.light.textMuted,
    marginTop: 4,
    paddingLeft: 13,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: Radii.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: Spacing.three,
  },
  errorText: {
    flex: 1,
    color: Colors.light.danger,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  field: {
    marginBottom: Spacing.three,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 7,
  },
  inputWrap: {
    position: 'relative',
    justifyContent: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: 13,
    zIndex: 1,
  },
  input: {
    backgroundColor: Colors.light.surfaceMuted,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: Radii.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.light.text,
  },
  inputWithIcon: {
    paddingLeft: 42,
  },
  passwordInput: {
    paddingRight: 46,
  },
  visibilityButton: {
    position: 'absolute',
    right: 8,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  hint: {
    fontSize: 12,
    color: Colors.light.textMuted,
    marginTop: 6,
  },
  primaryButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: Radii.pill,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: Spacing.one,
    ...Shadows.accent,
  },
  buttonDisabled: {
    opacity: 0.75,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  primaryButtonText: {
    color: Colors.light.primaryText,
    fontSize: 15,
    fontWeight: '700',
  },
  switchButton: {
    marginTop: Spacing.three,
    alignItems: 'center',
    paddingVertical: 4,
  },
  switchText: {
    color: Colors.light.textSecondary,
    fontSize: 14,
    textAlign: 'center',
  },
  switchLink: {
    color: Colors.light.primary,
    fontWeight: '700',
  },
  footerNote: {
    marginTop: Spacing.three,
    color: Colors.light.textMuted,
    fontSize: 12,
    textAlign: 'center',
  },
});
