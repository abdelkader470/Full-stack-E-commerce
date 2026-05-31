import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    name: String,
    image: String,
    price: Number,
    quantity: Number,
    variantId: String,
    selectedOptions: {
      size: String,
      color: String
    }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    orderItems: [orderItemSchema],
    shippingAddress: {
      fullName: String,
      phone: String,
      line1: String,
      line2: String,
      city: String,
      state: String,
      postalCode: String,
      country: String
    },
    paymentMethod: { type: String, default: "card" },
    paymentStatus: {
      type: String,
      enum: ["pending", "authorized", "paid", "failed", "refunded"],
      default: "pending"
    },
    paymentResult: {
      id: String,
      status: String,
      email: String
    },
    orderStatus: {
      type: String,
      enum: ["placed", "processing", "shipped", "delivered", "cancelled"],
      default: "placed"
    },
    trackingNumber: String,
    couponCode: String,
    discountAmount: { type: Number, default: 0 },
    itemsPrice: { type: Number, default: 0 },
    taxPrice: { type: Number, default: 0 },
    shippingPrice: { type: Number, default: 0 },
    totalPrice: { type: Number, default: 0 },
    deliveredAt: Date,
    paidAt: Date
  },
  { timestamps: true }
);

orderSchema.index({ createdAt: -1, orderStatus: 1, paymentStatus: 1 });
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ "orderItems.product": 1 });

export const Order = mongoose.model("Order", orderSchema);
