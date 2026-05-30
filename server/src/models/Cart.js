import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    variantId: String,
    name: String,
    image: String,
    price: Number,
    quantity: { type: Number, default: 1, min: 1 },
    selectedOptions: {
      size: String,
      color: String
    }
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    items: [cartItemSchema],
    couponCode: String
  },
  { timestamps: true }
);

export const Cart = mongoose.model("Cart", cartSchema);
