require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./models/User");

async function seedUsers() {
  console.log("Connecting to:", process.env.MONGO_URI);
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected.\n");

  const users = [
    { username: "Admin",  email: "adminkpi@gmail.com",  password: process.env.SEED_ADMIN_PASS  || "admin123",  role: "admin" },
    { username: "Viewer", email: "viwerkpi@gmail.com",  password: process.env.SEED_VIEWER_PASS || "viewer123", role: "user"  },
  ];

  for (const u of users) {
    const exists = await User.findOne({ email: u.email });
    if (exists) {
      console.log(`⚠  ${u.email} already exists — skipping`);
    } else {
      const hashed = await bcrypt.hash(u.password, 10);
      await User.create({ username: u.username, email: u.email, password: hashed, role: u.role });
      console.log(`✅ Created ${u.role}: ${u.email} / ${u.password}`);
    }
  }

  const all = await User.find({}, "username email role");
  console.log("\n📋 All users in DB:");
  all.forEach(u => console.log(`   [${u.role}] ${u.username} — ${u.email}`));

  await mongoose.disconnect();
  console.log("\n✅ Done!");
  process.exit(0);
}

seedUsers().catch(err => { console.error("Failed:", err.message); process.exit(1); });

