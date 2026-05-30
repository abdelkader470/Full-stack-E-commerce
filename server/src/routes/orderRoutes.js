import { Router } from "express";
import {
  createOrder,
  createPaymentIntent,
  getInvoice,
  getMyOrders,
  getOrder,
  updateOrderStatus
} from "../controllers/orderController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

export const orderRoutes = Router();

orderRoutes.use(protect);
orderRoutes.post("/payment-intent", createPaymentIntent);
orderRoutes.post("/", createOrder);
orderRoutes.get("/mine", getMyOrders);
orderRoutes.get("/:id", getOrder);
orderRoutes.get("/:id/invoice", getInvoice);
orderRoutes.put("/:id/status", authorize("admin"), updateOrderStatus);
