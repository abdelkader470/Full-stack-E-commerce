import { asyncHandler } from "../middleware/asyncHandler.js";
import { Cart } from "../models/Cart.js";
import { Coupon } from "../models/Coupon.js";
import { Product } from "../models/Product.js";
import { Wishlist } from "../models/Wishlist.js";

const getUserCart = (userId) =>
  Cart.findOneAndUpdate({ user: userId }, { $setOnInsert: { items: [] } }, { upsert: true, new: true })
    .populate("items.product", "name slug images stock");

export const getCart = asyncHandler(async (req, res) => {
  res.json(await getUserCart(req.user._id));
});

export const addCartItem = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.body.productId);
  if (!product) {
    const error = new Error("Clothing item not found");
    error.statusCode = 404;
    throw error;
  }

  const cart = await getUserCart(req.user._id);
  const variant = req.body.variantId
    ? product.variants.id(req.body.variantId)
    : null;
  const existing = cart.items.find(
    (item) =>
      item.product._id.toString() === product._id.toString() &&
      String(item.variantId || "") === String(req.body.variantId || "")
  );

  if (existing) {
    existing.quantity += Number(req.body.quantity || 1);
  } else {
    cart.items.push({
      product: product._id,
      variantId: req.body.variantId,
      name: product.name,
      image: product.images?.[0]?.url,
      price: variant?.price || product.price,
      quantity: req.body.quantity || 1,
      selectedOptions: req.body.selectedOptions
    });
  }

  await cart.save();
  res.status(201).json(await getUserCart(req.user._id));
});

export const updateCartItem = asyncHandler(async (req, res) => {
  const cart = await getUserCart(req.user._id);
  const item = cart.items.find((cartItem) => cartItem.product._id.toString() === req.params.productId);
  if (!item) {
    const error = new Error("Clothing bag item not found");
    error.statusCode = 404;
    throw error;
  }
  item.quantity = req.body.quantity;
  await cart.save();
  res.json(await getUserCart(req.user._id));
});

export const removeCartItem = asyncHandler(async (req, res) => {
  const cart = await getUserCart(req.user._id);
  cart.items = cart.items.filter((item) => item.product._id.toString() !== req.params.productId);
  await cart.save();
  res.json(await getUserCart(req.user._id));
});

export const applyCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findOne({ code: req.body.code?.toUpperCase(), isActive: true });
  if (!coupon || (coupon.expiresAt && coupon.expiresAt < new Date())) {
    const error = new Error("Coupon is invalid or expired");
    error.statusCode = 400;
    throw error;
  }
  const cart = await getUserCart(req.user._id);
  cart.couponCode = coupon.code;
  await cart.save();
  res.json({ cart, coupon });
});

export const getWishlist = asyncHandler(async (req, res) => {
  const wishlist = await Wishlist.findOneAndUpdate(
    { user: req.user._id },
    { $setOnInsert: { products: [] } },
    { upsert: true, new: true }
  ).populate("products");
  res.json(wishlist);
});

export const toggleWishlist = asyncHandler(async (req, res) => {
  const wishlist = await Wishlist.findOneAndUpdate(
    { user: req.user._id },
    { $setOnInsert: { products: [] } },
    { upsert: true, new: true }
  );
  const productId = req.params.productId;
  const exists = wishlist.products.some((id) => id.toString() === productId);
  wishlist.products = exists
    ? wishlist.products.filter((id) => id.toString() !== productId)
    : [...wishlist.products, productId];
  await wishlist.save();
  res.json(await Wishlist.findById(wishlist._id).populate("products"));
});
