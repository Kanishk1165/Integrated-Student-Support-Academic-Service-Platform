const { createClient } = require("@supabase/supabase-js");

const fallbackAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvY2xiamR6ZG96Z2x0and4b3pnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5MDYwNTgsImV4cCI6MjA4ODQ4MjA1OH0.o4TtAtdz0nFpXU2ESvuePGNk3H8GQ-cePz8BAGIDvjk";

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
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || parseSupabaseUrlFromAnonKey(anonKey);
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    return null;
  }

  return { url, serviceRoleKey };
};

const getDbClient = () => {
  const config = getSupabaseConfig();
  if (!config) return null;

  return createClient(config.url, config.serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
};

const normalizeProfile = (row) => {
  if (!row) return null;
  return {
    _id: row.id,
    id: row.id,
    supabaseId: row.supabase_id,
    name: row.name,
    email: row.email,
    role: row.role,
    rollNumber: row.roll_number,
    department: row.department,
    year: row.year,
    phone: row.phone,
    avatar: row.avatar,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

const normalizeDepartment = (row) => {
  if (!row) return null;
  return {
    _id: row.id,
    id: row.id,
    name: row.name,
    code: row.code,
    description: row.description,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

const normalizeResponse = (row, responder) => ({
  _id: row.id,
  id: row.id,
  message: row.message,
  isInternal: row.is_internal,
  createdAt: row.created_at,
  respondedBy: responder
    ? {
        _id: responder.id,
        name: responder.name,
        role: responder.role,
      }
    : null,
});

const normalizeQuery = ({ row, raisedBy, assignedTo, department, responses = [] }) => ({
  _id: row.id,
  id: row.id,
  queryId: row.query_id,
  title: row.title,
  description: row.description,
  category: row.category,
  status: row.status,
  priority: row.priority,
  attachments: row.attachments || [],
  resolvedAt: row.resolved_at,
  closedAt: row.closed_at,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  raisedBy: raisedBy
    ? { _id: raisedBy.id, name: raisedBy.name, email: raisedBy.email, rollNumber: raisedBy.roll_number }
    : null,
  assignedTo: assignedTo ? { _id: assignedTo.id, name: assignedTo.name, email: assignedTo.email } : null,
  department: department ? normalizeDepartment(department) : null,
  responses,
});

const getProfilesByIds = async (supabase, ids = []) => {
  const unique = [...new Set(ids.filter(Boolean))];
  if (!unique.length) return new Map();

  const { data, error } = await supabase.from("profiles").select("*").in("id", unique);
  if (error) throw error;
  const map = new Map();
  for (const row of data || []) map.set(row.id, row);
  return map;
};

const getDepartmentsByIds = async (supabase, ids = []) => {
  const unique = [...new Set(ids.filter(Boolean))];
  if (!unique.length) return new Map();

  const { data, error } = await supabase.from("departments").select("*").in("id", unique);
  if (error) throw error;
  const map = new Map();
  for (const row of data || []) map.set(row.id, row);
  return map;
};

const getResponsesByQueryIds = async (supabase, queryIds = []) => {
  const unique = [...new Set(queryIds.filter(Boolean))];
  if (!unique.length) return new Map();

  const { data, error } = await supabase
    .from("query_responses")
    .select("*")
    .in("query_id", unique)
    .order("created_at", { ascending: true });

  if (error) throw error;

  const responderIds = (data || []).map((r) => r.responded_by);
  const responders = await getProfilesByIds(supabase, responderIds);

  const grouped = new Map();
  for (const row of data || []) {
    if (!grouped.has(row.query_id)) grouped.set(row.query_id, []);
    grouped.get(row.query_id).push(normalizeResponse(row, responders.get(row.responded_by)));
  }

  return grouped;
};

const enrichQueries = async (supabase, rows = [], { includeResponses = false } = {}) => {
  const raisedIds = rows.map((q) => q.raised_by);
  const assignedIds = rows.map((q) => q.assigned_to);
  const departmentIds = rows.map((q) => q.department_id);

  const [raisedByMap, assignedToMap, departmentMap, responsesMap] = await Promise.all([
    getProfilesByIds(supabase, raisedIds),
    getProfilesByIds(supabase, assignedIds),
    getDepartmentsByIds(supabase, departmentIds),
    includeResponses ? getResponsesByQueryIds(supabase, rows.map((q) => q.id)) : Promise.resolve(new Map()),
  ]);

  return rows.map((row) =>
    normalizeQuery({
      row,
      raisedBy: raisedByMap.get(row.raised_by),
      assignedTo: assignedToMap.get(row.assigned_to),
      department: departmentMap.get(row.department_id),
      responses: responsesMap.get(row.id) || [],
    })
  );
};

module.exports = {
  getDbClient,
  normalizeProfile,
  normalizeDepartment,
  normalizeQuery,
  getProfilesByIds,
  getDepartmentsByIds,
  getResponsesByQueryIds,
  enrichQueries,
};
