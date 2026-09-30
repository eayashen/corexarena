import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

import { NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_corex_secret_jwt_key_2026";
const TOKEN_NAME = "corex_admin_token";

export type AdminRole = "superadmin" | "viewadmin" | "admin";

export interface AdminPayload {
  email: string;
  name: string;
  role: AdminRole | string;
}

export function isSuperAdmin(admin: AdminPayload | null | undefined): boolean {
  if (!admin) return false;
  return admin.role === "superadmin" || admin.role === "admin";
}

export function isViewAdmin(admin: AdminPayload | null | undefined): boolean {
  if (!admin) return false;
  return admin.role === "viewadmin";
}

export function canAdminWrite(admin: AdminPayload | null | undefined): boolean {
  return isSuperAdmin(admin);
}

export function forbiddenViewAdminResponse(customMessage?: string) {
  return NextResponse.json(
    {
      success: false,
      error:
        customMessage ||
        "Access denied. Viewadmin accounts have read-only access and are not authorized to create, update, or delete data.",
    },
    { status: 403 }
  );
}

export function hashPassword(password: string): string {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
}

export function comparePassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

export function signAdminToken(payload: AdminPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyAdminToken(token: string): AdminPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AdminPayload;
    return decoded;
  } catch {
    return null;
  }
}

export async function getAdminSession(): Promise<AdminPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_NAME)?.value;
  if (!token) return null;
  return verifyAdminToken(token);
}

export function getAdminFromRequestHeaders(request: Request): AdminPayload | null {
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    return verifyAdminToken(token);
  }

  // Check cookie header if present
  const cookieHeader = request.headers.get("cookie");
  if (cookieHeader) {
    const match = cookieHeader.match(new RegExp(`(^| )${TOKEN_NAME}=([^;]+)`));
    if (match) {
      return verifyAdminToken(match[2]);
    }
  }

  return null;
}
