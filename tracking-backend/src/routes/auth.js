const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { protect } = require("../middleware/auth");
const rateLimit = require("express-rate-limit");

const router = express.Router();

// Stricter rate limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: "Too many authentication attempts. Try again in 15 minutes." },
});

// ─── Generate JWT ─────────────────────────────────────────────────────────────
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

const sendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  user.password = undefined;
  res.status(statusCode).json({ token, user });
};

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
router.post("/login", authLimiter, async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Email and password are required." });

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ error: "Invalid email or password." });

    if (!user.isActive)
      return res.status(401).json({ error: "Account is deactivated." });

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    sendToken(user, 200, res);
  } catch (err) { next(err); }
});

// ─── POST /api/auth/register (superadmin only in production) ──────────────────
router.post("/register", protect, async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    const user = await User.create({ name, email, password, role: role || "admin" });
    sendToken(user, 201, res);
  } catch (err) {
    if (err.code === 11000)
      return res.status(400).json({ error: "Email already registered." });
    next(err);
  }
});

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
router.get("/me", protect, (req, res) => {
  res.json({ user: req.user });
});

// ─── POST /api/auth/change-password ──────────────────────────────────────────
router.post("/change-password", protect, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select("+password");
    if (!(await user.comparePassword(currentPassword)))
      return res.status(400).json({ error: "Current password is incorrect." });
    user.password = newPassword;
    user.passwordChangedAt = new Date();
    await user.save();
    sendToken(user, 200, res);
  } catch (err) { next(err); }
});

module.exports = router;
