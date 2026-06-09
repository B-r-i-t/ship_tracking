const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    // 1. Get token
    let token;
    if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
      return res.status(401).json({ error: "Not authorized. Please log in." });
    }

    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Check user still exists
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return res.status(401).json({ error: "User no longer exists or is inactive." });
    }

    // 4. Check password hasn't changed since token was issued
    if (user.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({ error: "Password recently changed. Please log in again." });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === "JsonWebTokenError") return res.status(401).json({ error: "Invalid token." });
    if (err.name === "TokenExpiredError") return res.status(401).json({ error: "Token expired. Please log in again." });
    next(err);
  }
};

const restrictTo = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: "You do not have permission to perform this action." });
  }
  next();
};

module.exports = { protect, restrictTo };
