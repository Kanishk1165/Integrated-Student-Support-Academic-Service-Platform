const Department = require("../models/Department");

exports.getAll = async (req, res, next) => {
  try {
    const depts = await Department.find({ isActive: true }).sort("name");
    res.json({ success: true, data: depts });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const dept = await Department.create(req.body);
    res.status(201).json({ success: true, data: dept });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const dept = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: dept });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    await Department.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Department deleted." });
  } catch (err) { next(err); }
};
