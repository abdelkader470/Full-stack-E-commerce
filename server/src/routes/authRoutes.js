import { Router } from "express";
import { login, me, register, updateProfile } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { loginRules, registerRules } from "../validators/authValidators.js";

export const authRoutes = Router();

authRoutes.post("/register", registerRules, validateRequest, register);
authRoutes.post("/login", loginRules, validateRequest, login);
authRoutes.get("/me", protect, me);
authRoutes.put("/me", protect, updateProfile);
