const Energy = require("../models/Energy");

exports.getAll = async (req, res) => {
  try {
    const { year, month, location } = req.query;
    const filter = {};
    if (year) filter.year = Number(year);
    if (month) filter.month = month;
    if (location) filter.location = location;
    const data = await Energy.find(filter).sort({ year: -1, createdAt: -1 });
    res.json(data);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getById = async (req, res) => {
  try {
    const doc = await Energy.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Not found" });
    res.json(doc);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.create = async (req, res) => {
  try {
    const doc = await Energy.create({ ...req.body, metric: "ENERGY" });
    res.status(201).json(doc);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

exports.update = async (req, res) => {
  try {
    const doc = await Energy.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!doc) return res.status(404).json({ message: "Not found" });
    res.json(doc);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

exports.remove = async (req, res) => {
  try {
    const doc = await Energy.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted" });
  } catch (err) { res.status(500).json({ message: err.message }); }
};