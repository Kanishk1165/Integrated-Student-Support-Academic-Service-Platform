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
