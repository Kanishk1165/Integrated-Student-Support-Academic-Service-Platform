const { validationResult } = require("express-validator");
const {
  signUpWithPassword,
  signInWithPassword,
  updatePasswordWithAccessToken,
  getUserWithAccessToken,
} = require("../services/supabaseAuthService");
const { getDbClient, normalizeProfile } = require("../services/supabaseDbService");

const normalizeSupabaseError = (data) =>
  data?.error_description || data?.msg || data?.message || "Authentication failed.";

const getDefaultNameFromEmail = (email) => {
  const local = String(email || "user").split("@")[0];
  return local.charAt(0).toUpperCase() + local.slice(1);
};

const pickRole = (candidateRole, email) => {
  if (["student", "admin", "faculty"].includes(candidateRole)) return candidateRole;
  const bootstrapAdminEmail = process.env.BOOTSTRAP_ADMIN_EMAIL?.toLowerCase().trim();
  if (bootstrapAdminEmail && email?.toLowerCase() === bootstrapAdminEmail) return "admin";
  return "student";
};

const ensureProfileFromSupabase = async (supabaseUser, fallback = {}) => {
  const db = getDbClient();
  if (!db) {
    throw new Error("Supabase DB client is not configured. Set SUPABASE_SERVICE_ROLE_KEY.");
  }

  const email = supabaseUser?.email || fallback.email;
  const supabaseId = supabaseUser?.id || fallback.supabaseId;
  if (!email || !supabaseId) {
    throw new Error("Supabase user is missing id/email.");
  }

  const metadata = supabaseUser?.user_metadata || {};

  const profilePayload = {
    supabase_id: supabaseId,
    email,
    name: fallback.name || metadata.name || getDefaultNameFromEmail(email),
    role: pickRole(fallback.role || metadata.role, email),
    roll_number: fallback.rollNumber || metadata.rollNumber || null,
    department: fallback.department || metadata.department || null,
    year: fallback.year || metadata.year || null,
    phone: fallback.phone || metadata.phone || null,
    is_active: true,
  };

  const { data, error } = await db
    .from("profiles")
    .upsert(profilePayload, { onConflict: "supabase_id" })
    .select("*")
    .single();

  if (error) throw error;
  return normalizeProfile(data);
};

const sendSession = (res, profile, accessToken, statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    token: accessToken,
    user: profile,
  });
};

// POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { name, email, password, role, rollNumber, department, year, phone } = req.body;

    const signup = await signUpWithPassword({
      email,
      password,
      metadata: { name, role, rollNumber, department, year, phone },
    });

    if (!signup.ok) {
      return res.status(signup.status || 400).json({
        success: false,
        message: normalizeSupabaseError(signup.data),
      });
    }

    const login = await signInWithPassword({ email, password });
    if (!login.ok) {
      return res.status(login.status || 401).json({
        success: false,
        message: normalizeSupabaseError(login.data),
      });
    }

    const supabaseUser = login.data?.user || signup.data?.user;
    const profile = await ensureProfileFromSupabase(supabaseUser, {
      name,
      role,
      rollNumber,
      department,
      year,
      phone,
      email,
      supabaseId: supabaseUser?.id,
    });

    return sendSession(res, profile, login.data?.access_token, 201);
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password required." });
    }

    const signin = await signInWithPassword({ email, password });
    if (!signin.ok) {
      return res.status(signin.status || 401).json({ success: false, message: normalizeSupabaseError(signin.data) });
    }

    const supabaseUser = signin.data?.user;
    const profile = await ensureProfileFromSupabase(supabaseUser, { email, supabaseId: supabaseUser?.id });

    if (!profile?.isActive) {
      return res.status(403).json({ success: false, message: "Account deactivated. Contact admin." });
    }

    return sendSession(res, profile, signin.data?.access_token, 200);
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/supabase-sync
exports.syncSupabaseSession = async (req, res, next) => {
  try {
    const accessToken = req.headers.authorization?.startsWith("Bearer")
      ? req.headers.authorization.split(" ")[1]
      : null;

    if (!accessToken) {
      return res.status(401).json({ success: false, message: "Supabase access token required." });
    }

    const lookup = await getUserWithAccessToken({ accessToken });
    if (!lookup.ok) {
      return res.status(lookup.status || 401).json({ success: false, message: normalizeSupabaseError(lookup.data) });
    }

    const profile = await ensureProfileFromSupabase(lookup.data);

    if (!profile?.isActive) {
      return res.status(403).json({ success: false, message: "Account deactivated. Contact admin." });
    }

    return sendSession(res, profile, accessToken, 200);
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  res.status(200).json({ success: true, user: req.user });
};

// PATCH /api/auth/update-password
exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const signin = await signInWithPassword({ email: req.user.email, password: currentPassword });
    if (!signin.ok) {
      return res.status(401).json({ success: false, message: "Current password incorrect." });
    }

    const accessToken = signin.data?.access_token;
    if (!accessToken) {
      return res.status(500).json({ success: false, message: "Unable to verify Supabase session." });
    }

    const updated = await updatePasswordWithAccessToken({ accessToken, password: newPassword });
    if (!updated.ok) {
      return res.status(updated.status || 400).json({
        success: false,
        message: normalizeSupabaseError(updated.data),
      });
    }

    return sendSession(res, req.user, accessToken, 200);
  } catch (err) {
    next(err);
  }
};
