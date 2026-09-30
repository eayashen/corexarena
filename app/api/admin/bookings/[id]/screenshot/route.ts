import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { Booking } from "@/models/Booking";
import { getAdminFromRequestHeaders } from "@/lib/auth/jwt";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = getAdminFromRequestHeaders(request);
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectToDatabase();

    const booking = await Booking.findById(id).select("paymentScreenshot bookingId").lean();
    if (!booking || !booking.paymentScreenshot) {
      return NextResponse.json(
        { success: false, error: "Payment screenshot not found" },
        { status: 404 }
      );
    }

    // If Base64 Data URL, we can stream the binary buffer with proper Content-Type
    const dataUrlMatch = booking.paymentScreenshot.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
    if (dataUrlMatch) {
      const mimeType = dataUrlMatch[1];
      const base64Data = dataUrlMatch[2];
      const buffer = Buffer.from(base64Data, "base64");

      return new NextResponse(buffer, {
        headers: {
          "Content-Type": mimeType,
          "Content-Disposition": `inline; filename="payment-${booking.bookingId}.png"`,
          "Cache-Control": "private, max-age=3600",
        },
      });
    }

    // If Cloudinary / External HTTPS URL, redirect directly to the CDN image
    if (booking.paymentScreenshot.startsWith("http://") || booking.paymentScreenshot.startsWith("https://")) {
      return NextResponse.redirect(new URL(booking.paymentScreenshot));
    }

    // Return the URL / reference if stored externally
    return NextResponse.json({
      success: true,
      screenshotUrl: booking.paymentScreenshot,
    });
  } catch (error: any) {
    console.error("Screenshot retrieval error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load payment screenshot" },
      { status: 500 }
    );
  }
}
