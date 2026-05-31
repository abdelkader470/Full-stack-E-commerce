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

const statusLabels = {
  placed: "placed",
  processing: "being prepared",
  shipped: "on the way",
  delivered: "delivered",
  cancelled: "cancelled"
};

const paymentLabels = {
  pending: "pending",
  authorized: "authorized",
  paid: "paid",
  failed: "failed",
  refunded: "refunded"
};

const formatMoney = (value) => `$${Number(value || 0).toFixed(2)}`;

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const formatAddress = (address = {}) =>
  [
    address.fullName,
    address.line1,
    address.line2,
    [address.city, address.state, address.postalCode].filter(Boolean).join(", "),
    address.country,
    address.phone ? `Phone: ${address.phone}` : ""
  ]
    .filter(Boolean)
    .map(escapeHtml)
    .join("<br />");

const buildOrderConfirmationEmail = (order, user) => {
  const orderNumber = order._id.toString().slice(-8).toUpperCase();
  const orderUrl = process.env.CLIENT_URL ? `${process.env.CLIENT_URL.replace(/\/$/, "")}/orders` : "";
  const itemsHtml = order.orderItems
    .map((item) => {
      const options = [item.selectedOptions?.size, item.selectedOptions?.color].filter(Boolean).join(" / ");
      return `
        <tr>
          <td style="padding:14px 0;border-bottom:1px solid #e5e5e5">
            <strong>${escapeHtml(item.name)}</strong>
            ${options ? `<div style="color:#666;font-size:13px;margin-top:4px">${escapeHtml(options)}</div>` : ""}
          </td>
          <td style="padding:14px 0;border-bottom:1px solid #e5e5e5;text-align:center">${item.quantity}</td>
          <td style="padding:14px 0;border-bottom:1px solid #e5e5e5;text-align:right">${formatMoney(item.price)}</td>
          <td style="padding:14px 0;border-bottom:1px solid #e5e5e5;text-align:right"><strong>${formatMoney(
            item.price * item.quantity
          )}</strong></td>
        </tr>
      `;
    })
    .join("");

  return {
    subject: `Order #${orderNumber} confirmed`,
    html: `
      <div style="margin:0;background:#f6f6f6;padding:28px 0;font-family:Arial,sans-serif;color:#111">
        <div style="max-width:720px;margin:0 auto;background:#fff;border:1px solid #e5e5e5;border-radius:14px;overflow:hidden">
          <div style="background:#111;color:#fff;padding:28px">
            <div style="font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#cfcfcf">Marketlane Clothing</div>
            <h1 style="margin:10px 0 0;font-size:28px;line-height:1.15">Thanks for your order, ${escapeHtml(user.name)}.</h1>
            <p style="margin:12px 0 0;color:#ddd">Your clothing order has been received and is now <strong>${escapeHtml(order.orderStatus)}</strong>.</p>
          </div>

          <div style="padding:26px 28px">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px">
              <div style="border:1px solid #e5e5e5;border-radius:12px;padding:16px">
                <div style="font-size:12px;text-transform:uppercase;color:#777;font-weight:700">Order number</div>
                <div style="font-size:20px;font-weight:800;margin-top:6px">#${orderNumber}</div>
              </div>
              <div style="border:1px solid #e5e5e5;border-radius:12px;padding:16px">
                <div style="font-size:12px;text-transform:uppercase;color:#777;font-weight:700">Order total</div>
                <div style="font-size:20px;font-weight:800;margin-top:6px">${formatMoney(order.totalPrice)}</div>
              </div>
            </div>

            <h2 style="font-size:18px;margin:0 0 12px">Items ordered</h2>
            <table style="width:100%;border-collapse:collapse;font-size:14px">
              <thead>
                <tr style="color:#666;text-transform:uppercase;font-size:12px">
                  <th style="text-align:left;padding-bottom:10px">Item</th>
                  <th style="text-align:center;padding-bottom:10px">Qty</th>
                  <th style="text-align:right;padding-bottom:10px">Unit</th>
                  <th style="text-align:right;padding-bottom:10px">Total</th>
                </tr>
              </thead>
              <tbody>${itemsHtml}</tbody>
            </table>

            <table style="width:100%;border-collapse:collapse;margin-top:20px;font-size:14px">
              <tr><td style="padding:5px 0;color:#666">Subtotal</td><td style="padding:5px 0;text-align:right">${formatMoney(order.itemsPrice)}</td></tr>
              <tr><td style="padding:5px 0;color:#666">Shipping</td><td style="padding:5px 0;text-align:right">${formatMoney(order.shippingPrice)}</td></tr>
              <tr><td style="padding:5px 0;color:#666">Tax</td><td style="padding:5px 0;text-align:right">${formatMoney(order.taxPrice)}</td></tr>
              ${
                order.discountAmount
                  ? `<tr><td style="padding:5px 0;color:#666">Discount${order.couponCode ? ` (${escapeHtml(order.couponCode)})` : ""}</td><td style="padding:5px 0;text-align:right">-${formatMoney(order.discountAmount)}</td></tr>`
                  : ""
              }
              <tr><td style="padding:12px 0 0;font-size:18px;font-weight:800;border-top:1px solid #e5e5e5">Total</td><td style="padding:12px 0 0;text-align:right;font-size:18px;font-weight:800;border-top:1px solid #e5e5e5">${formatMoney(order.totalPrice)}</td></tr>
            </table>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:26px">
              <div style="background:#f7f7f7;border-radius:12px;padding:16px">
                <h3 style="margin:0 0 8px;font-size:15px">Shipping address</h3>
                <p style="margin:0;color:#555;line-height:1.6">${formatAddress(order.shippingAddress)}</p>
              </div>
              <div style="background:#f7f7f7;border-radius:12px;padding:16px">
                <h3 style="margin:0 0 8px;font-size:15px">Payment</h3>
                <p style="margin:0;color:#555;line-height:1.6">
                  Method: ${escapeHtml(order.paymentMethod || "card")}<br />
                  Status: ${escapeHtml(paymentLabels[order.paymentStatus] || order.paymentStatus)}
                </p>
              </div>
            </div>

            <div style="margin-top:24px;border:1px solid #111;border-radius:12px;padding:16px">
              <strong>What happens next?</strong>
              <p style="margin:8px 0 0;color:#555;line-height:1.6">
                We will prepare your clothing order, update you when it moves to processing or shipping, and send tracking details once available.
              </p>
            </div>

            ${
              orderUrl
                ? `<p style="margin:24px 0 0"><a href="${orderUrl}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:700">View order history</a></p>`
                : ""
            }
          </div>
        </div>
      </div>
    `
  };
};

