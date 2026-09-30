import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { Slot } from "@/models/Slot";
import {
  getAdminFromRequestHeaders,
  canAdminWrite,
  forbiddenViewAdminResponse,
} from "@/lib/auth/jwt";

// GET: All slots including active/inactive
export async function GET(request: NextRequest) {
  try {
    const admin = getAdminFromRequestHeaders(request);
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const slots = await Slot.find().sort({ order: 1 }).lean();

    return NextResponse.json({ success: true, slots });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Failed to fetch slots" }, { status: 500 });
  }
}

// PUT: Update slot configuration
export async function PUT(request: NextRequest) {
  try {
    const admin = getAdminFromRequestHeaders(request);
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!canAdminWrite(admin)) {
      return forbiddenViewAdminResponse(
        "Access denied. Viewadmin cannot edit slot configurations, timings, or prices."
      );
    }

    const body = await request.json();
    const { slotId, label, startTime, endTime, regularPrice, discountedPrice, active, slotType } = body;

    if (!slotId) {
      return NextResponse.json({ success: false, error: "slotId is required" }, { status: 400 });
    }

    await connectToDatabase();

    const updatedSlot = await Slot.findOneAndUpdate(
      { slotId },
      {
        $set: {
          label,
          startTime,
          endTime,
          regularPrice: Number(regularPrice),
          discountedPrice: Number(discountedPrice),
          active: Boolean(active),
          slotType: slotType || "DAY",
        },
      },
      { new: true, upsert: false }
    );

    if (!updatedSlot) {
      return NextResponse.json({ success: false, error: "Slot not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Slot ${slotId} updated successfully.`,
      slot: updatedSlot,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Failed to update slot" }, { status: 500 });
  }
}

// POST: Add a new custom slot
export async function POST(request: NextRequest) {
  try {
    const admin = getAdminFromRequestHeaders(request);
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!canAdminWrite(admin)) {
      return forbiddenViewAdminResponse(
        "Access denied. Viewadmin cannot create new slots."
      );
    }

    const body = await request.json();
    const { slotId, label, startTime, endTime, regularPrice, discountedPrice, slotType, active = true } = body;

    if (!slotId || !label || !startTime || !endTime) {
      return NextResponse.json({ success: false, error: "Missing required slot fields." }, { status: 400 });
    }

    await connectToDatabase();

    const existing = await Slot.findOne({ slotId });
    if (existing) {
      return NextResponse.json({ success: false, error: "A slot with this slotId already exists." }, { status: 400 });
    }

    const count = await Slot.countDocuments();
    const newSlot = new Slot({
      slotId,
      label,
      startTime,
      endTime,
      regularPrice: Number(regularPrice) || 2500,
      discountedPrice: Number(discountedPrice) || 2000,
      slotType: slotType || "DAY",
      active: Boolean(active),
      order: count + 1,
    });

    await newSlot.save();

    return NextResponse.json({
      success: true,
      message: "New slot created successfully.",
      slot: newSlot,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Failed to create slot" }, { status: 500 });
  }
}
