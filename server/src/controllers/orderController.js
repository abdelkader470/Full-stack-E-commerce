import Stripe from "stripe";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { Cart } from "../models/Cart.js";
import { Coupon } from "../models/Coupon.js";
import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { buildInvoice } from "../utils/invoice.js";
import { sendEmail } from "../utils/sendEmail.js";

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

const calculateTotals = async (items, couponCode) => {
  const itemsPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingPrice = itemsPrice > 100 ? 0 : 9.95;
  const taxPrice = Number((itemsPrice * 0.08).toFixed(2));
  let discountAmount = 0;

  if (couponCode) {
    const coupon = await Coupon.findOne({ code: couponCode, isActive: true });
    if (coupon && (!coupon.expiresAt || coupon.expiresAt > new Date())) {
      discountAmount =
        coupon.type === "percentage" ? Number((itemsPrice * (coupon.value / 100)).toFixed(2)) : coupon.value;
    }
  }

  return {
    itemsPrice,
    shippingPrice,
    taxPrice,
    discountAmount,
    totalPrice: Number((itemsPrice + shippingPrice + taxPrice - discountAmount).toFixed(2))
  };
};

export const createPaymentIntent = asyncHandler(async (req, res) => {
  const amount = Math.round(Number(req.body.amount) * 100);
  if (!stripe) {
    return res.json({ clientSecret: "stripe-not-configured", amount });
  }

  const intent = await stripe.paymentIntents.create({
    amount,
    currency: "usd",
    automatic_payment_methods: { enabled: true }
  });
  return res.json({ clientSecret: intent.client_secret, amount });
});

export const createOrder = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart || cart.items.length === 0) {
    const error = new Error("Cart is empty");
    error.statusCode = 400;
    throw error;
  }

  const totals = await calculateTotals(cart.items, cart.couponCode);
  const order = await Order.create({
    user: req.user._id,
    orderItems: cart.items,
    shippingAddress: req.body.shippingAddress,
    paymentMethod: req.body.paymentMethod,
    couponCode: cart.couponCode,
    ...totals
  });

  await Promise.all(
    cart.items.map((item) =>
      Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity, salesCount: item.quantity }
      })
    )
  );
  cart.items = [];
  cart.couponCode = undefined;
  await cart.save();

  await sendEmail({
    to: req.user.email,
    subject: `Order ${order._id} received`,
    html: `<p>Thanks ${req.user.name}. Your order total is $${order.totalPrice}.</p>`
  });

  res.status(201).json(order);
});

export const getMyOrders = asyncHandler(async (req, res) => {
  res.json(await Order.find({ user: req.user._id }).sort("-createdAt"));
});

export const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate("user", "name email");
  if (!order || (req.user.role !== "admin" && order.user._id.toString() !== req.user._id.toString())) {
    const error = new Error("Order not found");
    error.statusCode = 404;
    throw error;
  }
  res.json(order);
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    const error = new Error("Order not found");
    error.statusCode = 404;
    throw error;
  }
  order.orderStatus = req.body.orderStatus || order.orderStatus;
  order.paymentStatus = req.body.paymentStatus || order.paymentStatus;
  order.trackingNumber = req.body.trackingNumber || order.trackingNumber;
  if (order.orderStatus === "delivered") order.deliveredAt = new Date();
  if (order.paymentStatus === "paid") order.paidAt = new Date();
  await order.save();
  res.json(order);
});

export const getInvoice = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate("user", "name email");
  if (!order) {
    const error = new Error("Order not found");
    error.statusCode = 404;
    throw error;
  }
  res.json(buildInvoice(order));
});
