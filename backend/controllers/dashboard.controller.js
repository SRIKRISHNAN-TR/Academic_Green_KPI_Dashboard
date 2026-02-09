const Energy = require("../models/Energy");
const Water = require("../models/Water");
const Waste = require("../models/Waste");
const KpiSnapshot = require("../models/KpiSnapshot");

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const getCurrentMonthYear = () => {
  const now = new Date();
  return { month: MONTHS[now.getMonth()], year: now.getFullYear() };
};

const calcStatus = (actual, target, metric) => {
  if (metric === "WASTE") {
    if (actual >= target) return "GREEN";
    if (actual >= target * 0.9) return "YELLOW";
    return "RED";
  }
  if (actual <= target) return "GREEN";
  if (actual <= target * 1.1) return "YELLOW";
  return "RED";
};

const getMetricSummary = async (Model, metric, month, year, location) => {
  const filter = { month, year };
  if (location) filter.location = location;

  const mtd = await Model.findOne(filter).sort({ createdAt: -1 });

  const currentMonthIndex = MONTHS.indexOf(month);
  const ytdMonths = MONTHS.slice(0, currentMonthIndex + 1);
  const ytdFilter = { year, month: { $in: ytdMonths } };
  if (location) ytdFilter.location = location;
  const ytdData = await Model.find(ytdFilter);

  const ytdActual = ytdData.reduce((sum, d) => sum + d.actual, 0);
  const ytdTarget = ytdData.reduce((sum, d) => sum + d.target, 0);

  return {
    metric,
    mtd: mtd ? { actual: mtd.actual, target: mtd.target, status: mtd.status, unit: mtd.unit } : null,
    ytd: { actual: ytdActual, target: ytdTarget, status: calcStatus(ytdActual, ytdTarget, metric) },
  };
};

exports.getSummary = async (req, res) => {
  try {
    const { month, year, location } = req.query;
    const current = getCurrentMonthYear();
    const m = month || current.month;
    const y = year ? Number(year) : current.year;

    const [energy, water, waste] = await Promise.all([
      getMetricSummary(Energy, "ENERGY", m, y, location),
      getMetricSummary(Water, "WATER", m, y, location),
      getMetricSummary(Waste, "WASTE", m, y, location),
    ]);

    res.json({ month: m, year: y, energy, water, waste });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Highest usage locations
exports.getHighestUsage = async (req, res) => {
  try {
    const { year } = req.query;
    const y = year ? Number(year) : new Date().getFullYear();

    const pipeline = [
      { $match: { year: y, location: { $exists: true, $ne: null } } },
      { $group: { _id: "$location", totalActual: { $sum: "$actual" }, totalTarget: { $sum: "$target" }, count: { $sum: 1 } } },
      { $sort: { totalActual: -1 } },
      { $limit: 5 },
    ];

    const [energyTop, waterTop, wasteTop] = await Promise.all([
      Energy.aggregate(pipeline),
      Water.aggregate(pipeline),
      Waste.aggregate([
        { $match: { year: y, location: { $exists: true, $ne: null } } },
        { $group: { _id: "$location", avgActual: { $avg: "$actual" }, avgTarget: { $avg: "$target" }, count: { $sum: 1 } } },
        { $sort: { avgActual: 1 } }, // Lower diversion = worse for waste
        { $limit: 5 },
      ]),
    ]);

    res.json({ energy: energyTop, water: waterTop, waste: wasteTop });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.generateSnapshot = async (req, res) => {
  try {
    const { month, year } = req.body;
    if (!month || !year) return res.status(400).json({ message: "month and year required" });

    const models = [
      { Model: Energy, metric: "ENERGY" },
      { Model: Water, metric: "WATER" },
      { Model: Waste, metric: "WASTE" },
    ];

    const snapshots = [];
    for (const { Model, metric } of models) {
      const doc = await Model.findOne({ month, year: Number(year) }).sort({ createdAt: -1 });
      if (doc) {
        const snap = await KpiSnapshot.create({
          metric, month, year: Number(year),
          actual: doc.actual, target: doc.target,
          status: doc.status, location: doc.location,
        });
        snapshots.push(snap);
      }
    }

    res.status(201).json(snapshots);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getSnapshots = async (req, res) => {
  try {
    const filter = {};
    if (req.query.year) filter.year = Number(req.query.year);
    if (req.query.metric) filter.metric = req.query.metric.toUpperCase();
    if (req.query.location) filter.location = req.query.location;
    res.json(await KpiSnapshot.find(filter).sort({ generatedAt: -1 }));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};