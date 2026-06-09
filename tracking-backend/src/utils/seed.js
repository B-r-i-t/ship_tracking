require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Shipment = require("../models/Shipment");

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("✅ Connected to MongoDB");

  await User.deleteMany({});
  await Shipment.deleteMany({});

  // Create admin user
  await User.create({
    name: "Admin User",
    email: "admin@shiptrack.com",
    password: "admin123456",
    role: "superadmin",
  });
  console.log("✅ Admin user created: admin@shiptrack.com / admin123456");

  // Create sample shipments
  await Shipment.create([
    {
      trackingId: "SHT001ABC",
      sender: { name: "GlobalTech Industries", email: "shipping@globaltech.com" },
      receiver: { name: "Sarah Mitchell", email: "sarah@example.com" },
      origin: "Lagos, Nigeria",
      destination: "London, UK",
      status: "In Transit",
      service: "Express International",
      weight: 2.4,
      estimatedDelivery: new Date("2025-06-10"),
      history: [
        { event: "Shipment created", location: "Lagos, Nigeria", icon: "📦", date: new Date("2025-05-28T09:00:00") },
        { event: "Picked up by courier", location: "Lagos, Nigeria", icon: "🚚", date: new Date("2025-05-29T14:30:00") },
        { event: "Departed origin facility", location: "Lagos Airport, Nigeria", icon: "✈️", date: new Date("2025-05-30T08:15:00") },
        { event: "Arrived at international hub", location: "Dubai Hub, UAE", icon: "🏭", date: new Date("2025-06-01T22:45:00") },
        { event: "In transit to destination", location: "Heathrow Hub, UK", icon: "🚚", date: new Date("2025-06-03T10:00:00") },
      ],
    },
    {
      trackingId: "SHT002XYZ",
      sender: { name: "Amazon Fulfillment", email: "shipping@amazon.com" },
      receiver: { name: "John Adebayo", email: "john@example.com" },
      origin: "New York, USA",
      destination: "Port Harcourt, Nigeria",
      status: "Processing",
      service: "Standard International",
      weight: 1.1,
      estimatedDelivery: new Date("2025-06-15"),
      history: [
        { event: "Order received", location: "New York, USA", icon: "📋", date: new Date("2025-06-02T11:00:00") },
        { event: "Shipment created", location: "New York, USA", icon: "📦", date: new Date("2025-06-02T16:45:00") },
        { event: "Processing at origin facility", location: "JFK Hub, USA", icon: "⚙️", date: new Date("2025-06-03T09:00:00") },
      ],
    },
  ]);
  console.log("✅ Sample shipments created");

  await mongoose.disconnect();
  console.log("✅ Seeding complete!");
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
