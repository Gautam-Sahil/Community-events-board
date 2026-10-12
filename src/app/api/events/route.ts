import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Event } from "@/models/Event";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);

    const category = searchParams.get("category") || "";
    const city = searchParams.get("city") || "";
    const search = searchParams.get("search")?.trim() || "";

    const page = Math.max(
      1,
      parseInt(searchParams.get("page") || "1", 10) || 1
    );

    const limit = Math.max(
      1,
      parseInt(searchParams.get("limit") || "6", 10) || 6
    );

    const now = new Date();

    const filter: Record<string, unknown> = {
      isActive: true,
      date: { $gte: now },
    };

    if (category && category !== "All") {
      filter.category = category;
    }

    if (city && city !== "All") {
      filter.city = {
        $regex: new RegExp(
          `^${city.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
          "i"
        ),
      };
    }

    if (search) {
      const escapedSearch = search.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

      filter.$or = [
        { title: { $regex: escapedSearch, $options: "i" } },
        { description: { $regex: escapedSearch, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const [events, total, cities] = await Promise.all([
      Event.find(filter)
        .sort({ date: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      Event.countDocuments(filter),

      Event.distinct("city", {
        isActive: true,
        date: { $gte: now },
      }),
    ]);

    return NextResponse.json({
      events,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      cities: cities.sort(),
    });
  } catch (error) {
    console.error("GET /api/events error:", error);

    return NextResponse.json(
      { error: "Failed to load events" },
      { status: 500 }
    );
  }
}