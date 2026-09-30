import { getBangladeshTodayString } from "./date";
import { Booking } from "@/models/Booking";

/**
 * Generates a unique human-friendly booking ID
 * Format: CRA-YYYYMMDD-XXXX (e.g. CRA-20260917-0001 or CRA-20260917-8492)
 */
export async function generateBookingId(): Promise<string> {
  const todayStr = getBangladeshTodayString().replace(/-/g, ""); // e.g. 20260917
  const prefix = `CRA-${todayStr}`;

  // Find the count of bookings created today to start a sequential attempt
  const countToday = await Booking.countDocuments({
    bookingId: new RegExp(`^${prefix}`),
  });

  let suffixNum = countToday + 1;
  let candidateId = `${prefix}-${String(suffixNum).padStart(4, "0")}`;

  // Ensure collision safety in case of concurrent bookings
  let exists = await Booking.findOne({ bookingId: candidateId }).select("_id").lean();
  while (exists) {
    suffixNum++;
    const randomSalt = Math.floor(1000 + Math.random() * 9000);
    candidateId = `${prefix}-${String(suffixNum).padStart(4, "0")}`;
    exists = await Booking.findOne({ bookingId: candidateId }).select("_id").lean();
    if (exists) {
      candidateId = `${prefix}-${randomSalt}`;
      exists = await Booking.findOne({ bookingId: candidateId }).select("_id").lean();
    }
  }

  return candidateId;
}
