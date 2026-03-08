/**
 * Seed script (Supabase)
 * Run: node seed.js
 */
const dotenv = require("dotenv");
dotenv.config();

const { signUpWithPassword, signInWithPassword } = require("./services/supabaseAuthService");
const { getDbClient } = require("./services/supabaseDbService");

const DEPARTMENTS = [
  { name: "Finance & Scholarship", code: "FIN", description: "Scholarship and fee support" },
  { name: "Academic Office", code: "ACA", description: "Attendance, exam and mentoring" },
  { name: "Placement Cell", code: "PLC", description: "Internship and placement support" },
  { name: "Administration", code: "ADM", description: "General administrative support" },
];

async function ensureAuthUser({ email, password, metadata }) {
  const signup = await signUpWithPassword({ email, password, metadata });
  if (!signup.ok) {
    const message = signup.data?.error_description || signup.data?.message || "signup failed";
    if (!/already|exists|registered/i.test(message)) {
      throw new Error(`Supabase signup failed for ${email}: ${message}`);
    }
  }

  const signin = await signInWithPassword({ email, password });
  if (!signin.ok) {
    const message = signin.data?.error_description || signin.data?.message || "signin failed";
    throw new Error(`Supabase signin failed for ${email}: ${message}`);
  }

  return signin.data.user;
}

async function seed() {
  const db = getDbClient();
  if (!db) throw new Error("Supabase DB client is not configured. Set SUPABASE_SERVICE_ROLE_KEY.");

  const adminUser = await ensureAuthUser({
    email: "admin@university.edu",
    password: "admin123",
    metadata: { name: "Admin User", role: "admin" },
  });

  const studentUser = await ensureAuthUser({
    email: "kanishk@university.edu",
    password: "student123",
    metadata: { name: "Kanishk Sharma", role: "student", rollNumber: "21CS1165", department: "Computer Science", year: "3rd Year" },
  });

  const { data: adminProfile, error: adminProfileError } = await db
    .from("profiles")
    .upsert(
      {
        supabase_id: adminUser.id,
        email: adminUser.email,
        name: "Admin User",
        role: "admin",
        department: "IT",
        is_active: true,
      },
      { onConflict: "supabase_id" }
    )
    .select("*")
    .single();
  if (adminProfileError) throw adminProfileError;

  const { data: studentProfile, error: studentProfileError } = await db
    .from("profiles")
    .upsert(
      {
        supabase_id: studentUser.id,
        email: studentUser.email,
        name: "Kanishk Sharma",
        role: "student",
        roll_number: "21CS1165",
        department: "Computer Science",
        year: "3rd Year",
        is_active: true,
      },
      { onConflict: "supabase_id" }
    )
    .select("*")
    .single();
  if (studentProfileError) throw studentProfileError;

  const { data: departments, error: deptError } = await db.from("departments").upsert(DEPARTMENTS, { onConflict: "code" }).select("*");
  if (deptError) throw deptError;

  const deptByCode = new Map((departments || []).map((d) => [d.code, d]));

  const queries = [
    {
      query_id: `QRY-${Date.now()}-1`,
      title: "Scholarship disbursement delayed",
      description: "My scholarship amount for semester 5 has not been credited yet.",
      category: "Scholarship",
      priority: "high",
      status: "in-progress",
      raised_by: studentProfile.id,
      department_id: deptByCode.get("FIN")?.id || null,
    },
    {
      query_id: `QRY-${Date.now()}-2`,
      title: "Attendance shortage in Operating Systems",
      description: "I have 68% attendance in OS due to a medical emergency. Please review.",
      category: "Attendance",
      priority: "medium",
      status: "resolved",
      raised_by: studentProfile.id,
      department_id: deptByCode.get("ACA")?.id || null,
      resolved_at: new Date().toISOString(),
    },
    {
      query_id: `QRY-${Date.now()}-3`,
      title: "Internship NOC letter request",
      description: "I need a No Objection Certificate for my internship at TCS starting Feb 2026.",
      category: "Internship",
      priority: "low",
      status: "open",
      raised_by: studentProfile.id,
      department_id: deptByCode.get("PLC")?.id || null,
    },
  ];

  const { data: insertedQueries, error: queryError } = await db
    .from("queries")
    .insert(queries)
    .select("id,title");
  if (queryError) throw queryError;

  if (insertedQueries?.length) {
    const responses = insertedQueries.slice(0, 2).map((q, index) => ({
      query_id: q.id,
      message:
        index === 0
          ? "We have forwarded this to the Finance Head."
          : "Attendance has been updated after medical verification.",
      responded_by: adminProfile.id,
      is_internal: false,
    }));

    const { error: responseError } = await db.from("query_responses").insert(responses);
    if (responseError) throw responseError;
  }

  console.log("Seed complete.");
  console.log("Admin:   admin@university.edu / admin123");
  console.log("Student: kanishk@university.edu / student123");
}

seed().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
