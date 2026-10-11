import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Event } from "@/models/Event";
import { verifyAdminRequest } from "@/lib/auth";


export async function GET(req: NextRequest) {
  try {
    const admin = await verifyAdminRequest(req);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 401 });
    }

    await connectDB();
    const events = await Event.find({}).sort({ date: 1 });

    return NextResponse.json({ events });
  } catch (error) {
    console.error("Admin GET events error:", error);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}


export async function POST(req: NextRequest) {
  try {
    const admin = await verifyAdminRequest(req);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();
    const { title, category, city, date, price, description, imageUrl } = body;

    if (
      !title ||
      !category ||
      !city ||
      !date ||
      price === undefined ||
      !description ||
      !imageUrl
    ) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const validCategories = ["Music", "Workshop", "Food", "Sports", "Kids"];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: "Invalid category selected" },
        { status: 400 }
      );
    }

    const newEvent = await Event.create({
      title: title.trim(),
      category,
      city: city.trim(),
      date: new Date(date),
      price: Number(price),
      description: description.trim(),
      imageUrl: imageUrl.trim(),
      isActive: true,
    });

    return NextResponse.json(
      { message: "Event created successfully", event: newEvent },
      { status: 201 }
    );
  } catch (error) {
    console.error("Admin POST event error:", error);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}