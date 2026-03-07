const User = require("../models/User");

// GET /api/users/profile
exports.getProfile = async (req, res) => {
  res.json({ success: true, data: req.user });
};

// PATCH /api/users/profile
exports.updateProfile = async (req, res, next) => {
  try {
    const allowed = ["name", "phone", "department", "year", "profilePic"];
    const updates = {};
    allowed.forEach(field => { if (req.body[field] !== undefined) updates[field] = req.body[field]; });

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

// GET /api/users  (admin only)
exports.getAllUsers = async (req, res, next) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (role) filter.role = role;

    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit)),
      User.countDocuments(filter),
    ]);
    res.json({ success: true, data: users, pagination: { total, page: Number(page) } });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/users/:id/toggle-active  (admin only)
exports.toggleActive = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found." });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};
