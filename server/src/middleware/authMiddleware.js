import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { asyncHandler } from "./asyncHandler.js";

export const protect = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    const error = new Error("Authentication required");
    error.statusCode = 401;
    throw error;
  }

  const token = header.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id).select("-password");

  if (!user || !user.isActive) {
    const error = new Error("User no longer exists or is inactive");
    error.statusCode = 401;
    throw error;
  }

  req.user = user;
  next();
});

export const authorize = (...roles) => (req, _res, next) => {
  if (!roles.includes(req.user.role)) {
    const error = new Error("You do not have permission to perform this action");
    error.statusCode = 403;
    return next(error);
  }
  return next();
};
