import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { Setting } from "@/models/Setting";
import { seedDatabaseIfNeeded } from "@/lib/db/seed";

export async function GET() {
  try {
    await connectToDatabase();
    await seedDatabaseIfNeeded();

    let settings = await Setting.findOne().lean();
    if (!settings) {
      await seedDatabaseIfNeeded();
      settings = await Setting.findOne().lean();
    }

    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    console.error("Failed to fetch settings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}
