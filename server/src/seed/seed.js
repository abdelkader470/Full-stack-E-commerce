import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import { Cart } from "../models/Cart.js";
import { Category } from "../models/Category.js";
import { Coupon } from "../models/Coupon.js";
import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { User } from "../models/User.js";
import { Wishlist } from "../models/Wishlist.js";

dotenv.config();

const image = (seed) => `https://images.unsplash.com/${seed}?auto=format&fit=crop&w=900&q=80`;

const run = async () => {
  await connectDB();
  await Promise.all([
    User.deleteMany(),
    Category.deleteMany(),
    Product.deleteMany(),
    Cart.deleteMany(),
    Wishlist.deleteMany(),
    Order.deleteMany(),
    Coupon.deleteMany()
  ]);

  const [women, men, denim, activewear] = await Category.create([
    {
      name: "Women",
      description: "Tailored dresses, elevated basics, and seasonal layers",
      image: image("photo-1496747611176-843222e1e57c"),
      isFeatured: true
    },
    {
      name: "Men",
      description: "Modern shirting, outerwear, denim, and everyday essentials",
      image: image("photo-1516257984-b1b4d707412e"),
      isFeatured: true
    },
    {
      name: "Denim",
      description: "Jeans, jackets, trousers, and refined everyday denim",
      image: image("photo-1541099649105-f69ad21f3246"),
      isFeatured: true
    },
    {
      name: "Activewear",
      description: "Performance layers, leggings, hoodies, and training sets",
      image: image("photo-1518310383802-640c2de311b2"),
      isFeatured: true
    }
  ]);

  const [admin, customer] = await User.create([
    {
      name: "Admin User",
      email: "admin@example.com",
      password: "Password123!",
      role: "admin"
    },
    {
      name: "Avery Customer",
      email: "customer@example.com",
      password: "Password123!",
      addresses: [
        {
          label: "Home",
          fullName: "Avery Customer",
          phone: "+1 555 0123",
          line1: "100 Market Street",
          city: "San Francisco",
          state: "CA",
          postalCode: "94105",
          country: "United States",
          isDefault: true
        }
      ]
    }
  ]);

  const products = await Product.create([
    {
      name: "Atelier Satin Midi Dress",
      brand: "Atelier Muse",
      sku: "DRS-SAT-001",
      category: women._id,
      price: 168,
      compareAtPrice: 220,
      stock: 28,
      isFeatured: true,
      isBestSeller: true,
      tags: ["dress", "occasionwear", "satin"],
      images: [
        { url: image("photo-1515372039744-b8f02a3ae446"), alt: "Satin midi dress" },
        { url: image("photo-1496747611176-843222e1e57c"), alt: "Dress styling detail" }
      ],
      variants: [
        { sku: "DRS-SAT-CHS", size: "S", color: "Champagne", stock: 8, price: 168 },
        { sku: "DRS-SAT-CHM", size: "M", color: "Champagne", stock: 12, price: 168 },
        { sku: "DRS-SAT-BLL", size: "L", color: "Black", stock: 8, price: 168 }
      ],
      description:
        "A softly draped satin midi dress with a clean neckline, fluid movement, and event-ready polish."
    },
    {
      name: "Northline Wool Blend Overshirt",
      brand: "Northline",
      sku: "MEN-OVS-002",
      category: men._id,
      price: 142,
      stock: 21,
      isFeatured: true,
      tags: ["menswear", "overshirt", "layering"],
      images: [{ url: image("photo-1516257984-b1b4d707412e"), alt: "Men's wool blend overshirt" }],
      variants: [
        { sku: "MEN-OVS-CHM", size: "M", color: "Charcoal", stock: 7, price: 142 },
        { sku: "MEN-OVS-CHL", size: "L", color: "Charcoal", stock: 8, price: 142 },
        { sku: "MEN-OVS-CAX", size: "XL", color: "Camel", stock: 6, price: 142 }
      ],
      description: "A structured wool blend overshirt with a relaxed fit, warm hand feel, and polished utility pockets."
    },
    {
      name: "Vale Wide-Leg Denim Trouser",
      brand: "Vale",
      sku: "DNM-TRS-003",
      category: denim._id,
      price: 128,
      compareAtPrice: 158,
      stock: 14,
      isFlashSale: true,
      flashSaleEndsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
      tags: ["denim", "trousers", "bottoms"],
      images: [{ url: image("photo-1541099649105-f69ad21f3246"), alt: "Wide-leg denim trousers" }],
      variants: [
        { sku: "DNM-TRS-IN28", size: "28", color: "Indigo", stock: 4, price: 128 },
        { sku: "DNM-TRS-IN30", size: "30", color: "Indigo", stock: 5, price: 128 },
        { sku: "DNM-TRS-BK32", size: "32", color: "Washed Black", stock: 5, price: 128 }
      ],
      description: "A wide-leg denim trouser with a high-rise waist, structured drape, and polished everyday styling."
    },
    {
      name: "Harbor Double-Breasted Trench",
      brand: "Harbor & Co.",
      sku: "OUT-TRN-004",
      category: women._id,
      price: 236,
      stock: 5,
      isBestSeller: true,
      tags: ["outerwear", "coat", "trench"],
      images: [{ url: image("photo-1520975954732-35dd22299614"), alt: "Classic double-breasted trench coat" }],
      variants: [
        { sku: "OUT-TRN-STS", size: "S", color: "Stone", stock: 1, price: 236 },
        { sku: "OUT-TRN-STM", size: "M", color: "Stone", stock: 2, price: 236 },
        { sku: "OUT-TRN-NVL", size: "L", color: "Navy", stock: 2, price: 236 }
      ],
      description: "A weather-ready trench coat with a double-breasted front, belted waist, and refined tailoring."
    },
    {
      name: "Core Ribbed Performance Legging",
      brand: "Coreform",
      sku: "ACT-LEG-005",
      category: activewear._id,
      price: 76,
      compareAtPrice: 96,
      stock: 32,
      isFeatured: true,
      tags: ["activewear", "leggings", "training"],
      images: [{ url: image("photo-1518310383802-640c2de311b2"), alt: "Ribbed performance leggings" }],
      variants: [
        { sku: "ACT-LEG-IKXS", size: "XS", color: "Ink", stock: 8, price: 76 },
        { sku: "ACT-LEG-IKS", size: "S", color: "Ink", stock: 10, price: 76 },
        { sku: "ACT-LEG-MSM", size: "M", color: "Moss", stock: 14, price: 76 }
      ],
      description: "Supportive ribbed leggings with four-way stretch, a smoothing high rise, and studio-to-street comfort."
    }
  ]);

  await Coupon.create([
    { code: "WELCOME10", type: "percentage", value: 10, minOrderValue: 50 },
    { code: "FLASH25", type: "fixed", value: 25, minOrderValue: 150 }
  ]);

  await Wishlist.create({ user: customer._id, products: [products[0]._id, products[2]._id] });
  await Cart.create({
    user: customer._id,
    items: [
      {
        product: products[0]._id,
        name: products[0].name,
        image: products[0].images[0].url,
        price: products[0].price,
        quantity: 1,
        selectedOptions: { size: "M", color: "Champagne" }
      }
    ]
  });

  console.log("Seed complete");
  console.log("Admin: admin@example.com / Password123!");
  console.log("Customer: customer@example.com / Password123!");
  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
