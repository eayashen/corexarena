import mongoose, { Schema, Document, Model } from "mongoose";

export type AdminRole = "superadmin" | "viewadmin" | "admin";

export interface IAdmin extends Document {
  email: string;
  name: string;
  passwordHash: string;
  role: AdminRole;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AdminSchema = new Schema<IAdmin>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, default: "Corex Admin" },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["superadmin", "viewadmin", "admin"], default: "viewadmin" },
    lastLogin: { type: Date },
  },
  { timestamps: true }
);

export const Admin: Model<IAdmin> =
  mongoose.models.Admin || mongoose.model<IAdmin>("Admin", AdminSchema);

