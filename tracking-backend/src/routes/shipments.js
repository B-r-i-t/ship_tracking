const express = require("express");
const rateLimit = require("express-rate-limit");
const Shipment = require("../models/Shipment");

const router = express.Router();

// Strict rate limit for public tracking endpoint
const trackLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: parseInt(process.env.TRACK_RATE_LIMIT_MAX) || 20,
  message: { error: "Too many tracking requests. Please wait before trying again." },
  keyGenerator: (req) => req.ip + ":" + (req.params.id || ""),
});

// ─── GET /api/shipments/:trackingId — Public tracking ────────────────────────
router.get("/:trackingId", trackLimiter, async (req, res, next) => {
  try {
    const { trackingId } = req.params;

    // Input validation
    if (!trackingId || trackingId.length < 4 || trackingId.length > 30) {
      return res.status(400).json({ error: "Invalid tracking ID format." });
    }
    if (!/^[A-Z0-9]+$/i.test(trackingId)) {
      return res.status(400).json({ error: "Tracking ID may only contain letters and numbers." });
    }

    const shipment = await Shipment.findOne({
      trackingId: trackingId.toUpperCase(),
    }).select("-__v -isDeleted -createdBy -notifications");

    if (!shipment) {
      return res.status(404).json({ error: `No shipment found with tracking ID "${trackingId.toUpperCase()}".` });
    }

    // Sanitize sensitive sender/receiver data for public endpoint
    const publicData = shipment.toObject();
    delete publicData.sender.email;
    delete publicData.sender.phone;
    if (publicData.receiver.email) {
      // Mask email: jo***@gmail.com
      const [local, domain] = publicData.receiver.email.split("@");
      publicData.receiver.email = local.slice(0, 2) + "***@" + domain;
    }

    res.json({ shipment: publicData });
  } catch (err) { next(err); }
});

module.exports = router;
