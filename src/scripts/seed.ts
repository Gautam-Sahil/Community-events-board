import mongoose from "mongoose";
import dotenv from "dotenv";
import { Event } from "../models/Event";

dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/community-events-board";

function getRelativeDate(daysOffset: number, hour: number, minute = 0): Date {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  date.setHours(hour, minute, 0, 0);
  return date;
}

const sampleEvents = [
  {
    title: "Acoustic Indie Music Night",
    category: "Music",
    city: "Coimbatore",
    date: getRelativeDate(63, 18, 30), // Was 3, now 63 days in the future
    price: 499,
    description: "An intimate acoustic night featuring top independent bands and solo artists from South India under the stars.",
    imageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80",
    isActive: true,
  },
  {
    title: "Classical Fusion Night Festival",
    category: "Music",
    city: "Coimbatore",
    date: getRelativeDate(70, 19, 0), // Was 10, now 70 days in the future
    price: 1200,
    description: "Experience a magical night of Carnatic rock fusion and live percussion ensembles.",
    imageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80",
    isActive: true,
  },
  {
    title: "Full-Stack AI & Next.js Bootcamp",
    category: "Workshop",
    city: "Mumbai",
    date: getRelativeDate(62, 10, 0),
    price: 150000,
    description: "Hands-on corporate masterclass on building production-ready web apps and AI integrations.",
    imageUrl: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80",
    isActive: true,
  },
  {
    title: "Grand Street Food & Spice Carnival",
    category: "Food",
    city: "Mumbai",
    date: getRelativeDate(65, 17, 0),
    price: 250,
    description: "Taste over 50 authentic regional street delicacies, craft desserts, and live barbecue counters.",
    imageUrl: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&auto=format&fit=crop&q=80",
    isActive: true,
  },
  {
    title: "City Midnight Half Marathon",
    category: "Sports",
    city: "Bengaluru",
    date: getRelativeDate(67, 21, 0),
    price: 999,
    description: "Run through the heart of Bengaluru in this timed 10K and 21K community marathon.",
    imageUrl: "https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=800&auto=format&fit=crop&q=80",
    isActive: true,
  },
  {
    title: "Junior Robotics & Lego Camp",
    category: "Kids",
    city: "Pune",
    date: getRelativeDate(64, 11, 0),
    price: 1500,
    description: "A fun weekend activity where kids aged 7-14 build and program their first moving robots.",
    imageUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80",
    isActive: true,
  },
  {
    title: "Artisanal Pottery & Ceramic Wheel Workshop",
    category: "Workshop",
    city: "Coimbatore",
    date: getRelativeDate(66, 15, 30),
    price: 850,
    description: "Learn hand-building and wheel-throwing techniques from master potters. All clay and tools included.",
    imageUrl: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&auto=format&fit=crop&q=80",
    isActive: true,
  },
  {
    title: "South Indian Filter Coffee & Brewing Session",
    category: "Food",
    city: "Chennai",
    date: getRelativeDate(68, 16, 0),
    price: 0,
    description: "Learn the art of roasting, grinding, and brewing the perfect cup of traditional filter coffee.",
    imageUrl: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&auto=format&fit=crop&q=80",
    isActive: true,
  },
  {
    title: "Sunset Electronic & Synthwave Rooftop Gig",
    category: "Music",
    city: "Mumbai",
    date: getRelativeDate(72, 18, 0),
    price: 2500,
    description: "High-energy synthwave and deep house sunset session overlooking the Arabian Sea.",
    imageUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80",
    isActive: true,
  },
  {
    title: "Weekend Turf Football 5v5 Tournament",
    category: "Sports",
    city: "Pune",
    date: getRelativeDate(69, 8, 0),
    price: 3000,
    description: "Bring your squad for a knockout 5v5 turf football tournament with cash prizes and medals.",
    imageUrl: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&auto=format&fit=crop&q=80",
    isActive: true,
  },
  {
    title: "Storytelling & Puppet Theatre Under the Banyan",
    category: "Kids",
    city: "Bengaluru",
    date: getRelativeDate(74, 10, 30),
    price: 350,
    description: "Interactive folk tales, shadow puppetry, and live ukulele sing-alongs for children and parents.",
    imageUrl: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&auto=format&fit=crop&q=80",
    isActive: true,
  },
  {
    title: "Secret Unannounced Comedy & Music Night",
    category: "Music",
    city: "Coimbatore",
    date: getRelativeDate(65, 20, 0),
    price: 799,
    description: "Draft event waiting for sponsor confirmation. Should remain hidden from public visitors.",
    imageUrl: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&auto=format&fit=crop&q=80",
    isActive: false,
  },
  {
    title: "Private Corporate Culinary Masterclass",
    category: "Food",
    city: "Mumbai",
    date: getRelativeDate(71, 14, 0),
    price: 15000,
    description: "Inactive event sample to verify that inactive listings do not leak into public feeds.",
    imageUrl: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&auto=format&fit=crop&q=80",
    isActive: false,
  },
  {
    title: "Monsoon Acoustic Jam Session",
    category: "Music",
    city: "Mumbai",
    date: getRelativeDate(-7, 19, 0), // Kept in the past
    price: 500,
    description: "Past event from last week to verify that the upcoming events filter excludes past dates.",
    imageUrl: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&auto=format&fit=crop&q=80",
    isActive: true,
  },
  {
    title: "Summer Kids Painting Carnival",
    category: "Kids",
    city: "Coimbatore",
    date: getRelativeDate(-15, 10, 0), // Kept in the past
    price: 200,
    description: "Past event sample to test date comparison queries.",
    imageUrl: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&auto=format&fit=crop&q=80",
    isActive: true,
  },
];

async function seed() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected! Clearing existing events...");
    await Event.deleteMany({});

    console.log("Inserting 15 sample events...");
    await Event.insertMany(sampleEvents);

    console.log("Successfully seeded 15 events (11 active upcoming, 2 inactive, 2 past)!");
    process.exit(0);
  } catch (error) {
    console.error("Seed error:", error);
    process.exit(1);
  }
}

seed();