import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { Slot } from "@/models/Slot";
import { Booking } from "@/models/Booking";
import { seedDatabaseIfNeeded } from "@/lib/db/seed";
import { getBangladeshTodayString, getBangladeshSlotTimestamp } from "@/lib/utils/date";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date") || getBangladeshTodayString();

    await connectToDatabase();
    await seedDatabaseIfNeeded();

    // 1. Fetch all active slots
    const slots = await Slot.find({ active: true }).sort({ order: 1 }).lean();

    // 2. Fetch all active bookings for this date (PENDING or CONFIRMED)
    const activeBookings = await Booking.find({
      date,
      status: { $in: ["PENDING", "CONFIRMED"] },
    })
      .select("slotId status")
      .lean();

    // Build a map of slotId -> status
    const bookingStatusMap: Record<string, "PENDING" | "BOOKED"> = {};
    for (const b of activeBookings) {
      bookingStatusMap[b.slotId] = b.status === "CONFIRMED" ? "BOOKED" : "PENDING";
    }

    const now = Date.now();
    const todayStr = getBangladeshTodayString();
    const isPastDate = date < todayStr;

    // 3. Map slot availability without exposing any personal customer information
    const availability = slots.map((slot) => {
      let status: "AVAILABLE" | "PENDING" | "BOOKED" | "PAST" = "AVAILABLE";

      if (isPastDate) {
        status = "PAST";
      } else if (bookingStatusMap[slot.slotId]) {
        status = bookingStatusMap[slot.slotId];
      } else if (date === todayStr) {
        // If today and slot end time is already in the past
        const slotEndTimestamp = getBangladeshSlotTimestamp(date, slot.endTime);
        // Handle midnight slots that wrap to next day
        const isNextDayEnd = slot.endTime < slot.startTime;
        const adjustedEndTimestamp = isNextDayEnd
          ? slotEndTimestamp + 24 * 60 * 60 * 1000
          : slotEndTimestamp;

        if (adjustedEndTimestamp < now) {
          status = "PAST";
        }
      }

      return {
        slotId: slot.slotId,
        slotType: slot.slotType,
        label: slot.label,
        startTime: slot.startTime,
        endTime: slot.endTime,
        regularPrice: slot.regularPrice,
        discountedPrice: slot.discountedPrice,
        order: slot.order,
        status, // "AVAILABLE" | "PENDING" | "BOOKED" | "PAST"
      };
    });

    return NextResponse.json({
      success: true,
      date,
      slots: availability,
    });
  } catch (error: any) {
    console.error("Availability error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch availability" },
      { status: 500 }
    );
  }
}
