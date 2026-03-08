const { getUserWithAccessToken } = require("../services/supabaseAuthService");
const { getDbClient, normalizeProfile } = require("../services/supabaseDbService");

exports.protect = async (req, res, next) => {
  const token = req.headers.authorization?.startsWith("Bearer")
    ? req.headers.authorization.split(" ")[1]
    : null;

  if (!token) {
    return res.status(401).json({ success: false, message: "Not authenticated. Please login." });
  }

  try {
    const lookup = await getUserWithAccessToken({ accessToken: token });
    if (!lookup.ok || !lookup.data?.id) {
      return res.status(401).json({ success: false, message: "Invalid or expired token." });
    }

    const db = getDbClient();
    if (!db) {
      return res.status(500).json({ success: false, message: "Supabase DB client is not configured." });
    }

    const { data, error } = await db
      .from("profiles")
      .select("*")
      .eq("supabase_id", lookup.data.id)
      .maybeSingle();

    if (error) throw error;
    if (!data || !data.is_active) {
      return res.status(401).json({ success: false, message: "User not found or deactivated." });
    }

    req.user = normalizeProfile(data);
    req.accessToken = token;
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Invalid or expired token." });
  }
};

exports.authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: `Access denied. Requires: ${roles.join(", ")}`,
    });
  }
  next();
};
