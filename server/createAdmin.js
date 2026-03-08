/**
 * Safe admin bootstrap script (Supabase)
 * Usage:
 *   ADMIN_EMAIL=admin@university.edu ADMIN_PASSWORD=admin123 npm run create-admin
 */
const dotenv = require("dotenv");
dotenv.config();

const bootstrapAdmin = require("./services/bootstrapAdmin");

async function run() {
  if (process.env.ADMIN_EMAIL) process.env.BOOTSTRAP_ADMIN_EMAIL = process.env.ADMIN_EMAIL;
  if (process.env.ADMIN_PASSWORD) process.env.BOOTSTRAP_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
  if (process.env.ADMIN_NAME) process.env.BOOTSTRAP_ADMIN_NAME = process.env.ADMIN_NAME;
  if (!process.env.BOOTSTRAP_ADMIN_FORCE_RESET) process.env.BOOTSTRAP_ADMIN_FORCE_RESET = "true";

  await bootstrapAdmin();
  console.log("Admin bootstrap complete.");
}

run().catch((err) => {
  console.error("create-admin failed:", err.message);
  process.exit(1);
});
