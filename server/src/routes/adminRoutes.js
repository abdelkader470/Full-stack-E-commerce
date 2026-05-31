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
import {
  exportReports,
  getCustomersReport,
  getInventoryReport,
  getOrdersReport,
  getProductsReport,
  getRevenueReport,
  getSalesReport,
  getSummaryReport
} from "../controllers/reportController.js";

export const adminRoutes = Router();

adminRoutes.post("/newsletter", subscribeNewsletter);
adminRoutes.use(protect, authorize("admin"));
adminRoutes.get("/analytics", analytics);
adminRoutes.get("/reports/summary", getSummaryReport);
adminRoutes.get("/reports/sales", getSalesReport);
adminRoutes.get("/reports/orders", getOrdersReport);
adminRoutes.get("/reports/products", getProductsReport);
adminRoutes.get("/reports/customers", getCustomersReport);
adminRoutes.get("/reports/inventory", getInventoryReport);
adminRoutes.get("/reports/revenue", getRevenueReport);
adminRoutes.get("/reports/export", exportReports);
adminRoutes.get("/users", listUsers);
adminRoutes.put("/users/:id", updateUser);
adminRoutes.get("/orders", listOrders);
adminRoutes.get("/coupons", listCoupons);
adminRoutes.post("/coupons", createCoupon);
adminRoutes.put("/coupons/:id", updateCoupon);
adminRoutes.delete("/coupons/:id", deleteCoupon);
