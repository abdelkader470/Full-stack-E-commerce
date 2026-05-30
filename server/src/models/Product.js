import mongoose from "mongoose";
import slugify from "slugify";

const variantSchema = new mongoose.Schema(
  {
    sku: String,
    size: String,
    color: String,
    price: Number,
    stock: { type: Number, default: 0 }
  },
  { _id: true }
);

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: String,
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, required: true }
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true },
    description: { type: String, required: true },
    brand: String,
    sku: { type: String, unique: true, sparse: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0 },
    images: [{ url: String, alt: String }],
    variants: [variantSchema],
    stock: { type: Number, default: 0 },
    lowStockThreshold: { type: Number, default: 5 },
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    reviews: [reviewSchema],
    tags: [String],
    isFeatured: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    isFlashSale: { type: Boolean, default: false },
    flashSaleEndsAt: Date,
    salesCount: { type: Number, default: 0 },
    seo: {
      title: String,
      description: String,
      keywords: [String]
    },
    status: { type: String, enum: ["draft", "active", "archived"], default: "active" }
  },
  { timestamps: true }
);

productSchema.index({ name: "text", description: "text", brand: "text", tags: "text" });

productSchema.pre("validate", function setSlug(next) {
  if (this.name && !this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

productSchema.methods.recalculateRating = function recalculateRating() {
  this.numReviews = this.reviews.length;
  this.rating =
    this.reviews.reduce((sum, review) => sum + review.rating, 0) / (this.numReviews || 1);
};

export const Product = mongoose.model("Product", productSchema);
