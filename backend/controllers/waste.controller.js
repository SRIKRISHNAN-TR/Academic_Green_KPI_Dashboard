const Waste = require("../models/Waste");
const { checkAndCreateAlert } = require("./notification.controller");

exports.getAll = async (req, res) => {
  try {
    const { year, month, location } = req.query;
    const filter = {};
    if (year) filter.year = Number(year);
    if (month) filter.month = month;
    if (location) filter.location = location;
    res.json(await Waste.find(filter).sort({ year: -1, createdAt: -1 }));
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getById = async (req, res) => {
  try {
    const doc = await Waste.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Not found" });
    res.json(doc);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.create = async (req, res) => {
  try {
    const doc = await Waste.create({ ...req.body, metric: "WASTE" });
    await checkAndCreateAlert("WASTE", doc);
    res.status(201).json(doc);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

exports.update = async (req, res) => {
  try {
    const doc = await Waste.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!doc) return res.status(404).json({ message: "Not found" });
    res.json(doc);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

exports.remove = async (req, res) => {
  try {
    const doc = await Waste.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted" });
  } catch (err) { res.status(500).json({ message: err.message }); }
};