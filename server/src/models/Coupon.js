import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    type: { type: String, enum: ["percentage", "fixed"], default: "percentage" },
    value: { type: Number, required: true },
    minOrderValue: { type: Number, default: 0 },
    usageLimit: { type: Number, default: 100 },
    usedCount: { type: Number, default: 0 },
    expiresAt: Date,
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const Coupon = mongoose.model("Coupon", couponSchema);
