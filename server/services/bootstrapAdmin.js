const User = require("../models/User");
const { signInWithPassword, signUpWithPassword } = require("./supabaseAuthService");

let hasBootstrappedAdmin = false;

const isTruthy = (value) => ["1", "true", "yes", "on"].includes(String(value || "").toLowerCase());

const bootstrapAdmin = async () => {
  if (hasBootstrappedAdmin) return;

  const email = process.env.BOOTSTRAP_ADMIN_EMAIL?.toLowerCase().trim();
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;
  const name = process.env.BOOTSTRAP_ADMIN_NAME || "Platform Admin";
  const forceReset = isTruthy(process.env.BOOTSTRAP_ADMIN_FORCE_RESET);

  if (!email || !password) return;

  const supabaseSignup = await signUpWithPassword({
    email,
    password,
    metadata: { name, role: "admin" },
  });

  if (!supabaseSignup.ok) {
    const message = supabaseSignup.data?.error_description || supabaseSignup.data?.msg || "Supabase signup failed.";
    const alreadyRegistered = /already|exists|registered/i.test(message);
    if (alreadyRegistered) {
      const supabaseSignIn = await signInWithPassword({ email, password });
      if (!supabaseSignIn.ok) {
        console.warn(`Bootstrap admin Supabase account exists but password mismatch for ${email}.`);
      }
    } else {
      console.warn(`Bootstrap admin Supabase error: ${message}`);
    }
  }

  const existingAdmin = await User.findOne({ email }).select("+password");

  if (!existingAdmin) {
    await User.create({
      name,
      email,
      password,
      role: "admin",
      department: "IT",
      isActive: true,
    });
    console.log(`Bootstrap admin created: ${email}`);
  } else {
    let updated = false;

    if (existingAdmin.role !== "admin") {
      existingAdmin.role = "admin";
      updated = true;
    }

    if (!existingAdmin.isActive) {
      existingAdmin.isActive = true;
      updated = true;
    }

    if (forceReset) {
      existingAdmin.password = password;
      updated = true;
    }

    if (updated) {
      await existingAdmin.save();
      console.log(`Bootstrap admin updated: ${email}`);
    } else {
      console.log(`Bootstrap admin exists: ${email}`);
    }
  }

  hasBootstrappedAdmin = true;
};

module.exports = bootstrapAdmin;