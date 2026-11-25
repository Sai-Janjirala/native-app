import { useCallback, useEffect, useState } from 'react';
import { taskApi } from '@/services/taskApi';
import { useAuth } from '@/context/AuthContext';

export function useTasks() {
  const { token } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTasks = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const data = await taskApi.getAll(token);
      setTasks(data.tasks || []);
    } catch (err) {
      setError(err.message || 'Could not load tasks.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  async function createTask(payload) {
    const data = await taskApi.create(token, payload);
    setTasks((prev) => [data.task, ...prev]);
    return data.task;
  }

  async function updateTask(id, payload) {
    const data = await taskApi.update(token, id, payload);
    setTasks((prev) => prev.map((t) => (t._id === id ? data.task : t)));
    return data.task;
  }

  async function toggleTask(id) {
    const data = await taskApi.toggle(token, id);
    setTasks((prev) => prev.map((t) => (t._id === id ? data.task : t)));
  }

  async function deleteTask(id) {
    await taskApi.remove(token, id);
    setTasks((prev) => prev.filter((t) => t._id !== id));
  }

  return { tasks, loading, error, fetchTasks, createTask, updateTask, toggleTask, deleteTask };
}
