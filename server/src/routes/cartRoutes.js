import { Router } from "express";
import {
  addCartItem,
  applyCoupon,
  getCart,
  getWishlist,
  removeCartItem,
  toggleWishlist,
  updateCartItem
} from "../controllers/cartController.js";
import { protect } from "../middleware/authMiddleware.js";

export const cartRoutes = Router();

cartRoutes.use(protect);
cartRoutes.get("/", getCart);
cartRoutes.post("/items", addCartItem);
cartRoutes.put("/items/:productId", updateCartItem);
cartRoutes.delete("/items/:productId", removeCartItem);
cartRoutes.post("/coupon", applyCoupon);
cartRoutes.get("/wishlist", getWishlist);
cartRoutes.put("/wishlist/:productId", toggleWishlist);
