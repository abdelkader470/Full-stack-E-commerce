import { Router } from "express";
import {
  addReview,
  createProduct,
  deleteProduct,
  getProduct,
  getProducts,
  updateProduct,
  uploadProductImages
} from "../controllers/productController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { productRules, reviewRules } from "../validators/productValidators.js";

export const productRoutes = Router();

productRoutes.get("/", getProducts);
productRoutes.get("/:idOrSlug", getProduct);
productRoutes.post("/", protect, authorize("admin"), productRules, validateRequest, createProduct);
productRoutes.put("/:id", protect, authorize("admin"), productRules, validateRequest, updateProduct);
productRoutes.delete("/:id", protect, authorize("admin"), deleteProduct);
productRoutes.post("/:id/reviews", protect, reviewRules, validateRequest, addReview);
productRoutes.post(
  "/uploads/images",
  protect,
  authorize("admin"),
  upload.array("images", 8),
  uploadProductImages
);
