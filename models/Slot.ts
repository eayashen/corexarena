import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISlot extends Document {
  slotId: string; // e.g. "day-1", "night-3"
  slotType: "DAY" | "NIGHT";
  label: string; // e.g. "6:00 AM – 7:30 AM"
  startTime: string; // e.g. "06:00"
  endTime: string; // e.g. "07:30"
  regularPrice: number;
  discountedPrice: number;
  active: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const SlotSchema = new Schema<ISlot>(
  {
    slotId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    slotType: {
      type: String,
      enum: ["DAY", "NIGHT"],
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    regularPrice: {
      type: Number,
      required: true,
    },
    discountedPrice: {
      type: Number,
      required: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const Slot: Model<ISlot> =
  mongoose.models.Slot || mongoose.model<ISlot>("Slot", SlotSchema);
