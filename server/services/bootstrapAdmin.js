const { signInWithPassword, signUpWithPassword } = require("./supabaseAuthService");
const { getDbClient } = require("./supabaseDbService");

let hasBootstrappedAdmin = false;

const isTruthy = (value) => ["1", "true", "yes", "on"].includes(String(value || "").toLowerCase());

const bootstrapAdmin = async () => {
  if (hasBootstrappedAdmin) return;

  const email = process.env.BOOTSTRAP_ADMIN_EMAIL?.toLowerCase().trim();
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;
  const name = process.env.BOOTSTRAP_ADMIN_NAME || "Platform Admin";
  const forceReset = isTruthy(process.env.BOOTSTRAP_ADMIN_FORCE_RESET);

  if (!email || !password) return;

  const db = getDbClient();
  if (!db) {
    console.warn("Bootstrap admin skipped: SUPABASE_SERVICE_ROLE_KEY not configured.");
    return;
  }

  let supabaseUserId;

  if (forceReset) {
    const signup = await signUpWithPassword({ email, password, metadata: { name, role: "admin" } });
    if (!signup.ok) {
      const message = signup.data?.error_description || signup.data?.msg || "Supabase signup failed.";
      const alreadyRegistered = /already|exists|registered/i.test(message);
      if (!alreadyRegistered) {
        console.warn(`Bootstrap admin Supabase error: ${message}`);
      }
    }
  }

  const signIn = await signInWithPassword({ email, password });
  if (!signIn.ok) {
    console.warn(`Bootstrap admin could not sign in with provided password for ${email}.`);
    return;
  }

  supabaseUserId = signIn.data?.user?.id;

  const { error } = await db.from("profiles").upsert(
    {
      supabase_id: supabaseUserId,
      email,
      name,
      role: "admin",
      is_active: true,
    },
    { onConflict: "supabase_id" }
  );

  if (error) {
    console.warn(`Bootstrap admin profile upsert failed: ${error.message}`);
    return;
  }

  hasBootstrappedAdmin = true;
  console.log(`Bootstrap admin ready: ${email}`);
};

module.exports = bootstrapAdmin;
