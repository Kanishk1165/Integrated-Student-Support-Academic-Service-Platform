/**
 * Safe admin bootstrap script (non-destructive)
 * Usage:
 *   ADMIN_EMAIL=admin@university.edu ADMIN_PASSWORD=admin123 npm run create-admin
 */
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const User = require("./models/User");

async function run() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is required");
  }

  const email = (process.env.ADMIN_EMAIL || "admin@university.edu").toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "admin123";
  const name = process.env.ADMIN_NAME || "Admin User";

  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  let user = await User.findOne({ email }).select("+password");

  if (!user) {
    user = await User.create({
      name,
      email,
      password,
      role: "admin",
      department: "IT",
      isActive: true,
    });
    console.log(`Created admin: ${email}`);
  } else {
    user.name = name;
    user.role = "admin";
    user.isActive = true;
    user.password = password;
    await user.save();
    console.log(`Updated admin: ${email}`);
  }

  await mongoose.disconnect();
  console.log("Done");
}

run().catch(async (err) => {
  console.error("create-admin failed:", err.message);
  try {
    await mongoose.disconnect();
  } catch (_) {}
  process.exit(1);
});