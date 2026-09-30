import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { Booking } from "@/models/Booking";
import { Slot } from "@/models/Slot";
import { Setting } from "@/models/Setting";
import { Notification } from "@/models/Notification";
import { generateBookingId } from "@/lib/utils/id";
import { getBangladeshTodayString } from "@/lib/utils/date";
import { uploadPaymentScreenshot } from "@/lib/cloudinary";

// Bangladeshi Mobile Regex (accepts 013-019 with optional +88/88 prefix)
const BD_PHONE_REGEX = /^(?:\+8801|8801|01)[3-9]\d{8}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customerName,
      mobile,
      email,
      address,
      date,
      slotId,
      transactionId,
      paymentScreenshot,
    } = body;

    // 1. Validation
    if (!customerName || typeof customerName !== "string" || !customerName.trim()) {
      return NextResponse.json(
        { success: false, error: "Please enter your full name." },
        { status: 400 }
      );
    }

    if (!mobile || !BD_PHONE_REGEX.test(mobile.replace(/[\s-]/g, ""))) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid Bangladeshi mobile number (e.g. 017XXXXXXXX)." },
        { status: 400 }
      );
    }

    if (email && !EMAIL_REGEX.test(email.trim())) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { success: false, error: "Please select a valid booking date." },
        { status: 400 }
      );
    }

    const todayStr = getBangladeshTodayString();
    if (date < todayStr) {
      return NextResponse.json(
        { success: false, error: "You cannot book slots for past dates." },
        { status: 400 }
      );
    }

    if (!slotId) {
      return NextResponse.json(
        { success: false, error: "Please select a time slot." },
        { status: 400 }
      );
    }

    if (!paymentScreenshot) {
      return NextResponse.json(
        { success: false, error: "Please upload your bKash payment screenshot." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // 2. Fetch Slot details
    const slot = await Slot.findOne({ slotId, active: true });
    if (!slot) {
      return NextResponse.json(
        { success: false, error: "The selected slot does not exist or is currently inactive." },
        { status: 404 }
      );
    }

    // 3. Fetch Settings for Advance Payment Amount
    const settings = await Setting.findOne().lean();
    const requiredAdvance = settings?.requiredAdvancePayment || 500;

    // 4. Check for existing active booking on the same date + slot
    const existingActiveBooking = await Booking.findOne({
      date,
      slotId,
      status: { $in: ["PENDING", "CONFIRMED"] },
    });

    if (existingActiveBooking) {
      return NextResponse.json(
        {
          success: false,
          error: "Sorry, this slot has just been booked by another customer. Please choose another slot.",
        },
        { status: 409 }
      );
    }

    // 5. Generate unique Booking ID
    const bookingId = await generateBookingId();
    const cleanMobile = mobile.replace(/[\s-]/g, "");

    // 6. Upload payment screenshot to Cloudinary Turf folder
    let screenshotUrl = paymentScreenshot;
    try {
      if (paymentScreenshot.startsWith("data:image/")) {
        const cloudinaryResult = await uploadPaymentScreenshot(paymentScreenshot, bookingId);
        screenshotUrl = cloudinaryResult.secure_url;
      }
    } catch (uploadError: any) {
      console.error("Cloudinary upload failed:", uploadError);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to upload payment screenshot. Please try again with a clear JPG or PNG image.",
        },
        { status: 500 }
      );
    }

    // 7. Create Booking Document
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
      originalPrice: slot.discountedPrice,
      specialDiscount: 0,
      finalPrice: slot.discountedPrice,
      paymentRequired: requiredAdvance,
      paymentAmount: requiredAdvance,
      paymentMethod: "bKash",
      transactionId: transactionId ? transactionId.trim() : undefined,
      paymentScreenshot: screenshotUrl,
      status: "PENDING",
      createdBy: "USER",
      bookingSource: "USER",
      discountHistory: [],
      scheduleChangeHistory: [],
      auditLog: [
        {
          action: "Booking submitted by USER",
          actor: "USER",
          timestamp: new Date(),
          details: `Advance payment ৳${requiredAdvance} via bKash`,
        },
        {
          action: "Payment screenshot uploaded successfully",
          actor: "USER",
          timestamp: new Date(),
          details: transactionId ? `TrxID: ${transactionId}` : "Screenshot uploaded",
        },
      ],
    });

    await newBooking.save();

    // 7. Create Admin Notification
    try {
      await Notification.create({
        bookingId,
        customerName: customerName.trim(),
        date,
        slot: slot.label,
        time: `${slot.startTime} – ${slot.endTime}`,
        message: `New booking request from ${customerName.trim()} for ${date}, ${slot.label}`,
        status: "UNREAD",
      });
    } catch (notifErr) {
      console.error("Failed to create notification:", notifErr);
    }

    const dueAmount = newBooking.finalPrice - newBooking.paymentAmount;

    return NextResponse.json({
      success: true,
      message: "Your booking request has been submitted successfully.",
      booking: {
        bookingId: newBooking.bookingId,
        customerName: newBooking.customerName,
        mobile: newBooking.mobile,
        email: newBooking.email,
        date: newBooking.date,
        slotId: newBooking.slotId,
        slotType: newBooking.slotType,
        startTime: newBooking.startTime,
        endTime: newBooking.endTime,
        label: slot.label,
        regularPrice: newBooking.regularPrice,
        discountedPrice: newBooking.discountedPrice,
        finalPrice: newBooking.finalPrice,
        paymentAmount: newBooking.paymentAmount,
        dueAmount,
        status: newBooking.status,
        createdAt: newBooking.createdAt,
      },
    });
  } catch (error: any) {
    console.error("Create booking error:", error);

    // Check for MongoDB duplicate key error (code 11000)
    if (error.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          error: "Sorry, this slot has just been booked by another customer. Please choose another slot.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || "Failed to process booking request." },
      { status: 500 }
    );
  }
}
