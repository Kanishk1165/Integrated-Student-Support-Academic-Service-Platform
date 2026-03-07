/**
 * Seed script: creates departments, admin user, sample students & queries
 * Run: node seed.js
 */
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const User       = require("./models/User");
const Department = require("./models/Department");
const Query      = require("./models/Query");

const DEPARTMENTS = [
  { name: "Finance & Scholarship", code: "FIN", categories: ["Scholarship"], headEmail: "finance@university.edu" },
  { name: "Academic Office",       code: "ACA", categories: ["Attendance", "Exam", "Mentoring"], headEmail: "academic@university.edu" },
  { name: "Placement Cell",        code: "PLC", categories: ["Internship"], headEmail: "placement@university.edu" },
  { name: "Administration",        code: "ADM", categories: ["Administrative", "Other"], headEmail: "admin@university.edu" },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/issasp");
  console.log("Connected to MongoDB");

  await Promise.all([User.deleteMany(), Department.deleteMany(), Query.deleteMany()]);
  console.log("Cleared existing data");

  const departments = await Department.insertMany(DEPARTMENTS);
  console.log("✅ Departments created");

  const admin = await User.create({
    name: "Admin User", email: "admin@university.edu",
    password: "admin123", role: "admin", department: "IT",
  });

  const student = await User.create({
    name: "Kanishk Sharma", email: "kanishk@university.edu",
    password: "student123", role: "student",
    rollNumber: "21CS1165", department: "Computer Science", year: "3rd Year",
  });
  console.log("✅ Users created");
  console.log("   Admin:   admin@university.edu / admin123");
  console.log("   Student: kanishk@university.edu / student123");

  await Query.create([
    {
      title: "Scholarship disbursement delayed",
      description: "My scholarship amount for semester 5 has not been credited yet.",
      category: "Scholarship", priority: "high", status: "in-progress",
      raisedBy: student._id, department: departments[0]._id,
      responses: [{ message: "We have forwarded this to the Finance Head.", respondedBy: admin._id }],
    },
    {
      title: "Attendance shortage in Operating Systems",
      description: "I have 68% attendance in OS due to a medical emergency. Please review.",
      category: "Attendance", priority: "medium", status: "resolved",
      raisedBy: student._id, department: departments[1]._id,
      resolvedAt: new Date(),
      responses: [{ message: "Attendance has been updated after medical verification.", respondedBy: admin._id }],
    },
    {
      title: "Internship NOC letter request",
      description: "I need a No Objection Certificate for my internship at TCS starting Feb 2026.",
      category: "Internship", priority: "low", status: "open",
      raisedBy: student._id, department: departments[2]._id,
    },
  ]);
  console.log("✅ Sample queries created");

  mongoose.disconnect();
  console.log("\n🎉 Seed complete! Start the server and login.");
}

seed().catch(err => { console.error(err); process.exit(1); });
