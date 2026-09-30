import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { Admin, AdminRole } from "@/models/Admin";
import {
  getAdminFromRequestHeaders,
  canAdminWrite,
  forbiddenViewAdminResponse,
  hashPassword,
} from "@/lib/auth/jwt";

// PATCH: Update admin account (superadmin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentAdmin = getAdminFromRequestHeaders(request);
    if (!currentAdmin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!canAdminWrite(currentAdmin)) {
      return forbiddenViewAdminResponse(
        "Access denied. Only superadmins can update admin accounts."
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { name, role, password } = body;

    await connectToDatabase();

    const targetAdmin = await Admin.findById(id);
    if (!targetAdmin) {
      return NextResponse.json({ success: false, error: "Admin account not found." }, { status: 404 });
    }

    // If changing role away from superadmin, check if it's the last superadmin
    if (role && role !== "superadmin" && targetAdmin.role === "superadmin") {
      const superAdminCount = await Admin.countDocuments({ role: "superadmin" });
      if (superAdminCount <= 1) {
        return NextResponse.json(
          { success: false, error: "Cannot demote the only remaining superadmin." },
          { status: 400 }
        );
      }
    }

    if (name && name.trim()) {
      targetAdmin.name = name.trim();
    }

    if (role && (role === "superadmin" || role === "viewadmin")) {
      targetAdmin.role = role as AdminRole;
    }

    if (password) {
      if (password.length < 6) {
        return NextResponse.json(
          { success: false, error: "Password must be at least 6 characters long." },
          { status: 400 }
        );
      }
      targetAdmin.passwordHash = hashPassword(password);
    }

    await targetAdmin.save();

    return NextResponse.json({
      success: true,
      message: `Admin account (${targetAdmin.email}) updated successfully.`,
      admin: {
        _id: targetAdmin._id,
        email: targetAdmin.email,
        name: targetAdmin.name,
        role: targetAdmin.role,
        lastLogin: targetAdmin.lastLogin,
        updatedAt: targetAdmin.updatedAt,
      },
    });
  } catch (error: any) {
    console.error("Update admin error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update admin account." },
      { status: 500 }
    );
  }
}

// DELETE: Delete admin account (superadmin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentAdmin = getAdminFromRequestHeaders(request);
    if (!currentAdmin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!canAdminWrite(currentAdmin)) {
      return forbiddenViewAdminResponse(
        "Access denied. Only superadmins can delete admin accounts."
      );
    }

    const { id } = await params;
    await connectToDatabase();

    const targetAdmin = await Admin.findById(id);
    if (!targetAdmin) {
      return NextResponse.json({ success: false, error: "Admin account not found." }, { status: 404 });
    }

    // Safety 1: Cannot delete own account
    if (targetAdmin.email.toLowerCase() === currentAdmin.email.toLowerCase()) {
      return NextResponse.json(
        { success: false, error: "You cannot delete your own logged-in admin account." },
        { status: 400 }
      );
    }

    // Safety 2: Cannot delete the last superadmin
    if (targetAdmin.role === "superadmin") {
      const superAdminCount = await Admin.countDocuments({ role: "superadmin" });
      if (superAdminCount <= 1) {
        return NextResponse.json(
          { success: false, error: "Cannot delete the only remaining superadmin." },
          { status: 400 }
        );
      }
    }

    await Admin.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: `Admin account (${targetAdmin.email}) deleted successfully.`,
    });
  } catch (error: any) {
    console.error("Delete admin error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete admin account." },
      { status: 500 }
    );
  }
}
