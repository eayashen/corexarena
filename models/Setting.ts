import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISetting extends Document {
  turfName: string;
  tagline: string;
  address: string;
  email: string;
  contactNumber: string;
  whatsappNumber: string;
  facebookUrl: string;
  latitude: number;
  longitude: number;
  bkashNumber: string;
  requiredAdvancePayment: number;
  scheduleChangeHoursLimit: number; // default 48
  daySlotDefaultRegularPrice: number;
  daySlotDefaultDiscountedPrice: number;
  nightSlotDefaultRegularPrice: number;
  nightSlotDefaultDiscountedPrice: number;
  updatedAt: Date;
}

const SettingSchema = new Schema<ISetting>(
  {
    turfName: { type: String, default: "Corex Arena and Academy" },
    tagline: { type: String, default: "Premium Football Turf & Training Academy in Mirpur" },
    address: { type: String, default: "Plot no 217, Block no B, Rd No. 4, Shagufta, Mirpur 12, Dhaka, Bangladesh, 1216" },
    email: { type: String, default: "corexarena.academy@gmail.com" },
    contactNumber: { type: String, default: "01701-275099" },
    whatsappNumber: { type: String, default: "01701-275099" },
    facebookUrl: { type: String, default: "https://www.facebook.com/profile.php?id=61591476123056" },
    latitude: { type: Number, default: 23.83148397838252 },
    longitude: { type: Number, default: 90.37969133511696 },
    bkashNumber: { type: String, default: "01675906833" },
    requiredAdvancePayment: { type: Number, default: 500 },
    scheduleChangeHoursLimit: { type: Number, default: 48 },
    daySlotDefaultRegularPrice: { type: Number, default: 2500 },
    daySlotDefaultDiscountedPrice: { type: Number, default: 2000 },
    nightSlotDefaultRegularPrice: { type: Number, default: 4500 },
    nightSlotDefaultDiscountedPrice: { type: Number, default: 4000 },
  },
  { timestamps: true }
);

export const Setting: Model<ISetting> =
  mongoose.models.Setting || mongoose.model<ISetting>("Setting", SettingSchema);
