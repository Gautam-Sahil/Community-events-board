import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { getUserFromRequest } from "@/lib/auth";

const VALID_CATEGORIES = ["Music", "Workshop", "Food", "Sports", "Kids"];

export async function PUT(req: NextRequest) {
  try {
    const userPayload = await getUserFromRequest(req);
    if (!userPayload?.userId) {
      return NextResponse.json(
        { error: "Please log in to save favourite categories" },
        { status: 401 }
      );
    }

    const { favouriteCategories } = await req.json();
    if (!Array.isArray(favouriteCategories)) {
      return NextResponse.json(
        { error: "favouriteCategories must be an array" },
        { status: 400 }
      );
    }

    const sanitized = favouriteCategories.filter((cat) =>
      VALID_CATEGORIES.includes(cat)
    );

    await connectDB();
    const user = await User.findByIdAndUpdate(
      userPayload.userId,
      { favouriteCategories: sanitized },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Favourite categories updated",
      favouriteCategories: user.favouriteCategories,
    });
  } catch (error) {
    console.error("PUT /api/user/favourites error:", error);
    return NextResponse.json(
      { error: "Failed to save favourite categories" },
      { status: 500 }
    );
  }
}