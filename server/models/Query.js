const mongoose = require("mongoose");

const responseSchema = new mongoose.Schema({
  message:     { type: String, required: true },
  respondedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  isInternal:  { type: Boolean, default: false },
}, { timestamps: true });

const querySchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category:    { type: String, required: true, enum: ["Scholarship","Attendance","Exam","Internship","Mentoring","Library","Hostel","Fee","Other"] },
  status:      { type: String, enum: ["open","in-progress","resolved","closed"], default: "open" },
  priority:    { type: String, enum: ["low","medium","high"], default: "medium" },
  raisedBy:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  assignedTo:  { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  department:  { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
  responses:   [responseSchema],
  attachments: [{ type: String }],
  resolvedAt:  { type: Date },
  closedAt:    { type: Date },
}, { timestamps: true });

// Auto-set resolvedAt
querySchema.pre("save", function (next) {
  if (this.isModified("status")) {
    if (this.status === "resolved") this.resolvedAt = new Date();
    if (this.status === "closed")   this.closedAt   = new Date();
  }
  next();
});

module.exports = mongoose.model("Query", querySchema);
