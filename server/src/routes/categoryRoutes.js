import { Router } from "express";
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory
} from "../controllers/productController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { categoryRules } from "../validators/productValidators.js";

export const categoryRoutes = Router();

categoryRoutes.get("/", getCategories);
categoryRoutes.post("/", protect, authorize("admin"), categoryRules, validateRequest, createCategory);
categoryRoutes.put("/:id", protect, authorize("admin"), categoryRules, validateRequest, updateCategory);
categoryRoutes.delete("/:id", protect, authorize("admin"), deleteCategory);
