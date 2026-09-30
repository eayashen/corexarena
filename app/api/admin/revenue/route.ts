import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { Booking } from "@/models/Booking";
import { getAdminFromRequestHeaders } from "@/lib/auth/jwt";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function formatMonthLabel(monthKey: string): string {
  if (!monthKey || !monthKey.includes("-")) return monthKey;
  const [year, m] = monthKey.split("-");
  const monthIndex = parseInt(m, 10) - 1;
  const name = MONTH_NAMES[monthIndex] || m;
  return `${name} ${year}`;
}

export async function GET(request: NextRequest) {
  try {
    const admin = getAdminFromRequestHeaders(request);
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const view = searchParams.get("view") || "daily"; // "daily" | "monthly" | "yearly"
    const year = searchParams.get("year"); // e.g. "2026"
    const month = searchParams.get("month"); // e.g. "2026-09"
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const bookingSource = searchParams.get("bookingSource"); // "ALL" | "USER" | "ADMIN"
    const slotType = searchParams.get("slotType"); // "ALL" | "DAY" | "NIGHT"
    const statusParam = searchParams.get("status"); // Default "CONFIRMED"

    await connectToDatabase();

    // 1. Build Base Match Filter
    // Default to CONFIRMED for revenue calculations
    const statusFilter = statusParam && statusParam !== "ALL" ? statusParam : "CONFIRMED";
    const matchQuery: any = {
      status: statusFilter,
    };

    // Filter by bookingSource
    if (bookingSource && bookingSource !== "ALL") {
      matchQuery.$or = [{ bookingSource }, { createdBy: bookingSource }];
    }

    // Filter by slotType
    if (slotType && slotType !== "ALL") {
      matchQuery.slotType = slotType;
    }

    // Date Filters
    if (startDate || endDate) {
      matchQuery.date = {};
      if (startDate) matchQuery.date.$gte = startDate;
      if (endDate) matchQuery.date.$lte = endDate;
    } else if (month) {
      matchQuery.date = { $regex: `^${month}` };
    } else if (year) {
      matchQuery.date = { $regex: `^${year}` };
    }

    // 2. Summary Cards Aggregation (Total Bookings, Day, Night, Day Income, Night Income, Net Income)
    const summaryAgg = await Booking.aggregate([
      { $match: matchQuery },
      {
        $project: {
          slotType: 1,
          price: {
            $ifNull: [
              "$finalPrice",
              {
                $subtract: [
                  { $ifNull: ["$originalPrice", { $ifNull: ["$discountedPrice", "$regularPrice"] }] },
                  { $ifNull: ["$specialDiscount", 0] },
                ],
              },
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          dayBookings: {
            $sum: { $cond: [{ $eq: ["$slotType", "DAY"] }, 1, 0] },
          },
          nightBookings: {
            $sum: { $cond: [{ $eq: ["$slotType", "NIGHT"] }, 1, 0] },
          },
          dayIncome: {
            $sum: { $cond: [{ $eq: ["$slotType", "DAY"] }, "$price", 0] },
          },
          nightIncome: {
            $sum: { $cond: [{ $eq: ["$slotType", "NIGHT"] }, "$price", 0] },
          },
          netIncome: { $sum: "$price" },
        },
      },
    ]);

    const summary = summaryAgg[0] || {
      totalBookings: 0,
      dayBookings: 0,
      nightBookings: 0,
      dayIncome: 0,
      nightIncome: 0,
      netIncome: 0,
    };

    // 3. Tabulated Reports by View
    let reportData: any[] = [];

    if (view === "daily") {
      // Group by specific Date (YYYY-MM-DD)
      const dailyAgg = await Booking.aggregate([
        { $match: matchQuery },
        {
          $project: {
            date: 1,
            slotType: 1,
            price: {
              $ifNull: [
                "$finalPrice",
                {
                  $subtract: [
                    { $ifNull: ["$originalPrice", { $ifNull: ["$discountedPrice", "$regularPrice"] }] },
                    { $ifNull: ["$specialDiscount", 0] },
                  ],
                },
              ],
            },
          },
        },
        {
          $group: {
            _id: "$date",
            date: { $first: "$date" },
            day: {
              $sum: { $cond: [{ $eq: ["$slotType", "DAY"] }, 1, 0] },
            },
            night: {
              $sum: { $cond: [{ $eq: ["$slotType", "NIGHT"] }, 1, 0] },
            },
            total: { $sum: 1 },
            dayIncome: {
              $sum: { $cond: [{ $eq: ["$slotType", "DAY"] }, "$price", 0] },
            },
            nightIncome: {
              $sum: { $cond: [{ $eq: ["$slotType", "NIGHT"] }, "$price", 0] },
            },
            netIncome: { $sum: "$price" },
          },
        },
        { $sort: { date: -1 } },
      ]);

      reportData = dailyAgg;
    } else if (view === "monthly") {
      // Group by Month (YYYY-MM)
      const monthlyAgg = await Booking.aggregate([
        { $match: matchQuery },
        {
          $project: {
            monthKey: { $substrCP: ["$date", 0, 7] },
            slotType: 1,
            price: {
              $ifNull: [
                "$finalPrice",
                {
                  $subtract: [
                    { $ifNull: ["$originalPrice", { $ifNull: ["$discountedPrice", "$regularPrice"] }] },
                    { $ifNull: ["$specialDiscount", 0] },
                  ],
                },
              ],
            },
          },
        },
        {
          $group: {
            _id: "$monthKey",
            monthKey: { $first: "$monthKey" },
            day: {
              $sum: { $cond: [{ $eq: ["$slotType", "DAY"] }, 1, 0] },
            },
            night: {
              $sum: { $cond: [{ $eq: ["$slotType", "NIGHT"] }, 1, 0] },
            },
            total: { $sum: 1 },
            dayIncome: {
              $sum: { $cond: [{ $eq: ["$slotType", "DAY"] }, "$price", 0] },
            },
            nightIncome: {
              $sum: { $cond: [{ $eq: ["$slotType", "NIGHT"] }, "$price", 0] },
            },
            netIncome: { $sum: "$price" },
          },
        },
        { $sort: { monthKey: -1 } },
      ]);

      reportData = monthlyAgg.map((item) => ({
        ...item,
        month: formatMonthLabel(item.monthKey),
      }));
    } else if (view === "yearly") {
      // Group by Year (YYYY)
      const yearlyAgg = await Booking.aggregate([
        { $match: matchQuery },
        {
          $project: {
            yearKey: { $substrCP: ["$date", 0, 4] },
            slotType: 1,
            price: {
              $ifNull: [
                "$finalPrice",
                {
                  $subtract: [
                    { $ifNull: ["$originalPrice", { $ifNull: ["$discountedPrice", "$regularPrice"] }] },
                    { $ifNull: ["$specialDiscount", 0] },
                  ],
                },
              ],
            },
          },
        },
        {
          $group: {
            _id: "$yearKey",
            year: { $first: "$yearKey" },
            day: {
              $sum: { $cond: [{ $eq: ["$slotType", "DAY"] }, 1, 0] },
            },
            night: {
              $sum: { $cond: [{ $eq: ["$slotType", "NIGHT"] }, 1, 0] },
            },
            total: { $sum: 1 },
            dayIncome: {
              $sum: { $cond: [{ $eq: ["$slotType", "DAY"] }, "$price", 0] },
            },
            nightIncome: {
              $sum: { $cond: [{ $eq: ["$slotType", "NIGHT"] }, "$price", 0] },
            },
            netIncome: { $sum: "$price" },
          },
        },
        { $sort: { year: -1 } },
      ]);

      reportData = yearlyAgg;
    }

    // 4. Detail Bookings Table (filtered bookings)
    const detailBookings = await Booking.find(matchQuery)
      .sort({ date: -1, startTime: -1, createdAt: -1 })
      .limit(150)
      .lean();

    const formattedDetails = detailBookings.map((b) => {
      const orig = b.originalPrice ?? b.discountedPrice ?? b.finalPrice ?? 0;
      const disc = b.specialDiscount ?? 0;
      const final = b.finalPrice ?? orig - disc;
      const source = b.bookingSource || b.createdBy || "USER";

      return {
        _id: b._id,
        bookingId: b.bookingId,
        date: b.date,
        customerName: b.customerName,
        source,
        slotType: b.slotType,
        originalPrice: orig,
        specialDiscount: disc,
        finalPrice: final,
        status: b.status,
      };
    });

    // 5. Available Years & Months for Filters
    const distinctDates = await Booking.distinct("date", { status: statusFilter as any });
    const availableYearsSet = new Set<string>();
    const availableMonthsSet = new Set<string>();

    distinctDates.forEach((d: string) => {
      if (typeof d === "string" && d.length >= 7) {
        availableYearsSet.add(d.substring(0, 4));
        availableMonthsSet.add(d.substring(0, 7));
      }
    });

    const availableYears = Array.from(availableYearsSet).sort().reverse();
    const availableMonths = Array.from(availableMonthsSet).sort().reverse();

    return NextResponse.json({
      success: true,
      view,
      summary,
      reportData,
      detailBookings: formattedDetails,
      filterOptions: {
        availableYears,
        availableMonths,
      },
    });
  } catch (error: any) {
    console.error("Admin revenue aggregation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate revenue report." },
      { status: 500 }
    );
  }
}
