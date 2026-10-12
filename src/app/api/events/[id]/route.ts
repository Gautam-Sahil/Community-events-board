import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { Event } from "@/models/Event";
import { CardDesign } from "@/models/CardDesign";
import { User } from "@/models/User";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid event ID" }, { status: 400 });
    }

    await connectDB();
    const event = await Event.findById(id);
    if (!event || !event.isActive) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const userPayload = await getUserFromRequest(req);
    let cardDesign = null;
    let isReminded = false;

    if (userPayload?.userId) {
      const [savedDesign, userDoc] = await Promise.all([
        CardDesign.findOne({ userId: userPayload.userId, eventId: id }),
        User.findById(userPayload.userId).select("reminders"),
      ]);

      if (savedDesign) {
        cardDesign = {
          theme: savedDesign.theme,
          stickers: savedDesign.stickers,
        };
      }

      if (userDoc) {
        isReminded = userDoc.reminders.some((r) => r.toString() === id);
      }
    }

    return NextResponse.json({
      event,
      cardDesign,
      isReminded,
    });
  } catch (error) {
    console.error("GET /api/events/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to load event details" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userPayload = await getUserFromRequest(req);

    if (!userPayload?.userId) {
      return NextResponse.json(
        { error: "Please log in to save your card design to your account" },
        { status: 401 }
      );
    }

    const { theme, stickers } = await req.json();
    const validThemes = ["sunset", "ocean", "midnight"];

    if (!validThemes.includes(theme)) {
      return NextResponse.json(
        { error: "Invalid theme selected" },
        { status: 400 }
      );
    }

    if (!Array.isArray(stickers) || stickers.length > 3) {
      return NextResponse.json(
        { error: "You can add up to 3 stickers maximum" },
        { status: 400 }
      );
    }

    await connectDB();
    const updatedDesign = await CardDesign.findOneAndUpdate(
      { userId: userPayload.userId, eventId: id },
      { theme, stickers },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      message: "Card design saved!",
      cardDesign: {
        theme: updatedDesign.theme,
        stickers: updatedDesign.stickers,
      },
    });
  } catch (error) {
    console.error("PUT /api/events/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to save card design" },
      { status: 500 }
    );
  }
}