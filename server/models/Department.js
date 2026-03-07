const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema({
  name:       { type: String, required: true, unique: true },
  code:       { type: String, required: true, unique: true },
  head:       { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  email:      { type: String },
  categories: [{ type: String }],
  isActive:   { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model("Department", departmentSchema);
