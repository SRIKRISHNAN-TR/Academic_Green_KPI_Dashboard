const mongoose = require("mongoose");

const kpiSnapshotSchema = new mongoose.Schema({
  metric: { type: String, enum: ["ENERGY", "WATER", "WASTE"], required: true },
  month: { type: String, required: true },
  year: { type: Number, required: true },
  actual: { type: Number, required: true },
  target: { type: Number, required: true },
  status: { type: String, enum: ["GREEN", "YELLOW", "RED"], required: true },
  location: { type: String },
  generatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("KpiSnapshot", kpiSnapshotSchema, "kpi_snapshots");