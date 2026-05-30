import { asyncHandler } from "../middleware/asyncHandler.js";
import { User } from "../models/User.js";
import { signToken } from "../utils/token.js";

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  avatar: user.avatar,
  addresses: user.addresses,
  preferredLanguage: user.preferredLanguage
});

export const register = asyncHandler(async (req, res) => {
  const existing = await User.findOne({ email: req.body.email });
  if (existing) {
    const error = new Error("Email is already registered");
    error.statusCode = 409;
    throw error;
  }

  const user = await User.create(req.body);
  res.status(201).json({ user: publicUser(user), token: signToken(user._id, user.role) });
});

export const login = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email }).select("+password");

  if (!user || !(await user.comparePassword(req.body.password))) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  res.json({ user: publicUser(user), token: signToken(user._id, user.role) });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ user: publicUser(req.user) });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const allowed = ["name", "phone", "avatar", "addresses", "preferredLanguage"];
  allowed.forEach((field) => {
    if (req.body[field] !== undefined) req.user[field] = req.body[field];
  });
  await req.user.save();
  res.json({ user: publicUser(req.user) });
});
