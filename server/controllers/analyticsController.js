const { getDbClient } = require("../services/supabaseDbService");

const requireDb = (res) => {
  const db = getDbClient();
  if (!db) {
    res.status(500).json({ success: false, message: "Supabase DB client is not configured." });
    return null;
  }
  return db;
};

const countByStatus = async (db, status, userId) => {
  let q = db.from("queries").select("id", { count: "exact", head: true });
  if (status) q = q.eq("status", status);
  if (userId) q = q.eq("assigned_to", userId);
  const { count, error } = await q;
  if (error) throw error;
  return count || 0;
};

// GET /api/analytics/overview
exports.getOverview = async (req, res, next) => {
  try {
    const db = requireDb(res);
    if (!db) return;

    const isFaculty = req.user.role === "faculty";
    const userId = isFaculty ? req.user.id : null;

    const [total, open, inProgress, resolved, closed, totalStudents] = await Promise.all([
      countByStatus(db, null, userId),
      countByStatus(db, "open", userId),
      countByStatus(db, "in-progress", userId),
      countByStatus(db, "resolved", userId),
      countByStatus(db, "closed", userId),
      (async () => {
        if (isFaculty) return 0; // Faculty don't need total students count in their overview typically
        const { count, error } = await db
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .eq("role", "student");
        if (error) throw error;
        return count || 0;
      })(),
    ]);

    res.json({ success: true, data: { total, open, inProgress, resolved, closed, totalStudents } });
  } catch (err) {
    next(err);
  }
};

// GET /api/analytics/by-category
exports.getByCategory = async (req, res, next) => {
  try {
    const db = requireDb(res);
    if (!db) return;

    const { data, error } = await db.from("queries").select("category");
    if (error) throw error;

    const map = new Map();
    for (const row of data || []) {
      map.set(row.category, (map.get(row.category) || 0) + 1);
    }

    const result = [...map.entries()]
      .map(([category, count]) => ({ _id: category, count }))
      .sort((a, b) => b.count - a.count);

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

// GET /api/analytics/response-time
exports.getResponseTime = async (req, res, next) => {
  try {
    const db = requireDb(res);
    if (!db) return;

    const { data, error } = await db
      .from("queries")
      .select("category,created_at,resolved_at,status")
      .eq("status", "resolved")
      .not("resolved_at", "is", null);

    if (error) throw error;

    const buckets = new Map();
    for (const row of data || []) {
      const created = new Date(row.created_at).getTime();
      const resolved = new Date(row.resolved_at).getTime();
      if (Number.isNaN(created) || Number.isNaN(resolved) || resolved < created) continue;

      const hours = (resolved - created) / 3600000;
      const key = row.category || "Other";
      const entry = buckets.get(key) || { _id: key, totalHours: 0, count: 0 };
      entry.totalHours += hours;
      entry.count += 1;
      buckets.set(key, entry);
    }

    const result = [...buckets.values()]
      .map((x) => ({ _id: x._id, avgHours: x.count ? x.totalHours / x.count : 0, count: x.count }))
      .sort((a, b) => a.avgHours - b.avgHours);

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

// GET /api/analytics/monthly
exports.getMonthly = async (req, res, next) => {
  try {
    const db = requireDb(res);
    if (!db) return;

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const { data, error } = await db
      .from("queries")
      .select("created_at")
      .gte("created_at", sixMonthsAgo.toISOString())
      .order("created_at", { ascending: true });

    if (error) throw error;

    const map = new Map();
    for (const row of data || []) {
      const date = new Date(row.created_at);
      const year = date.getUTCFullYear();
      const month = date.getUTCMonth() + 1;
      const key = `${year}-${month}`;
      map.set(key, (map.get(key) || 0) + 1);
    }

    const result = [...map.entries()]
      .map(([key, count]) => {
        const [year, month] = key.split("-").map(Number);
        return { _id: { year, month }, count };
      })
      .sort((a, b) => (a._id.year - b._id.year) || (a._id.month - b._id.month));

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};
