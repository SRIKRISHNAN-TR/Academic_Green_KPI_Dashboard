const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const User = require("../models/User");

// ─── Helpers ────────────────────────────────────────────────────────────────

const generateToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

const createMailTransporter = () =>
  nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

// ─── Auth Endpoints ──────────────────────────────────────────────────────────

exports.signup = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const exists = await User.findOne({ $or: [{ email }, { username }] });
    if (exists) return res.status(400).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashed, role: "user" });

    res.status(201).json({
      token: generateToken(user),
      user: { id: user._id, username: user.username, email: user.email, role: user.role },
    });
  } catch (err) { next(err); }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password are required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: "Invalid credentials" });

    res.json({
      token: generateToken(user),
      user: { id: user._id, username: user.username, email: user.email, role: user.role },
    });
  } catch (err) { next(err); }
};

// ─── Forgot Password: sends a secure reset link ──────────────────────────────

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    // Always respond the same message to prevent email enumeration
    if (!user) {
      return res.json({ message: "If that email exists, a reset link has been sent." });
    }

    // Generate a secure random token
    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    user.resetToken = hashedToken;
    user.resetTokenExpiry = expiry;
    await user.save();

    // Determine which frontend URL to use for the reset link
    let frontendUrl = "http://localhost:8080";
    const allowedUrls = (process.env.FRONTEND_URL || "http://localhost:8080").split(",");
    const origin = req.get("origin");

    // If the request came from an allowed origin, use that origin for the link
    if (origin && allowedUrls.includes(origin)) {
      frontendUrl = origin;
    } else {
      // Otherwise, use the first allowed URL
      frontendUrl = allowedUrls[0];
    }

    const resetLink = `${frontendUrl}/reset-password?token=${rawToken}&email=${encodeURIComponent(email)}`;

    const transporter = createMailTransporter();

    await transporter.sendMail({
      from: `"Academic Green KPI" <${process.env.MAIL_USER}>`,
      to: email,
      subject: "Password Reset Request – Academic Green KPI Dashboard",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px; background: #f9fafb; border-radius: 12px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="display: inline-block; background: #16a34a; border-radius: 50%; padding: 12px;">
              <span style="color: white; font-size: 24px;">🌿</span>
            </div>
            <h2 style="color: #166534; margin: 12px 0 4px;">Academic Green KPI Dashboard</h2>
          </div>

          <div style="background: white; border-radius: 8px; padding: 24px; border: 1px solid #e5e7eb;">
            <p style="margin: 0 0 12px;">Hello <strong>${user.username}</strong>,</p>
            <p style="margin: 0 0 20px; color: #4b5563;">
              We received a request to reset your password. Click the button below to set a new password.
              This link will expire in <strong>1 hour</strong>.
            </p>

            <div style="text-align: center; margin: 24px 0;">
              <a href="${resetLink}"
                 style="background: #16a34a; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">
                Reset My Password
              </a>
            </div>

            <p style="color: #6b7280; font-size: 12px; margin: 20px 0 0;">
              If you didn't request this, you can safely ignore this email. Your password will not change.<br><br>
              Or copy this link into your browser:<br>
              <a href="${resetLink}" style="color: #16a34a; word-break: break-all;">${resetLink}</a>
            </p>
          </div>
        </div>
      `,
    });

    res.json({ message: "If that email exists, a reset link has been sent." });
  } catch (err) { next(err); }
};

// ─── Reset Password: validates token and sets new password ───────────────────

exports.resetPassword = async (req, res, next) => {
  try {
    const { token, email, password } = req.body;
    if (!token || !email || !password)
      return res.status(400).json({ message: "Token, email and new password are required" });

    if (password.length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters" });

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      email,
      resetToken: hashedToken,
      resetTokenExpiry: { $gt: new Date() }, // token must not be expired
    });

    if (!user)
      return res.status(400).json({ message: "Invalid or expired reset link. Please request a new one." });

    user.password = await bcrypt.hash(password, 10);
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();

    res.json({ message: "Password reset successfully. You can now log in with your new password." });
  } catch (err) { next(err); }
};

// ─── Seed default users on first run ─────────────────────────────────────────

exports.seedAdmin = async () => {
  try {
    const adminPass = process.env.SEED_ADMIN_PASS || "admin123";
    const viewerPass = process.env.SEED_VIEWER_PASS || "viewer123";

    const adminExists = await User.findOne({ email: "adminkpi@gmail.com" });
    if (!adminExists) {
      const hashed = await bcrypt.hash(adminPass, 10);
      await User.create({ username: "Admin", email: "adminkpi@gmail.com", password: hashed, role: "admin" });
      console.log("Default admin seeded (adminkpi@gmail.com)");
    }

    const viewerExists = await User.findOne({ email: "viwerkpi@gmail.com" });
    if (!viewerExists) {
      const hashed = await bcrypt.hash(viewerPass, 10);
      await User.create({ username: "Viewer", email: "viwerkpi@gmail.com", password: hashed, role: "user" });
      console.log("Default viewer seeded (viwerkpi@gmail.com)");
    }
  } catch (err) {
    console.error("Seed error:", err.message);
  }
};