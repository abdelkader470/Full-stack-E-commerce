import { asyncHandler } from "../middleware/asyncHandler.js";
import { Category } from "../models/Category.js";
import { Product } from "../models/Product.js";
import mongoose from "mongoose";

export const getProducts = asyncHandler(async (req, res) => {
  const {
    search,
    category,
    minPrice,
    maxPrice,
    featured,
    bestSeller,
    newArrivals,
    flashSale,
    sort = "-createdAt",
    page = 1,
    limit = 12
  } = req.query;

  const filter = { status: "active" };
  if (search) filter.$text = { $search: search };
  if (category) filter.category = category;
  if (featured) filter.isFeatured = featured === "true";
  if (bestSeller) filter.isBestSeller = bestSeller === "true";
  if (flashSale) filter.isFlashSale = flashSale === "true";
  if (newArrivals) {
    filter.createdAt = { $gte: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30) };
  }
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    Product.find(filter).populate("category", "name slug").sort(sort).skip(skip).limit(Number(limit)),
    Product.countDocuments(filter)
  ]);

  res.json({ items, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
});

export const getProduct = asyncHandler(async (req, res) => {
  const lookup = mongoose.Types.ObjectId.isValid(req.params.idOrSlug)
    ? { $or: [{ _id: req.params.idOrSlug }, { slug: req.params.idOrSlug }] }
    : { slug: req.params.idOrSlug };
  const product = await Product.findOne(lookup).populate("category", "name slug");

  if (!product) {
    const error = new Error("Clothing item not found");
    error.statusCode = 404;
    throw error;
  }

  const related = await Product.find({
    _id: { $ne: product._id },
    category: product.category._id,
    status: "active"
  }).limit(4);

  res.json({ product, related });
});

export const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json(product);
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!product) {
    const error = new Error("Clothing item not found");
    error.statusCode = 404;
    throw error;
  }
  res.json(product);
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, { status: "archived" }, { new: true });
  if (!product) {
    const error = new Error("Clothing item not found");
    error.statusCode = 404;
    throw error;
  }
  res.json({ message: "Clothing item archived" });
});

export const addReview = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    const error = new Error("Clothing item not found");
    error.statusCode = 404;
    throw error;
  }

  const alreadyReviewed = product.reviews.some((review) => review.user.toString() === req.user._id.toString());
  if (alreadyReviewed) {
    const error = new Error("You already reviewed this clothing item");
    error.statusCode = 409;
    throw error;
  }

  product.reviews.push({
    user: req.user._id,
    name: req.user.name,
    rating: req.body.rating,
    comment: req.body.comment
  });
  product.recalculateRating();
  await product.save();
  res.status(201).json(product);
});

export const uploadProductImages = asyncHandler(async (req, res) => {
  const images = req.files.map((file) => ({
    url: `/uploads/${file.filename}`,
    alt: file.originalname
  }));
  res.status(201).json({ images });
});

export const getCategories = asyncHandler(async (_req, res) => {
  res.json(await Category.find().sort("name"));
});

export const createCategory = asyncHandler(async (req, res) => {
  res.status(201).json(await Category.create(req.body));
});

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!category) {
    const error = new Error("Category not found");
    error.statusCode = 404;
    throw error;
  }
  res.json(category);
});

export const deleteCategory = asyncHandler(async (req, res) => {
  await Category.findByIdAndDelete(req.params.id);
  res.json({ message: "Category deleted" });
});