const buildStatusEmail = (order, changes) => {
  const orderNumber = order._id.toString().slice(-8).toUpperCase();
  const orderStatus = statusLabels[order.orderStatus] || order.orderStatus;
  const paymentStatus = paymentLabels[order.paymentStatus] || order.paymentStatus;
  const statusLine = changes.orderStatusChanged
    ? `<p>Your clothing order is now <strong>${orderStatus}</strong>.</p>`
    : "";
  const paymentLine = changes.paymentStatusChanged
    ? `<p>Your payment status is now <strong>${paymentStatus}</strong>.</p>`
    : "";
  const trackingLine = order.trackingNumber
    ? `<p><strong>Tracking number:</strong> ${order.trackingNumber}</p>`
    : "";

  return {
    subject: `Order #${orderNumber} status update`,
    html: `
      <div style="font-family:Arial,sans-serif;color:#111;line-height:1.6">
        <h2 style="margin:0 0 12px">Marketlane order update</h2>
        <p>Hello ${order.user?.name || "there"},</p>
        ${statusLine}
        ${paymentLine}
        ${trackingLine}
        <p><strong>Order:</strong> #${orderNumber}</p>
        <p><strong>Total:</strong> ${formatMoney(order.totalPrice)}</p>
        <p>Thank you for shopping with Marketlane Clothing.</p>
      </div>
    `
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

  const confirmationEmail = buildOrderConfirmationEmail(order, req.user);
  try {
    await sendEmail({
      to: req.user.email,
      subject: confirmationEmail.subject,
      html: confirmationEmail.html
    });
  } catch (emailError) {
    console.error(`[email failed] ${confirmationEmail.subject} -> ${req.user.email}: ${emailError.message}`);
  }

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
  const order = await Order.findById(req.params.id).populate("user", "name email");
  if (!order) {
    const error = new Error("Order not found");
    error.statusCode = 404;
    throw error;
  }

  const previousOrderStatus = order.orderStatus;
  const previousPaymentStatus = order.paymentStatus;
  const previousTrackingNumber = order.trackingNumber;

  order.orderStatus = req.body.orderStatus || order.orderStatus;
  order.paymentStatus = req.body.paymentStatus || order.paymentStatus;
  order.trackingNumber = req.body.trackingNumber || order.trackingNumber;
  if (order.orderStatus === "delivered") order.deliveredAt = new Date();
  if (order.paymentStatus === "paid") order.paidAt = new Date();
  await order.save();

  const changes = {
    orderStatusChanged: previousOrderStatus !== order.orderStatus,
    paymentStatusChanged: previousPaymentStatus !== order.paymentStatus,
    trackingChanged: previousTrackingNumber !== order.trackingNumber
  };

  let emailNotification = { attempted: false, sent: false };

  if (order.user?.email && Object.values(changes).some(Boolean)) {
    const email = buildStatusEmail(order, changes);
    emailNotification = { attempted: true, sent: false };
    try {
      await sendEmail({
        to: order.user.email,
        subject: email.subject,
        html: email.html
      });
      emailNotification.sent = true;
    } catch (emailError) {
      emailNotification.error = emailError.message;
      console.error(`[email failed] ${email.subject} -> ${order.user.email}: ${emailError.message}`);
    }
  }

  const response = order.toObject();
  response.emailNotification = emailNotification;
  res.json(response);
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
