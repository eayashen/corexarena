import mongoose, { Schema, Document, Model } from "mongoose";

export type BookingStatus = "PENDING" | "CONFIRMED" | "DECLINED" | "CANCELLED";
export type CreatedByType = "USER" | "ADMIN";
export type SlotType = "DAY" | "NIGHT";

export interface IScheduleChangeHistory {
  oldDate: string;
  oldSlot: string;
  oldStartTime?: string;
  oldEndTime?: string;
  newDate: string;
  newSlot: string;
  newStartTime?: string;
  newEndTime?: string;
  changedBy: CreatedByType;
  timestamp: Date;
  reason?: string;
}

export interface IDiscountHistory {
  previousDiscount: number;
  newDiscount: number;
  changedBy: string;
  timestamp: Date;
  reason?: string;
}

export interface IAuditLog {
  action: string;
  actor: "USER" | "ADMIN" | "SYSTEM";
  timestamp: Date;
  details?: string;
}

export interface IBooking extends Document {
  bookingId: string;
  customerName: string;
  mobile: string;
  email?: string;
  address?: string;
  date: string; // YYYY-MM-DD
  slotId: string;
  slotType: SlotType;
  startTime: string;
  endTime: string;
  regularPrice: number;
  discountedPrice: number;
  originalPrice: number;
  specialDiscount: number;
  finalPrice: number;
  paymentRequired: number;
  paymentAmount: number;
  paymentMethod: string;
  transactionId?: string;
  paymentScreenshot?: string;
  status: BookingStatus;
  createdBy: CreatedByType;
  bookingSource: CreatedByType;
  scheduleChangeHistory: IScheduleChangeHistory[];
  discountHistory: IDiscountHistory[];
  auditLog: IAuditLog[];
  adminNote?: string;
  declineReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ScheduleChangeHistorySchema = new Schema<IScheduleChangeHistory>(
  {
    oldDate: { type: String, required: true },
    oldSlot: { type: String, required: true },
    oldStartTime: { type: String },
    oldEndTime: { type: String },
    newDate: { type: String, required: true },
    newSlot: { type: String, required: true },
    newStartTime: { type: String },
    newEndTime: { type: String },
    changedBy: { type: String, enum: ["USER", "ADMIN"], required: true },
    timestamp: { type: Date, default: Date.now },
    reason: { type: String },
  },
  { _id: false }
);

const AuditLogSchema = new Schema<IAuditLog>(
  {
    action: { type: String, required: true },
    actor: { type: String, enum: ["USER", "ADMIN", "SYSTEM"], required: true },
    timestamp: { type: Date, default: Date.now },
    details: { type: String },
  },
  { _id: false }
);

const DiscountHistorySchema = new Schema<IDiscountHistory>(
  {
    previousDiscount: { type: Number, required: true },
    newDiscount: { type: Number, required: true },
    changedBy: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    reason: { type: String },
  },
  { _id: false }
);

const BookingSchema = new Schema<IBooking>(
  {
    bookingId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    mobile: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      index: true,
    },
    address: {
      type: String,
      trim: true,
    },
    date: {
      type: String,
      required: true,
      index: true,
    },
    slotId: {
      type: String,
      required: true,
      index: true,
    },
    slotType: {
      type: String,
      enum: ["DAY", "NIGHT"],
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
    originalPrice: {
      type: Number,
      default: function (this: any) {
        return this.discountedPrice ?? this.finalPrice ?? 0;
      },
    },
    specialDiscount: {
      type: Number,
      default: 0,
    },
    finalPrice: {
      type: Number,
      required: true,
    },
    paymentRequired: {
      type: Number,
      default: 500,
    },
    paymentAmount: {
      type: Number,
      default: 500,
    },
    paymentMethod: {
      type: String,
      default: "bKash",
    },
    transactionId: {
      type: String,
      trim: true,
    },
    paymentScreenshot: {
      type: String, // Base64 data URL or storage file reference
    },
    status: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "DECLINED", "CANCELLED"],
      default: "PENDING",
      index: true,
    },
    createdBy: {
      type: String,
      enum: ["USER", "ADMIN"],
      default: "USER",
    },
    bookingSource: {
      type: String,
      enum: ["USER", "ADMIN"],
      default: function (this: any) {
        return this.createdBy || "USER";
      },
    },
    scheduleChangeHistory: [ScheduleChangeHistorySchema],
    discountHistory: [DiscountHistorySchema],
    auditLog: [AuditLogSchema],
    adminNote: {
      type: String,
    },
    declineReason: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// MongoDB Partial Unique Index: Prevent double booking for the same slot on the same date for active (PENDING or CONFIRMED) bookings
BookingSchema.index(
  { date: 1, slotId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ["PENDING", "CONFIRMED"] },
    },
  }
);

export const Booking: Model<IBooking> =
  mongoose.models.Booking || mongoose.model<IBooking>("Booking", BookingSchema);
