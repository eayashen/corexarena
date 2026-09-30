import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { Booking } from "@/models/Booking";
import { Setting } from "@/models/Setting";
import { isRescheduleAllowed, formatDisplayDate, format12Hour } from "@/lib/utils/date";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawMobile = searchParams.get("mobile")?.trim() || "";
    const rawEmail = searchParams.get("email")?.trim().toLowerCase() || "";

    const cleanMobile = rawMobile.replace(/[\s-]/g, "");
    const cleanEmail = rawEmail;

    // Both mobile and email are strictly required for reschedule verification
    if (!cleanMobile || !cleanEmail) {
      return NextResponse.json(
        {
          success: false,
          error: "Booking not found. Please make sure your mobile number and email address match the details used for your booking.",
        },
        { status: 400 }
      );
    }

    const pure11 = cleanMobile.slice(-11);
    if (pure11.length < 11) {
      return NextResponse.json(
        {
          success: false,
          error: "Booking not found. Please make sure your mobile number and email address match the details used for your booking.",
        },
        { status: 404 }
      );
    }

    await connectToDatabase();

    const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    // Enforce AND condition: BOTH mobile AND email must match the SAME booking record
    const query = {
      mobile: new RegExp(`${escapeRegex(pure11)}$`),
      email: new RegExp(`^${escapeRegex(cleanEmail)}$`, "i"),
    };

    const settings = await Setting.findOne().lean();
    const cutoffHours = settings?.scheduleChangeHoursLimit || 48;

    const bookings = await Booking.find(query).sort({ createdAt: -1 }).lean();

    if (!bookings || bookings.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Booking not found. Please make sure your mobile number and email address match the details used for your booking.",
          count: 0,
          bookings: [],
        },
        { status: 404 }
      );
    }

    const formattedBookings = bookings.map((b) => {
      const rescheduleCheck = isRescheduleAllowed(b.date, b.startTime, cutoffHours);
      const isEligibleToReschedule =
        (b.status === "PENDING" || b.status === "CONFIRMED") && rescheduleCheck.allowed;

      return {
        bookingId: b.bookingId,
        customerName: b.customerName,
        mobile: b.mobile,
        email: b.email,
        date: b.date,
        displayDate: formatDisplayDate(b.date),
        slotId: b.slotId,
        slotType: b.slotType,
        startTime: b.startTime,
        endTime: b.endTime,
        timeRange: `${format12Hour(b.startTime)} – ${format12Hour(b.endTime)}`,
        regularPrice: b.regularPrice,
        discountedPrice: b.discountedPrice,
        finalPrice: b.finalPrice,
        paymentAmount: b.paymentAmount,
        dueAmount: b.finalPrice - b.paymentAmount,
        status: b.status,
        createdAt: b.createdAt,
        isEligibleToReschedule,
        hoursRemainingBeforeMatch: rescheduleCheck.hoursRemaining,
        cutoffHours,
        scheduleChangeHistory: b.scheduleChangeHistory || [],
      };
    });

    return NextResponse.json({
      success: true,
      count: formattedBookings.length,
      bookings: formattedBookings,
    });
  } catch (error: any) {
    console.error("Manage booking lookup error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to search bookings." },
      { status: 500 }
    );
  }
}
