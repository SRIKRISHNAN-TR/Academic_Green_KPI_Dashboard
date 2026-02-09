const mongoose = require("mongoose");

const waterSchema = new mongoose.Schema({
  metric: { type: String, default: "WATER" },
  month: { type: String, required: true },
  year: { type: Number, required: true },
  actual: { type: Number, required: true },
  target: { type: Number, required: true },
  unit: { type: String, default: "m³" },
  source: { type: String },
  location: { type: String },
  status: { type: String, enum: ["GREEN", "YELLOW", "RED"], required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Water", waterSchema, "water_data");