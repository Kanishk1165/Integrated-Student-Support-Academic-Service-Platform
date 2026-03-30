const { sendQueryNotification } = require("../services/emailService");
const { getDbClient, enrichQueries } = require("../services/supabaseDbService");

const requireDb = (res) => {
  const db = getDbClient();
  if (!db) {
    res.status(500).json({ success: false, message: "Supabase DB client is not configured." });
    return null;
  }
  return db;
};

const queryId = () => `QRY-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

// GET /api/queries
exports.getQueries = async (req, res, next) => {
  try {
    const db = requireDb(res);
    if (!db) return;

    const { status, category, priority, page = 1, limit = 10 } = req.query;
    const pageNum = Math.max(Number(page) || 1, 1);
    const limitNum = Math.max(Number(limit) || 10, 1);
    const from = (pageNum - 1) * limitNum;
    const to = from + limitNum - 1;

    let q = db.from("queries").select("*", { count: "exact" }).order("created_at", { ascending: false });

    // Role-based filtering
    if (req.user.role === "student") {
      q = q.eq("raised_by", req.user.id);
    } else if (req.user.role === "faculty") {
      // Faculty see queries assigned to them via the new junction table
      if (req.query.assigned === 'me') {
        // Get query IDs where faculty is assigned
        const { data: assignments } = await db
          .from("query_faculty_assignments")
          .select("query_id")
          .eq("faculty_id", req.user.id);
        
        const queryIds = (assignments || []).map(a => a.query_id);
        
        if (queryIds.length > 0) {
          q = q.in("id", queryIds);
        } else {
          // No queries assigned, return empty
          return res.json({
            success: true,
            data: [],
            pagination: { total: 0, page: pageNum, pages: 0 },
          });
        }
      } else if (req.query.assigned === 'unassigned') {
        // Get queries with no faculty assignments
        const { data: assignedQueries } = await db
          .from("query_faculty_assignments")
          .select("query_id");
        
        const assignedQueryIds = (assignedQueries || []).map(a => a.query_id);
        
        if (assignedQueryIds.length > 0) {
          q = q.not("id", "in", `(${assignedQueryIds.join(",")})`);
        }
      }
    }

    if (status) q = q.eq("status", status);
    if (category) q = q.eq("category", category);
    if (priority) q = q.eq("priority", priority);

    const { data, error, count } = await q.range(from, to);
    if (error) throw error;

    const queries = await enrichQueries(db, data || [], { includeResponses: true });
    const total = count || 0;

    res.json({
      success: true,
      data: queries,
      pagination: { total, page: pageNum, pages: Math.ceil(total / limitNum) || 1 },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/queries/:id
exports.getQueryById = async (req, res, next) => {
  try {
    const db = requireDb(res);
    if (!db) return;

    const { data, error } = await db.from("queries").select("*").eq("id", req.params.id).maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ success: false, message: "Query not found." });

    if (req.user.role === "student" && data.raised_by !== req.user.id) {
      return res.status(403).json({ success: false, message: "Access denied." });
    }

    const [query] = await enrichQueries(db, [data], { includeResponses: true });
    res.json({ success: true, data: query });
  } catch (err) {
    next(err);
  }
};

// POST /api/queries
exports.createQuery = async (req, res, next) => {
  try {
    const db = requireDb(res);
    if (!db) return;

    const { title, description, category, priority, department, assignedFaculty } = req.body;
    if (!title || !description || !category) {
      return res.status(400).json({ success: false, message: "Title, description, and category are required." });
    }

    // Validate assignedFaculty is required and is an array
    if (!assignedFaculty || !Array.isArray(assignedFaculty) || assignedFaculty.length === 0) {
      return res.status(400).json({ success: false, message: "At least one faculty member must be assigned." });
    }

    // Validate all faculty IDs are valid approved faculty members
    const { data: facultyMembers, error: facultyError } = await db
      .from("profiles")
      .select("id")
      .eq("role", "faculty")
      .eq("approval_status", "approved")
      .eq("is_active", true)
      .in("id", assignedFaculty);

    if (facultyError) throw facultyError;

    if (!facultyMembers || facultyMembers.length !== assignedFaculty.length) {
      return res.status(400).json({ 
        success: false, 
        message: "One or more selected faculty members are not valid or not approved." 
      });
    }

    const payload = {
      query_id: queryId(),
      title,
      description,
      category,
      priority: priority || "medium",
      department_id: department || null,
      raised_by: req.user.id,
      assigned_to: assignedFaculty[0] || null, // Keep first faculty in old field for backward compatibility
    };

    const { data, error } = await db.from("queries").insert(payload).select("*").single();
    if (error) throw error;

    // Insert faculty assignments into query_faculty_assignments table
    const assignments = assignedFaculty.map(facultyId => ({
      query_id: data.id,
      faculty_id: facultyId
    }));

    const { error: assignmentError } = await db
      .from("query_faculty_assignments")
      .insert(assignments);

    if (assignmentError) throw assignmentError;

    const [query] = await enrichQueries(db, [data], { includeResponses: true });

    try {
      await sendQueryNotification(req.user.email, query, "created");
    } catch (e) {
      console.warn("Email failed:", e.message);
    }

    res.status(201).json({ success: true, data: query });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/queries/:id/status
exports.updateStatus = async (req, res, next) => {
  try {
    const db = requireDb(res);
    if (!db) return;

    const { status, assignedTo } = req.body;

    const { data: existing, error: fetchError } = await db
      .from("queries")
      .select("*")
      .eq("id", req.params.id)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!existing) return res.status(404).json({ success: false, message: "Query not found." });

    const patch = {};
    if (status) patch.status = status;
    if (assignedTo !== undefined) patch.assigned_to = assignedTo || null;
    if (status === "resolved") patch.resolved_at = new Date().toISOString();
    if (status === "closed") patch.closed_at = new Date().toISOString();

    const { data, error } = await db
      .from("queries")
      .update(patch)
      .eq("id", req.params.id)
      .select("*")
      .single();

    if (error) throw error;

    const [query] = await enrichQueries(db, [data], { includeResponses: true });

    try {
      await sendQueryNotification(query.raisedBy?.email, query, "status_update");
    } catch (e) {
      console.warn("Email failed:", e.message);
    }

    res.json({ success: true, data: query });
  } catch (err) {
    next(err);
  }
};

// POST /api/queries/:id/respond
exports.addResponse = async (req, res, next) => {
  try {
    const db = requireDb(res);
    if (!db) return;

    const { message, isInternal } = req.body;
    if (!message) return res.status(400).json({ success: false, message: "Message is required." });

    const { data: existing, error: fetchError } = await db
      .from("queries")
      .select("*")
      .eq("id", req.params.id)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!existing) return res.status(404).json({ success: false, message: "Query not found." });

    const { error: responseError } = await db.from("query_responses").insert({
      query_id: req.params.id,
      message,
      responded_by: req.user.id,
      is_internal: Boolean(isInternal),
    });
    if (responseError) throw responseError;

    if (req.user.role !== "student" && existing.status === "open") {
      const { error: statusError } = await db
        .from("queries")
        .update({ status: "in-progress" })
        .eq("id", req.params.id);
      if (statusError) throw statusError;
    }

    const { data: updated, error: updatedError } = await db
      .from("queries")
      .select("*")
      .eq("id", req.params.id)
      .single();

    if (updatedError) throw updatedError;

    const [query] = await enrichQueries(db, [updated], { includeResponses: true });

    if (!Boolean(isInternal)) {
      try {
        await sendQueryNotification(query.raisedBy?.email, query, "new_response");
      } catch (e) {
        console.warn("Email failed:", e.message);
      }
    }

    res.json({ success: true, data: query });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/queries/:id
exports.deleteQuery = async (req, res, next) => {
  try {
    const db = requireDb(res);
    if (!db) return;

    const { error } = await db.from("queries").delete().eq("id", req.params.id);
    if (error) throw error;

    res.json({ success: true, message: "Query deleted." });
  } catch (err) {
    next(err);
  }
};
