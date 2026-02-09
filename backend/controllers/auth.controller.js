const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
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

// Seed default users on first run
exports.seedAdmin = async () => {
  try {
    // Seed Admin
    const adminExists = await User.findOne({ email: "adminkpi@gmail.com" });
    if (!adminExists) {
      const hashed = await bcrypt.hash("admin123", 10);
      await User.create({ username: "Admin", email: "adminkpi@gmail.com", password: hashed, role: "admin" });
      console.log("Default admin seeded (adminkpi@gmail.com / admin123)");
    }
  } catch (err) {
    console.error("Admin seed error:", err.message);
  }
};