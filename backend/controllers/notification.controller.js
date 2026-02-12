
const Notification = require("../models/Notification");

exports.getAll = async (req, res) => {
  try {
    const filter = {};
    if (req.query.read === "false") filter.read = false;
    if (req.query.read === "true") filter.read = true;
    const notifications = await Notification.find(filter).sort({ createdAt: -1 }).limit(50);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({ read: false });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByIdAndUpdate(id, { read: true }, { new: true });
    if (!notification) return res.status(404).json({ message: "Notification not found" });
    res.json(notification);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ read: false }, { read: true });
    res.json({ message: "All notifications marked as read" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Called internally when data is created - checks if usage > target
exports.checkAndCreateAlert = async (metric, data) => {
  try {
    const { actual, target, location, month, year } = data;
    const kpiLabels = { ENERGY: "Electricity", WATER: "Water", WASTE: "Waste" };
    const label = kpiLabels[metric] || metric;

    let isOverTarget = false;
    if (metric === "WASTE") {
      isOverTarget = actual < target; // For waste, lower diversion is bad
    } else {
      isOverTarget = actual > target; // For energy/water, higher usage is bad
    }

    if (isOverTarget && target > 0) {
      await Notification.create({
        type: "warning",
        title: `${label} usage exceeds target`,
        message: `${location || "Unknown location"}: Actual ${actual.toLocaleString()} vs Target ${target.toLocaleString()} for ${month} ${year}.`,
        kpi: metric,
        location: location || "",
        actualValue: actual,
        targetValue: target,
        read: false,
      });
    }
  } catch (err) {
    console.error("Notification creation error:", err.message);
  }
};
