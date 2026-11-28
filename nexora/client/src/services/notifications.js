import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { AndroidImportance } from 'expo-notifications';
import { Platform } from 'react-native';

const REMINDER_KEY = 'nexora_reminder_ids';
const CHANNEL_ID = 'reminders';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

let reminderQueue = Promise.resolve();

function enqueue(task) {
  const run = reminderQueue.then(task, task);
  reminderQueue = run.then(
    () => {},
    () => {}
  );
  return run;
}

async function readMap() {
  try {
    const raw = await AsyncStorage.getItem(REMINDER_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

async function writeMap(map) {
  await AsyncStorage.setItem(REMINDER_KEY, JSON.stringify(map));
}

async function ensureAndroidChannel() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: 'Task reminders',
    importance: AndroidImportance.DEFAULT,
  });
}

export async function requestNotificationPermission() {
  if (Platform.OS === 'web') return false;

  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') {
    await ensureAndroidChannel();
    return true;
  }

  const { status } = await Notifications.requestPermissionsAsync();
  if (status === 'granted') await ensureAndroidChannel();
  return status === 'granted';
}

export async function getNotificationPermissionStatus() {
  if (Platform.OS === 'web') return 'unavailable';
  const { status } = await Notifications.getPermissionsAsync();
  return status;
}

async function scheduleTaskReminder(task) {
  if (Platform.OS === 'web' || !task?.dueDate || task.isCompleted) return null;

  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') return null;

  const triggerAt = new Date(new Date(task.dueDate).getTime() - 60 * 60 * 1000);
  if (triggerAt <= new Date()) return null;

  await ensureAndroidChannel();

  try {
    return await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Task due soon',
        body: `${task.title} is due in 1 hour.`,
        data: { taskId: task._id },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerAt,
        channelId: CHANNEL_ID,
      },
    });
  } catch {
    return null;
  }
}

export async function cancelTaskReminder(notificationId) {
  if (!notificationId || Platform.OS === 'web') return;
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch {
    // The notification may already have fired.
  }
}

export function syncTaskReminder(task) {
  if (!task?._id) return Promise.resolve(null);

  return enqueue(async () => {
    const map = await readMap();
    const existing = map[task._id];
    if (existing) {
      await cancelTaskReminder(existing);
      delete map[task._id];
    }

    const notificationId = await scheduleTaskReminder(task);
    if (notificationId) map[task._id] = notificationId;
    await writeMap(map);
    return notificationId;
  });
}

export function clearTaskReminder(taskId) {
  if (!taskId) return Promise.resolve();

  return enqueue(async () => {
    const map = await readMap();
    if (!map[taskId]) return;
    await cancelTaskReminder(map[taskId]);
    delete map[taskId];
    await writeMap(map);
  });
}
