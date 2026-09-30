/**
 * Bangladesh Timezone (Asia/Dhaka, UTC+6) Utility Functions
 */

export const BANGLADESH_TIMEZONE = "Asia/Dhaka";
export const BANGLADESH_UTC_OFFSET_HOURS = 6;

/**
 * Returns current Date in Bangladesh local string representation (YYYY-MM-DD)
 */
export function getBangladeshTodayString(): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: BANGLADESH_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(new Date()); // Outputs YYYY-MM-DD
}

/**
 * Formats a Date or date string to YYYY-MM-DD in Asia/Dhaka
 */
export function formatToBangladeshDateString(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: BANGLADESH_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(d);
}

/**
 * Converts date string and startTime to an exact Unix timestamp for Asia/Dhaka
 * Example: date="2026-09-20", startTime="20:00" -> timestamp for 2026-09-20T20:00:00+06:00
 */
export function getBangladeshSlotTimestamp(dateStr: string, startTime: string): number {
  // Normalize startTime format to HH:mm
  const [hours, minutes] = startTime.split(":").map((v) => v.padStart(2, "0"));
  const isoString = `${dateStr}T${hours}:${minutes}:00+06:00`;
  const timestamp = new Date(isoString).getTime();
  return timestamp;
}

/**
 * Checks if the current time is at least requiredHours before the booking start time.
 * Default requiredHours is 48.
 */
export function isRescheduleAllowed(
  dateStr: string,
  startTime: string,
  requiredHours: number = 48
): { allowed: boolean; hoursRemaining: number; bookingTimestamp: number } {
  const bookingTimestamp = getBangladeshSlotTimestamp(dateStr, startTime);
  const now = Date.now();
  const diffMs = bookingTimestamp - now;
  const diffHours = diffMs / (1000 * 60 * 60);

  return {
    allowed: diffHours >= requiredHours,
    hoursRemaining: Math.max(0, Math.round(diffHours * 10) / 10),
    bookingTimestamp,
  };
}

/**
 * Formats YYYY-MM-DD to a human-friendly format like "Wed, 20 Sep 2026"
 */
export function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const [year, month, day] = dateStr.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
    return new Intl.DateTimeFormat("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    }).format(date);
  } catch {
    return dateStr;
  }
}

/**
 * Formats 24h time to 12h AM/PM
 * Example: "06:00" -> "6:00 AM", "17:30" -> "5:30 PM"
 */
export function format12Hour(time24: string): string {
  if (!time24) return "";
  const [h, m] = time24.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const displayHour = h % 12 === 0 ? 12 : h % 12;
  const displayMin = m.toString().padStart(2, "0");
  return `${displayHour}:${displayMin} ${period}`;
}

/**
 * Formats time range
 * Example: "06:00", "07:30" -> "6:00 AM – 7:30 AM"
 */
export function formatTimeRange(startTime: string, endTime: string): string {
  return `${format12Hour(startTime)} – ${format12Hour(endTime)}`;
}
