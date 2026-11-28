import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';

import { useAuth } from '@/context/AuthContext';
import { clearTaskReminder, syncTaskReminder } from '@/services/notifications';
import { taskApi } from '@/services/taskApi';

export function useTasks() {
  const { token } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const hasLoaded = useRef(false);
  const requestId = useRef(0);

  const fetchTasks = useCallback(async ({ mode = 'initial' } = {}) => {
    if (!token) {
      setLoading(false);
      return;
    }

    const id = ++requestId.current;
    if (mode === 'refresh') setRefreshing(true);
    else if (!hasLoaded.current) setLoading(true);

    try {
      const data = await taskApi.getAll(token);
      if (requestId.current !== id) return;
      setTasks(data.tasks || []);
      setError('');
      hasLoaded.current = true;
    } catch (err) {
      if (requestId.current !== id) return;
      setError(err.message || 'Could not load tasks.');
    } finally {
      if (requestId.current === id) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      fetchTasks({ mode: hasLoaded.current ? 'silent' : 'initial' });
    }, [fetchTasks])
  );

  async function createTask(payload) {
    const data = await taskApi.create(token, payload);
    await syncTaskReminder(data.task);
    setTasks((prev) => [data.task, ...prev]);
    return data.task;
  }

  async function updateTask(id, payload) {
    const data = await taskApi.update(token, id, payload);
    await syncTaskReminder(data.task);
    setTasks((prev) => prev.map((task) => (task._id === id ? data.task : task)));
    return data.task;
  }

  async function toggleTask(id) {
    const data = await taskApi.toggle(token, id);
    await syncTaskReminder(data.task);
    setTasks((prev) => prev.map((task) => (task._id === id ? data.task : task)));
    return data.task;
  }

  async function deleteTask(id) {
    await taskApi.remove(token, id);
    await clearTaskReminder(id);
    setTasks((prev) => prev.filter((task) => task._id !== id));
  }

  return {
    tasks,
    loading,
    refreshing,
    error,
    fetchTasks,
    createTask,
    updateTask,
    toggleTask,
    deleteTask,
  };
}
