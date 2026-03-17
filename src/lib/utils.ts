import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, isToday, isTomorrow, addDays, startOfDay } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function formatPrice(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
}

export function formatDate(date: Date | string): string {
  return format(new Date(date), "EEEE, MMMM d, yyyy");
}

export function formatDateShort(date: Date | string): string {
  return format(new Date(date), "EEE, MMM d");
}

export function formatTime(date: Date | string): string {
  return format(new Date(date), "h:mm a");
}

export function formatTime24(date: Date | string): string {
  return format(new Date(date), "HH:mm");
}

export function formatDateTime(date: Date | string): string {
  return format(new Date(date), "MMM d, yyyy h:mm a");
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export interface DateTab {
  label: string;
  shortLabel: string;
  date: Date;
  dateKey: string;
  isToday: boolean;
  isTomorrow: boolean;
}

export function getDateTabs(days = 7): DateTab[] {
  return Array.from({ length: days }, (_, i) => {
    const date = startOfDay(addDays(new Date(), i));
    const todayFlag = isToday(date);
    const tomorrowFlag = isTomorrow(date);
    return {
      label: todayFlag ? "Today" : tomorrowFlag ? "Tomorrow" : format(date, "EEE, MMM d"),
      shortLabel: todayFlag ? "Today" : tomorrowFlag ? "Tomorrow" : format(date, "EEE d"),
      date,
      dateKey: format(date, "yyyy-MM-dd"),
      isToday: todayFlag,
      isTomorrow: tomorrowFlag,
    };
  });
}

export function isSameDay(a: Date | string, b: Date | string): boolean {
  return format(new Date(a), "yyyy-MM-dd") === format(new Date(b), "yyyy-MM-dd");
}
