const express = require("express");
const Shipment = require("../models/Shipment");
const { protect } = require("../middleware/auth");

const router = express.Router();
router.use(protect);

// ─── GET /api/analytics/overview ─────────────────────────────────────────────
router.get("/overview", async (req, res, next) => {
  try {
    const [total, byStatus, recent, deliveryRate] = await Promise.all([
      Shipment.countDocuments(),
      Shipment.aggregate([
        { $match: { isDeleted: false } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Shipment.find().sort({ createdAt: -1 }).limit(5).select("trackingId receiver.name status createdAt destination"),
      Shipment.aggregate([
        { $match: { isDeleted: false } },
        { $group: {
          _id: null,
          total: { $sum: 1 },
          delivered: { $sum: { $cond: [{ $eq: ["$status", "Delivered"] }, 1, 0] } },
          delayed: { $sum: { $cond: [{ $eq: ["$status", "Delayed"] }, 1, 0] } },
        }},
      ]),
    ]);

    const stats = deliveryRate[0] || { total: 0, delivered: 0, delayed: 0 };

    res.json({
      total,
      byStatus: byStatus.reduce((a, x) => ({ ...a, [x._id]: x.count }), {}),
      successRate: stats.total ? ((stats.delivered / stats.total) * 100).toFixed(1) : 0,
      delayRate: stats.total ? ((stats.delayed / stats.total) * 100).toFixed(1) : 0,
      recentShipments: recent,
    });
  } catch (err) { next(err); }
});

// ─── GET /api/analytics/timeline — Shipments created per day (last 30 days) ──
router.get("/timeline", async (req, res, next) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const data = await Shipment.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo }, isDeleted: false } },
      { $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 },
      }},
      { $sort: { _id: 1 } },
    ]);

    res.json({ timeline: data.map(d => ({ date: d._id, count: d.count })) });
  } catch (err) { next(err); }
});

module.exports = router;
