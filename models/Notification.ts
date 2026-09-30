import mongoose, { Schema, Document, Model } from "mongoose";

export interface INotification extends Document {
  bookingId: string;
  customerName: string;
  date: string;
  slot: string;
  time: string;
  message: string;
  status: "UNREAD" | "READ";
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    bookingId: { type: String, required: true, index: true },
    customerName: { type: String, required: true },
    date: { type: String, required: true },
    slot: { type: String, required: true },
    time: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, enum: ["UNREAD", "READ"], default: "UNREAD", index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Notification: Model<INotification> =
  mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", NotificationSchema);
