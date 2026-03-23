/**
 * Demo Data Seed Script
 * Uses real campus locations; actuals are mostly UNDER target so the
 * campus-wide aggregate dashboard looks healthy (GREEN/YELLOW) with
 * only a couple of locations genuinely struggling.
 * Run: node seed.js
 */

require("dotenv").config();
const mongoose = require("mongoose");

const Energy = require("./models/Energy");
const Water  = require("./models/Water");
const Waste  = require("./models/Waste");
const Target = require("./models/Target");

// ─── Locations (mirrors frontend/src/lib/locations.ts) ───────────────────────
const ALL_LOCATIONS = [
  "Boys Hostel - Sapphire",
  "Boys Hostel - Emerald",
  "Boys Hostel - Ruby",
  "Boys Hostel - Diamond",
  "Boys Hostel - Coral",
  "Boys Hostel - Pearl",
  "Girls Hostel - Ganga",
  "Girls Hostel - Yamuna",
  "Girls Hostel - Narmadha",
  "Girls Hostel - Cauvery",
  "Girls Hostel - North Bhavani",
  "Girls Hostel - South Bhavani",
  "Girls Hostel - Old Bhavani",
  "Academic Blocks - Applied Science (AS)",
  "Academic Blocks - Industry Block (IB)",
  "Academic Blocks - Sun Flower Block",
  "Academic Blocks - School of Mechanical",
  "Academic Blocks - Research Park",
];

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

// ─── Base targets per location ────────────────────────────────────────────────
function getBaseTargets(location) {
  if (location.startsWith("Boys Hostel"))  return { energy: 8500,  water: 420, waste: 68 };
  if (location.startsWith("Girls Hostel")) return { energy: 7800,  water: 390, waste: 70 };
  const acad = {
    "Applied Science (AS)":  { energy: 14000, water: 280, waste: 75 },
    "Industry Block (IB)":   { energy: 12500, water: 220, waste: 72 },
    "Sun Flower Block":      { energy: 9000,  water: 190, waste: 74 },
    "School of Mechanical":  { energy: 11000, water: 210, waste: 70 },
    "Research Park":         { energy: 10000, water: 200, waste: 76 },
  };
  const short = location.replace("Academic Blocks - ", "");
  return acad[short] || { energy: 10000, water: 200, waste: 72 };
}

// ─── Profiles: mostly efficient/average so aggregate is GREEN ─────────────────
// Only 2–3 locations are "struggling" to keep dashboard interesting
const PROFILES = {
  // Boys Hostels — mostly efficient/average
  "Boys Hostel - Sapphire":        "average",
  "Boys Hostel - Emerald":         "efficient",
  "Boys Hostel - Ruby":            "efficient",
  "Boys Hostel - Diamond":         "efficient",
  "Boys Hostel - Coral":           "struggling",   // ← one red hostel
  "Boys Hostel - Pearl":           "efficient",
  // Girls Hostels — mostly efficient
  "Girls Hostel - Ganga":          "efficient",
  "Girls Hostel - Yamuna":         "average",
  "Girls Hostel - Narmadha":       "efficient",
  "Girls Hostel - Cauvery":        "average",
  "Girls Hostel - North Bhavani":  "efficient",
  "Girls Hostel - South Bhavani":  "efficient",
  "Girls Hostel - Old Bhavani":    "average",
  // Academic Blocks — mostly average/efficient
  "Academic Blocks - Applied Science (AS)":  "struggling",  // ← one red block
  "Academic Blocks - Industry Block (IB)":   "average",
  "Academic Blocks - Sun Flower Block":      "efficient",
  "Academic Blocks - School of Mechanical":  "average",
  "Academic Blocks - Research Park":         "efficient",
};

// Multiplier ranges — efficient stays well under target
const MULTIPLIERS = {
  efficient:  { energy: [0.68, 0.90], water: [0.70, 0.90], waste: [1.02, 1.20] },
  average:    { energy: [0.88, 1.02], water: [0.85, 1.00], waste: [0.92, 1.08] },
  struggling: { energy: [1.10, 1.28], water: [1.08, 1.22], waste: [0.62, 0.86] },
};

function getMultiplier(profile, metric) {
  const [lo, hi] = MULTIPLIERS[profile][metric];
  return lo + Math.random() * (hi - lo);
}

