const mongoose = require("mongoose");

const targetSchema = new mongoose.Schema({
  metric: { type: String, enum: ["ENERGY", "WATER", "WASTE"], required: true },
  year: { type: Number, required: true },
  targetValue: { type: Number, required: true },
  unit: { type: String, required: true },
  location: { type: String },
});

module.exports = mongoose.model("Target", targetSchema, "targets");