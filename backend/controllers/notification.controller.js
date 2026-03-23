const nodemailer = require("nodemailer");
const Notification = require("../models/Notification");

// ─── Mail helper ─────────────────────────────────────────────────────────────

const createMailTransporter = () =>
  nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS },
  });

const sendAdminKpiAlert = async ({ metric, label, location, actual, target, month, year }) => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) return;

    const transporter = createMailTransporter();
    const pct = target > 0 ? ((actual / target) * 100).toFixed(1) : "N/A";
    const direction = metric === "WASTE"
      ? (actual < target ? "below" : "above")
      : (actual > target ? "above" : "below");
    const statusColor = "#dc2626";

    await transporter.sendMail({
      from: `"Academic Green KPI Alerts" <${process.env.MAIL_USER}>`,
      to: adminEmail,
      subject: `[KPI Alert] ⚠️ ${label} exceeds target – ${location || "All Locations"} (${month} ${year})`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px;background:#f9fafb;border-radius:12px;">
          <div style="text-align:center;margin-bottom:20px;">
            <div style="display:inline-block;background:#16a34a;border-radius:50%;padding:10px;">
              <span style="color:white;font-size:22px;">🌿</span>
            </div>
            <h2 style="color:#166534;margin:10px 0 2px;">Academic Green KPI Dashboard</h2>
            <p style="color:#6b7280;margin:0;font-size:13px;">KPI Threshold Alert</p>
          </div>
          <div style="background:white;border-radius:8px;padding:24px;border:1px solid #e5e7eb;">
            <div style="background:${statusColor};color:white;border-radius:6px;padding:10px 16px;margin-bottom:20px;text-align:center;font-weight:bold;font-size:16px;">
              ⚠️ TARGET EXCEEDED
            </div>
            <table style="width:100%;border-collapse:collapse;font-size:14px;">
              <tr style="background:#f0fdf4;">
                <td style="padding:10px 12px;font-weight:600;color:#374151;border-bottom:1px solid #e5e7eb;">Metric</td>
                <td style="padding:10px 12px;color:#111827;border-bottom:1px solid #e5e7eb;">${label}</td>
              </tr>
              <tr>
                <td style="padding:10px 12px;font-weight:600;color:#374151;border-bottom:1px solid #e5e7eb;">Location</td>
                <td style="padding:10px 12px;color:#111827;border-bottom:1px solid #e5e7eb;">${location || "All Locations"}</td>
              </tr>
              <tr style="background:#f0fdf4;">
                <td style="padding:10px 12px;font-weight:600;color:#374151;border-bottom:1px solid #e5e7eb;">Period</td>
                <td style="padding:10px 12px;color:#111827;border-bottom:1px solid #e5e7eb;">${month} ${year}</td>
              </tr>
              <tr>
                <td style="padding:10px 12px;font-weight:600;color:#374151;border-bottom:1px solid #e5e7eb;">Actual Value</td>
                <td style="padding:10px 12px;color:${statusColor};font-weight:bold;border-bottom:1px solid #e5e7eb;">${actual.toLocaleString()}</td>
              </tr>
              <tr style="background:#f0fdf4;">
                <td style="padding:10px 12px;font-weight:600;color:#374151;border-bottom:1px solid #e5e7eb;">Target Value</td>
                <td style="padding:10px 12px;color:#111827;border-bottom:1px solid #e5e7eb;">${target.toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding:10px 12px;font-weight:600;color:#374151;">Usage %</td>
                <td style="padding:10px 12px;color:${statusColor};font-weight:bold;">${pct}% of target (${direction} target)</td>
              </tr>
            </table>
            <p style="color:#6b7280;font-size:12px;margin:20px 0 0;border-top:1px solid #e5e7eb;padding-top:16px;">
              Log in to the KPI Dashboard to review this alert and mark it as resolved once corrective action has been taken.
            </p>
          </div>
        </div>
      `,
    });
  } catch (err) {
    console.error("Admin KPI alert email error:", err.message);
  }
};

// ─── API Routes ───────────────────────────────────────────────────────────────

exports.getAll = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.read === "false") filter.read = false;
    if (req.query.read === "true") filter.read = true;
    if (req.query.resolved === "false") filter.resolved = false;
    if (req.query.resolved === "true") filter.resolved = true;
    if (req.query.kpi) filter.kpi = req.query.kpi.toUpperCase();
    const notifications = await Notification.find(filter).sort({ createdAt: -1 }).limit(200);
    res.json(notifications);
  } catch (err) { next(err); }
};

exports.getUnreadCount = async (req, res, next) => {
  try {
    const count = await Notification.countDocuments({ read: false });
    res.json({ count });
  } catch (err) { next(err); }
};

exports.markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id, { read: true }, { new: true }
    );
    if (!notification) return res.status(404).json({ message: "Notification not found" });
    res.json(notification);
  } catch (err) { next(err); }
};

exports.markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ read: false }, { read: true });
    res.json({ message: "All notifications marked as read" });
  } catch (err) { next(err); }
};

// Toggle resolved status (admin only)
exports.toggleResolved = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ message: "Notification not found" });

    notification.resolved = !notification.resolved;
    notification.resolvedAt = notification.resolved ? new Date() : null;
    if (notification.resolved) notification.read = true; // auto-read when resolved
    await notification.save();
    res.json(notification);
  } catch (err) { next(err); }
};

// Delete a notification (admin only)
exports.deleteOne = async (req, res, next) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);
    if (!notification) return res.status(404).json({ message: "Notification not found" });
    res.json({ message: "Deleted" });
  } catch (err) { next(err); }
};

// ─── Internal: alert on KPI breach ───────────────────────────────────────────

exports.checkAndCreateAlert = async (metric, data) => {
  try {
    const { actual, target, location, month, year } = data;
    if (!target || target === 0) return;

    const kpiLabels = { ENERGY: "Electricity", WATER: "Water", WASTE: "Waste Diversion" };
    const label = kpiLabels[metric] || metric;

    let isOverTarget = false;
    if (metric === "WASTE") {
      isOverTarget = actual < target;
    } else {
      isOverTarget = actual > target;
    }

    if (isOverTarget) {
      const pct = ((actual / target) * 100).toFixed(1);
      const overBy = metric === "WASTE"
        ? `${(target - actual).toFixed(1)} % below diversion target`
        : `${(actual - target).toLocaleString()} units over target (${pct}% of target)`;

      await Notification.create({
        type: "warning",
        title: `${label} target exceeded at ${location || "Unknown location"}`,
        message: `${location || "Unknown location"} recorded ${actual.toLocaleString()} vs target of ${target.toLocaleString()} for ${month} ${year}. ${overBy}.`,
        kpi: metric,
        location: location || "",
        actualValue: actual,
        targetValue: target,
        read: false,
        resolved: false,
      });

      await sendAdminKpiAlert({ metric, label, location, actual, target, month, year });
    }
  } catch (err) {
    console.error("Notification creation error:", err.message);
  }
};