// Seasonal factor — energy/water higher on summer (May–Aug) and Jan (exam)
function seasonal(mi, metric) {
  if (metric === "waste") return 1;
  const s = [1.10, 1.04, 1.00, 1.01, 1.14, 1.22, 1.20, 1.13, 1.04, 0.97, 1.06, 1.12];
  return s[mi];
}

function calcStatus(actual, target, metric) {
  if (metric === "WASTE") {
    if (actual >= target)       return "GREEN";
    if (actual >= target * 0.9) return "YELLOW";
    return "RED";
  }
  if (actual <= target)        return "GREEN";
  if (actual <= target * 1.1)  return "YELLOW";
  return "RED";
}

// ─── Seed ─────────────────────────────────────────────────────────────────────
async function seed() {
  console.log("Connecting to MongoDB…");
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected.\n");

  console.log("⚠  Clearing Energy, Water, Waste, Target…");
  await Promise.all([
    Energy.deleteMany({}),
    Water.deleteMany({}),
    Waste.deleteMany({}),
    Target.deleteMany({}),
  ]);
  console.log("   Done.\n");

  const years = [2025, 2026];
  const eRows = [], wRows = [], waRows = [], tRows = [];

  for (const year of years) {
    const months = year === 2026 ? MONTHS.slice(0, 3) : MONTHS;

    for (const location of ALL_LOCATIONS) {
      const base    = getBaseTargets(location);
      const profile = PROFILES[location] || "average";

      // Annual targets (stored once per year per location per metric)
      tRows.push(
        { metric: "ENERGY", year, targetValue: base.energy * 12,  unit: "kWh", location },
        { metric: "WATER",  year, targetValue: base.water  * 12,  unit: "m³",  location },
        { metric: "WASTE",  year, targetValue: base.waste,        unit: "%",   location },
      );

      for (const [mi, month] of months.entries()) {
        // Energy
        const eT = Math.round(base.energy * seasonal(mi, "energy"));
        const eA = Math.round(eT * getMultiplier(profile, "energy"));
        eRows.push({ month, year, actual: eA, target: eT, unit: "kWh", source: "Seed", location, status: calcStatus(eA, eT, "ENERGY") });

        // Water
        const wT = Math.round(base.water * seasonal(mi, "water"));
        const wA = Math.round(wT * getMultiplier(profile, "water"));
        wRows.push({ month, year, actual: wA, target: wT, unit: "m³", source: "Seed", location, status: calcStatus(wA, wT, "WATER") });

        // Waste
        const waT = base.waste;
        const waA = Math.min(100, Math.max(10, Math.round(waT * getMultiplier(profile, "waste"))));
        waRows.push({ month, year, actual: waA, target: waT, unit: "%", source: "Seed", location, status: calcStatus(waA, waT, "WASTE") });
      }
    }
  }

  await Energy.insertMany(eRows);  console.log(`✅ Energy  : ${eRows.length}`);
  await Water.insertMany(wRows);   console.log(`✅ Water   : ${wRows.length}`);
  await Waste.insertMany(waRows);  console.log(`✅ Waste   : ${waRows.length}`);
  await Target.insertMany(tRows);  console.log(`✅ Targets : ${tRows.length}`);

  // Quick sanity: show March 2026 campus-wide energy aggregate
  const check = await Energy.aggregate([
    { $match: { month: "March", year: 2026 } },
    { $group: { _id: null, totalActual: { $sum: "$actual" }, totalTarget: { $sum: "$target" } } },
  ]);
  if (check[0]) {
    const { totalActual, totalTarget } = check[0];
    const pct = ((totalActual / totalTarget) * 100).toFixed(1);
    const status = totalActual <= totalTarget ? "✅ GREEN" : totalActual <= totalTarget * 1.1 ? "🟡 YELLOW" : "🔴 RED";
    console.log(`\n📊 March 2026 campus-wide Energy: ${totalActual.toLocaleString()} / ${totalTarget.toLocaleString()} kWh (${pct}%) → ${status}`);
  }

  console.log("\n🌿 Done! Refresh the dashboard.");
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => { console.error("Seed failed:", err.message); process.exit(1); });
