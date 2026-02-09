const Carbon = require("../models/Carbon");

exports.getAll = async (req, res) => {
  try {
    const filter = {};
    if (req.query.year) filter.year = Number(req.query.year);
    if (req.query.month) filter.month = req.query.month;
    res.json(await Carbon.find(filter).sort({ year: -1, createdAt: -1 }));
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getById = async (req, res) => {
  try {
    const doc = await Carbon.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Not found" });
    res.json(doc);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.create = async (req, res) => {
  try { res.status(201).json(await Carbon.create({ ...req.body, metric: "CARBON" })); }
  catch (err) { res.status(400).json({ message: err.message }); }
};

exports.update = async (req, res) => {
  try {
    const doc = await Carbon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!doc) return res.status(404).json({ message: "Not found" });
    res.json(doc);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

exports.remove = async (req, res) => {
  try {
    const doc = await Carbon.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted" });
  } catch (err) { res.status(500).json({ message: err.message }); }
};