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
