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
