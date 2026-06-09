const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

// ─── Sub-schemas ──────────────────────────────────────────────────────────────
const TrackingEventSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  event: { type: String, required: true, maxlength: 200 },
  location: { type: String, maxlength: 200 },
  icon: { type: String, default: "📦", maxlength: 10 },
  note: { type: String, maxlength: 500 },
}, { _id: true });

// ─── Main Shipment Schema ─────────────────────────────────────────────────────
const ShipmentSchema = new mongoose.Schema({
  trackingId: {
    type: String,
    unique: true,
    uppercase: true,
    default: () => "SHT" + uuidv4().replace(/-/g, "").substr(0, 9).toUpperCase(),
    index: true,
  },
  sender: {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
  },
  receiver: {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true, maxlength: 300 },
  },
  origin: { type: String, required: true, trim: true, maxlength: 150 },
  destination: { type: String, required: true, trim: true, maxlength: 150 },
  status: {
    type: String,
    enum: ["Processing", "In Transit", "Out for Delivery", "Delivered", "Delayed"],
    default: "Processing",
    index: true,
  },
  estimatedDelivery: { type: Date },
  actualDelivery: { type: Date },
  service: {
    type: String,
    enum: ["Standard International", "Express International", "Premium Express", "Economy"],
    default: "Standard International",
  },
  weight: { type: Number, min: 0, max: 10000 }, // kg
  dimensions: {
    length: Number, width: Number, height: Number, // cm
  },
  value: { type: Number, min: 0 }, // declared value USD
  description: { type: String, maxlength: 500 },
  history: [TrackingEventSchema],
  notifications: {
    email: { type: Boolean, default: false },
    sms: { type: Boolean, default: false },
    lastNotifiedStatus: String,
  },
  qrCode: { type: String }, // base64 QR image
  isDeleted: { type: Boolean, default: false, index: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// ─── Virtuals ─────────────────────────────────────────────────────────────────
ShipmentSchema.virtual("isDelivered").get(function () {
  return this.status === "Delivered";
});

ShipmentSchema.virtual("isOverdue").get(function () {
  return this.estimatedDelivery && new Date() > this.estimatedDelivery && this.status !== "Delivered";
});

// ─── Indexes ──────────────────────────────────────────────────────────────────
ShipmentSchema.index({ trackingId: 1, isDeleted: 1 });
ShipmentSchema.index({ status: 1, createdAt: -1 });
ShipmentSchema.index({ "receiver.email": 1 });

// ─── Methods ──────────────────────────────────────────────────────────────────
ShipmentSchema.methods.addEvent = function (event, location, icon = "📦", note = "") {
  this.history.push({ event, location, icon, note });
  return this.save();
};

// ─── Soft delete query helper ────────────────────────────────────────────────
ShipmentSchema.pre(/^find/, function (next) {
  if (!this._skipDeleteFilter) {
    this.where({ isDeleted: false });
  }
  next();
});

module.exports = mongoose.model("Shipment", ShipmentSchema);
