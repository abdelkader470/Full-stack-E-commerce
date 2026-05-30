import { asyncHandler } from "../middleware/asyncHandler.js";
import { Coupon } from "../models/Coupon.js";
import { Newsletter } from "../models/Newsletter.js";
import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { User } from "../models/User.js";

export const listUsers = asyncHandler(async (_req, res) => {
  res.json(await User.find().select("-password").sort("-createdAt"));
});

export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  }).select("-password");
  res.json(user);
});

export const listOrders = asyncHandler(async (_req, res) => {
  res.json(await Order.find().populate("user", "name email").sort("-createdAt"));
});

export const analytics = asyncHandler(async (_req, res) => {
  const [orders, customers, products, lowStock] = await Promise.all([
    Order.find({}),
    User.countDocuments({ role: "customer" }),
    Product.countDocuments({ status: "active" }),
    Product.find({ stock: { $lte: 5 }, status: "active" }).select("name stock price").limit(10)
  ]);

  const revenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);
  const byStatus = orders.reduce((acc, order) => {
    acc[order.orderStatus] = (acc[order.orderStatus] || 0) + 1;
    return acc;
  }, {});

  res.json({
    revenue,
    orders: orders.length,
    customers,
    products,
    byStatus,
    lowStock
  });
});

export const createCoupon = asyncHandler(async (req, res) => {
  res.status(201).json(await Coupon.create(req.body));
});

export const listCoupons = asyncHandler(async (_req, res) => {
  res.json(await Coupon.find().sort("-createdAt"));
});

export const updateCoupon = asyncHandler(async (req, res) => {
  res.json(await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }));
});

export const deleteCoupon = asyncHandler(async (req, res) => {
  await Coupon.findByIdAndDelete(req.params.id);
  res.json({ message: "Coupon deleted" });
});

export const subscribeNewsletter = asyncHandler(async (req, res) => {
  const entry = await Newsletter.findOneAndUpdate(
    { email: req.body.email },
    { email: req.body.email, isSubscribed: true },
    { upsert: true, new: true }
  );
  res.status(201).json(entry);
});
