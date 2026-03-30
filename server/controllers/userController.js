const { getDbClient, normalizeProfile } = require("../services/supabaseDbService");

const requireDb = (res) => {
  const db = getDbClient();
  if (!db) {
    res.status(500).json({ success: false, message: "Supabase DB client is not configured." });
    return null;
  }
  return db;
};

// GET /api/users/profile
exports.getProfile = async (req, res) => {
  res.json({ success: true, data: req.user });
};

// PATCH /api/users/profile
exports.updateProfile = async (req, res, next) => {
  try {
    const db = requireDb(res);
    if (!db) return;

    const allowed = ["name", "phone", "department", "year", "avatar"];
    const updates = {};
    for (const field of allowed) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    const payload = {
      name: updates.name,
      phone: updates.phone,
      department: updates.department,
      year: updates.year,
      avatar: updates.avatar,
    };

    Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);

    const { data, error } = await db.from("profiles").update(payload).eq("id", req.user.id).select("*").single();
    if (error) throw error;

    res.json({ success: true, data: normalizeProfile(data) });
  } catch (err) {
    next(err);
  }
};

// GET /api/users
exports.getAllUsers = async (req, res, next) => {
  try {
    const db = requireDb(res);
    if (!db) return;

    const { role, page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(Number(page) || 1, 1);
    const limitNum = Math.max(Number(limit) || 20, 1);
    const from = (pageNum - 1) * limitNum;
    const to = from + limitNum - 1;

    let q = db.from("profiles").select("*", { count: "exact" }).order("created_at", { ascending: false });
    if (role) q = q.eq("role", role);

    const { data, error, count } = await q.range(from, to);
    if (error) throw error;

    res.json({
      success: true,
      data: (data || []).map(normalizeProfile),
      pagination: { total: count || 0, page: pageNum },
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/users/:id/toggle-active
exports.toggleActive = async (req, res, next) => {
  try {
    const db = requireDb(res);
    if (!db) return;

    const { data: existing, error: fetchError } = await db
      .from("profiles")
      .select("id,is_active")
      .eq("id", req.params.id)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!existing) return res.status(404).json({ success: false, message: "User not found." });

    const { data, error } = await db
      .from("profiles")
      .update({ is_active: !existing.is_active })
      .eq("id", req.params.id)
      .select("*")
      .single();

    if (error) throw error;
    res.json({ success: true, data: normalizeProfile(data) });
  } catch (err) {
    next(err);
  }
};

// GET /api/users/pending-faculty - Get all pending faculty approvals
exports.getPendingFaculty = async (req, res, next) => {
  try {
    const db = requireDb(res);
    if (!db) return;

    const { data, error } = await db
      .from("profiles")
      .select("*")
      .eq("role", "faculty")
      .eq("approval_status", "pending")
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      data: (data || []).map(normalizeProfile),
      count: (data || []).length
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/users/faculty - Get all approved active faculty
exports.getFacultyList = async (req, res, next) => {
  try {
    const db = requireDb(res);
    if (!db) return;

    const { data, error } = await db
      .from("profiles")
      .select("id, name, email, department")
      .eq("role", "faculty")
      .eq("approval_status", "approved")
      .eq("is_active", true)
      .order("name", { ascending: true });

    if (error) throw error;

    res.json({
      success: true,
      data: data || []
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/users/:id/approve - Approve faculty account
exports.approveFaculty = async (req, res, next) => {
  try {
    const db = requireDb(res);
    if (!db) return;

    // First, check if the user exists and is pending faculty
    const { data: existing, error: fetchError } = await db
      .from("profiles")
      .select("*")
      .eq("id", req.params.id)
      .single();

    if (fetchError) throw fetchError;
    if (!existing) return res.status(404).json({ success: false, message: "Faculty not found." });
    
    if (existing.role !== "faculty") {
      return res.status(400).json({ success: false, message: "User is not a faculty member." });
    }

    if (existing.approval_status !== "pending") {
      return res.status(400).json({ success: false, message: "Faculty is not pending approval." });
    }

    // Approve the faculty
    const { data, error } = await db
      .from("profiles")
      .update({
        approval_status: "approved",
        is_active: true,
        approved_by: req.user.id,
        approved_at: new Date().toISOString(),
        rejection_reason: null // Clear any previous rejection reason
      })
      .eq("id", req.params.id)
      .select("*")
      .single();

    if (error) throw error;

    // TODO: Send approval email to faculty
    
    res.json({ 
      success: true, 
      message: "Faculty approved successfully.",
      data: normalizeProfile(data) 
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/users/:id/reject - Reject faculty account
exports.rejectFaculty = async (req, res, next) => {
  try {
    const db = requireDb(res);
    if (!db) return;

    const { rejectionReason } = req.body;
    
    if (!rejectionReason || !rejectionReason.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: "Rejection reason is required." 
      });
    }

    // First, check if the user exists and is pending faculty
    const { data: existing, error: fetchError } = await db
      .from("profiles")
      .select("*")
      .eq("id", req.params.id)
      .single();

    if (fetchError) throw fetchError;
    if (!existing) return res.status(404).json({ success: false, message: "Faculty not found." });
    
    if (existing.role !== "faculty") {
      return res.status(400).json({ success: false, message: "User is not a faculty member." });
    }

    if (existing.approval_status !== "pending") {
      return res.status(400).json({ success: false, message: "Faculty is not pending approval." });
    }

    // Increment rejection count
    const newRejectionCount = (existing.rejection_count || 0) + 1;

    // If rejection count reaches 3, we'll keep the record but it won't allow re-registration
    const { data, error } = await db
      .from("profiles")
      .update({
        approval_status: "rejected",
        is_active: false,
        approved_by: req.user.id,
        approved_at: new Date().toISOString(),
        rejection_reason: rejectionReason,
        rejection_count: newRejectionCount
      })
      .eq("id", req.params.id)
      .select("*")
      .single();

    if (error) throw error;

    // TODO: Send rejection email to faculty

    // If max attempts reached, delete the account
    if (newRejectionCount >= 3) {
      // Delete from Supabase Auth (optional - keeps audit trail in profiles table)
      // For now, we'll just mark it as rejected with count 3
      await db
        .from("profiles")
        .delete()
        .eq("id", req.params.id);

      return res.json({ 
        success: true, 
        message: "Faculty rejected. Maximum attempts reached - account deleted.",
        maxAttemptsReached: true
      });
    }
    
    res.json({ 
      success: true, 
      message: "Faculty rejected successfully.",
      data: normalizeProfile(data),
      attemptsRemaining: 3 - newRejectionCount
    });
  } catch (err) {
    next(err);
  }
};
