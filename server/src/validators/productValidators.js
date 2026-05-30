import { body } from "express-validator";

export const productRules = [
  body("name").trim().notEmpty().withMessage("Clothing name is required"),
  body("description").trim().notEmpty().withMessage("Description is required"),
  body("category").notEmpty().withMessage("Category is required"),
  body("price").isFloat({ min: 0 }).withMessage("Price must be positive"),
  body("stock").optional().isInt({ min: 0 }).withMessage("Stock must be zero or greater")
];

export const categoryRules = [
  body("name").trim().notEmpty().withMessage("Category name is required")
];

export const reviewRules = [
  body("rating").isInt({ min: 1, max: 5 }).withMessage("Rating must be 1 to 5"),
  body("comment").trim().notEmpty().withMessage("Review comment is required")
];
