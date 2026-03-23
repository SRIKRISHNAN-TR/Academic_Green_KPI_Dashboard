const Energy = require("../models/Energy");
const Water  = require("../models/Water");
const Waste  = require("../models/Waste");
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

/**
 * Get MTD + YTD summary for a metric.
 * When no location is given, AGGREGATE across all locations.
 * When a location is given, return just that location's data.
 */
const getMetricSummary = async (Model, metric, month, year, location) => {
  const currentMonthIndex = MONTHS.indexOf(month);
  const ytdMonths = MONTHS.slice(0, currentMonthIndex + 1);

  if (location) {
    // ── Single location ───────────────────────────────────────────────────
    const mtdDocs = await Model.find({ month, year, location });
    const ytdDocs = await Model.find({ year, month: { $in: ytdMonths }, location });

    const mtdActual = mtdDocs.reduce((s, d) => s + d.actual, 0);
    const mtdTarget = mtdDocs.reduce((s, d) => s + d.target, 0);
    const unit      = mtdDocs[0]?.unit || "";

    let ytdActual = ytdDocs.reduce((s, d) => s + d.actual, 0);
    let ytdTarget = ytdDocs.reduce((s, d) => s + d.target, 0);
    if (metric === "WASTE" && ytdDocs.length > 0) {
      ytdActual = Math.round(ytdActual / ytdDocs.length);
      ytdTarget = Math.round(ytdTarget / ytdDocs.length);
    }

    return {
      metric,
      mtd: mtdDocs.length > 0
        ? { actual: mtdActual, target: mtdTarget, status: calcStatus(mtdActual, mtdTarget, metric), unit }
        : null,
      ytd: { actual: ytdActual, target: ytdTarget, status: calcStatus(ytdActual, ytdTarget, metric) },
    };
  }

  // ── All locations — aggregate via MongoDB pipeline ────────────────────────
  const aggMtd = await Model.aggregate([
    { $match: { month, year } },
    {
      $group: {
        _id: null,
        totalActual: { $sum: "$actual" },
        totalTarget: { $sum: "$target" },
        count: { $sum: 1 },
        unit: { $first: "$unit" },
        // For waste we need averages
        avgActual: { $avg: "$actual" },
        avgTarget: { $avg: "$target" },
      },
    },
  ]);

  const aggYtd = await Model.aggregate([
    { $match: { year, month: { $in: ytdMonths } } },
    {
      $group: {
        _id: null,
        totalActual: { $sum: "$actual" },
        totalTarget: { $sum: "$target" },
        count: { $sum: 1 },
        avgActual: { $avg: "$actual" },
        avgTarget: { $avg: "$target" },
      },
    },
  ]);

  const mtdRow = aggMtd[0];
  const ytdRow = aggYtd[0];

  // Waste uses averages (it's a % rate, not a sum)
  const mtdActual = mtdRow
    ? (metric === "WASTE" ? Math.round(mtdRow.avgActual) : mtdRow.totalActual)
    : 0;
  const mtdTarget = mtdRow
    ? (metric === "WASTE" ? Math.round(mtdRow.avgTarget) : mtdRow.totalTarget)
    : 0;

  const ytdActual = ytdRow
    ? (metric === "WASTE" ? Math.round(ytdRow.avgActual) : ytdRow.totalActual)
    : 0;
  const ytdTarget = ytdRow
    ? (metric === "WASTE" ? Math.round(ytdRow.avgTarget) : ytdRow.totalTarget)
    : 0;

  return {
    metric,
    mtd: mtdRow
      ? { actual: mtdActual, target: mtdTarget, status: calcStatus(mtdActual, mtdTarget, metric), unit: mtdRow.unit || "" }
      : null,
    ytd: { actual: ytdActual, target: ytdTarget, status: calcStatus(ytdActual, ytdTarget, metric) },
  };
};

// ── getSummary ────────────────────────────────────────────────────────────────
exports.getSummary = async (req, res, next) => {
  try {
    const { month, year, location } = req.query;
    const current = getCurrentMonthYear();
    const m = month || current.month;
    const y = year ? Number(year) : current.year;

    const [energy, water, waste] = await Promise.all([
      getMetricSummary(Energy, "ENERGY", m, y, location),
      getMetricSummary(Water,  "WATER",  m, y, location),
      getMetricSummary(Waste,  "WASTE",  m, y, location),
    ]);

    res.json({ month: m, year: y, energy, water, waste });
  } catch (err) { next(err); }
};

// ── getHighestUsage ───────────────────────────────────────────────────────────
exports.getHighestUsage = async (req, res, next) => {
  try {
    const { year } = req.query;
    const y = year ? Number(year) : new Date().getFullYear();

    const basePipeline = [
      { $match: { year: y, location: { $exists: true, $ne: "" } } },
      { $group: { _id: "$location", totalActual: { $sum: "$actual" }, totalTarget: { $sum: "$target" }, count: { $sum: 1 } } },
      { $sort: { totalActual: -1 } },
      { $limit: 5 },
    ];

    const [energyTop, waterTop, wasteTop] = await Promise.all([
      Energy.aggregate(basePipeline),
      Water.aggregate(basePipeline),
      Waste.aggregate([
        { $match: { year: y, location: { $exists: true, $ne: "" } } },
        { $group: { _id: "$location", avgActual: { $avg: "$actual" }, avgTarget: { $avg: "$target" }, count: { $sum: 1 } } },
        { $sort: { avgActual: 1 } }, // lowest diversion = worst
        { $limit: 5 },
      ]),
    ]);

    res.json({ energy: energyTop, water: waterTop, waste: wasteTop });
  } catch (err) { next(err); }
};

// ── generateSnapshot ──────────────────────────────────────────────────────────
exports.generateSnapshot = async (req, res, next) => {
  try {
    const { month, year } = req.body;
    if (!month || !year) return res.status(400).json({ message: "month and year required" });

    const models = [
      { Model: Energy, metric: "ENERGY" },
      { Model: Water,  metric: "WATER"  },
      { Model: Waste,  metric: "WASTE"  },
    ];

    const snapshots = [];
    for (const { Model, metric } of models) {
      const summary = await getMetricSummary(Model, metric, month, Number(year), null);
      if (summary.mtd) {
        const snap = await KpiSnapshot.create({
          metric, month, year: Number(year),
          actual: summary.mtd.actual,
          target: summary.mtd.target,
          status: summary.mtd.status,
        });
        snapshots.push(snap);
      }
    }

    res.status(201).json(snapshots);
  } catch (err) { next(err); }
};

// ── getSnapshots ──────────────────────────────────────────────────────────────
exports.getSnapshots = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.year)     filter.year   = Number(req.query.year);
    if (req.query.metric)   filter.metric = req.query.metric.toUpperCase();
    if (req.query.location) filter.location = req.query.location;
    res.json(await KpiSnapshot.find(filter).sort({ generatedAt: -1 }));
  } catch (err) { next(err); }
};