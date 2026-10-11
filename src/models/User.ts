import mongoose, { Schema, Document, Model } from "mongoose";
import { EventCategory } from "./Event";

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  favouriteCategories: EventCategory[];
  reminders: mongoose.Types.ObjectId[];
  createdAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    favouriteCategories: {
      type: [String],
      enum: ["Music", "Workshop", "Food", "Sports", "Kids"],
      default: [],
    },
    reminders: [{ type: Schema.Types.ObjectId, ref: "Event" }],
  },
  { timestamps: true }
);

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);