import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { Admin, AdminRole } from "@/models/Admin";
import {
  getAdminFromRequestHeaders,
  canAdminWrite,
  forbiddenViewAdminResponse,
  hashPassword,
} from "@/lib/auth/jwt";

// GET: List all admin accounts
export async function GET(request: NextRequest) {
  try {
    const admin = getAdminFromRequestHeaders(request);
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const admins = await Admin.find()
      .select("-passwordHash")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      admins,
    });
  } catch (error: any) {
    console.error("Fetch admins error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch admin accounts" },
      { status: 500 }
    );
  }
}

// POST: Create a new admin account (superadmin only)
export async function POST(request: NextRequest) {
  try {
    const admin = getAdminFromRequestHeaders(request);
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!canAdminWrite(admin)) {
      return forbiddenViewAdminResponse(
        "Access denied. Only superadmins can create new admin accounts."
      );
    }

    const body = await request.json();
    const { email, name, password, role } = body;

    if (!email || !email.trim()) {
      return NextResponse.json(
        { success: false, error: "Email is required." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "Name is required." },
        { status: 400 }
      );
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    const validRoles: AdminRole[] = ["superadmin", "viewadmin"];
    const targetRole: AdminRole = validRoles.includes(role) ? role : "viewadmin";

    await connectToDatabase();

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await Admin.findOne({ email: normalizedEmail });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "An admin account with this email already exists." },
        { status: 409 }
      );
    }

    const newAdmin = new Admin({
      email: normalizedEmail,
      name: name.trim(),
      passwordHash: hashPassword(password),
      role: targetRole,
    });

    await newAdmin.save();

    return NextResponse.json({
      success: true,
      message: `Admin account (${targetRole}) created successfully.`,
      admin: {
        _id: newAdmin._id,
        email: newAdmin.email,
        name: newAdmin.name,
        role: newAdmin.role,
        createdAt: newAdmin.createdAt,
      },
    });
  } catch (error: any) {
    console.error("Create admin error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create admin account." },
      { status: 500 }
    );
  }
}
