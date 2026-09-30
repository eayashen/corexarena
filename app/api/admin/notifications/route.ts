import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { Notification } from "@/models/Notification";
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

    const notifications = await Notification.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const unreadCount = await Notification.countDocuments({ status: "UNREAD" });

    return NextResponse.json({
      success: true,
      unreadCount,
      notifications,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Failed to fetch notifications" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = getAdminFromRequestHeaders(request);
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!canAdminWrite(admin)) {
      return forbiddenViewAdminResponse(
        "Access denied. Viewadmin cannot modify notification status."
      );
    }

    const { id, markAllAsRead } = await request.json();
    await connectToDatabase();

    if (markAllAsRead) {
      await Notification.updateMany({ status: "UNREAD" }, { $set: { status: "READ" } });
    } else if (id) {
      await Notification.findByIdAndUpdate(id, { $set: { status: "READ" } });
    }

    return NextResponse.json({ success: true, message: "Notifications updated." });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Failed to update notifications" }, { status: 500 });
  }
}
