import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { Setting } from "@/models/Setting";
import {
  getAdminFromRequestHeaders,
  canAdminWrite,
  forbiddenViewAdminResponse,
} from "@/lib/auth/jwt";

export async function GET(request: NextRequest) {
  try {
    const admin = getAdminFromRequestHeaders(request);
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const settings = await Setting.findOne().lean();

    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const admin = getAdminFromRequestHeaders(request);
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!canAdminWrite(admin)) {
      return forbiddenViewAdminResponse(
        "Access denied. Viewadmin cannot modify turf settings, pricing, or payment details."
      );
    }

    const body = await request.json();
    await connectToDatabase();

    const updated = await Setting.findOneAndUpdate(
      {},
      {
        $set: {
          turfName: body.turfName,
          tagline: body.tagline,
          address: body.address,
          email: body.email,
          contactNumber: body.contactNumber,
          whatsappNumber: body.whatsappNumber,
          facebookUrl: body.facebookUrl,
          latitude: Number(body.latitude),
          longitude: Number(body.longitude),
          bkashNumber: body.bkashNumber,
          requiredAdvancePayment: Number(body.requiredAdvancePayment),
          scheduleChangeHoursLimit: Number(body.scheduleChangeHoursLimit),
          daySlotDefaultRegularPrice: Number(body.daySlotDefaultRegularPrice),
          daySlotDefaultDiscountedPrice: Number(body.daySlotDefaultDiscountedPrice),
          nightSlotDefaultRegularPrice: Number(body.nightSlotDefaultRegularPrice),
          nightSlotDefaultDiscountedPrice: Number(body.nightSlotDefaultDiscountedPrice),
        },
      },
      { new: true, upsert: true }
    );

    return NextResponse.json({
      success: true,
      message: "Turf settings updated successfully.",
      settings: updated,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Failed to update settings" }, { status: 500 });
  }
}
