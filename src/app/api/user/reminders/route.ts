import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { getUserFromRequest } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const userPayload = await getUserFromRequest(req);
    if (!userPayload?.userId) {
      return NextResponse.json(
        { error: "Please log in as a visitor to set event reminders" },
        { status: 401 }
      );
    }

    const { eventId } = await req.json();
    if (!eventId || !mongoose.Types.ObjectId.isValid(eventId)) {
      return NextResponse.json(
        { error: "Valid eventId is required" },
        { status: 400 }
      );
    }

    await connectDB();
    const user = await User.findById(userPayload.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const existsIndex = user.reminders.findIndex(
      (id) => id.toString() === eventId
    );

    let isReminded = false;
    if (existsIndex > -1) {
      user.reminders.splice(existsIndex, 1);
      isReminded = false;
    } else {
      user.reminders.push(new mongoose.Types.ObjectId(eventId));
      isReminded = true;
    }

    await user.save();

    return NextResponse.json({
      message: isReminded ? "Reminder saved" : "Reminder removed",
      isReminded,
      reminders: user.reminders.map((id) => id.toString()),
    });
  } catch (error) {
    console.error("POST /api/user/reminders error:", error);
    return NextResponse.json(
      { error: "Could not save reminder. Please try again." },
      { status: 500 }
    );
  }
}