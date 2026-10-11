import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICardDesign extends Document {
  userId: mongoose.Types.ObjectId;
  eventId: mongoose.Types.ObjectId;
  theme: "sunset" | "ocean" | "midnight";
  stickers: string[];
}

const CardDesignSchema = new Schema<ICardDesign>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true },
    theme: {
      type: String,
      enum: ["sunset", "ocean", "midnight"],
      default: "sunset",
    },
    stickers: {
      type: [String],
      validate: [(val: string[]) => val.length <= 3, "Maximum 3 stickers allowed"],
      default: [],
    },
  },
  { timestamps: true }
);

CardDesignSchema.index({ userId: 1, eventId: 1 }, { unique: true });

export const CardDesign: Model<ICardDesign> =
  mongoose.models.CardDesign || mongoose.model<ICardDesign>("CardDesign", CardDesignSchema);