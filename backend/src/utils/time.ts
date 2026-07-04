import { randomUUID } from "crypto";

export function toIso(date: Date): string {
  return date.toISOString();
}

export function getDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function isAfterOfficeHours(date: Date, startHour = 17): boolean {
  return date.getHours() >= startHour;
}

/**
 * Returns true when the current hour is outside 9 AM – 5 PM office hours.
 * Covers both "before work starts" (hour < beforeEnd) and "after work ends" (hour >= afterStart).
 */
export function isOutsideOfficeHours(date: Date, beforeEnd = 9, afterStart = 17): boolean {
  const hour = date.getHours();
  return hour < beforeEnd || hour >= afterStart;
}

export function getOfficeHoursLabel(date: Date, beforeEnd = 9, afterStart = 17): string {
  const hour = date.getHours();
  if (hour < beforeEnd) return "before office hours";
  if (hour >= afterStart) return "after office hours";
  return "during office hours";
}

export function hoursBetween(start: Date, end: Date): number {
  return (end.getTime() - start.getTime()) / 3_600_000;
}

export function minutesBetween(start: Date, end: Date): number {
  return (end.getTime() - start.getTime()) / 60_000;
}

export function createId(prefix: string): string {
  return `${prefix}-${randomUUID()}`;
}

export function cloneDate(value: string | Date): Date {
  return new Date(value);
}
