import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { Slot } from "@/models/Slot";
import { seedDatabaseIfNeeded } from "@/lib/db/seed";

export async function GET() {
  try {
    await connectToDatabase();
    await seedDatabaseIfNeeded();

    const slots = await Slot.find({ active: true }).sort({ order: 1 }).lean();
    return NextResponse.json({ success: true, slots });
  } catch (error: any) {
    console.error("Failed to fetch slots:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch slots" },
      { status: 500 }
    );
  }
}
