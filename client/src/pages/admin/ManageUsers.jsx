import { useState, useEffect } from "react";
import Layout from "../../components/layout/Layout";
import { userAPI } from "../../services/api";

const ROLE_BADGE = {
  student: { color: "#4f8ef7", bg: "#eef3ff" },
  admin:   { color: "#7c5cbf", bg: "#f2eeff" },
  faculty: { color: "#27ae60", bg: "#edfaf3" },
};

export default function ManageUsers() {
  const [users, setUsers]     = useState([]);
  const [role, setRole]       = useState("all");
  const [loading, setLoading] = useState(true);
  const [total, setTotal]     = useState(0);
  const [page, setPage]       = useState(1);

  const load = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (role !== "all") params.role = role;
      const r = await userAPI.getAll(params);
      setUsers(r.data.data);
      setTotal(r.data.pagination.total);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { setPage(1); }, [role]);
  useEffect(() => { load(); }, [role, page]);

  const handleToggle = async (id) => {
    try {
      await userAPI.toggleActive(id);
      load();
    } catch { alert("Failed to update user."); }
  };

  const initials = (name) => name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "?";

  return (
    <Layout>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800 }}>Manage Users</h1>
          <p style={{ color: "#aaa", fontSize: 14, marginTop: 2 }}>{total} users registered</p>
        </div>
        <button onClick={() => alert("To add a faculty or admin, register them via the standard /register route and their role will be determined by their email or you can modify them in the database.")} style={{
          padding: "10px 16px", borderRadius: 8, background: "#1a1a2e", color: "#fff",
          fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
        }}>
          <span>+</span> Add Faculty/Admin
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {["all","student","faculty","admin"].map(r => (
          <button key={r} onClick={() => setRole(r)} style={{
            padding: "7px 16px", borderRadius: 8, border: "1.5px solid",
            borderColor: role === r ? "#1a1a2e" : "#e0e0e0",
            background: role === r ? "#1a1a2e" : "#fff",
            color: role === r ? "#fff" : "#888",
            fontSize: 12, fontWeight: 600, cursor: "pointer", textTransform: "capitalize",
          }}>{r === "all" ? "All Users" : r}</button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: "#fff", borderRadius: 14, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "48px 1fr 180px 110px 100px 80px 90px", padding: "12px 20px", background: "#f8f9fb", fontSize: 11, fontWeight: 700, color: "#aaa", letterSpacing: 0.6, textTransform: "uppercase" }}>
          <span></span><span>Name</span><span>Email</span><span>Roll / Dept</span><span>Joined</span><span>Role</span><span>Status</span>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 40, color: "#aaa" }}>Loading...</div>
        ) : users.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 20px", color: "#aaa" }}>No users found.</div>
        ) : users.map((u, i) => {
          const rb = ROLE_BADGE[u.role] || ROLE_BADGE.student;
          return (
            <div key={u._id} style={{
              display: "grid", gridTemplateColumns: "48px 1fr 180px 110px 100px 80px 90px",
              padding: "14px 20px", alignItems: "center",
              borderTop: i > 0 ? "1px solid #f5f5f5" : "none",
            }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#4f8ef7,#7c5cbf)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#fff" }}>
                {initials(u.name)}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{u.name}</div>
              </div>
              <span style={{ fontSize: 12, color: "#666", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.email}</span>
              <span style={{ fontSize: 12, color: "#888" }}>{u.rollNumber || u.department || "—"}</span>
              <span style={{ fontSize: 12, color: "#aaa" }}>{new Date(u.createdAt).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"2-digit" })}</span>
              <span style={{ background: rb.bg, color: rb.color, borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700, textTransform: "capitalize" }}>{u.role}</span>
              {u.role === 'faculty' ? (
                <span style={{ 
                  background: APPROVAL_STATUS_BADGE[u.approvalStatus]?.bg || "#edfaf3", 
                  color: APPROVAL_STATUS_BADGE[u.approvalStatus]?.color || "#27ae60", 
                  borderRadius: 20, 
                  padding: "3px 10px", 
                  fontSize: 11, 
                  fontWeight: 700 
                }}>
                  {APPROVAL_STATUS_BADGE[u.approvalStatus]?.text || u.approvalStatus}
                </span>
              ) : (
                <button onClick={() => handleToggle(u._id)} style={{
                  padding: "5px 12px", borderRadius: 7, border: "none",
                  background: u.isActive ? "#edfaf3" : "#fef0ef",
                  color: u.isActive ? "#27ae60" : "#e74c3c",
                  fontSize: 11, fontWeight: 700, cursor: "pointer",
                }}>
                  {u.isActive ? "Active" : "Inactive"}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {total > 15 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 20 }}>
          {[...Array(Math.ceil(total / 15))].map((_, i) => (
            <button key={i} onClick={() => setPage(i + 1)} style={{
              width: 36, height: 36, borderRadius: 8, border: "1.5px solid",
              borderColor: page === i + 1 ? "#1a1a2e" : "#e0e0e0",
              background: page === i + 1 ? "#1a1a2e" : "#fff",
              color: page === i + 1 ? "#fff" : "#666",
              fontSize: 13, fontWeight: 700, cursor: "pointer",
            }}>{i + 1}</button>
          ))}
        </div>
      )}
    </Layout>
  );
}