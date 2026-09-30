import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { Booking } from "@/models/Booking";
import { Slot } from "@/models/Slot";
import {
  getAdminFromRequestHeaders,
  canAdminWrite,
  forbiddenViewAdminResponse,
} from "@/lib/auth/jwt";
import { generateBookingId } from "@/lib/utils/id";

// GET: Filter and search bookings for Admin
export async function GET(request: NextRequest) {
  try {
    const admin = getAdminFromRequestHeaders(request);
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const status = searchParams.get("status");
    const slotType = searchParams.get("slotType");
    const createdBy = searchParams.get("createdBy");
    const search = searchParams.get("search")?.trim();

    await connectToDatabase();

    const query: any = {};

    if (date) {
      query.date = date;
    } else if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = startDate;
      if (endDate) query.date.$lte = endDate;
    }

    if (status && status !== "ALL") {
      query.status = status;
    }

    if (slotType && slotType !== "ALL") {
      query.slotType = slotType;
    }

    const bookingSource = searchParams.get("bookingSource") || createdBy;
    if (bookingSource && bookingSource !== "ALL") {
      query.$or = [{ bookingSource }, { createdBy: bookingSource }];
    }

    if (search) {
      query.$or = [
        { bookingId: new RegExp(search, "i") },
        { customerName: new RegExp(search, "i") },
        { mobile: new RegExp(search, "i") },
        { email: new RegExp(search, "i") },
      ];
    }

    const bookings = await Booking.find(query).sort({ date: -1, startTime: -1, createdAt: -1 }).lean();

    return NextResponse.json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error: any) {
    console.error("Admin bookings query error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch bookings." },
      { status: 500 }
    );
  }
}

// POST: Admin manually creates a booking (walk-in / phone customer)
export async function POST(request: NextRequest) {
  try {
    const admin = getAdminFromRequestHeaders(request);
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!canAdminWrite(admin)) {
      return forbiddenViewAdminResponse("Access denied. Viewadmin cannot create manual bookings.");
    }

    const body = await request.json();
    const {
      customerName,
      mobile,
      date,
      slotId,
      status = "CONFIRMED",
      email,
      address,
      paymentAmount = 0,
      adminNote,
      specialDiscount: requestedDiscount = 0,
    } = body;

    // Admin manual bookings only require Name, Mobile, Date, Slot
    if (!customerName || !customerName.trim()) {
      return NextResponse.json(
        { success: false, error: "Customer name is required." },
        { status: 400 }
      );
    }

    if (!mobile || !mobile.trim()) {
      return NextResponse.json(
        { success: false, error: "Mobile number is required." },
        { status: 400 }
      );
    }

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { success: false, error: "Valid date (YYYY-MM-DD) is required." },
        { status: 400 }
      );
    }

    if (!slotId) {
      return NextResponse.json(
        { success: false, error: "Slot is required." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const slot = await Slot.findOne({ slotId });
    if (!slot) {
      return NextResponse.json(
        { success: false, error: "Slot not found." },
        { status: 404 }
      );
    }

    // Check if slot is already occupied on that date
    const existingBooking = await Booking.findOne({
      date,
      slotId,
      status: { $in: ["PENDING", "CONFIRMED"] },
    });

    if (existingBooking) {
      return NextResponse.json(
        { success: false, error: `Slot is already occupied (${existingBooking.status}) on ${date}.` },
        { status: 409 }
      );
    }

    const originalPrice = slot.discountedPrice;
    const specialDiscount = Math.max(0, Number(requestedDiscount) || 0);

    if (specialDiscount > originalPrice) {
      return NextResponse.json(
        {
          success: false,
          error: `Special discount (৳${specialDiscount.toLocaleString()}) cannot exceed original price (৳${originalPrice.toLocaleString()}).`,
        },
        { status: 400 }
      );
    }

    const finalPrice = Math.max(0, originalPrice - specialDiscount);
    const bookingId = await generateBookingId();
    const cleanMobile = mobile.replace(/[\s-]/g, "");

    const discountHistory =
      specialDiscount > 0
        ? [
            {
              previousDiscount: 0,
              newDiscount: specialDiscount,
              changedBy: admin.name || "ADMIN",
              timestamp: new Date(),
              reason: adminNote || "Initial admin special discount given during creation",
            },
          ]
        : [];

    const newBooking = new Booking({
      bookingId,
      customerName: customerName.trim(),
      mobile: cleanMobile,
      email: email ? email.trim().toLowerCase() : undefined,
      address: address ? address.trim() : undefined,
      date,
      slotId: slot.slotId,
      slotType: slot.slotType,
      startTime: slot.startTime,
      endTime: slot.endTime,
      regularPrice: slot.regularPrice,
      discountedPrice: slot.discountedPrice,
      originalPrice,
      specialDiscount,
      finalPrice,
      paymentRequired: 0,
      paymentAmount: Number(paymentAmount) || 0,
      paymentMethod: "Cash / Direct Admin",
      status: status === "PENDING" ? "PENDING" : "CONFIRMED",
      createdBy: "ADMIN",
      bookingSource: "ADMIN",
      adminNote: adminNote || "Manual walk-in / phone booking created by admin",
      discountHistory,
      scheduleChangeHistory: [],
      auditLog: [
        {
          action: "Manual booking created by ADMIN",
          actor: "ADMIN",
          timestamp: new Date(),
          details: `Created by ${admin.name} (${admin.email}) with status ${status}${
            specialDiscount > 0 ? `, Special discount: ৳${specialDiscount}` : ""
          }`,
        },
      ],
    });

    await newBooking.save();

    return NextResponse.json({
      success: true,
      message: "Manual booking created successfully.",
      booking: newBooking,
    });
  } catch (error: any) {
    console.error("Admin manual booking error:", error);
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: "This slot is already booked for the selected date." },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create manual booking." },
      { status: 500 }
    );
  }
}
