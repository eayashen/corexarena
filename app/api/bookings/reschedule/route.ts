import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { Booking } from "@/models/Booking";
import { Slot } from "@/models/Slot";
import { Setting } from "@/models/Setting";
import { isRescheduleAllowed, getBangladeshTodayString } from "@/lib/utils/date";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingId, mobile, email, newDate, newSlotId, reason } = body;

    if (!bookingId || !mobile || !email || !newDate || !newSlotId) {
      return NextResponse.json(
        {
          success: false,
          error: "Booking not found. Please make sure your mobile number and email address match the details used for your booking.",
        },
        { status: 400 }
      );
    }

    const todayStr = getBangladeshTodayString();
    if (newDate < todayStr) {
      return NextResponse.json(
        { success: false, error: "You cannot reschedule to a past date." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // 1. Find existing booking and verify BOTH mobile AND email match the SAME booking record
    const cleanMobile = String(mobile).replace(/[\s-]/g, "");
    const pure11 = cleanMobile.slice(-11);
    const cleanEmail = String(email).trim().toLowerCase();
    const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    if (pure11.length < 11 || !cleanEmail) {
      return NextResponse.json(
        {
          success: false,
          error: "Booking not found. Please make sure your mobile number and email address match the details used for your booking.",
        },
        { status: 404 }
      );
    }

    const booking = await Booking.findOne({
      bookingId: new RegExp(`^${escapeRegex(String(bookingId).trim())}$`, "i"),
      mobile: new RegExp(`${escapeRegex(pure11)}$`),
      email: new RegExp(`^${escapeRegex(cleanEmail)}$`, "i"),
    });

    if (!booking) {
      return NextResponse.json(
        {
          success: false,
          error: "Booking not found. Please make sure your mobile number and email address match the details used for your booking.",
        },
        { status: 404 }
      );
    }

    if (booking.status === "DECLINED" || booking.status === "CANCELLED") {
      return NextResponse.json(
        { success: false, error: `Cannot reschedule a booking that is currently ${booking.status.toLowerCase()}.` },
        { status: 400 }
      );
    }

    // 2. Strict Server-Side 48-Hour Deadline Check
    const settings = await Setting.findOne().lean();
    const requiredHours = settings?.scheduleChangeHoursLimit || 48;

    const check = isRescheduleAllowed(booking.date, booking.startTime, requiredHours);
    if (!check.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Schedule changes are only allowed at least ${requiredHours} hours before the booking time. (${check.hoursRemaining} hours remaining)`,
        },
        { status: 400 }
      );
    }

    // 3. Find the target new slot
    const newSlot = await Slot.findOne({ slotId: newSlotId, active: true });
    if (!newSlot) {
      return NextResponse.json(
        { success: false, error: "The selected new slot does not exist or is inactive." },
        { status: 404 }
      );
    }

    // 4. Verify target slot is not already booked/pending on the new date
    const conflictingBooking = await Booking.findOne({
      _id: { $ne: booking._id },
      date: newDate,
      slotId: newSlotId,
      status: { $in: ["PENDING", "CONFIRMED"] },
    });

    if (conflictingBooking) {
      return NextResponse.json(
        { success: false, error: "The requested new slot is already booked or pending for that date." },
        { status: 409 }
      );
    }

    // 5. Save history and update booking
    const oldDate = booking.date;
    const oldSlot = booking.slotId;
    const oldStartTime = booking.startTime;
    const oldEndTime = booking.endTime;

    booking.scheduleChangeHistory.push({
      oldDate,
      oldSlot,
      oldStartTime,
      oldEndTime,
      newDate,
      newSlot: newSlotId,
      newStartTime: newSlot.startTime,
      newEndTime: newSlot.endTime,
      changedBy: "USER",
      timestamp: new Date(),
      reason: reason ? String(reason).trim() : "Requested by customer",
    });

    booking.auditLog.push({
      action: "Schedule changed by USER",
      actor: "USER",
      timestamp: new Date(),
      details: `Moved from ${oldDate} (${oldStartTime}-${oldEndTime}) to ${newDate} (${newSlot.startTime}-${newSlot.endTime})`,
    });

    booking.date = newDate;
    booking.slotId = newSlotId;
    booking.slotType = newSlot.slotType;
    booking.startTime = newSlot.startTime;
    booking.endTime = newSlot.endTime;
    booking.regularPrice = newSlot.regularPrice;
    booking.discountedPrice = newSlot.discountedPrice;
    booking.finalPrice = newSlot.discountedPrice;

    await booking.save();

    return NextResponse.json({
      success: true,
      message: "Your schedule change has been processed successfully.",
      booking: {
        bookingId: booking.bookingId,
        date: booking.date,
        slotId: booking.slotId,
        slotType: booking.slotType,
        startTime: booking.startTime,
        endTime: booking.endTime,
        finalPrice: booking.finalPrice,
        status: booking.status,
      },
    });
  } catch (error: any) {
    console.error("Reschedule booking error:", error);

    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: "The requested slot is already taken on that date." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || "Failed to process schedule change." },
      { status: 500 }
    );
  }
}
