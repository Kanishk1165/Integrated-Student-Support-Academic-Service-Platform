const Query = require("../models/Query");
const User = require("../models/User");

// GET /api/analytics/overview
exports.getOverview = async (req, res, next) => {
  try {
    const [total, open, inProgress, resolved, closed, totalStudents] = await Promise.all([
      Query.countDocuments(),
      Query.countDocuments({ status: "open" }),
      Query.countDocuments({ status: "in-progress" }),
      Query.countDocuments({ status: "resolved" }),
      Query.countDocuments({ status: "closed" }),
      User.countDocuments({ role: "student" }),
    ]);

    res.json({ success: true, data: { total, open, inProgress, resolved, closed, totalStudents } });
  } catch (err) {
    next(err);
  }
};

// GET /api/analytics/by-category
exports.getByCategory = async (req, res, next) => {
  try {
    const data = await Query.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// GET /api/analytics/response-time  — avg hours to resolve per department
exports.getResponseTime = async (req, res, next) => {
  try {
    const data = await Query.aggregate([
      { $match: { status: "resolved", resolvedAt: { $exists: true } } },
      {
        $project: {
          hoursToResolve: {
            $divide: [{ $subtract: ["$resolvedAt", "$createdAt"] }, 3600000],
          },
          category: 1,
        },
      },
      {
        $group: {
          _id: "$category",
          avgHours: { $avg: "$hoursToResolve" },
          count: { $sum: 1 },
        },
      },
      { $sort: { avgHours: 1 } },
    ]);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// GET /api/analytics/monthly  — queries raised per month (last 6 months)
exports.getMonthly = async (req, res, next) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const data = await Query.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year:  { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};
