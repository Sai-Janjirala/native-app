import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';

import { authApi, setUnauthorizedHandler } from '@/services/api';

const TOKEN_KEY = 'nexora_auth_token';
const USER_KEY = 'nexora_auth_user';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  async function clearSession() {
    setUser(null);
    setToken(null);
    await Promise.all([
      AsyncStorage.removeItem(TOKEN_KEY),
      AsyncStorage.removeItem(USER_KEY),
    ]);
  }

  async function saveSession(data) {
    await Promise.all([
      AsyncStorage.setItem(TOKEN_KEY, data.token),
      AsyncStorage.setItem(USER_KEY, JSON.stringify(data.user)),
    ]);
    setToken(data.token);
    setUser(data.user);
  }

  useEffect(() => {
    let active = true;

    setUnauthorizedHandler(() => {
      clearSession();
    });

    async function restoreSession() {
      try {
        const [storedToken, storedUser] = await Promise.all([
          AsyncStorage.getItem(TOKEN_KEY),
          AsyncStorage.getItem(USER_KEY),
        ]);

        if (!active || !storedToken) {
          return;
        }

        setToken(storedToken);

        if (storedUser) {
          setUser(JSON.parse(storedUser));
          setIsLoading(false);
          return;
        }

        const data = await authApi.getMe(storedToken);
        if (!active) {
          return;
        }

        setUser(data.user);
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(data.user));
      } catch {
        if (active) {
          await clearSession();
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    restoreSession();

    return () => {
      active = false;
    };
  }, []);

  async function signIn(email, password) {
    const data = await authApi.login({ email, password });
    await saveSession(data);
  }

  async function signUp(name, email, password) {
    const data = await authApi.register({ name, email, password });
    await saveSession(data);
  }

  async function updateUserName(name) {
    const data = await authApi.updateProfile(token, { name });
    setUser(data.user);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(data.user));
    return data.user;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        signIn,
        signUp,
        signOut: clearSession,
        updateUserName,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
}
