const WEEK_LABELS = ['日', '一', '二', '三', '四', '五', '六'];

export function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function isSameDay(a: Date, b: Date) {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}

export function formatApiDate(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getWeekStripDays(selected: Date) {
  const today = startOfDay(new Date());
  const days: Array<{
    date: Date;
    weekday: string;
    dayNum: number;
    isToday: boolean;
    isSelected: boolean;
  }> = [];

  for (let offset = -3; offset <= 3; offset += 1) {
    const date = new Date(today);
    date.setDate(today.getDate() + offset);
    days.push({
      date,
      weekday: offset === 0 ? '今' : WEEK_LABELS[date.getDay()],
      dayNum: date.getDate(),
      isToday: offset === 0,
      isSelected: isSameDay(date, selected),
    });
  }

  return days;
}

export function formatTimeLabel(iso: string) {
  return new Date(iso).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
}

/** 课程卡片时间角标：上午/下午 + HH:mm */
export function formatTimeBadge(iso: string) {
  const d = new Date(iso);
  const hours = d.getHours();
  const period = hours < 12 ? '上午' : '下午';
  const displayHour = hours % 12 === 0 ? 12 : hours % 12;
  const time = `${String(displayHour).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  return { period, time };
}

export function formatSelectedDateLabel(date: Date) {
  const today = startOfDay(new Date());
  const label = date.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'short' });
  if (isSameDay(date, today)) return `今天 · ${label}`;
  return label;
}

export function formatMonthLabel(date: Date) {
  return `${date.getFullYear()}年${date.getMonth() + 1}月`;
}

export function getMonthCalendarDays(viewMonth: Date) {
  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = (firstDay.getDay() + 6) % 7;

  const days: Array<{ date: Date; inMonth: boolean }> = [];

  for (let i = startOffset - 1; i >= 0; i -= 1) {
    const date = new Date(year, month, -i);
    days.push({ date: startOfDay(date), inMonth: false });
  }

  for (let d = 1; d <= lastDay.getDate(); d += 1) {
    days.push({ date: startOfDay(new Date(year, month, d)), inMonth: true });
  }

  const totalCells = Math.ceil(days.length / 7) * 7;
  let cursor = days[days.length - 1]?.date ?? startOfDay(new Date(year, month, 1));
  while (days.length < totalCells) {
    cursor = new Date(cursor);
    cursor.setDate(cursor.getDate() + 1);
    days.push({ date: startOfDay(cursor), inMonth: cursor.getMonth() === month });
  }

  return days;
}
