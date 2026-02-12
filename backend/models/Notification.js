const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  type: { type: String, enum: ["warning", "info", "success"], default: "warning" },
  title: { type: String, required: true },
  message: { type: String, required: true },
  kpi: { type: String },
  location: { type: String },
  actualValue: { type: Number },
  targetValue: { type: Number },
  read: { type: Boolean, default: false },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Notification", notificationSchema, "notifications");