import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { Booking } from "@/models/Booking";
import { Slot } from "@/models/Slot";
import { getAdminFromRequestHeaders } from "@/lib/auth/jwt";
import { getBangladeshTodayString } from "@/lib/utils/date";

export async function GET(request: NextRequest) {
  try {
    const admin = getAdminFromRequestHeaders(request);
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const todayStr = getBangladeshTodayString();

    // 1. Total Active Slots Count
    const totalSlotsCount = await Slot.countDocuments({ active: true });

    // 2. Today's Bookings Breakdown
    const todayBookings = await Booking.find({ date: todayStr }).lean();
    const todayConfirmed = todayBookings.filter((b) => b.status === "CONFIRMED");
    const todayPending = todayBookings.filter((b) => b.status === "PENDING");
    const todayBookedSlotsCount = todayConfirmed.length + todayPending.length;
    const todayAvailableSlots = Math.max(0, totalSlotsCount - todayBookedSlotsCount);
    const todayOccupancy =
      totalSlotsCount > 0
        ? Math.round((todayBookedSlotsCount / totalSlotsCount) * 100)
        : 0;

    // Today's Revenue (Collected Advance + Total Value of Confirmed)
    const todayAdvanceRevenue = todayBookings.reduce(
      (sum, b) => (b.status === "CONFIRMED" || b.status === "PENDING" ? sum + (b.paymentAmount || 0) : sum),
      0
    );
    const todayTotalConfirmedValue = todayConfirmed.reduce(
      (sum, b) => sum + (b.finalPrice || 0),
      0
    );

    // 3. Overall KPI Metrics
    const totalPending = await Booking.countDocuments({ status: "PENDING" });
    const totalConfirmed = await Booking.countDocuments({ status: "CONFIRMED" });
    const totalDeclined = await Booking.countDocuments({ status: "DECLINED" });
    const totalCancelled = await Booking.countDocuments({ status: "CANCELLED" });
    const totalAll = await Booking.countDocuments();

    // Upcoming Bookings (Confirmed or Pending >= today)
    const upcomingBookingsCount = await Booking.countDocuments({
      date: { $gte: todayStr },
      status: { $in: ["PENDING", "CONFIRMED"] },
    });

    // Recent 7 Days & 30 Days stats
    const allActiveBookings = await Booking.find({
      status: { $in: ["CONFIRMED", "PENDING"] },
    })
      .select("date finalPrice paymentAmount status createdBy createdAt")
      .sort({ createdAt: -1 })
      .lean();

    const totalLifetimeRevenue = allActiveBookings.reduce(
      (sum, b) => (b.status === "CONFIRMED" ? sum + (b.finalPrice || 0) : sum + (b.paymentAmount || 0)),
      0
    );

    return NextResponse.json({
      success: true,
      analytics: {
        todayDate: todayStr,
        todayBookingsCount: todayBookings.length,
        todayConfirmedCount: todayConfirmed.length,
        todayPendingCount: todayPending.length,
        todayAvailableSlots,
        totalSlotsCount,
        todayOccupancy,
        todayAdvanceRevenue,
        todayTotalConfirmedValue,
        pendingRequestsCount: totalPending,
        confirmedBookingsCount: totalConfirmed,
        totalBookingsCount: totalAll,
        upcomingBookingsCount,
        cancelledCount: totalCancelled,
        declinedCount: totalDeclined,
        totalLifetimeRevenue,
      },
    });
  } catch (error: any) {
    console.error("Admin analytics error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate dashboard analytics" },
      { status: 500 }
    );
  }
}
