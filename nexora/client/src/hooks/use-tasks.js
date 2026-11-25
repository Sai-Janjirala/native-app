import { useCallback, useEffect, useState } from 'react';
import { taskApi } from '@/services/taskApi';
import { scheduleTaskReminder, cancelTaskReminder } from '@/services/notifications';
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
    const task = data.task;
    // Schedule reminder if due date is set
    const notifId = await scheduleTaskReminder(task);
    setTasks((prev) => [{ ...task, _notifId: notifId }, ...prev]);
    return task;
  }

  async function updateTask(id, payload) {
    const data = await taskApi.update(token, id, payload);
    const updated = data.task;
    setTasks((prev) =>
      prev.map((t) => {
        if (t._id !== id) return t;
        // Reschedule notification if due date changed
        if (t._notifId) cancelTaskReminder(t._notifId);
        return updated;
      })
    );
    // Schedule new reminder
    scheduleTaskReminder(updated);
    return updated;
  }

  async function toggleTask(id) {
    const data = await taskApi.toggle(token, id);
    setTasks((prev) =>
      prev.map((t) => {
        if (t._id !== id) return t;
        // Cancel reminder if completed
        if (data.task.isCompleted && t._notifId) {
          cancelTaskReminder(t._notifId);
        }
        return data.task;
      })
    );
  }

  async function deleteTask(id) {
    await taskApi.remove(token, id);
    setTasks((prev) => {
      const task = prev.find((t) => t._id === id);
      if (task?._notifId) cancelTaskReminder(task._notifId);
      return prev.filter((t) => t._id !== id);
    });
  }

  return { tasks, loading, error, fetchTasks, createTask, updateTask, toggleTask, deleteTask };
}
