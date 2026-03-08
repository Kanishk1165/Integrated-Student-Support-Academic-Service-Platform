const { getDbClient, normalizeDepartment } = require("../services/supabaseDbService");

const requireDb = (res) => {
  const db = getDbClient();
  if (!db) {
    res.status(500).json({ success: false, message: "Supabase DB client is not configured." });
    return null;
  }
  return db;
};

exports.getAll = async (req, res, next) => {
  try {
    const db = requireDb(res);
    if (!db) return;

    const { data, error } = await db
      .from("departments")
      .select("*")
      .eq("is_active", true)
      .order("name", { ascending: true });

    if (error) throw error;
    res.json({ success: true, data: (data || []).map(normalizeDepartment) });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const db = requireDb(res);
    if (!db) return;

    const payload = {
      name: req.body.name,
      code: req.body.code,
      description: req.body.description,
      is_active: req.body.isActive !== undefined ? Boolean(req.body.isActive) : true,
    };

    const { data, error } = await db.from("departments").insert(payload).select("*").single();
    if (error) throw error;

    res.status(201).json({ success: true, data: normalizeDepartment(data) });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const db = requireDb(res);
    if (!db) return;

    const payload = {
      name: req.body.name,
      code: req.body.code,
      description: req.body.description,
      is_active: req.body.isActive,
    };
    Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);

    const { data, error } = await db
      .from("departments")
      .update(payload)
      .eq("id", req.params.id)
      .select("*")
      .single();

    if (error) throw error;
    res.json({ success: true, data: normalizeDepartment(data) });
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const db = requireDb(res);
    if (!db) return;

    const { error } = await db.from("departments").delete().eq("id", req.params.id);
    if (error) throw error;

    res.json({ success: true, message: "Department deleted." });
  } catch (err) {
    next(err);
  }
};
