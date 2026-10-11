import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { getUserFromRequest, verifyAdminRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const adminPayload = await verifyAdminRequest(req);
    const userPayload = await getUserFromRequest(req);

    let userData = null;
    if (userPayload?.userId) {
      await connectDB();
      const user = await User.findById(userPayload.userId).select("-passwordHash");
      if (user) {
        userData = {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          favouriteCategories: user.favouriteCategories,
          reminders: user.reminders.map((id) => id.toString()),
        };
      }
    }

    return NextResponse.json({
      user: userData,
      isAdmin: !!adminPayload,
    });
  } catch (error) {
    console.error("Auth me error:", error);
    return NextResponse.json({ user: null, isAdmin: false }, { status: 500 });
  }
}