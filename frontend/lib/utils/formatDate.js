/**
 * lib/utils/formatDate.js
 * Date formatting helpers using the native Intl API (no extra deps).
 */

/**
 * Format a date as "12 Jun 2025"
 */
export function formatDate(date) {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

/**
 * Format a date as "Jun 12"
 */
export function formatShortDate(date) {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
  }).format(new Date(date));
}

/**
 * Get the number of days between two dates (inclusive).
 */
export function getDaysBetween(startDate, endDate) {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = Math.abs(end - start);
  return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
}

/**
 * Check if a date is in the past.
 */
export function isPast(date) {
  return new Date(date) < new Date();
}

/**
 * Format relative time: "2 days ago", "in 3 days"
 */
export function formatRelative(date) {
  if (!date) return "—";
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const diff = (new Date(date) - Date.now()) / 1000;
  const abs = Math.abs(diff);
  if (abs < 60) return rtf.format(Math.round(diff), "second");
  if (abs < 3600) return rtf.format(Math.round(diff / 60), "minute");
  if (abs < 86400) return rtf.format(Math.round(diff / 3600), "hour");
  return rtf.format(Math.round(diff / 86400), "day");
}
