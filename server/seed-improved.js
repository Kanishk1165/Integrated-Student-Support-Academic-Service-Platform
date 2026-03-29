/**
 * Improved Seed script (Supabase)
 * Uses Admin API to create users directly
 * Run: node seed-improved.js
 */
const dotenv = require("dotenv");
dotenv.config();

const { createClient } = require("@supabase/supabase-js");

const DEPARTMENTS = [
  { name: "Finance & Scholarship", code: "FIN", description: "Scholarship and fee support" },
  { name: "Academic Office", code: "ACA", description: "Attendance, exam and mentoring" },
  { name: "Placement Cell", code: "PLC", description: "Internship and placement support" },
  { name: "Administration", code: "ADM", description: "General administrative support" },
];

async function createOrGetUser(adminClient, email, password, metadata) {
  console.log(`Creating/updating user: ${email}`);
  
  // Try to create user with Admin API (bypasses email confirmation)
  const { data: createData, error: createError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Auto-confirm email
    user_metadata: metadata,
  });

  if (createError) {
    // If user already exists, try to get and update them
    if (createError.message?.includes("already") || createError.message?.includes("exists")) {
      console.log(`  User ${email} already exists, fetching...`);
      
      // List users and find by email
      const { data: listData, error: listError } = await adminClient.auth.admin.listUsers();
      if (listError) throw listError;
      
      const existingUser = listData.users.find(u => u.email === email);
      if (existingUser) {
        console.log(`  Found existing user, updating password...`);
        
        // Update user password
        const { data: updateData, error: updateError } = await adminClient.auth.admin.updateUserById(
          existingUser.id,
          { 
            password,
            email_confirm: true,
            user_metadata: metadata 
          }
        );
        
        if (updateError) throw updateError;
        console.log(`  ✓ User ${email} updated`);
        return updateData.user;
      }
    }
    throw createError;
  }

  console.log(`  ✓ User ${email} created`);
  return createData.user;
}

async function seed() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env");
  }

  // Create admin client with service role key
  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  console.log("Starting seed process...\n");

  // Create users using Admin API
  const adminUser = await createOrGetUser(
    adminClient,
    "admin@university.edu",
    "admin123",
    { name: "Admin User", role: "admin" }
  );

  const facultyUser = await createOrGetUser(
    adminClient,
    "faculty@university.edu",
    "faculty123",
    { 
      name: "Dr. Rajesh Kumar", 
      role: "faculty",
      department: "Computer Science"
    }
  );

  const studentUser = await createOrGetUser(
    adminClient,
    "kanishk@university.edu",
    "student123",
    { 
      name: "Kanishk Sharma", 
      role: "student", 
      rollNumber: "21CS1165", 
      department: "Computer Science", 
      year: "3rd Year" 
    }
  );

  console.log("\nCreating profiles...");

  // Upsert profiles
  const { data: adminProfile, error: adminProfileError } = await adminClient
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
  console.log("  ✓ Admin profile created");

  const { data: facultyProfile, error: facultyProfileError } = await adminClient
    .from("profiles")
    .upsert(
      {
        supabase_id: facultyUser.id,
        email: facultyUser.email,
        name: "Dr. Rajesh Kumar",
        role: "faculty",
        department: "Computer Science",
        phone: "+91-9876543210",
        is_active: true,
      },
      { onConflict: "supabase_id" }
    )
    .select("*")
    .single();
  if (facultyProfileError) throw facultyProfileError;
  console.log("  ✓ Faculty profile created");

  const { data: studentProfile, error: studentProfileError } = await adminClient
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
  console.log("  ✓ Student profile created");

  console.log("\nCreating departments...");
  const { data: departments, error: deptError } = await adminClient
    .from("departments")
    .upsert(DEPARTMENTS, { onConflict: "code" })
    .select("*");
  if (deptError) throw deptError;
  console.log(`  ✓ ${departments.length} departments created`);

  const deptByCode = new Map((departments || []).map((d) => [d.code, d]));

  console.log("\nCreating sample queries...");
  const queries = [
    {
      query_id: `QRY-${Date.now()}-1`,
      title: "Scholarship disbursement delayed",
      description: "My scholarship amount for semester 5 has not been credited yet.",
      category: "Scholarship",
      priority: "high",
      status: "in-progress",
      raised_by: studentProfile.id,
      assigned_to: facultyProfile.id,
      department_id: deptByCode.get("FIN")?.id || null,
    },
    {
      query_id: `QRY-${Date.now()}-2`,
      title: "Attendance shortage in Operating Systems",
      description: "I have 68% attendance in OS due to a medical emergency. Please review.",
      category: "Attendance",
      priority: "high",
      status: "in-progress",
      raised_by: studentProfile.id,
      assigned_to: facultyProfile.id,
      department_id: deptByCode.get("ACA")?.id || null,
    },
    {
      query_id: `QRY-${Date.now()}-3`,
      title: "Request for project extension",
      description: "Due to technical issues with the lab equipment, our group needs a 1-week extension for the DBMS project.",
      category: "Exam",
      priority: "medium",
      status: "open",
      raised_by: studentProfile.id,
      assigned_to: facultyProfile.id,
      department_id: deptByCode.get("ACA")?.id || null,
    },
    {
      query_id: `QRY-${Date.now()}-4`,
      title: "Internship NOC letter request",
      description: "I need a No Objection Certificate for my internship at TCS starting Feb 2026.",
      category: "Internship",
      priority: "low",
      status: "open",
      raised_by: studentProfile.id,
      department_id: deptByCode.get("PLC")?.id || null,
    },
    {
      query_id: `QRY-${Date.now()}-5`,
      title: "Library book renewal issue",
      description: "Unable to renew borrowed books through the online portal. Getting error message.",
      category: "Library",
      priority: "low",
      status: "open",
      raised_by: studentProfile.id,
      department_id: deptByCode.get("ADM")?.id || null,
    },
  ];

  const { data: insertedQueries, error: queryError } = await adminClient
    .from("queries")
    .insert(queries)
    .select("id,title");
  if (queryError) throw queryError;
  console.log(`  ✓ ${insertedQueries.length} queries created`);

  if (insertedQueries?.length) {
    console.log("\nCreating query responses...");
    const responses = [
      {
        query_id: insertedQueries[0].id,
        message: "I have reviewed your scholarship status. The finance team is processing pending disbursements. Expected credit by end of this week.",
        responded_by: facultyProfile.id,
        is_internal: false,
      },
      {
        query_id: insertedQueries[1].id,
        message: "Please submit your medical certificate to the department office. We will review your case and update the attendance accordingly.",
        responded_by: facultyProfile.id,
        is_internal: false,
      },
    ];

    const { error: responseError } = await adminClient.from("query_responses").insert(responses);
    if (responseError) throw responseError;
    console.log(`  ✓ ${responses.length} responses created`);
  }

  console.log("\n✓ Seed complete!");
  console.log("\nLogin credentials:");
  console.log("==================");
  console.log("Admin:   admin@university.edu / admin123");
  console.log("Faculty: faculty@university.edu / faculty123");
  console.log("Student: kanishk@university.edu / student123");
  console.log("\nFaculty has 3 queries assigned to them.");
}

seed().catch((err) => {
  console.error("\n✗ Seed failed:");
  console.error(err.message);
  process.exit(1);
});
