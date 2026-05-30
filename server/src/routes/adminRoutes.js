import { Router } from "express";
import {
  analytics,
  createCoupon,
  deleteCoupon,
  listCoupons,
  listOrders,
  listUsers,
  subscribeNewsletter,
  updateCoupon,
  updateUser
} from "../controllers/adminController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

export const adminRoutes = Router();

adminRoutes.post("/newsletter", subscribeNewsletter);
adminRoutes.use(protect, authorize("admin"));
adminRoutes.get("/analytics", analytics);
adminRoutes.get("/users", listUsers);
adminRoutes.put("/users/:id", updateUser);
adminRoutes.get("/orders", listOrders);
adminRoutes.get("/coupons", listCoupons);
adminRoutes.post("/coupons", createCoupon);
adminRoutes.put("/coupons/:id", updateCoupon);
adminRoutes.delete("/coupons/:id", deleteCoupon);
