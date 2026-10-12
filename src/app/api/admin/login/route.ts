import { NextRequest, NextResponse } from "next/server";
import { signToken } from "@/lib/auth";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "sahil@admin.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: "Invalid admin credentials" },
        { status: 401 }
      );
    }

    const token = await signToken({
      email: ADMIN_EMAIL,
      role: "admin",
    });

    const response = NextResponse.json({
      message: "Admin login successful",
      token,
      admin: { email: ADMIN_EMAIL, role: "admin" },
    });

    response.cookies.set("admin_token", token, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}