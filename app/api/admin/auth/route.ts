import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { Admin } from "@/models/Admin";
import { seedDatabaseIfNeeded } from "@/lib/db/seed";
import {
  comparePassword,
  signAdminToken,
  getAdminFromRequestHeaders,
} from "@/lib/auth/jwt";

const TOKEN_NAME = "corex_admin_token";

// POST: Admin Login
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Please enter email and password." },
        { status: 400 }
      );
    }

    await connectToDatabase();
    await seedDatabaseIfNeeded();

    const admin = await Admin.findOne({ email: email.toLowerCase().trim() });
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Invalid admin credentials." },
        { status: 401 }
      );
    }

    const isValid = comparePassword(password, admin.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Invalid admin credentials." },
        { status: 401 }
      );
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    const token = signAdminToken({
      email: admin.email,
      name: admin.name,
      role: admin.role,
    });

    const response = NextResponse.json({
      success: true,
      message: "Login successful.",
      admin: {
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
      token,
    });

    // Set secure HTTP-only cookie
    response.cookies.set({
      name: TOKEN_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { success: false, error: "Login failed." },
      { status: 500 }
    );
  }
}

// GET: Check current Admin Session
export async function GET(request: NextRequest) {
  try {
    const admin = getAdminFromRequestHeaders(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized." },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      admin,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Session check failed." },
      { status: 500 }
    );
  }
}

// DELETE: Admin Logout
export async function DELETE() {
  const response = NextResponse.json({
    success: true,
    message: "Logged out successfully.",
  });

  response.cookies.set({
    name: TOKEN_NAME,
    value: "",
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  });

  return response;
}
