const mongoose = require("mongoose");

const energySchema = new mongoose.Schema({
  metric: { type: String, default: "ENERGY" },
  month: { type: String, required: true },
  year: { type: Number, required: true },
  actual: { type: Number, required: true },
  target: { type: Number, required: true },
  unit: { type: String, default: "kWh" },
  source: { type: String },
  location: { type: String },
  status: { type: String, enum: ["GREEN", "YELLOW", "RED"], required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Energy", energySchema, "energy_data");