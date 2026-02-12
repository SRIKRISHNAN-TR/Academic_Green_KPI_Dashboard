const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const User = require("../models/User");

const generateToken = (user) =>
  jwt.sign({ id: user._id, role: user.role, username: user.username }, process.env.JWT_SECRET, { expiresIn: "7d" });

exports.signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) return res.status(400).json({ message: "All fields are required" });

    const exists = await User.findOne({ $or: [{ email }, { username }] });
    if (exists) return res.status(400).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashed, role: "user" });

    res.status(201).json({ token: generateToken(user), user: { id: user._id, username: user.username, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: "Invalid credentials" });

    res.json({ token: generateToken(user), user: { id: user._id, username: user.username, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "No account found with that email" });

    // Generate a temporary password
    const tempPassword = crypto.randomBytes(4).toString("hex"); // 8-char random string
    const hashed = await bcrypt.hash(tempPassword, 10);
    user.password = hashed;
    await user.save();

    // Send email
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: email,
      subject: "Academic Green KPI - Password Reset",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #16a34a;">Academic Green KPI Dashboard</h2>
          <p>Hello <strong>${user.username}</strong>,</p>
          <p>Your password has been reset. Use the temporary password below to log in:</p>
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; text-align: center; margin: 16px 0;">
            <code style="font-size: 24px; font-weight: bold; color: #166534;">${tempPassword}</code>
          </div>
          <p>Please change your password after logging in.</p>
          <p style="color: #6b7280; font-size: 12px;">If you didn't request this, please contact your administrator.</p>
        </div>
      `,
    });

    res.json({ message: "Temporary password sent to your email" });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Failed to send email. Please contact admin." });
  }
};

// Seed default users on first run
exports.seedAdmin = async () => {
  try {
    const adminExists = await User.findOne({ email: "adminkpi@gmail.com" });
    if (!adminExists) {
      const hashed = await bcrypt.hash("admin123", 10);
      await User.create({ username: "Admin", email: "adminkpi@gmail.com", password: hashed, role: "admin" });
      console.log("Default admin seeded (adminkpi@gmail.com / admin123)");
    }

    const viewerExists = await User.findOne({ email: "viwerkpi@gmail.com" });
    if (!viewerExists) {
      const hashed = await bcrypt.hash("viwer123", 10);
      await User.create({ username: "Viewer", email: "viwerkpi@gmail.com", password: hashed, role: "user" });
      console.log("Default viewer seeded (viwerkpi@gmail.com / viwer123)");
    }
  } catch (err) {
    console.error("Seed error:", err.message);
  }
};