const express = require("express");
const qrcode = require("qrcode");
const XLSX = require("xlsx");
const Shipment = require("../models/Shipment");
const { protect } = require("../middleware/auth");
const { sendStatusEmail } = require("../utils/email");

const router = express.Router();

// All admin routes require authentication
router.use(protect);

// ─── GET /api/admin/shipments — List all ─────────────────────────────────────
router.get("/shipments", async (req, res, next) => {
  try {
    const {
      status, page = 1, limit = 20, search, sortBy = "createdAt", order = "desc",
    } = req.query;

    const query = {};
    if (status && status !== "All") query.status = status;
    if (search) {
      const re = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      query.$or = [
        { trackingId: re },
        { "sender.name": re },
        { "receiver.name": re },
        { origin: re },
        { destination: re },
      ];
    }

    const total = await Shipment.countDocuments(query);
    const shipments = await Shipment.find(query)
      .sort({ [sortBy]: order === "desc" ? -1 : 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .select("-__v");

    res.json({
      shipments,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) },
    });
  } catch (err) { next(err); }
});

// ─── GET /api/admin/shipments/:id — Single shipment ──────────────────────────
router.get("/shipments/:id", async (req, res, next) => {
  try {
    const shipment = await Shipment.findById(req.params.id);
    if (!shipment) return res.status(404).json({ error: "Shipment not found." });
    res.json({ shipment });
  } catch (err) { next(err); }
});

// ─── POST /api/admin/shipments — Create ──────────────────────────────────────
router.post("/shipments", async (req, res, next) => {
  try {
    const { sender, receiver, origin, destination, status, estimatedDelivery, service, weight, description } = req.body;

    const shipment = await Shipment.create({
      sender, receiver, origin, destination, status,
      estimatedDelivery, service, weight, description,
      createdBy: req.user._id,
      history: [{
        event: "Shipment created",
        location: origin,
        icon: "📦",
        date: new Date(),
      }],
    });

    // Generate QR code for tracking URL
    try {
      const trackUrl = `${process.env.CLIENT_URL}/track/${shipment.trackingId}`;
      shipment.qrCode = await qrcode.toDataURL(trackUrl);
      await shipment.save();
    } catch (_) { /* QR gen is non-critical */ }

    res.status(201).json({ shipment });
  } catch (err) {
    if (err.name === "ValidationError") {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ error: errors.join(". ") });
    }
    next(err);
  }
});

// ─── PATCH /api/admin/shipments/:id — Update ─────────────────────────────────
router.patch("/shipments/:id", async (req, res, next) => {
  try {
    const allowed = ["sender", "receiver", "origin", "destination", "status", "estimatedDelivery", "service", "weight", "description", "dimensions", "value", "notifications"];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

    const shipment = await Shipment.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!shipment) return res.status(404).json({ error: "Shipment not found." });

    // Send status notification email if status changed
    if (updates.status && shipment.notifications?.email && shipment.receiver?.email) {
      try { await sendStatusEmail(shipment); } catch (_) { /* non-critical */ }
    }

    res.json({ shipment });
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ error: Object.values(err.errors).map(e => e.message).join(". ") });
    }
    next(err);
  }
});

// ─── POST /api/admin/shipments/:id/events — Add timeline event ───────────────
router.post("/shipments/:id/events", async (req, res, next) => {
  try {
    const { event, location, icon, note } = req.body;
    if (!event) return res.status(400).json({ error: "Event description is required." });

    const shipment = await Shipment.findByIdAndUpdate(
      req.params.id,
      { $push: { history: { event, location, icon: icon || "📦", note, date: new Date() } } },
      { new: true }
    );
    if (!shipment) return res.status(404).json({ error: "Shipment not found." });

    res.json({ shipment });
  } catch (err) { next(err); }
});

// ─── DELETE /api/admin/shipments/:id/events/:eventId — Remove event ──────────
router.delete("/shipments/:id/events/:eventId", async (req, res, next) => {
  try {
    const shipment = await Shipment.findByIdAndUpdate(
      req.params.id,
      { $pull: { history: { _id: req.params.eventId } } },
      { new: true }
    );
    if (!shipment) return res.status(404).json({ error: "Shipment not found." });
    res.json({ shipment });
  } catch (err) { next(err); }
});

// ─── DELETE /api/admin/shipments/:id — Soft delete ───────────────────────────
router.delete("/shipments/:id", async (req, res, next) => {
  try {
    const shipment = await Shipment.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true }
    );
    if (!shipment) return res.status(404).json({ error: "Shipment not found." });
    res.json({ message: "Shipment deleted successfully." });
  } catch (err) { next(err); }
});

// ─── GET /api/admin/shipments/:id/qr — Get QR code ───────────────────────────
router.get("/shipments/:id/qr", async (req, res, next) => {
  try {
    const shipment = await Shipment.findById(req.params.id).select("trackingId qrCode");
    if (!shipment) return res.status(404).json({ error: "Shipment not found." });
    if (!shipment.qrCode) {
      const trackUrl = `${process.env.CLIENT_URL || "http://localhost:3000"}/track/${shipment.trackingId}`;
      shipment.qrCode = await qrcode.toDataURL(trackUrl);
      await shipment.save();
    }
    res.json({ qrCode: shipment.qrCode, trackingId: shipment.trackingId });
  } catch (err) { next(err); }
});

// ─── GET /api/admin/shipments/export/excel — Export to Excel ─────────────────
router.get("/shipments/export/excel", async (req, res, next) => {
  try {
    const shipments = await Shipment.find({}).select("-__v -qrCode -history -isDeleted").lean();

    const rows = shipments.map(s => ({
      "Tracking ID": s.trackingId,
      "Sender": s.sender?.name,
      "Receiver": s.receiver?.name,
      "Origin": s.origin,
      "Destination": s.destination,
      "Status": s.status,
      "Service": s.service,
      "Weight (kg)": s.weight,
      "Est. Delivery": s.estimatedDelivery ? new Date(s.estimatedDelivery).toLocaleDateString() : "",
      "Created": new Date(s.createdAt).toLocaleDateString(),
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);
    ws["!cols"] = [{ wch: 16 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 18 }, { wch: 22 }, { wch: 10 }, { wch: 14 }, { wch: 14 }];
    XLSX.utils.book_append_sheet(wb, ws, "Shipments");

    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="shipments-${Date.now()}.xlsx"`);
    res.send(buf);
  } catch (err) { next(err); }
});

module.exports = router;
