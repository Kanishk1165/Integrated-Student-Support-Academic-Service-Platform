const fallbackAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvY2xiamR6ZG96Z2x0and4b3pnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5MDYwNTgsImV4cCI6MjA4ODQ4MjA1OH0.o4TtAtdz0nFpXU2ESvuePGNk3H8GQ-cePz8BAGIDvjk";

const parseSupabaseUrlFromAnonKey = (anonKey) => {
  try {
    const payload = anonKey?.split(".")?.[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
    const decoded = JSON.parse(Buffer.from(padded, "base64").toString("utf8"));
    if (!decoded?.ref) return null;
    return `https://${decoded.ref}.supabase.co`;
  } catch {
    return null;
  }
};

const getSupabaseConfig = () => {
  const anonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || fallbackAnonKey;
  const baseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || parseSupabaseUrlFromAnonKey(anonKey);

  if (!anonKey || !baseUrl) {
    return null;
  }

  return { anonKey, baseUrl };
};

const post = async (url, anonKey, body) => {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: anonKey,
      },
      body: JSON.stringify(body),
    });
    const data = await response.json().catch(() => ({}));
    return { ok: response.ok, status: response.status, data };
  } catch (error) {
    return {
      ok: false,
      status: 502,
      data: { message: error?.message || "Failed to reach Supabase auth service." },
    };
  }
};

const signUpWithPassword = async ({ email, password, metadata = {} }) => {
  const config = getSupabaseConfig();
  if (!config) {
    return {
      ok: false,
      status: 500,
      data: { message: "Supabase is not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY." },
    };
  }
  const { anonKey, baseUrl } = config;
  const result = await post(`${baseUrl}/auth/v1/signup`, anonKey, {
    email,
    password,
    data: metadata,
  });
  return result;
};

const signInWithPassword = async ({ email, password }) => {
  const config = getSupabaseConfig();
  if (!config) {
    return {
      ok: false,
      status: 500,
      data: { message: "Supabase is not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY." },
    };
  }
  const { anonKey, baseUrl } = config;
  const result = await post(`${baseUrl}/auth/v1/token?grant_type=password`, anonKey, {
    email,
    password,
  });
  return result;
};

const updatePasswordWithAccessToken = async ({ accessToken, password }) => {
  const config = getSupabaseConfig();
  if (!config) {
    return {
      ok: false,
      status: 500,
      data: { message: "Supabase is not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY." },
    };
  }
  const { anonKey, baseUrl } = config;
  try {
    const response = await fetch(`${baseUrl}/auth/v1/user`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        apikey: anonKey,
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ password }),
    });
    const data = await response.json().catch(() => ({}));
    return { ok: response.ok, status: response.status, data };
  } catch (error) {
    return {
      ok: false,
      status: 502,
      data: { message: error?.message || "Failed to reach Supabase auth service." },
    };
  }
};

const getUserWithAccessToken = async ({ accessToken }) => {
  const config = getSupabaseConfig();
  if (!config) {
    return {
      ok: false,
      status: 500,
      data: { message: "Supabase is not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY." },
    };
  }
  const { anonKey, baseUrl } = config;
  try {
    const response = await fetch(`${baseUrl}/auth/v1/user`, {
      method: "GET",
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const data = await response.json().catch(() => ({}));
    return { ok: response.ok, status: response.status, data };
  } catch (error) {
    return {
      ok: false,
      status: 502,
      data: { message: error?.message || "Failed to reach Supabase auth service." },
    };
  }
};

module.exports = {
  signUpWithPassword,
  signInWithPassword,
  updatePasswordWithAccessToken,
  getUserWithAccessToken,
};