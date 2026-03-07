const Query = require("../models/Query");
const { sendQueryNotification } = require("../services/emailService");

// GET /api/queries
exports.getQueries = async (req, res, next) => {
  try {
    const { status, category, priority, page = 1, limit = 10 } = req.query;
    const filter = {};

    // Students only see their own queries
    if (req.user.role === "student") filter.raisedBy = req.user._id;

    if (status)   filter.status   = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;

    const skip = (page - 1) * limit;
    const [queries, total] = await Promise.all([
      Query.find(filter)
        .populate("raisedBy", "name email rollNumber")
        .populate("assignedTo", "name email")
        .populate("department", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Query.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: queries,
      pagination: { total, page: Number(page), pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/queries/:id
exports.getQueryById = async (req, res, next) => {
  try {
    const query = await Query.findById(req.params.id)
      .populate("raisedBy", "name email rollNumber department year")
      .populate("assignedTo", "name email")
      .populate("department", "name")
      .populate("responses.respondedBy", "name role");

    if (!query) return res.status(404).json({ success: false, message: "Query not found." });

    // Students can only see their own
    if (req.user.role === "student" && query.raisedBy._id.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: "Access denied." });

    res.json({ success: true, data: query });
  } catch (err) {
    next(err);
  }
};

// POST /api/queries
exports.createQuery = async (req, res, next) => {
  try {
    const { title, description, category, priority, department } = req.body;
    if (!title || !description || !category)
      return res.status(400).json({ success: false, message: "Title, description, and category are required." });

    const query = await Query.create({
      title, description, category, priority, department,
      raisedBy: req.user._id,
    });

    await query.populate("raisedBy", "name email");

    // Send email notification
    try {
      await sendQueryNotification(req.user.email, query, "created");
    } catch (e) { console.warn("Email failed:", e.message); }

    res.status(201).json({ success: true, data: query });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/queries/:id/status
exports.updateStatus = async (req, res, next) => {
  try {
    const { status, assignedTo } = req.body;
    const query = await Query.findById(req.params.id).populate("raisedBy", "email name");
    if (!query) return res.status(404).json({ success: false, message: "Query not found." });

    if (status)     query.status     = status;
    if (assignedTo) query.assignedTo = assignedTo;
    await query.save();

    // Notify student on status change
    try {
      await sendQueryNotification(query.raisedBy.email, query, "status_update");
    } catch (e) { console.warn("Email failed:", e.message); }

    res.json({ success: true, data: query });
  } catch (err) {
    next(err);
  }
};

// POST /api/queries/:id/respond
exports.addResponse = async (req, res, next) => {
  try {
    const { message, isInternal } = req.body;
    if (!message) return res.status(400).json({ success: false, message: "Message is required." });

    const query = await Query.findById(req.params.id).populate("raisedBy", "email name");
    if (!query) return res.status(404).json({ success: false, message: "Query not found." });

    query.responses.push({ message, respondedBy: req.user._id, isInternal: isInternal || false });

    // Auto set to in-progress when admin responds
    if (req.user.role !== "student" && query.status === "open") query.status = "in-progress";
    await query.save();

    await query.populate("responses.respondedBy", "name role");

    if (!isInternal) {
      try {
        await sendQueryNotification(query.raisedBy.email, query, "new_response");
      } catch (e) { console.warn("Email failed:", e.message); }
    }

    res.json({ success: true, data: query });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/queries/:id  (admin only)
exports.deleteQuery = async (req, res, next) => {
  try {
    await Query.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Query deleted." });
  } catch (err) {
    next(err);
  }
};
