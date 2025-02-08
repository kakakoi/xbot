export function getLastThursdayToSunday(): { start: Date; end: Date } {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0=日曜, 1=月曜, ..., 6=土曜

  // 直近の日曜日までの日数を計算
  const daysUntilLastSunday = dayOfWeek === 0 ? 0 : -dayOfWeek;
  const lastSunday = new Date(today);
  lastSunday.setDate(today.getDate() + daysUntilLastSunday);

  // 直近の木曜日を計算（日曜日から4日前）
  const lastThursday = new Date(lastSunday);
  lastThursday.setDate(lastSunday.getDate() - 3);

  return { start: lastThursday, end: lastSunday };
}

export function formatDateRange(start: Date, end: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    month: "long",
    day: "numeric",
    weekday: "short",
  };
  const formatter = new Intl.DateTimeFormat("ja-JP", options);
  return `${formatter.format(start)}から${formatter.format(end)}`;
}
