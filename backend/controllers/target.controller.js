const Target = require("../models/Target");

exports.getAll = async (req, res) => {
  try {
    const filter = {};
    if (req.query.year) filter.year = Number(req.query.year);
    if (req.query.metric) filter.metric = req.query.metric.toUpperCase();
    if (req.query.location) filter.location = req.query.location;
    res.json(await Target.find(filter));
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.create = async (req, res) => {
  try { res.status(201).json(await Target.create(req.body)); }
  catch (err) { res.status(400).json({ message: err.message }); }
};

exports.update = async (req, res) => {
  try {
    const doc = await Target.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!doc) return res.status(404).json({ message: "Not found" });
    res.json(doc);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

exports.remove = async (req, res) => {
  try {
    const doc = await Target.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted" });
  } catch (err) { res.status(500).json({ message: err.message }); }
};