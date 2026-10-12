import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { Event } from "@/models/Event";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const userPayload = await getUserFromRequest(req);
    if (!userPayload?.userId) {
      return NextResponse.json(
        { error: "Unauthorized: Please log in to view your feed" },
        { status: 401 }
      );
    }

    await connectDB();
    const user = await User.findById(userPayload.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const favs = user.favouriteCategories || [];
    if (favs.length === 0) {
      return NextResponse.json({
        events: [],
        favouriteCategories: [],
        reminders: user.reminders.map((id) => id.toString()),
      });
    }

    const events = await Event.find({
      isActive: true,
      date: { $gte: new Date() },
      category: { $in: favs },
    }).sort({ date: 1 });

    return NextResponse.json({
      events,
      favouriteCategories: favs,
      reminders: user.reminders.map((id) => id.toString()),
    });
  } catch (error) {
    console.error("GET /api/feed error:", error);
    return NextResponse.json(
      { error: "Failed to load personalized feed" },
      { status: 500 }
    );
  }
}