const mongoose = require("mongoose");

const carbonSchema = new mongoose.Schema({
  metric: { type: String, default: "CARBON" },
  month: { type: String, required: true },
  year: { type: Number, required: true },
  actual: { type: Number, required: true },
  target: { type: Number, required: true },
  unit: { type: String, default: "tCO₂e" },
  source: { type: String },
  status: { type: String, enum: ["GREEN", "YELLOW", "RED"], required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Carbon", carbonSchema, "carbon_data");