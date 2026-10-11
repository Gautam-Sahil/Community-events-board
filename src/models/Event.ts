import mongoose, { Schema, Document, Model } from "mongoose";

export type EventCategory = "Music" | "Workshop" | "Food" | "Sports" | "Kids";

export interface IEvent extends Document {
  title: string;
  category: EventCategory;
  city: string;
  date: Date;
  price: number;
  description: string;
  imageUrl: string;
  isActive: boolean;
  createdAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ["Music", "Workshop", "Food", "Sports", "Kids"],
      required: true,
    },
    city: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    price: { type: Number, required: true, min: 0 },
    description: { type: String, required: true },
    imageUrl: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);


EventSchema.index({ isActive: 1, category: 1, city: 1, date: 1 });

export const Event: Model<IEvent> =
  mongoose.models.Event || mongoose.model<IEvent>("Event", EventSchema);