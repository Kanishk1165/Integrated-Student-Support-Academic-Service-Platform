const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { validationResult } = require("express-validator");
const User = require("../models/User");
const {
  signUpWithPassword,
  signInWithPassword,
  updatePasswordWithAccessToken,
  getUserWithAccessToken,
} = require("../services/supabaseAuthService");

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

const sendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  user.password = undefined;
  res.status(statusCode).json({ success: true, token, user });
};

const normalizeSupabaseError = (data) =>
  data?.error_description || data?.msg || data?.message || "Authentication failed.";

const getDefaultNameFromEmail = (email) => {
  const local = String(email || "user").split("@")[0];
  return local.charAt(0).toUpperCase() + local.slice(1);
};

const generateFallbackPassword = () => `sb_${crypto.randomBytes(12).toString("hex")}`;

const upsertLocalUserFromSupabase = async (supabaseUser) => {
  const email = supabaseUser?.email;
  if (!email) return null;

  const roleFromMetadata = supabaseUser?.user_metadata?.role;
  const bootstrapAdminEmail = process.env.BOOTSTRAP_ADMIN_EMAIL?.toLowerCase().trim();
  const role = ["student", "admin", "faculty"].includes(roleFromMetadata)
    ? roleFromMetadata
    : bootstrapAdminEmail && email.toLowerCase() === bootstrapAdminEmail
      ? "admin"
      : "student";
  const supabaseId = supabaseUser?.id || null;

  let user = await User.findOne({ $or: [{ email }, { supabaseId }] }).select("+password");
  if (!user) {
    user = await User.create({
      name: supabaseUser?.user_metadata?.name || getDefaultNameFromEmail(email),
      email,
      password: generateFallbackPassword(),
      role,
      rollNumber: supabaseUser?.user_metadata?.rollNumber,
      department: supabaseUser?.user_metadata?.department,
      year: supabaseUser?.user_metadata?.year,
      phone: supabaseUser?.user_metadata?.phone,
      supabaseId,
    });
    return user;
  }

  let changed = false;
  if (supabaseId && user.supabaseId !== supabaseId) {
    user.supabaseId = supabaseId;
    changed = true;
  }
  if (!user.name && supabaseUser?.user_metadata?.name) {
    user.name = supabaseUser.user_metadata.name;
    changed = true;
  }
  if (changed) await user.save();
  return user;
};

// POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { name, email, password, role, rollNumber, department, year, phone } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ success: false, message: "Email already registered." });

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

    const supabaseId = signup.data?.user?.id || null;

    const user = await User.create({
      name,
      email,
      password,
      role,
      rollNumber,
      department,
      year,
      phone,
      supabaseId,
    });
    sendToken(user, 201, res);
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: "Email and password required." });

    const signin = await signInWithPassword({ email, password });
    if (!signin.ok) {
      return res.status(signin.status || 401).json({ success: false, message: normalizeSupabaseError(signin.data) });
    }

    const supabaseUser = signin.data?.user;
    const user = await upsertLocalUserFromSupabase(supabaseUser);
    if (!user) return res.status(400).json({ success: false, message: "Supabase user email missing." });

    if (!user.isActive)
      return res.status(403).json({ success: false, message: "Account deactivated. Contact admin." });

    sendToken(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/supabase-sync
exports.syncSupabaseSession = async (req, res, next) => {
  try {
    let accessToken;
    if (req.headers.authorization?.startsWith("Bearer")) {
      accessToken = req.headers.authorization.split(" ")[1];
    }

    if (!accessToken) {
      return res.status(401).json({ success: false, message: "Supabase access token required." });
    }

    const lookup = await getUserWithAccessToken({ accessToken });
    if (!lookup.ok) {
      return res.status(lookup.status || 401).json({ success: false, message: normalizeSupabaseError(lookup.data) });
    }

    const user = await upsertLocalUserFromSupabase(lookup.data);
    if (!user) return res.status(400).json({ success: false, message: "Supabase user email missing." });

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: "Account deactivated. Contact admin." });
    }

    sendToken(user, 200, res);
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

    const user = await User.findById(req.user._id).select("+password");
    if (!user) return res.status(404).json({ success: false, message: "User not found." });

    user.password = newPassword;
    await user.save();
    sendToken(user, 200, res);
  } catch (err) {
    next(err);
  }
};
