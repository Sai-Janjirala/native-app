export function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function toDateInput(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function addDaysInput(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return toDateInput(date);
}

export function parseDueDateInput(value) {
  const trimmed = String(value || '').trim();
  if (!trimmed) return { iso: null };

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (!match) return { error: 'Enter the date as YYYY-MM-DD.' };

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day, 23, 59, 0, 0);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return { error: 'That date does not exist.' };
  }

  return { iso: date.toISOString() };
}

export function isOverdue(task, now = new Date()) {
  if (!task || task.isCompleted || !task.dueDate) return false;
  return startOfDay(new Date(task.dueDate)).getTime() < startOfDay(now).getTime();
}

export function formatDueLabel(value, now = new Date()) {
  const due = startOfDay(new Date(value));
  const today = startOfDay(now);
  const diff = Math.round((due.getTime() - today.getTime()) / 86400000);

  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff === -1) return 'Yesterday';
  if (diff < 0) return `${Math.abs(diff)} days overdue`;
  return due.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function formatLongDate(value) {
  return new Date(value).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export function getWeekDays(weekOffset, now = new Date()) {
  const start = startOfDay(now);
  const weekday = start.getDay();
  const mondayDelta = weekday === 0 ? -6 : 1 - weekday;
  start.setDate(start.getDate() + mondayDelta + weekOffset * 7);

  return Array.from({ length: 7 }, (_, index) => {
    return new Date(start.getFullYear(), start.getMonth(), start.getDate() + index);
  });
}

export function formatWeekRange(days) {
  const first = days[0];
  const last = days[6];
  const sameMonth = first.getMonth() === last.getMonth() && first.getFullYear() === last.getFullYear();
  const startLabel = first.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  const endLabel = last.toLocaleDateString(undefined, sameMonth
    ? { day: 'numeric' }
    : { month: 'short', day: 'numeric' });
  return `${startLabel} – ${endLabel}`;
}
