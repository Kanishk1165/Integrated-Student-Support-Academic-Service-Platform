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
  const anonKey = process.env.SUPABASE_ANON_KEY;
  const baseUrl = process.env.SUPABASE_URL || parseSupabaseUrlFromAnonKey(anonKey);

  if (!anonKey || !baseUrl) {
    throw new Error("Supabase is not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY.");
  }

  return { anonKey, baseUrl };
};

const post = async (url, anonKey, body) => {
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
};

const signUpWithPassword = async ({ email, password, metadata = {} }) => {
  const { anonKey, baseUrl } = getSupabaseConfig();
  const result = await post(`${baseUrl}/auth/v1/signup`, anonKey, {
    email,
    password,
    data: metadata,
  });
  return result;
};

const signInWithPassword = async ({ email, password }) => {
  const { anonKey, baseUrl } = getSupabaseConfig();
  const result = await post(`${baseUrl}/auth/v1/token?grant_type=password`, anonKey, {
    email,
    password,
  });
  return result;
};

const updatePasswordWithAccessToken = async ({ accessToken, password }) => {
  const { anonKey, baseUrl } = getSupabaseConfig();
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
};

const getUserWithAccessToken = async ({ accessToken }) => {
  const { anonKey, baseUrl } = getSupabaseConfig();
  const response = await fetch(`${baseUrl}/auth/v1/user`, {
    method: "GET",
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const data = await response.json().catch(() => ({}));
  return { ok: response.ok, status: response.status, data };
};

module.exports = {
  signUpWithPassword,
  signInWithPassword,
  updatePasswordWithAccessToken,
  getUserWithAccessToken,
};