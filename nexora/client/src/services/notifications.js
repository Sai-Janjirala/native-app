import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// How notifications look when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermission() {
  if (Platform.OS === 'web') return false;

  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function getNotificationPermissionStatus() {
  if (Platform.OS === 'web') return 'unavailable';
  const { status } = await Notifications.getPermissionsAsync();
  return status; // 'granted' | 'denied' | 'undetermined'
}

/**
 * Schedule a local notification 1 hour before a task's due date.
 * Returns the notification identifier (store it on the task to cancel later).
 */
export async function scheduleTaskReminder(task) {
  if (Platform.OS === 'web') return null;
  if (!task.dueDate) return null;

  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') return null;

  const dueDate = new Date(task.dueDate);
  const triggerAt = new Date(dueDate.getTime() - 60 * 60 * 1000); // 1 hour before

  if (triggerAt <= new Date()) return null; // already past

  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Task Due Soon',
        body: `"${task.title}" is due in 1 hour.`,
        data: { taskId: task._id },
      },
      trigger: { date: triggerAt },
    });
    return id;
  } catch {
    return null;
  }
}

export async function cancelTaskReminder(notificationId) {
  if (!notificationId || Platform.OS === 'web') return;
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch {
    // ignore
  }
}

export async function cancelAllReminders() {
  if (Platform.OS === 'web') return;
  await Notifications.cancelAllScheduledNotificationsAsync();
}
