export interface StripDay {
  dayName: string;
  dayNum: number;
  isToday: boolean;
}

/** Monday-to-Sunday days of the week containing `today`. */
export function getDayStrip(today: Date): StripDay[] {
  const dow = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dow + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return {
      dayName: d.toLocaleDateString("en-US", { weekday: "short" }),
      dayNum: d.getDate(),
      isToday: d.toDateString() === today.toDateString(),
    };
  });
}

export function getGreeting(now: Date): string {
  const hour = now.getHours();
  return hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
}
